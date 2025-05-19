"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FluxGenerator from "./FluxGenerator";
import ClassicGenerator from "./ClassicGenerator";

export default function ImageGeneratorPage() {
  const [model, setModel] = useState("standard");

  return (
    <div className="mx-auto mt-4 p-4 md:mx-16 bg-slate-200 rounded-xl max-w-screen-xl">
      <h1 className="text-2xl font-bold text-center mb-6">AI Image Generator</h1>
      
      {/* Tab Selector for Model */}
      <div className="flex justify-center mb-6">
        <Tabs 
          value={model} 
          onValueChange={setModel}
          className="w-[400px]"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="standard" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500"
            >
              Standard
            </TabsTrigger>
            <TabsTrigger 
              value="hd"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500"
            >
              HD (Flux)
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Conditionally render the appropriate generator */}
      {model === "standard" ? <ClassicGenerator /> : <FluxGenerator />}
    </div>
  );
}