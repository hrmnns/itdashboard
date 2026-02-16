import { useState, useEffect, useCallback } from 'react';
import { runQuery, initDB } from '../lib/db';
import type { DbRow } from '../types';

export function useQuery<T = DbRow>(query: string, params: (string | number | null | undefined)[] = []) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [version, setVersion] = useState(0); // To force refresh

    const refresh = useCallback(() => {
        setVersion(v => v + 1);
    }, []);

    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            // Skip execution if query is empty
            if (!query || query.trim() === '') {
                if (mounted) {
                    setData([]);
                    setLoading(false);
                }
                return;
            }

            try {
                setLoading(true);
                await initDB();

                const result = await runQuery(query, params);
                if (mounted) {
                    setData(result as T[]);
                    setError(null);
                }
            } catch (err: unknown) {
                if (mounted) {
                    console.error('Query error:', err);
                    setError(err instanceof Error ? err : new Error(String(err)));
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        // Listen for global DB update events
        const handleDbUpdate = () => {
            fetchData();
        };
        window.addEventListener('db-updated', handleDbUpdate);

        return () => {
            mounted = false;
            window.removeEventListener('db-updated', handleDbUpdate);
        };
    }, [query, JSON.stringify(params), version]);

    return { data, loading, error, refresh };
}
