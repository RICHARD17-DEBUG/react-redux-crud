import { useDispatch, useSelector } from 'react-redux';
import { deletePost, selectVisiblePosts } from './postsSlice';

export default function PostList({ onEdit }) {
  const dispatch = useDispatch();
  const posts = useSelector(selectVisiblePosts);
  const { status } = useSelector((state) => state.posts);

  if (status === 'loading') return <p>Loading posts...</p>;
  if (status === 'succeeded' && posts.length === 0) return <p>No posts found.</p>;

  const handleDelete = (post) => {
    if (window.confirm(`Delete "${post.title}"?`)) dispatch(deletePost(post.id));
  };

  return (
    <ul className="list">
      {posts.map((post) => (
        <li key={post.id} className="card">
          <h3>
            #{post.id} {post.title}
          </h3>
          <p>{post.body}</p>
          <div className="row">
            <button onClick={() => onEdit(post)}>Edit</button>
            <button className="danger" onClick={() => handleDelete(post)}>
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
