import { User } from '../models/User';
import { Lead } from '../models/Lead';
import { Customer } from '../models/Customer';
import { Deal } from '../models/Deal';
import { Activity } from '../models/Activity';
import { Timeline } from '../models/Timeline';
import { Notification } from '../models/Notification';

export const seedDatabase = async () => {
  console.log('[SEED] Clearing existing database collections...');
  await User.deleteMany({});
  await Lead.deleteMany({});
  await Customer.deleteMany({});
  await Deal.deleteMany({});
  await Activity.deleteMany({});
  await Timeline.deleteMany({});
  await Notification.deleteMany({});

  console.log('[SEED] Seeding Users...');
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@crm.com',
    password: 'Admin@123',
    role: 'ADMIN',
  });

  const manager = await User.create({
    name: 'Sales Manager',
    email: 'manager@crm.com',
    password: 'Manager@123',
    role: 'SALES_MANAGER',
  });

  const exec1 = await User.create({
    name: 'Alex Rivera',
    email: 'executive1@crm.com',
    password: 'Executive@123',
    role: 'SALES_EXECUTIVE',
  });

  const exec2 = await User.create({
    name: 'Sarah Jenkins',
    email: 'executive2@crm.com',
    password: 'Executive@123',
    role: 'SALES_EXECUTIVE',
  });

  const exec3 = await User.create({
    name: 'Michael Chen',
    email: 'executive3@crm.com',
    password: 'Executive@123',
    role: 'SALES_EXECUTIVE',
  });

  console.log('🌱 Seeding Leads...');
  const leadsData = [
    {
      firstName: 'David',
      lastName: 'Miller',
      email: 'david.miller@techcorp.io',
      phone: '+1 555-0192',
      company: 'TechCorp Solutions',
      source: 'Website' as const,
      status: 'QUALIFIED' as const,
      priority: 'HIGH' as const,
      assignedTo: exec1._id,
      notes: [
        { text: 'Interested in enterprise license for 150 seats.', createdBy: exec1._id, createdAt: new Date(Date.now() - 7 * 86400000) }
      ],
      createdBy: exec1._id,
    },
    {
      firstName: 'Emma',
      lastName: 'Watson',
      email: 'emma@apexcloud.com',
      phone: '+1 555-0143',
      company: 'Apex Cloud Systems',
      source: 'Referral' as const,
      status: 'QUALIFIED' as const,
      priority: 'HIGH' as const,
      assignedTo: exec2._id,
      notes: [
        { text: 'Warm referral from existing client.', createdBy: exec2._id, createdAt: new Date(Date.now() - 5 * 86400000) }
      ],
      createdBy: exec2._id,
    },
    {
      firstName: 'Robert',
      lastName: 'Garcia',
      email: 'rgarcia@vanguardlog.com',
      phone: '+1 555-0188',
      company: 'Vanguard Logistics',
      source: 'Social Media' as const,
      status: 'CONTACTED' as const,
      priority: 'MEDIUM' as const,
      assignedTo: exec1._id,
      notes: [
        { text: 'Initial call completed, scheduled demo for next Tuesday.', createdBy: exec1._id, createdAt: new Date(Date.now() - 2 * 86400000) }
      ],
      createdBy: exec1._id,
    },
    {
      firstName: 'Sophia',
      lastName: 'Martinez',
      email: 'sophia@quantumbio.org',
      phone: '+1 555-0131',
      company: 'Quantum Bio',
      source: 'Email' as const,
      status: 'NEW' as const,
      priority: 'HIGH' as const,
      assignedTo: exec3._id,
      notes: [],
      createdBy: exec3._id,
    },
    {
      firstName: 'James',
      lastName: 'Wilson',
      email: 'jwilson@nexadigital.com',
      phone: '+1 555-0177',
      company: 'Nexa Digital',
      source: 'Phone' as const,
      status: 'CONTACTED' as const,
      priority: 'LOW' as const,
      assignedTo: exec2._id,
      notes: [
        { text: 'Budget approval expected next quarter.', createdBy: exec2._id, createdAt: new Date(Date.now() - 3 * 86400000) }
      ],
      createdBy: exec2._id,
    },
    {
      firstName: 'Olivia',
      lastName: 'Taylor',
      email: 'olivia@horizonretail.com',
      phone: '+1 555-0155',
      company: 'Horizon Retail Group',
      source: 'Website' as const,
      status: 'NEW' as const,
      priority: 'MEDIUM' as const,
      assignedTo: exec3._id,
      createdBy: exec3._id,
    },
    {
      firstName: 'Daniel',
      lastName: 'Anderson',
      email: 'daniel@stellarmedia.com',
      phone: '+1 555-0166',
      company: 'Stellar Media',
      source: 'Social Media' as const,
      status: 'UNQUALIFIED' as const,
      priority: 'LOW' as const,
      assignedTo: exec1._id,
      notes: [{ text: 'No immediate requirement at this time.', createdBy: exec1._id, createdAt: new Date(Date.now() - 10 * 86400000) }],
      createdBy: exec1._id,
    },
    {
      firstName: 'Ava',
      lastName: 'Thomas',
      email: 'athomas@pulsehealth.org',
      phone: '+1 555-0199',
      company: 'Pulse Health Technologies',
      source: 'Referral' as const,
      status: 'QUALIFIED' as const,
      priority: 'HIGH' as const,
      assignedTo: exec2._id,
      createdBy: exec2._id,
    },
    {
      firstName: 'Lucas',
      lastName: 'Jackson',
      email: 'lucas@bluefinfin.com',
      phone: '+1 555-0112',
      company: 'Bluefin Financial',
      source: 'Email' as const,
      status: 'LOST' as const,
      priority: 'MEDIUM' as const,
      assignedTo: exec3._id,
      createdBy: exec3._id,
    },
    {
      firstName: 'Mia',
      lastName: 'White',
      email: 'mwhite@crestlineenergy.com',
      phone: '+1 555-0144',
      company: 'Crestline Energy',
      source: 'Website' as const,
      status: 'NEW' as const,
      priority: 'HIGH' as const,
      assignedTo: exec1._id,
      createdBy: exec1._id,
    },
  ];

  const createdLeads = await Lead.create(leadsData);

  console.log('🌱 Converting select Qualified Leads into Customers & Deals...');
  // Lead 0 -> Convert to Customer & Deal (Won Deal)
  const lead0 = createdLeads[0];
  const customer1 = await Customer.create({
    name: `${lead0.firstName} ${lead0.lastName}`,
    email: lead0.email,
    phone: lead0.phone,
    company: lead0.company,
    originalLead: lead0._id,
    assignedTo: lead0.assignedTo,
    createdBy: exec1._id,
  });

  const deal1 = await Deal.create({
    title: `${lead0.company} - Enterprise License`,
    customer: customer1._id,
    originalLead: lead0._id,
    assignedTo: lead0.assignedTo,
    dealValue: 125000,
    probability: 100,
    expectedRevenue: 125000,
    expectedClosingDate: new Date(Date.now() - 2 * 86400000),
    stage: 'Won',
    closedAt: new Date(Date.now() - 2 * 86400000),
    createdBy: exec1._id,
  });

  lead0.isConverted = true;
  lead0.convertedCustomerId = customer1._id;
  lead0.convertedDealId = deal1._id;
  await lead0.save();

  // Lead 1 -> Convert to Customer & Deal (Negotiation Stage)
  const lead1 = createdLeads[1];
  const customer2 = await Customer.create({
    name: `${lead1.firstName} ${lead1.lastName}`,
    email: lead1.email,
    phone: lead1.phone,
    company: lead1.company,
    originalLead: lead1._id,
    assignedTo: lead1.assignedTo,
    createdBy: exec2._id,
  });

  const deal2 = await Deal.create({
    title: `${lead1.company} - Cloud Integration`,
    customer: customer2._id,
    originalLead: lead1._id,
    assignedTo: lead1.assignedTo,
    dealValue: 85000,
    probability: 80,
    expectedRevenue: 68000,
    expectedClosingDate: new Date(Date.now() + 10 * 86400000),
    stage: 'Negotiation',
    createdBy: exec2._id,
  });

  lead1.isConverted = true;
  lead1.convertedCustomerId = customer2._id;
  lead1.convertedDealId = deal2._id;
  await lead1.save();

  // Lead 7 -> Convert to Customer & Deal (Proposal Stage)
  const lead7 = createdLeads[7];
  const customer3 = await Customer.create({
    name: `${lead7.firstName} ${lead7.lastName}`,
    email: lead7.email,
    phone: lead7.phone,
    company: lead7.company,
    originalLead: lead7._id,
    assignedTo: lead7.assignedTo,
    createdBy: exec2._id,
  });

  const deal3 = await Deal.create({
    title: `${lead7.company} - SaaS Platform Subscription`,
    customer: customer3._id,
    originalLead: lead7._id,
    assignedTo: lead7.assignedTo,
    dealValue: 45000,
    probability: 60,
    expectedRevenue: 27000,
    expectedClosingDate: new Date(Date.now() + 15 * 86400000),
    stage: 'Proposal',
    createdBy: exec2._id,
  });

  lead7.isConverted = true;
  lead7.convertedCustomerId = customer3._id;
  lead7.convertedDealId = deal3._id;
  await lead7.save();

  // Additional deals in Discovery & Qualification stages
  await Deal.create({
    title: `${customer1.company} - Expansion Expansion Module`,
    customer: customer1._id,
    assignedTo: exec1._id,
    dealValue: 35000,
    probability: 40,
    expectedRevenue: 14000,
    expectedClosingDate: new Date(Date.now() + 20 * 86400000),
    stage: 'Discovery',
    createdBy: exec1._id,
  });

  await Deal.create({
    title: `${customer2.company} - Premium SLA Package`,
    customer: customer2._id,
    assignedTo: exec2._id,
    dealValue: 22000,
    probability: 20,
    expectedRevenue: 4400,
    expectedClosingDate: new Date(Date.now() + 25 * 86400000),
    stage: 'Qualification',
    createdBy: exec2._id,
  });

  console.log('🌱 Seeding Activities...');
  const activitiesData = [
    {
      type: 'DEMO' as const,
      title: 'Product Demo & Architecture Review',
      description: 'Present customized CRM dashboard and workflow capabilities to technical stakeholders.',
      relatedLead: createdLeads[2]._id,
      assignedTo: exec1._id,
      dueDate: new Date(Date.now() + 2 * 86400000),
      status: 'PENDING' as const,
      createdBy: exec1._id,
    },
    {
      type: 'MEETING' as const,
      title: 'Contract Pricing Negotiation',
      description: 'Review final discount percentages and multi-year payment terms.',
      relatedDeal: deal2._id,
      relatedCustomer: customer2._id,
      assignedTo: exec2._id,
      dueDate: new Date(Date.now() + 1 * 86400000),
      status: 'PENDING' as const,
      createdBy: exec2._id,
    },
    {
      type: 'CALL' as const,
      title: 'Discovery Follow-up Call',
      description: 'Follow up on technical questionnaire sent last week.',
      relatedLead: createdLeads[4]._id,
      assignedTo: exec2._id,
      dueDate: new Date(Date.now() - 1 * 86400000),
      status: 'OVERDUE' as const,
      createdBy: exec2._id,
    },
    {
      type: 'EMAIL' as const,
      title: 'Send Proposal Documentation PDF',
      description: 'Deliver proposal deck and ROI breakdown document.',
      relatedDeal: deal3._id,
      relatedCustomer: customer3._id,
      assignedTo: exec2._id,
      dueDate: new Date(Date.now() - 3 * 86400000),
      status: 'COMPLETED' as const,
      completedAt: new Date(Date.now() - 3 * 86400000),
      createdBy: exec2._id,
    },
    {
      type: 'REMINDER' as const,
      title: 'Check Lead Qualification Status',
      description: 'Review inbound website inquiry details.',
      relatedLead: createdLeads[3]._id,
      assignedTo: exec3._id,
      dueDate: new Date(Date.now() + 4 * 86400000),
      status: 'PENDING' as const,
      createdBy: exec3._id,
    },
  ];

  await Activity.create(activitiesData);

  console.log('🌱 Seeding Timeline Events...');
  await Timeline.create([
    {
      entityType: 'LEAD',
      entityId: lead0._id,
      eventType: 'CONVERTED',
      title: 'Lead Converted',
      description: `Lead converted to Customer '${customer1.name}' and Deal '${deal1.title}'.`,
      performedBy: exec1._id,
    },
    {
      entityType: 'DEAL',
      entityId: deal1._id,
      eventType: 'DEAL_CLOSED',
      title: 'Deal Won',
      description: `Deal closed as Won with total revenue ₹${deal1.dealValue.toLocaleString()}.`,
      performedBy: exec1._id,
    },
    {
      entityType: 'DEAL',
      entityId: deal2._id,
      eventType: 'DEAL_STAGE_CHANGED',
      title: 'Moved to Negotiation Stage',
      description: `Deal stage advanced from Proposal to Negotiation.`,
      performedBy: exec2._id,
    },
  ]);

  console.log('🌱 Seeding Notifications...');
  await Notification.create([
    {
      recipient: exec2._id,
      sender: manager._id,
      title: 'New Deal Assigned',
      message: `You have been assigned deal Apex Cloud Systems - Cloud Integration.`,
      type: 'ASSIGNMENT',
      link: `/deals/${deal2._id}`,
      isRead: false,
    },
    {
      recipient: exec1._id,
      sender: admin._id,
      title: 'Deal Won Celebration!',
      message: `Congratulations on winning deal TechCorp Solutions - Enterprise License (₹125,000)!`,
      type: 'DEAL_STAGE',
      link: `/deals/${deal1._id}`,
      isRead: true,
    },
  ]);

  console.log('[SUCCESS] Database Seeding completed successfully!');
};
