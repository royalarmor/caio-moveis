import { useState, useEffect } from 'react';

export default function useDebounce(value: string, delay: number) {
    const [delayedValue, setDelayedValue] = useState(value);

    useEffect(() => {
        const timeout = setTimeout(() => setDelayedValue(value), delay);
        return () => clearTimeout(timeout);
    }, [value, delay]);

    return delayedValue;
}