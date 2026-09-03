import { apiSlice } from './apiSlice';
import { Lead, PaginationMeta } from '../../types';

export const leadApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query<
      { success: boolean; data: Lead[]; pagination: PaginationMeta },
      Record<string, any> | void
    >({
      query: (params) => ({
        url: '/leads',
        params: params || {},
      }),
      providesTags: ['Leads'],
    }),
    getLeadById: builder.query<{ success: boolean; data: Lead }, string>({
      query: (id) => `/leads/${id}`,
      providesTags: (result, error, id) => [{ type: 'LeadDetails', id }],
    }),
    createLead: builder.mutation<{ success: boolean; data: Lead }, any>({
      query: (body) => ({
        url: '/leads',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leads', 'Dashboard'],
    }),
    updateLead: builder.mutation<{ success: boolean; data: Lead }, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/leads/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ['Leads', { type: 'LeadDetails', id }, 'Dashboard'],
    }),
    assignLead: builder.mutation<
      { success: boolean; data: Lead },
      { id: string; assignedTo: string; reason?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/leads/${id}/assign`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => ['Leads', { type: 'LeadDetails', id }, 'Dashboard', 'Timeline'],
    }),
    addNote: builder.mutation<{ success: boolean; data: Lead }, { id: string; text: string }>({
      query: ({ id, text }) => ({
        url: `/leads/${id}/notes`,
        method: 'POST',
        body: { text },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'LeadDetails', id }, 'Timeline'],
    }),
    convertLead: builder.mutation<
      { success: boolean; data: { lead: Lead; customer: any; deal: any } },
      { id: string; dealValue: number; probability?: number; expectedClosingDate?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/leads/${id}/convert`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leads', 'Customers', 'Deals', 'Dashboard', 'Timeline', 'Notifications'],
    }),
    deleteLead: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/leads/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Leads', 'Dashboard'],
    }),
  }),
});

export const {
  useGetLeadsQuery,
  useGetLeadByIdQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useAssignLeadMutation,
  useAddNoteMutation,
  useConvertLeadMutation,
  useDeleteLeadMutation,
} = leadApi;
