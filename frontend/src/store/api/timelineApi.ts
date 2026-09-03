import { apiSlice } from './apiSlice';
import { TimelineEvent } from '../../types';

export const timelineApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTimelineEvents: builder.query<
      { success: boolean; data: TimelineEvent[] },
      { entityType: string; entityId: string }
    >({
      query: ({ entityType, entityId }) => `/timeline/${entityType}/${entityId}`,
      providesTags: ['Timeline'],
    }),
  }),
});

export const { useGetTimelineEventsQuery } = timelineApi;
