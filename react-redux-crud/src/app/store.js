import { configureStore } from '@reduxjs/toolkit';
import postsReducer from '../features/posts/postsSlice';

// Single source of truth for the whole application state.
export const store = configureStore({
  reducer: {
    posts: postsReducer,
  },
});
