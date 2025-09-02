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

  const fetchData = useCallback(async (page: number, currentOrder: 'asc' | 'desc') => {
    if (loading) return;
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
      toast.error('Failed to fetch history.');
      setError('Could not load data.');
    } finally {
      setLoading(false);
    }
  }, [endpoint, limit, loading]);
  
  // Effect to reset and fetch data when the order changes
  useEffect(() => {
    setItems([]); // Clear existing items
    fetchData(1, order); // Fetch first page with the new order
  }, [order]);


  const loadMore = () => {
    if (pagination.hasNextPage && !loading) {
      fetchData(pagination.page + 1, order);
    }
  };

  return { items, loading, error, order, setOrder, loadMore, hasNextPage: pagination.hasNextPage };
}
