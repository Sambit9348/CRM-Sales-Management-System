import { apiSlice } from './apiSlice';
import { Customer, Deal, PaginationMeta } from '../../types';

export const customerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<
      { success: boolean; data: Customer[]; pagination: PaginationMeta },
      Record<string, any> | void
    >({
      query: (params) => ({
        url: '/customers',
        params: params || {},
      }),
      providesTags: ['Customers'],
    }),
    getCustomerById: builder.query<
      { success: boolean; data: { customer: Customer; deals: Deal[] } },
      string
    >({
      query: (id) => `/customers/${id}`,
      providesTags: (result, error, id) => [{ type: 'CustomerDetails', id }],
    }),
    createCustomer: builder.mutation<{ success: boolean; data: Customer }, Partial<Customer>>({
      query: (body) => ({
        url: '/customers',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Customers', 'Dashboard'],
    }),
    updateCustomer: builder.mutation<
      { success: boolean; data: Customer },
      { id: string; data: Partial<Customer> }
    >({
      query: ({ id, data }) => ({
        url: `/customers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ['Customers', { type: 'CustomerDetails', id }],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} = customerApi;
