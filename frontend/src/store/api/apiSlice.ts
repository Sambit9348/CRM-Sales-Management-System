import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token || localStorage.getItem('crm_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'Leads',
    'LeadDetails',
    'Customers',
    'CustomerDetails',
    'Deals',
    'DealDetails',
    'Activities',
    'Dashboard',
    'Notifications',
    'Users',
    'Timeline',
  ],
  endpoints: () => ({}),
});
