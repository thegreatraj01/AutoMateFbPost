"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { Download, Loader2 } from "lucide-react";
import Image from "next/image";
import api from "@/lib/api-client";
import { FREEPIK_FLUX_OPTIONS, fluxAspectRatios } from "@/lib/freePikOptions";
import { toast } from "sonner";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ColorOption {
  color: string;
  weight: number;
}

interface EffectSelectorProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export default function FluxGenerator() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("square_1_1");
  const [colorEffect, setColorEffect] = useState(
    FREEPIK_FLUX_OPTIONS.color_effects[0]
  );
  const [lightingEffect, setLightingEffect] = useState(
    FREEPIK_FLUX_OPTIONS.lightning_effects[0]
  );
  const [framingEffect, setFramingEffect] = useState(
    FREEPIK_FLUX_OPTIONS.framing_effects[0]
  );
  const [colors, setColors] = useState<ColorOption[]>([
    {
      color: "#ffffff",
      weight: 0.5,
    },
  ]);
  const [newColor, setNewColor] = useState("#ffffff");
  const [newWeight, setNewWeight] = useState(0.5);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setImageUrl("");

    try {
      const requestData = {
        prompt,
        aspect_ratio: aspectRatio,
        color: colorEffect,
        framing: framingEffect,
        lightning: lightingEffect,
        colors,
        seed: Math.floor(Math.random() * 2147483648),
      };

      const res = await api.post("/freepik/generate/flux", requestData);
      setImageUrl(res.data?.data?.image?.imageUrl);
    } catch (err: unknown) {
      setError("Something went wrong.");

      // Safely check if it's an AxiosError (or similar)
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as any).response === "object"
      ) {
        const axiosErr = err as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };

        toast.error(axiosErr.response?.data?.message || "Something went wrong");
      } else {
        toast.error("Something went wrong");
      }

      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddColor = () => {
    if (!newColor || newWeight < 0.05 || newWeight > 1) return;

    const colorExists = colors.some((c) => c.color === newColor);
    if (colorExists) return toast.error("Dublicated not allowed"); // prevent duplicate colors
    if (colors.length >= 4) {
      toast.error("Max 4 colours are accepted");
      return;
    }

    setColors((prev) => [...prev, { color: newColor, weight: newWeight }]);
    setNewColor("#ffffff");
    setNewWeight(0.5);
  };

  const handleRemoveColor = (index: number) => {
    if (colors.length === 1) {
      toast.error("Add another color to remove this");
      return;
    }
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 justify-center">
      <div className="md:w-[40%] space-y-4">
        {/* Prompt Input */}
        <div className="space-y-2">
          <Label>Create an image from text prompt</Label>
          <Textarea
            className="bg-[#1c1b29] text-white border-none min-h-[120px]"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt..."
          />
          <Button
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
          >
            {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            Generate
          </Button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* Selectors Grid */}
        <div className="flex justify-between gap-4">
          <EffectSelector
            label="Color Effect"
            value={colorEffect}
            options={FREEPIK_FLUX_OPTIONS.color_effects}
            onChange={setColorEffect}
          />
          <EffectSelector
            label="Lighting"
            value={lightingEffect}
            options={FREEPIK_FLUX_OPTIONS.lightning_effects}
            onChange={setLightingEffect}
          />
          <EffectSelector
            label="Framing"
            value={framingEffect}
            options={FREEPIK_FLUX_OPTIONS.framing_effects}
            onChange={setFramingEffect}
          />
        </div>

        {/* Aspect Ratio */}
        <div>
          <Label className="p-2">Aspect Ratio</Label>
          <div className="overflow-x-auto mt-2 flex gap-3 pb-2 scrollbar-hide">
            <ToggleGroup
              type="single"
              value={aspectRatio}
              onValueChange={(value) => value && setAspectRatio(value)}
              className="flex gap-3"
            >
              {fluxAspectRatios.map(({ label, value, icon: Icon }) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  className="p-2 text-xs bg-black text-white border border-slate-800 data-[state=on]:bg-white data-[state=on]:text-black"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        {/* COLOR PICKER  */}
        <div className="space-y-2">
          <Label>Add Custom Colors</Label>

          {/* Input fields */}
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-10 h-10 p-0 border-none"
            />
            <input
              type="number"
              min="0.05"
              max="1"
              step="0.05"
              value={newWeight}
              onChange={(e) => setNewWeight(parseFloat(e.target.value))}
              className="w-20 px-2 py-1 rounded-md text-black"
            />
            <Button
              type="button"
              onClick={handleAddColor}
              className="bg-white text-black hover:bg-gray-200"
            >
              Add
            </Button>
          </div>

          {/* Show added colors with delete button */}
          <div className="flex flex-wrap gap-2 mt-2">
            {colors.map((c, idx) => (
              <div
                key={idx}
                className="relative group flex items-center gap-1 px-2 py-1 rounded bg-white text-black text-sm"
              >
                <span
                  className="w-4 h-4 inline-block rounded-full"
                  style={{ backgroundColor: c.color }}
                ></span>
                {c.color} ({c.weight}){/* Cross icon on hover */}
                <button
                  type="button"
                  onClick={() => handleRemoveColor(idx)}
                  className="absolute -top-2 -right-2 hidden group-hover:flex w-5 h-5 items-center justify-center rounded-full bg-red-500 text-white text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image Preview */}
      <div className="md:w-[50%] p-4">
        <Card className="bg-[#1c1b29] h-full">
          <CardContent className="flex flex-col justify-center items-center w-full h-full p-4 aspect-square">
            {imageUrl ? (
              <>
                <Image
                  src={imageUrl}
                  alt="Generated"
                  width={512}
                  height={512}
                  className="w-full h-full object-contain"
                />
                <Button
                  onClick={() => handleDownload(imageUrl)}
                  variant="outline"
                  className="mt-4 bg-transparent text-white border-white hover:bg-white hover:text-[#1c1b29]"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Image
                </Button>
              </>
            ) : (
              <div className="text-white/30 text-center p-4">
                <p>Your generated image will appear here</p>
                <p className="text-sm mt-2">
                  Enter a prompt and click Generate
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface EffectSelectorProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

const EffectSelector = ({
  label,
  value,
  options,
  onChange,
}: EffectSelectorProps) => (
  <div className="flex-1">
    <Label className="block mb-1">{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-[#1c1b29] text-white border border-gray-700 px-2 py-1 rounded">
        <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent className="bg-[#1c1b29] text-white border-none max-h-[300px]">
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
