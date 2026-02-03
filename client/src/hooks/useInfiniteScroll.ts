"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/api-client";
import { toast } from "sonner";

interface PaginationState {
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

export function useInfiniteScroll<T>(
  endpoint: string,
  initialOrder: "asc" | "desc" = "desc",
  limit: number = 20,
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
  const [order, setOrder] = useState<"asc" | "desc">(initialOrder);

  // Synchronous lock to prevent multiple simultaneous requests
  const isFetching = useRef(false);

  const fetchData = useCallback(
    async (page: number, currentOrder: "asc" | "desc") => {
      // If a fetch is already in progress, ignore any new requests immediately
      if (isFetching.current) return;

      isFetching.current = true;
      setLoading(true);
      setError(null);

      try {
        const res = await api.get(endpoint, {
          params: { page, limit, order: currentOrder },
        });

        if (res.status === 200) {
          const { items: newItems, pagination: newPagination } = res.data.data;

          setItems((prevItems) =>
            page === 1 ? newItems : [...prevItems, ...newItems],
          );

          setPagination({
            page: newPagination.page,
            limit: newPagination.limit,
            totalPages: newPagination.totalPages,
            hasNextPage: newPagination.hasNextPage,
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch history.");
        setError("Could not load data.");
      } finally {
        setLoading(false);
        isFetching.current = false; // Unlock so the next page can be fetched
      }
    },
    [endpoint, limit],
  );

  useEffect(() => {
    setItems([]);
    fetchData(1, order);
  }, [order, fetchData]);

  const loadMore = () => {
    if (pagination.hasNextPage && !loading && !isFetching.current) {
      fetchData(pagination.page + 1, order);
    }
  };

  return {
    items,
    loading,
    error,
    order,
    setOrder,
    loadMore,
    hasNextPage: pagination.hasNextPage,
  };
}
