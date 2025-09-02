// hooks/useInfiniteScroll.ts
'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api-client';
import { toast } from 'sonner';

interface PaginationState {
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

export function useInfiniteScroll<T>(
  endpoint: string,
  initialOrder: 'asc' | 'desc' = 'desc',
  limit: number = 20
) {
  const [items, setItems] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit,
    totalPages: 1,
    hasNextPage: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<'asc' | 'desc'>(initialOrder);

  // --- THE FIX IS HERE ---
  // The 'loading' state is managed inside the function but is not a dependency for creating the function itself.
  const fetchData = useCallback(async (page: number, currentOrder: 'asc' | 'desc') => {
    // The check `if (loading) return;` is now handled where loadMore is called,
    // but keeping it here is a good safeguard.
    // However, since we're about to set it to true, we can remove it for clarity.

    setLoading(true);
    setError(null);

    try {
      const res = await api.get(endpoint, {
        params: {
          page,
          limit,
          order: currentOrder,
        },
      });

      if (res.status === 200) {
        const { items: newItems, pagination: newPagination } = res.data.data;

        setItems((prevItems) => (page === 1 ? newItems : [...prevItems, ...newItems]));
        setPagination({
          page: newPagination.page,
          limit: newPagination.limit,
          totalPages: newPagination.totalPages,
          hasNextPage: newPagination.hasNextPage,
        });
      }
    } catch (err) {
      console.log(err);
      toast.error('Failed to fetch history.');
      setError('Could not load data.');
    } finally {
      setLoading(false);
    }
  }, [endpoint, limit]); // REMOVED 'loading' from this dependency array

  // Effect to reset and fetch data when the order changes
  useEffect(() => {
    setItems([]); // Clear existing items
    fetchData(1, order); // Fetch first page with the new order
  }, [order, fetchData]); // NOW IT'S SAFE to add fetchData here

  const loadMore = () => {
    // This check is now the primary guard against multiple simultaneous fetches
    if (pagination.hasNextPage && !loading) {
      fetchData(pagination.page + 1, order);
    }
  };

  return { items, loading, error, order, setOrder, loadMore, hasNextPage: pagination.hasNextPage };
}
