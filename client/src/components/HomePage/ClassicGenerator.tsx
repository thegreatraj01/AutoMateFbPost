"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Download } from "lucide-react";
import Image from "next/image";
import {
  FREEPIK_CLASSIC_FAST_OPTIONS,
  classicFastAspectRatios,
} from "@/lib/freePikOptions";
import api from "@/lib/api-client";
import { set } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "../ui/input";

interface ColorOption {
  color: string;
  weight: number;
}

export default function ClassicGenerator() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("square_1_1");
  const [style, setStyle] = useState(FREEPIK_CLASSIC_FAST_OPTIONS.styles[0]);
  const [colorEffect, setColorEffect] = useState(
    FREEPIK_CLASSIC_FAST_OPTIONS.color_effects[0]
  );
  const [lightingEffect, setLightingEffect] = useState(
    FREEPIK_CLASSIC_FAST_OPTIONS.lightning_effects[0]
  );
  const [framingEffect, setFramingEffect] = useState(
    FREEPIK_CLASSIC_FAST_OPTIONS.framing_effects[0]
  );
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newColor, setNewColor] = useState("#ffffff");
  const [newWeight, setNewWeight] = useState(0.5);
  const [filterNsfw, setFilterNsfw] = useState(true);

  const handleToggle = (checked: boolean) => {
    setFilterNsfw(!filterNsfw);
    console.log(filterNsfw);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setImageUrl("");

    try {
      const requestData = {
        prompt,
        aspect_ratio: aspectRatio,
        color: colorEffect,
        style,
        framing: framingEffect,
        lightning: lightingEffect,
        colors,
        guidance_scale: parseFloat((Math.random() * 2).toFixed(1)),
        num_images: 1,
        seed: Math.floor(Math.random() * 1000000),
        negative_prompt: negativePrompt,
        filter_nsfw: filterNsfw,
      };

      const res = await api.post("/freepik/generate/classic-fast", requestData);
      setImageUrl(res.data?.data?.Images[0]?.imageUrl);
      if (res.data?.success) {
        setError("");
        // setPrompt("");
        // setNegativePrompt("");
        // setColors([]);
      }
    } catch (err: any) {
      setError("Something went wrong.");
      toast.error(err.response?.data?.message || "Something went wrong");
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
    if (colorExists) return; // prevent duplicate colors
    if (colors.length >= 4) {
      toast.error("Max 4 colours are accepted");
      return ;
    }

    setColors((prev) => [...prev, { color: newColor, weight: newWeight }]);
    setNewColor("#ffffff");
    setNewWeight(0.5);
  };

  const handleRemoveColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 justify-center">
      {/* LEFT PANEL - CONTROLS */}
      <div className="md:w-[40%] space-y-4">
        {/* PROMPT */}
        <div className="space-y-2">
          <Label>Create an image from text prompt</Label>
          <Textarea
            className="bg-[#1c1b29] text-white border-none min-h-[120px]"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt..."
            required
          />

          <div className="mt-2">
            {/* Label + Hidden Switch in a Row */}
            <div className="flex items-center gap-2 relative group w-fit">
              <Label className="">Negative Prompt (Optional)</Label>

              {/* Stealth Switch */}
              <Switch
                id="airplane-mode"
                checked={filterNsfw}
                onCheckedChange={handleToggle}
                className="opacity-0 group-hover:opacity-30 transition-opacity duration-300 cursor-pointer"
              />
            </div>

            {/* Textarea Input */}
            <Textarea
              className="bg-[#1c1b29] text-white border-none min-h-[60px] mt-1"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="What to exclude (e.g., b&w, cartoon, ugly)"
            />
          </div>

          <Button
            type="submit"
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
            disabled={loading || !prompt.trim()}
          >
            {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            Generate
          </Button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <div className="flex justify-between gap-2">
          {/* COLUMN 1 */}
          <div className="space-y-2">
            <Label className="p-2">Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="bg-[#1c1b29] text-white border-none">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent className="bg-[#1c1b29] text-white border-none max-h-[300px]">
                {FREEPIK_CLASSIC_FAST_OPTIONS.styles.map((styleItem) => (
                  <SelectItem key={styleItem} value={styleItem}>
                    {styleItem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* COLUMN 2 */}
          <div className="space-y-2">
            <Label className="p-2">Lighting</Label>
            <Select value={lightingEffect} onValueChange={setLightingEffect}>
              <SelectTrigger className="bg-[#1c1b29] text-white border-none">
                <SelectValue placeholder="Select lighting" />
              </SelectTrigger>
              <SelectContent className="bg-[#1c1b29] text-white border-none max-h-[300px]">
                {FREEPIK_CLASSIC_FAST_OPTIONS.lightning_effects.map(
                  (effect) => (
                    <SelectItem key={effect} value={effect}>
                      {effect}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* COLUMN 3 */}
          <div className="space-y-2">
            <Label className="p-2">Framing</Label>
            <Select value={framingEffect} onValueChange={setFramingEffect}>
              <SelectTrigger className="bg-[#1c1b29] text-white border-none">
                <SelectValue placeholder="Select framing" />
              </SelectTrigger>
              <SelectContent className="bg-[#1c1b29] text-white border-none max-h-[300px]">
                {FREEPIK_CLASSIC_FAST_OPTIONS.framing_effects.map((effect) => (
                  <SelectItem key={effect} value={effect}>
                    {effect}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* COLUMN 4 */}
          <div className="space-y-2">
            <Label className="p-2">Color Effect</Label>
            <Select value={colorEffect} onValueChange={setColorEffect}>
              <SelectTrigger className="bg-[#1c1b29] text-white border-none">
                <SelectValue placeholder="Select effect" />
              </SelectTrigger>
              <SelectContent className="bg-[#1c1b29] text-white border-none max-h-[300px]">
                {FREEPIK_CLASSIC_FAST_OPTIONS.color_effects.map((effect) => (
                  <SelectItem key={effect} value={effect}>
                    {effect}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* COLOR PICKER  */}
        <div className="space-y-2">
          <Label>Add Custom Colors</Label>

          {/* Input fields */}
          <div className="flex gap-2 items-center">
            <Input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-10 h-10 p-0 border-none"
            />
            <Input
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

        {/* ASPECT RATIO - VISUAL BUTTONS */}
        <div>
          <Label className="p-2">Aspect Ratio</Label>
          <div className="overflow-x-auto mt-2 flex gap-3 pb-2 scrollbar-hide">
            <ToggleGroup
              type="single"
              value={aspectRatio}
              onValueChange={(value) => value && setAspectRatio(value)}
              className="flex gap-3"
            >
              {classicFastAspectRatios.map(({ label, value, icon: Icon }) => (
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
      </div>

      {/* RIGHT PANEL - IMAGE PREVIEW */}
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
