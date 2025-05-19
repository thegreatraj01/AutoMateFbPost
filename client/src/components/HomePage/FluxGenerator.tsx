"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { FREEPIK_FLUX_OPTIONS, fluxAspectRatios } from "@/lib/freePikOptions";
import api from "@/lib/api-client";

export default function FluxGenerator() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("square_1_1");
  const [colorEffect, setColorEffect] = useState(FREEPIK_FLUX_OPTIONS.color_effects[0]);
  const [lightingEffect, setLightingEffect] = useState(FREEPIK_FLUX_OPTIONS.lightning_effects[0]);
  const [framingEffect, setFramingEffect] = useState(FREEPIK_FLUX_OPTIONS.framing_effects[0]);
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
        styling: {
          effects: {
            color: colorEffect,
            framing: framingEffect,
            lightning: lightingEffect,
          },
        },
        seed: Math.floor(Math.random() * 2147483648),
      };

      const res = await api.post("/freepik/generate/flux", requestData);
      setImageUrl(res.data?.data?.Images[0]?.imageUrl);
    } catch (err) {
      setError("Something went wrong.");
      console.error(err);
    } finally {
      setLoading(false);
    }
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
              <Label className="p-2">Color Effect</Label>
              <Select value={colorEffect} onValueChange={setColorEffect}>
                <SelectTrigger className="bg-[#1c1b29] text-white border-none">
                  <SelectValue placeholder="Select effect" />
                </SelectTrigger>
                <SelectContent className="bg-[#1c1b29] text-white border-none">
                  {FREEPIK_FLUX_OPTIONS.color_effects.map((effect) => (
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
              <Select value={lightingEffect} onValueChange={setLightingEffect}>
                <SelectTrigger className="bg-[#1c1b29] text-white border-none">
                  <SelectValue placeholder="Select lighting" />
                </SelectTrigger>
                <SelectContent className="bg-[#1c1b29] text-white border-none">
                  {FREEPIK_FLUX_OPTIONS.lightning_effects.map((effect) => (
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
                  {FREEPIK_FLUX_OPTIONS.framing_effects.map((effect) => (
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
      </div>

      {/* RIGHT PANEL - IMAGE PREVIEW */}
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
  );
}