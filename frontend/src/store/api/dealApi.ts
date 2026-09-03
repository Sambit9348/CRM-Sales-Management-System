import { apiSlice } from './apiSlice';
import { Deal, DealStage, PaginationMeta } from '../../types';

export const dealApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDeals: builder.query<
      { success: boolean; data: Deal[]; pagination: PaginationMeta },
      Record<string, any> | void
    >({
      query: (params) => ({
        url: '/deals',
        params: params || {},
      }),
      providesTags: ['Deals'],
    }),
    getDealById: builder.query<{ success: boolean; data: Deal }, string>({
      query: (id) => `/deals/${id}`,
      providesTags: (result, error, id) => [{ type: 'DealDetails', id }],
    }),
    createDeal: builder.mutation<{ success: boolean; data: Deal }, any>({
      query: (body) => ({
        url: '/deals',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Deals', 'Dashboard'],
    }),
    updateDeal: builder.mutation<{ success: boolean; data: Deal }, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/deals/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ['Deals', { type: 'DealDetails', id }, 'Dashboard', 'Timeline'],
    }),
    updateDealStage: builder.mutation<
      { success: boolean; data: Deal },
      { id: string; stage: DealStage; lossReason?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/deals/${id}/stage`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => ['Deals', { type: 'DealDetails', id }, 'Dashboard', 'Timeline', 'Notifications'],
    }),
  }),
});

export const {
  useGetDealsQuery,
  useGetDealByIdQuery,
  useCreateDealMutation,
  useUpdateDealMutation,
  useUpdateDealStageMutation,
} = dealApi;
