import { useState, useEffect } from 'react';

// Custom hook: returns `value` only after it has stopped changing for `delay` ms.
export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // cleanup on every change / unmount
  }, [value, delay]);

  return debounced;
}
