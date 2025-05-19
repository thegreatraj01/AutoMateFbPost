"use client";

import { useState, useEffect } from "react";
// import { Input } from "@/components/ui/input";
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
  FREEPIK_CLASSIC_FAST_OPTIONS,
  FREEPIK_FLUX_OPTIONS,
  fluxAspectRatios,
  classicFastAspectRatios,
} from "@/lib/freePikOptions";
import api from "@/lib/api-client";

interface ColorOption {
  color: string;
  weight: number;
}

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [model, setModel] = useState("standard");
  const [aspectRatio, setAspectRatio] = useState("square_1_1");
  const [style, setStyle] = useState("");
  const [colorEffect, setColorEffect] = useState("");
  const [lightingEffect, setLightingEffect] = useState("");
  const [framingEffect, setFramingEffect] = useState("");
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Determine which options to use based on model selection
  const OPTIONS =
    model === "standard" ? FREEPIK_CLASSIC_FAST_OPTIONS : FREEPIK_FLUX_OPTIONS;
  const currentAspectRatios =
    model === "standard" ? classicFastAspectRatios : fluxAspectRatios;

  // Initialize default values whenever model changes
  useEffect(() => {
    // Set defaults based on available options for the selected model
    if (model === "standard") {
      // Classic Fast defaults
      setStyle(FREEPIK_CLASSIC_FAST_OPTIONS.styles[0]);
      setColorEffect(FREEPIK_CLASSIC_FAST_OPTIONS.color_effects[0]);
      setLightingEffect(FREEPIK_CLASSIC_FAST_OPTIONS.lightning_effects[0]);
      setFramingEffect(FREEPIK_CLASSIC_FAST_OPTIONS.framing_effects[0]);
    } else {
      // Flux defaults
      setColorEffect(FREEPIK_FLUX_OPTIONS.color_effects[0]);
      setFramingEffect(FREEPIK_FLUX_OPTIONS.framing_effects[0]);
      setLightingEffect(FREEPIK_FLUX_OPTIONS.lightning_effects[0]);
      // Clear color since structure is different
      setColors([]);
      // Reset style since it's not available in Flux
      setStyle("");
      // Clear negative prompt since it's not used in Flux
      setNegativePrompt("");
    }

    // Check if current aspect ratio is available in the new model
    if (!OPTIONS.aspect_ratios.includes(aspectRatio)) {
      setAspectRatio(OPTIONS.aspect_ratios[0]);
    }
  }, [model]);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setImageUrl("");

    try {
      let requestData;
      let endpoint;

      if (model === "standard") {
        // For Classic Fast API
        endpoint = "/freepik/generate/classic-fast";
        requestData = {
          prompt,
          aspect_ratio: aspectRatio,
          color: colorEffect,
          style: style,
          framing: framingEffect,
          lightning: lightingEffect,
          colors,
          guidance_scale: parseFloat((Math.random() * 2).toFixed(1)),
          num_images: 1,
          seed: Math.floor(Math.random() * 1000000),
        };
      } else {
        // For Flux API
        endpoint = "/freepik/generate/flux";
        requestData = {
          prompt,
          aspect_ratio: aspectRatio,
          styling: {
            effects: {
              color: colorEffect,
              framing: framingEffect,
              lightning: lightingEffect,
            },
          },
          seed: Math.floor(Math.random() * 2147483648), // Random seed
        };

        // Colors are optional in Flux API
        if (colors) {
          // requestData.styling.colors = [
          //   {
          //     color: color,
          //     weight: 0.5
          //   }
          // ];
        }
      }

      // For  might want development purposes, youto use a proxy API route
      // instead of directly calling the Freepik API from the client
      const res = await api.post(`${endpoint}`, requestData);

      // Assuming the API returns the image URL in the response
      console.log("resdata", res.data);
      setImageUrl(res.data?.data?.Images[0]?.imageUrl);
    } catch (err) {
      setError("Something went wrong.");
      console.error(err);
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

            {model === "standard" && (
              <div className="mt-2">
                <Label>Negative Prompt (Optional)</Label>
                <Textarea
                  className="bg-[#1c1b29] text-white border-none min-h-[60px] mt-1"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="What to exclude (e.g., b&w, cartoon, ugly)"
                />
              </div>
            )}

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

          {/* MODEL SELECTION */}
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

          {/* THREE-COLUMN SELECTOR GRID */}
          <div className="grid grid-cols-3 gap-4">
            {/* COLUMN 1 */}
            <div className="space-y-4">
              {/* Style selector - only show for standard model */}
              {model === "standard" && (
                <div>
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
              )}

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
                {currentAspectRatios.map(({ label, value, icon: Icon }) => (
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

          {/* COLOR PICKER - only show for standard model */}
          {model === "standard" && (
            <div>
              <Label className="p-2">Accent Color</Label>
              <div className="flex flex-wrap gap-1 mt-2">
                {/* {FREEPIK_CLASSIC_FAST_OPTIONS.colors.map((colorObj) => (
                  <button
                    key={colorObj.color}
                    style={{ backgroundColor: colorObj.color }}
                    title={colorObj.color}
                  />
                ))} */}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL - IMAGE PREVIEW (50%) */}
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
