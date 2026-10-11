import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addPost, updatePost } from './postsSlice';

const empty = { title: '', body: '' };

export default function PostForm({ editing, onDone }) {
  const dispatch = useDispatch();
  const saving = useSelector((state) => state.posts.saving);
  const [form, setForm] = useState(empty);
  const [formError, setFormError] = useState('');

  // When the user clicks "Edit", copy that post into the form fields.
  useEffect(() => {
    setForm(editing ? { title: editing.title, body: editing.body } : empty);
    setFormError('');
  }, [editing]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setFormError('Title and body are required.');
      return;
    }
    const action = editing
      ? updatePost({ ...editing, ...form })
      : addPost({ ...form, userId: 1 });

    const result = await dispatch(action);
    if (!result.error) {
      setForm(empty);
      onDone();
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{editing ? `Edit post #${editing.id}` : 'Add new post'}</h2>
      <input name="title" placeholder="Title" value={form.title} onChange={handleChange} />
      <textarea name="body" rows="3" placeholder="Body" value={form.body} onChange={handleChange} />
      {formError && <p className="error">{formError}</p>}
      <div className="row">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : editing ? 'Update' : 'Add'}
        </button>
        {editing && (
          <button type="button" className="secondary" onClick={onDone}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
