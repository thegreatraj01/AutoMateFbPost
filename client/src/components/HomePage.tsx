"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
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
import { Loader2 } from "lucide-react";
import Image from "next/image";
import {
  aspectRatios,
  FREEPIK_IMAGE_GENERATION_OPTIONS as OPTIONS,
} from "@/lib/freePikOptions";
import api from "@/lib/api-client";

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("standard");
  const [aspectRatio, setAspectRatio] = useState("square_1_1");
  const [style, setStyle] = useState(OPTIONS.styles[0]);
  const [colorEffect, setColorEffect] = useState(OPTIONS.color_effects[0]);
  const [lightingEffect, setLightingEffect] = useState(
    OPTIONS.lightning_effects[0]
  );
  const [framingEffect, setFramingEffect] = useState(
    OPTIONS.framing_effects[0]
  );
  const [color, setColor] = useState(OPTIONS.colors[0]);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setImageUrl("");

    try {
      const res = await api.post("", {
       
      });
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-4 p-4 md:mx-16 bg-slate-200 rounded-xl max-w-screen-xl">
      <h1 className="text-2xl font-bold text-center mb-6">
        AI Image Generator
      </h1>
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

          {/* THREE-COLUMN SELECTOR GRID */}
          <div className="grid grid-cols-3 gap-4">
            {/* COLUMN 1 */}
            <div className="space-y-4">
              <div>
                <Label className="p-2">Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="bg-[#1c1b29] text-white border-none">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c1b29] text-white border-none">
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="hd">HD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="p-2">Color Effect</Label>
                <Select value={colorEffect} onValueChange={setColorEffect}>
                  <SelectTrigger className="bg-[#1c1b29] text-white border-none">
                    <SelectValue placeholder="Select effect" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c1b29] text-white border-none">
                    {OPTIONS.color_effects.map((effect) => (
                      <SelectItem key={effect} value={effect}>
                        {effect}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* COLUMN 2 */}
            <div className="space-y-4">
              <div>
                <Label className="p-2">Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="bg-[#1c1b29] text-white border-none">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c1b29] text-white border-none max-h-[300px]">
                    {OPTIONS.styles.map((styleItem) => (
                      <SelectItem key={styleItem} value={styleItem}>
                        {styleItem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="p-2">Lighting</Label>
                <Select
                  value={lightingEffect}
                  onValueChange={setLightingEffect}
                >
                  <SelectTrigger className="bg-[#1c1b29] text-white border-none">
                    <SelectValue placeholder="Select lighting" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c1b29] text-white border-none">
                    {OPTIONS.lightning_effects.map((effect) => (
                      <SelectItem key={effect} value={effect}>
                        {effect}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* COLUMN 3 */}
            <div className="space-y-4">
              <div>
                <Label className="p-2">Framing</Label>
                <Select value={framingEffect} onValueChange={setFramingEffect}>
                  <SelectTrigger className="bg-[#1c1b29] text-white border-none">
                    <SelectValue placeholder="Select framing" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c1b29] text-white border-none">
                    {OPTIONS.framing_effects.map((effect) => (
                      <SelectItem key={effect} value={effect}>
                        {effect}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                {aspectRatios.map(({ label, value, icon: Icon }) => (
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

          {/* COLOR PICKER */}
          <div>
            <Label className="p-2">Accent Color</Label>
            <div className="flex flex-wrap gap-1 mt-2">
              {OPTIONS.colors.map((colorHex) => (
                <button
                  key={colorHex}
                  onClick={() => setColor(colorHex)}
                  className={`w-6 h-6 rounded-full border ${
                    color === colorHex
                      ? "border-white ring-2 ring-purple-500"
                      : "border-gray-300"
                  }`}
                  style={{ backgroundColor: colorHex }}
                  title={colorHex}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - IMAGE PREVIEW (40%) */}
        <div className="md:w-[50%] p-4">
          <Card className="bg-[#1c1b29] h-full">
            <CardContent className="flex justify-center items-center w-full h-full p-4 aspect-square">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Generated"
                  width={512}
                  height={512}
                  className="w-full h-full object-contain"
                />
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
    </div>
  );
}
