# React CRUD with Redux Toolkit

A Posts Manager demonstrating Create, Read, Update and Delete using
React 18 (hooks), Redux Toolkit (`configureStore`, `createSlice`,
`createAsyncThunk`, `createSelector`) and Axios against the free
JSONPlaceholder REST API.

## Run

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # Vitest unit tests for the slice
npm run build   # production build
```

## Structure

```
src/
  app/store.js                  Redux store
  features/posts/
    postsApi.js                 Axios calls (REST layer)
    postsSlice.js               state, thunks, selectors
    PostForm.jsx                add / edit form
    PostList.jsx                list + delete
    postsSlice.test.js          unit tests
  hooks/useDebounce.js          custom hook
  App.jsx, main.jsx, index.css
```

## Notes
JSONPlaceholder does not persist changes, so after a page refresh the data
resets. Posts created in the session get ids above 100 and are edited/deleted
in the Redux store only.
