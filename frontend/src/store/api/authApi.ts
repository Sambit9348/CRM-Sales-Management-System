import { apiSlice } from './apiSlice';
import { User } from '../../types';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ success: boolean; data: { token: string; user: User } }, any>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getMe: builder.query<{ success: boolean; data: User }, void>({
      query: () => '/auth/me',
      providesTags: ['Users'],
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery } = authApi;
