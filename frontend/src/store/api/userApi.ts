import { apiSlice } from './apiSlice';
import { User } from '../../types';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<{ success: boolean; data: User[] }, void>({
      query: () => '/users',
      providesTags: ['Users'],
    }),
    getSalesTeam: builder.query<{ success: boolean; data: User[] }, void>({
      query: () => '/users/team',
      providesTags: ['Users'],
    }),
    createUser: builder.mutation<{ success: boolean; data: User }, Partial<User>>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Users'],
    }),
    updateUser: builder.mutation<
      { success: boolean; data: User },
      { id: string; data: Partial<User> }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetSalesTeamQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
} = userApi;
