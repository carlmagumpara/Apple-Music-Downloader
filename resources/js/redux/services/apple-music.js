// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { baseUrl } from '../../config';

// Define a service using a base URL and expected endpoints
export const appleMusicApi = createApi({
  reducerPath: 'appleMusicApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${baseUrl}/downloader/apple-music`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.token?.value || '';

      // If we have a token set in state, let's assume that we should be passing it.
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      headers.set('Accept', 'application/json');

      return headers;
    },
  }),
  timeout: 99999999,
  tagTypes: [],
  endpoints: (builder) => ({    
    extract: builder.mutation({
      query: (body) => ({
        url: `/extract`,
        method: 'POST',
        body,
      }),
    }),
    generate: builder.mutation({
      query: (body) => ({
        url: `/generate`,
        method: 'POST',
        body,
      }),
    }),
  }),
})

// Export hooks for usage in functional pages, which are
// auto-generated based on the defined endpoints
export const {
  useExtractMutation,
  useGenerateMutation,
} = appleMusicApi