import { useState, useEffect } from 'react';

const useDebounceValue = (value, debounce) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), debounce);
    return () => clearTimeout(timeout);
  }, [value, debounce]);

  return debouncedValue;
};

export default useDebounceValue;
