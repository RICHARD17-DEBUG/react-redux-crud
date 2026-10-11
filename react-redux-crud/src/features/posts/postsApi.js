import axios from 'axios';

// JSONPlaceholder is a free fake REST API. It accepts POST/PUT/DELETE
// and returns realistic responses, but it does not persist the changes.
const client = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
});

export const getPosts = async () => {
  const { data } = await client.get('/posts', { params: { _limit: 20 } });
  return data;
};

export const createPost = async (post) => {
  const { data } = await client.post('/posts', post);
  return data;
};

export const editPost = async (post) => {
  const { data } = await client.put(`/posts/${post.id}`, post);
  return data;
};

export const removePost = async (id) => {
  await client.delete(`/posts/${id}`);
  return id;
};
