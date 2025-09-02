// components/ImageCardForHistory.tsx
"use client";

import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

type ImageCardProps = {
  imageUrl: string;
  prompt: string;
  model?: string;
};

function ImageCardForHistory({ imageUrl, prompt, model }: ImageCardProps) {
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent actions
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `freepik-ai-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  return (
    <div className="relative group aspect-square w-full h-auto overflow-hidden rounded-lg shadow-lg">
      {/* Image */}
      <Image
        src={imageUrl}
        alt={prompt || "AI generated image"}
        fill
        className="object-cover transition-transform duration-300 md:group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />

      {/* Download Button: Visible on mobile, hover on desktop */}
      <Button
        onClick={handleDownload}
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 text-white/80 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/20 hover:text-white"
      >
        <Download className="h-4 w-4" />
        <span className="sr-only">Download Image</span>
      </Button>

      {/* Prompt and Model Info Overlay: Visible on mobile, hover on desktop */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white transition-transform duration-300 md:translate-y-full md:group-hover:translate-y-0">
        {model && (
          <p className="font-bold text-sm capitalize truncate">{model}</p>
        )}
        <p className="text-xs text-gray-200 line-clamp-2">{prompt}</p>
      </div>
    </div>
  );
}

export default ImageCardForHistory;
