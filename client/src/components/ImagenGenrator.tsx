"use client";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import api from "@/lib/api-client";
import {
  FREEPIK_IMAGEN3_OPTIONS,
  imagen3AspectRatios,
} from "@/lib/freePikOptions";
import ImageCard from "./ImageCard";

interface EffectSelectorProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export default function ImagenGenerator() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("square_1_1");
  const [style, setStyle] = useState(FREEPIK_IMAGEN3_OPTIONS.styles[0]);
  const [colorEffect, setColorEffect] = useState(
    FREEPIK_IMAGEN3_OPTIONS.color_effects[0]
  );
  const [lightingEffect, setLightingEffect] = useState(
    FREEPIK_IMAGEN3_OPTIONS.lightning_effects[0]
  );
  const [personGeneration, setPersonGeneration] = useState(
    FREEPIK_IMAGEN3_OPTIONS.person_generation[0]
  );
  const [safetySettings, setSafetySettings] = useState(
    FREEPIK_IMAGEN3_OPTIONS.safety_settings[0]
  );
  // const [numImages, setNumImages] = useState(1);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt.");
      return;
    }

    setLoading(true);
    setError("");
    setImageUrls([]);

    try {
      const requestData = {
        prompt,
        aspect_ratio: aspectRatio,
        style,
        color_effect: colorEffect,
        lightning_effect: lightingEffect,
        person_generation: personGeneration,
        safety_settings: safetySettings,
        num_images: 1,
      };

      const res = await api.post("/freepik/generate/imagen", requestData);
      if (res.status === 200) {
        setImageUrls(res.data?.data?.cloudinary_urls || []);
        console.log("Generation metadata:", res.data?.data?.generation_meta);
      }
    } catch (err: unknown) {
      if (!err) return;
      let msg = "Something went wrong during image generation.";
      if (isAxiosError(err) && err.response?.data?.message) {
        msg = err.response.data.message;
      }
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
        className="text-3xl font-bold text-center mb-6 cursor-pointer"
      >
        Imagen 
      </h1>
      <div className="flex flex-col md:flex-row gap-6 justify-center">
        <div className="md:w-[40%] space-y-4">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label>Create an image from text prompt</Label>
            <Textarea
              className="bg-[#1c1b29] text-white border-none min-h-[120px]"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt for Imagen3..."
            />
            <Button
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500"
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
            >
              {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              Generate with Imagen3
            </Button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          {/* Selectors Grid */}
          <div className="grid grid-cols-2 gap-4">
            <EffectSelector
              label="Style"
              value={style}
              options={FREEPIK_IMAGEN3_OPTIONS.styles}
              onChange={setStyle}
            />
            <EffectSelector
              label="Color Effect"
              value={colorEffect}
              options={FREEPIK_IMAGEN3_OPTIONS.color_effects}
              onChange={setColorEffect}
            />
            <EffectSelector
              label="Lighting"
              value={lightingEffect}
              options={FREEPIK_IMAGEN3_OPTIONS.lightning_effects}
              onChange={setLightingEffect}
            />
            <EffectSelector
              label="Person Generation"
              value={personGeneration}
              options={FREEPIK_IMAGEN3_OPTIONS.person_generation}
              onChange={setPersonGeneration}
            />
            <EffectSelector
              label="Safety Settings"
              value={safetySettings}
              options={FREEPIK_IMAGEN3_OPTIONS.safety_settings}
              onChange={setSafetySettings}
            />
            {/* <div className="flex-1">
              <Label className="block mb-1">Number of Images</Label>
              <Select
                value={String(numImages)}
                onValueChange={(value) => setNumImages(Number(value))}
              >
                <SelectTrigger className="bg-[#1c1b29] text-white border border-gray-700 px-2 py-1 rounded">
                  <SelectValue placeholder="Number of images" />
                </SelectTrigger>
                <SelectContent className="bg-[#1c1b29] text-white border-none">
                  {[1, 2, 3, 4].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}
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
                {imagen3AspectRatios.map(({ label, value, icon: Icon }) => (
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

        {/* Image Preview */}
        <div className="md:w-[50%] p-4">
          <Card className="bg-[#1c1b29] h-full">
            <CardContent className="flex flex-col justify-center items-center w-full h-full p-4 aspect-square">
              {imageUrls.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {imageUrls.map((url, index) => (
                    <ImageCard key={index} imageUrl={url} />
                  ))}
                </div>
              ) : (
                <div className="text-white/30 text-center p-4">
                  <p>Your generated image(s) will appear here</p>
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
