import { apiSlice } from './apiSlice';
import { DashboardMetrics } from '../../types';

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<{ success: boolean; data: DashboardMetrics }, void>({
      query: () => '/dashboard',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
