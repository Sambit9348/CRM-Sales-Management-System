import mongoose from 'mongoose';
import { Lead } from '../models/Lead';
import { Customer } from '../models/Customer';
import { Deal } from '../models/Deal';
import { Activity } from '../models/Activity';
import { User, IUser } from '../models/User';

export class DashboardService {
  static async getDashboardMetrics(currentUser: IUser) {
    const isExecutive = currentUser.role === 'SALES_EXECUTIVE';

    const leadFilter: any = {};
    const customerFilter: any = {};
    const dealFilter: any = {};
    const activityFilter: any = {};

    if (isExecutive) {
      leadFilter.assignedTo = currentUser._id;
      customerFilter.assignedTo = currentUser._id;
      dealFilter.assignedTo = currentUser._id;
      activityFilter.assignedTo = currentUser._id;
    }

    // Auto update overdue activities status
    await Activity.updateMany(
      { status: 'PENDING', dueDate: { $lt: new Date() } },
      { $set: { status: 'OVERDUE' } }
    );

    // 1. Lead Metrics
    const totalLeads = await Lead.countDocuments(leadFilter);
    const newLeads = await Lead.countDocuments({ ...leadFilter, status: 'NEW' });
    const qualifiedLeads = await Lead.countDocuments({ ...leadFilter, status: 'QUALIFIED' });
    const convertedLeads = await Lead.countDocuments({ ...leadFilter, isConverted: true });
    const lostUnqualifiedLeads = await Lead.countDocuments({
      ...leadFilter,
      status: { $in: ['UNQUALIFIED', 'LOST'] },
    });
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100 * 10) / 10 : 0;

    // 2. Customer Metrics
    const totalCustomers = await Customer.countDocuments(customerFilter);
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const newCustomersThisMonth = await Customer.countDocuments({
      ...customerFilter,
      createdAt: { $gte: startOfMonth },
    });

    // 3. Deal & Revenue Metrics
    const deals = await Deal.find(dealFilter);
    const totalDeals = deals.length;
    const openDealsList = deals.filter((d) => d.stage !== 'Won' && d.stage !== 'Lost');
    const wonDealsList = deals.filter((d) => d.stage === 'Won');
    const lostDealsList = deals.filter((d) => d.stage === 'Lost');

    const openDeals = openDealsList.length;
    const wonDeals = wonDealsList.length;
    const lostDeals = lostDealsList.length;

    const pipelineValue = openDealsList.reduce((sum, d) => sum + (d.dealValue || 0), 0);
    const wonRevenue = wonDealsList.reduce((sum, d) => sum + (d.dealValue || 0), 0);
    const expectedRevenue = openDealsList.reduce((sum, d) => sum + (d.expectedRevenue || 0), 0);

    // 4. Activity Metrics
    const pendingActivities = await Activity.countDocuments({ ...activityFilter, status: 'PENDING' });
    const completedActivities = await Activity.countDocuments({ ...activityFilter, status: 'COMPLETED' });
    const overdueActivities = await Activity.countDocuments({ ...activityFilter, status: 'OVERDUE' });

    // 5. Stage Breakdown
    const stages = ['Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Won', 'Lost'];
    const pipelineBreakdown = stages.map((stage) => {
      const stageDeals = deals.filter((d) => d.stage === stage);
      return {
        stage,
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + (d.dealValue || 0), 0),
      };
    });

    // 6. Lead Source Distribution
    const sources = ['Website', 'Referral', 'Social Media', 'Email', 'Phone'];
    const leadSourcesBreakdown = await Promise.all(
      sources.map(async (source) => ({
        source,
        count: await Lead.countDocuments({ ...leadFilter, source }),
      }))
    );

    // 7. Team Performance (Only for Admin & Sales Manager)
    let teamPerformance: any[] = [];
    if (currentUser.role === 'ADMIN' || currentUser.role === 'SALES_MANAGER') {
      const executives = await User.find({ role: 'SALES_EXECUTIVE', isActive: true }).select('name email avatar');

      teamPerformance = await Promise.all(
        executives.map(async (exec) => {
          const execLeadsCount = await Lead.countDocuments({ assignedTo: exec._id });
          const execConvertedCount = await Lead.countDocuments({ assignedTo: exec._id, isConverted: true });
          const execDeals = await Deal.find({ assignedTo: exec._id });
          const execWonDeals = execDeals.filter((d) => d.stage === 'Won');
          const execWonRevenue = execWonDeals.reduce((sum, d) => sum + (d.dealValue || 0), 0);
          const execConversionRate = execLeadsCount > 0 ? Math.round((execConvertedCount / execLeadsCount) * 100) : 0;

          return {
            userId: exec._id,
            name: exec.name,
            email: exec.email,
            avatar: exec.avatar,
            assignedLeads: execLeadsCount,
            convertedLeads: execConvertedCount,
            conversionRate: execConversionRate,
            wonDealsCount: execWonDeals.length,
            wonRevenue: execWonRevenue,
          };
        })
      );
    }

    return {
      leads: {
        total: totalLeads,
        new: newLeads,
        qualified: qualifiedLeads,
        converted: convertedLeads,
        lostUnqualified: lostUnqualifiedLeads,
        conversionRate,
      },
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersThisMonth,
      },
      deals: {
        total: totalDeals,
        open: openDeals,
        won: wonDeals,
        lost: lostDeals,
        pipelineValue,
        wonRevenue,
        expectedRevenue,
      },
      activities: {
        pending: pendingActivities,
        completed: completedActivities,
        overdue: overdueActivities,
      },
      pipelineBreakdown,
      leadSourcesBreakdown,
      teamPerformance,
    };
  }
}
