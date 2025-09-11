"use client";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Loader2, Upload, X } from "lucide-react";
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
import { Slider } from "@/components/ui/slider";
import api from "@/lib/api-client";
import {
  FREEPIK_MYSTIC_OPTIONS,
  mysticAspectRatios,
} from "@/lib/freePikOptions";
import ImageCard from "./ImageCard";
import Image from "next/image";

interface EffectSelectorProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export default function MysticGenerator() {
  // State for all Mystic parameters
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("square_1_1");
  const [model, setModel] = useState(FREEPIK_MYSTIC_OPTIONS.model[0]);
  const [structureStrength, setStructureStrength] = useState(
    FREEPIK_MYSTIC_OPTIONS.structure_strength.default
  );
  const [styleReference, setStyleReference] = useState<string | null>(null); // Holds the base64 string
  const [styleReferencePreview, setStyleReferencePreview] = useState<
    string | null
  >(null); // For displaying the selected image
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Convert image file to base64
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setStyleReference(base64String);
        setStyleReferencePreview(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setStyleReference(null);
    setStyleReferencePreview(null);
  };
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt.");
      return;
    }

    setLoading(true);
    setError("");
    // setGeneratedImageUrl(""); // Keep the old image while a new one is generating

    try {
      // Base request data
      const baseRequestData = {
        prompt,
        aspect_ratio: aspectRatio,
        model,
      };

      // Conditionally add reference-related fields
      const requestData = {
        ...baseRequestData,
        ...(styleReference && {
          style_reference: styleReference,
          structure_strength: structureStrength, // Only include strength if there's a reference
        }),
      };

      const res = await api.post("/freepik/generate/mystic", requestData);

      if (res.status === 200) {
        setGeneratedImageUrl(res.data?.data?.cloudinary_url || "");
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
        className="text-2xl font-bold text-center mb-6 cursor-pointer"
      >
        Mystic
      </h1>
      <div className="flex flex-col md:flex-row gap-6 justify-center">
        {/* Left Panel: Controls */}
        <div className="md:w-[40%] space-y-4">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label>Create an image from text prompt</Label>
            <Textarea
              className="bg-[#1c1b29] text-white border-none min-h-[120px]"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt for Mystic..."
            />
            <Button
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500"
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
            >
              {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              Generate with Mystic
            </Button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          {/* Style Reference Image Upload */}
          <div className="space-y-2">
            <Label>Style Reference (Optional)</Label>
            <Card className="bg-[#2a293a] border-dashed border-2 border-gray-600">
              <CardContent className="p-4 text-center">
                {styleReferencePreview ? (
                  <div className="relative">
                    <Image
                      width={160}
                      height={160}
                      src={styleReferencePreview}
                      alt="Style Preview"
                      className="rounded-md max-h-40 mx-auto"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      id="style-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <Label
                      htmlFor="style-upload"
                      className="cursor-pointer flex flex-col items-center justify-center text-gray-400"
                    >
                      <Upload className="h-8 w-8 mb-2" />
                      <span>Upload an image for style reference</span>
                    </Label>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Selectors and Sliders Grid */}
          <div className="grid grid-cols-2 gap-4">
            <EffectSelector
              label="Model"
              value={model}
              options={FREEPIK_MYSTIC_OPTIONS.model}
              onChange={setModel}
            />
            <div className="col-span-2">
              <Label className="block mb-1">
                Structure Strength: {structureStrength}
              </Label>
              <Slider
                value={[structureStrength]}
                onValueChange={(value) => setStructureStrength(value[0])}
                min={FREEPIK_MYSTIC_OPTIONS.structure_strength.min}
                max={FREEPIK_MYSTIC_OPTIONS.structure_strength.max}
                step={1}
              />
            </div>
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
                {mysticAspectRatios.map(({ label, value, icon: Icon }) => (
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

        {/* Right Panel: Image Preview */}
        <div className="md:w-[50%] p-4">
          <Card className="bg-[#1c1b29] h-full">
            <CardContent className="flex flex-col justify-center items-center w-full h-full p-4 aspect-square">
              {generatedImageUrl ? (
                <ImageCard imageUrl={generatedImageUrl} />
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

// Reusable selector component
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
