// app/history/page.tsx (or wherever your history page is)
"use client";

import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import ImageCardForHistory from "./ImageCardForHistory";

// Define the shape of your Image object based on your API response
interface ImageHistoryItem {
  _id: string;
  imageUrl: string;
  prompt: string;
  createdAt: string;
  model?: string;
}

export default function HistoryAdminPage() {
  const { items, loading, error, order, setOrder, loadMore, hasNextPage } =
    useInfiniteScroll<ImageHistoryItem>("/history/admin");

  const { ref, inView } = useInView({
    threshold: 0.5, // Trigger when 50% of the loader is visible
    triggerOnce: false,
  });

  // Effect to load more items when the loader becomes visible
  useEffect(() => {
    if (inView && hasNextPage && !loading) {
      loadMore();
    }
  }, [inView, hasNextPage, loading, loadMore]);

  return (
    <div
      id="tab-home"
      onClick={() => {}}
      className="mx-auto mt-4 p-4 min-h-[60vh] md:mx-16 bg-neutral-50 rounded-xl max-w-screen-xl"
    >
      <h1
        onClick={() => {
          window.scrollTo({ top: 80, behavior: "smooth" }); // scroll to top
        }}
        className="text-2xl font-bold text-center mb-6 cursor-pointer"
      >
        Admin History
      </h1>
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Your Image History</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <Select
              value={order}
              onValueChange={(value: "asc" | "desc") => setOrder(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((image) => (
              <ImageCardForHistory
                key={image._id}
                imageUrl={image.imageUrl}
                prompt={image.prompt}
                model={image?.model}
                // You can pass more props like createdAt if your ImageCard supports it
              />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-20 text-gray-500">
              <p>You haven't generated any images yet.</p>
              <p className="text-sm">
                Start creating to see your history here!
              </p>
            </div>
          )
        )}

        {/* Loader and scroll trigger */}
        <div ref={ref} className="flex justify-center items-center h-20">
          {loading && (
            <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
          )}
          {!loading && !hasNextPage && items.length > 0 && (
            <p className="text-sm text-gray-500">You've reached the end.</p>
          )}
        </div>

        {error && (
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const History = () => {
  return (
    <div
      id="tab-home"
      onClick={() => {}}
      className="mx-auto mt-4 p-4 min-h-[60vh] md:mx-16 bg-slate-200 rounded-xl max-w-screen-xl"
    >
      <h1
        onClick={() => {
          window.scrollTo({ top: 80, behavior: "smooth" }); // scroll to top
        }}
        className="text-2xl font-bold text-center mb-6 cursor-pointer"
      >
        History
      </h1>
    </div>
  );
};
