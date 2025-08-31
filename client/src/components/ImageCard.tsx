import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

type ImageCardProps = {
  imageUrl: string;
};

function ImageCard({ imageUrl }: ImageCardProps) {
  const handleDownload = async (imageUrl: string) => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `ai-generated-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image", error);
    }
  };
  return (
    <>
      <div className="relative group w-full h-full">
        {/* Image */}
        <Image
          src={imageUrl}
          alt="Generated"
          width={512}
          height={512}
          className="w-full h-full object-contain"
        />

        {/* NEW Hover Button (icon only, top-right) */}
        <Button
          onClick={() => handleDownload(imageUrl)}
          variant="outline"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white border-white hover:bg-white hover:text-[#1c1b29]"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
      <Button
        onClick={() => handleDownload(imageUrl)}
        variant="outline"
        className="mt-4 bg-transparent text-white border-white hover:bg-white hover:text-[#1c1b29]"
      >
        <Download className="mr-2 h-4 w-4" />
        Download Image
      </Button>
    </>
  );
}

export default ImageCard;
