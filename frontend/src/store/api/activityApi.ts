import { apiSlice } from './apiSlice';
import { Activity, PaginationMeta } from '../../types';

export const activityApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActivities: builder.query<
      { success: boolean; data: Activity[]; pagination: PaginationMeta },
      Record<string, any> | void
    >({
      query: (params) => ({
        url: '/activities',
        params: params || {},
      }),
      providesTags: ['Activities'],
    }),
    createActivity: builder.mutation<{ success: boolean; data: Activity }, any>({
      query: (body) => ({
        url: '/activities',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Activities', 'Dashboard', 'Timeline'],
    }),
    updateActivity: builder.mutation<{ success: boolean; data: Activity }, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/activities/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Activities', 'Dashboard', 'Timeline'],
    }),
  }),
});

export const {
  useGetActivitiesQuery,
  useCreateActivityMutation,
  useUpdateActivityMutation,
} = activityApi;
