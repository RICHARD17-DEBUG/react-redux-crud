import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import reducer, {
  fetchPosts, addPost, updatePost, deletePost, setSearch, selectVisiblePosts,
} from './postsSlice';
import * as api from './postsApi';

vi.mock('./postsApi'); // replace real HTTP calls with mock functions

const makeStore = () => configureStore({ reducer: { posts: reducer } });
const sample = [
  { id: 1, userId: 1, title: 'Redux Toolkit', body: 'slices and thunks' },
  { id: 2, userId: 1, title: 'React Hooks', body: 'useState and useEffect' },
];

describe('postsSlice', () => {
  beforeEach(() => vi.resetAllMocks());

  it('has the correct initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state).toMatchObject({ items: [], status: 'idle', error: null, search: '' });
  });

  it('READ: fetchPosts stores items and sets status to succeeded', async () => {
    api.getPosts.mockResolvedValue(sample);
    const store = makeStore();
    const promise = store.dispatch(fetchPosts());
    expect(store.getState().posts.status).toBe('loading');
    await promise;
    expect(store.getState().posts.status).toBe('succeeded');
    expect(store.getState().posts.items).toHaveLength(2);
  });

  it('READ: fetchPosts failure sets status failed and an error message', async () => {
    api.getPosts.mockRejectedValue(new Error('Network Error'));
    const store = makeStore();
    await store.dispatch(fetchPosts());
    expect(store.getState().posts.status).toBe('failed');
    expect(store.getState().posts.error).toBe('Network Error');
  });

  it('CREATE: addPost adds a new post at the top with a unique id', async () => {
    api.getPosts.mockResolvedValue(sample);
    api.createPost.mockResolvedValue({ id: 101, title: 'New', body: 'Body', userId: 1 });
    const store = makeStore();
    await store.dispatch(fetchPosts());
    await store.dispatch(addPost({ title: 'New', body: 'Body', userId: 1 }));
    const { items } = store.getState().posts;
    expect(items).toHaveLength(3);
    expect(items[0].title).toBe('New');
    expect(items[0].id).toBe(101);
  });

  it('UPDATE: updatePost replaces the matching post', async () => {
    api.getPosts.mockResolvedValue(sample);
    api.editPost.mockResolvedValue({ ...sample[0], title: 'Changed' });
    const store = makeStore();
    await store.dispatch(fetchPosts());
    await store.dispatch(updatePost({ ...sample[0], title: 'Changed' }));
    expect(store.getState().posts.items[0].title).toBe('Changed');
  });

  it('DELETE: deletePost removes the post', async () => {
    api.getPosts.mockResolvedValue(sample);
    api.removePost.mockResolvedValue(1);
    const store = makeStore();
    await store.dispatch(fetchPosts());
    await store.dispatch(deletePost(1));
    expect(store.getState().posts.items.map((p) => p.id)).toEqual([2]);
  });

  it('DELETE: a failed request keeps the post and stores the error', async () => {
    api.getPosts.mockResolvedValue(sample);
    api.removePost.mockRejectedValue(new Error('Server down'));
    const store = makeStore();
    await store.dispatch(fetchPosts());
    await store.dispatch(deletePost(1));
    expect(store.getState().posts.items).toHaveLength(2);
    expect(store.getState().posts.error).toBe('Server down');
    expect(store.getState().posts.saving).toBe(false);
  });

  it('selector: selectVisiblePosts filters by search text', async () => {
    api.getPosts.mockResolvedValue(sample);
    const store = makeStore();
    await store.dispatch(fetchPosts());
    store.dispatch(setSearch('hooks'));
    const visible = selectVisiblePosts(store.getState());
    expect(visible).toHaveLength(1);
    expect(visible[0].id).toBe(2);
  });
});
