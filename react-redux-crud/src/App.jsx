import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, setSearch, clearError } from './features/posts/postsSlice';
import PostForm from './features/posts/PostForm';
import PostList from './features/posts/PostList';
import useDebounce from './hooks/useDebounce';

export default function App() {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.posts);
  const [editing, setEditing] = useState(null); // local UI state: which post is being edited
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 300);

  // Load posts once when the app starts.
  useEffect(() => {
    if (status === 'idle') dispatch(fetchPosts());
  }, [status, dispatch]);

  // Push the debounced search text into the Redux store.
  useEffect(() => {
    dispatch(setSearch(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  return (
    <main className="container">
      <h1>Posts Manager</h1>
      <p className="subtitle">React CRUD with Redux Toolkit</p>

      {error && (
        <div className="error banner">
          {error}
          <button className="link" onClick={() => dispatch(clearError())}>
            Dismiss
          </button>
          {status === 'failed' && (
            <button className="link" onClick={() => dispatch(fetchPosts())}>
              Retry
            </button>
          )}
        </div>
      )}

      <PostForm editing={editing} onDone={() => setEditing(null)} />

      <input
        className="search"
        placeholder="Search posts..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      <PostList onEdit={setEditing} />
    </main>
  );
}
