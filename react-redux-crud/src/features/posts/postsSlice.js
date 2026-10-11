import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import * as api from './postsApi';

// The fake API only knows posts 1-100. Posts created in this session get
// higher ids, so for them we update the Redux store without calling the API.
const SERVER_MAX_ID = 100;

const errorMessage = (e) => e.response?.data?.message || e.message || 'Something went wrong';

/* ---------- Async thunks (one per CRUD operation) ---------- */

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async (_, { rejectWithValue }) => {
  try {
    return await api.getPosts();
  } catch (e) {
    return rejectWithValue(errorMessage(e));
  }
});

export const addPost = createAsyncThunk('posts/addPost', async (post, { rejectWithValue }) => {
  try {
    return await api.createPost(post);
  } catch (e) {
    return rejectWithValue(errorMessage(e));
  }
});

export const updatePost = createAsyncThunk('posts/updatePost', async (post, { rejectWithValue }) => {
  try {
    return post.id > SERVER_MAX_ID ? post : await api.editPost(post);
  } catch (e) {
    return rejectWithValue(errorMessage(e));
  }
});

export const deletePost = createAsyncThunk('posts/deletePost', async (id, { rejectWithValue }) => {
  try {
    if (id <= SERVER_MAX_ID) await api.removePost(id);
    return id;
  } catch (e) {
    return rejectWithValue(errorMessage(e));
  }
});

/* ---------- Slice ---------- */

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'  (for the initial fetch)
  saving: false, // true while a create / update / delete request is running
  error: null,
  search: '',
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // READ
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message;
      })
      // CREATE
      .addCase(addPost.fulfilled, (state, action) => {
        // The fake API always answers with id 101, so we generate a unique id locally.
        const nextId = Math.max(SERVER_MAX_ID, ...state.items.map((p) => p.id)) + 1;
        state.items.unshift({ ...action.payload, id: nextId });
      })
      // UPDATE
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      // DELETE
      .addCase(deletePost.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      })
      // Shared handling for the three write operations
      .addMatcher(
        (action) => [addPost.pending, updatePost.pending, deletePost.pending].some((t) => t.match(action)),
        (state) => {
          state.saving = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => [addPost.fulfilled, updatePost.fulfilled, deletePost.fulfilled].some((t) => t.match(action)),
        (state) => {
          state.saving = false;
        }
      )
      .addMatcher(
        (action) => [addPost.rejected, updatePost.rejected, deletePost.rejected].some((t) => t.match(action)),
        (state, action) => {
          state.saving = false;
          state.error = action.payload ?? action.error.message;
        }
      );
  },
});

export const { setSearch, clearError } = postsSlice.actions;
export default postsSlice.reducer;

/* ---------- Selectors ---------- */

// Memoized: recomputes only when items or the search text change.
export const selectVisiblePosts = createSelector(
  [(state) => state.posts.items, (state) => state.posts.search],
  (items, search) => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q));
  }
);
