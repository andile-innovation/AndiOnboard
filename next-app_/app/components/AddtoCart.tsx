"use client";
import React, { useState, useRef } from "react";

interface AddtoCartProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSubmit: (customQuery?: string) => Promise<void>;
  isLoading: boolean;
}

export default function AddtoCart({ inputValue, setInputValue, onSubmit, isLoading }: AddtoCartProps) {
  const [activeTab, setActiveTab] = useState<"prompt" | "pdf">("prompt");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestionChips = [
    "What are the best practices for configuring a Pinecone HNSW index for 768-dimensional vectors?",
    "Explain how an AI Solutions Engineer configures Inngest event orchestration structures."
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const clearFile = () => {
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const safeInput = (inputValue || "").trim();
    if (!safeInput && !fileName) return;

    if (activeTab === "prompt") {
      onSubmit();
    } else {
      onSubmit(`Uploaded document context target: ${fileName}`);
      clearFile();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-5xl flex flex-col gap-6 text-white">
      
      <div className="text-center flex flex-col items-center gap-4 mb-2">
        <div className="badge badge-outline border-accent/30 text-accent bg-accent/5 text-xs px-3 py-3 gap-1.5 font-medium rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
          AI-Powered Career Intelligence
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white max-w-xl leading-tight">
          Discover your path to <span className="text-andile-sunshine block md:inline">Andile Solutions</span>
        </h1>
        <p className="text-sm opacity-70 max-w-lg leading-relaxed text-base-content">
          Share your background or drop a document. Our AI maps the exact skills you need to thrive at Andile.
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="w-full bg-base-100 border border-base-200 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
        
        <div className="flex items-center gap-6 border-b border-base-200 pb-3 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab("prompt")}
            className={`flex items-center gap-2 pb-1 transition-all ${
              activeTab === "prompt" 
                ? "text-andile-sunshine border-b-2 border-andile-sunshine font-medium" 
                : "opacity-60 hover:opacity-100"
            }`}
          >
            Write a prompt
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab("pdf")}
            className={`flex items-center gap-2 pb-1 transition-all ${
              activeTab === "pdf" 
                ? "text-andile-sunshine border-b-2 border-andile-sunshine font-medium" 
                : "opacity-60 hover:opacity-100"
            }`}
          >
            Upload a PDF
          </button>
        </div>

        {activeTab === "prompt" ? (
          <textarea
            value={inputValue || ""}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your background, experience, or the role you are targeting at Andile Solutions..."
            className="w-full min-h-[70px] bg-transparent resize-none outline-none text-sm text-white placeholder-white/40 border-0 p-0 focus:ring-0"
            rows={3}
          />
        ) : (
          <div className="py-4 flex flex-col items-center justify-center border border-dashed border-base-200 rounded-xl bg-base-200/20">
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              id="fullscreen-pdf-upload"
            />
            {fileName ? (
              <div className="flex items-center gap-3 bg-accent/10 border border-accent/20 px-4 py-2 rounded-lg">
                <span className="text-xs text-accent font-medium">{fileName}</span>
                <button type="button" onClick={clearFile} className="text-white hover:text-andile-power font-bold">✕</button>
              </div>
            ) : (
              <label htmlFor="fullscreen-pdf-upload" className="btn btn-sm btn-outline border-base-200 text-white hover:bg-base-200 transition-all cursor-pointer">
                Choose PDF File
              </label>
            )}
          </div>
        )}

        {activeTab === "prompt" && !(inputValue || "").trim() && (
          <div className="flex flex-col md:flex-row gap-2 pt-1">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputValue(chip)}
                className="text-xs bg-base-200/40 hover:bg-base-200 border border-base-200 text-white/80 hover:text-white px-3 py-2 rounded-lg transition-all text-left truncate max-w-md"
              >
                {chip.slice(0, 45)}...
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-base-200 pt-4 mt-1">
          <span className="text-xs opacity-40 text-base-content">Press Enter to submit</span>
          
          <button
            type="submit"
            disabled={(!(inputValue || "").trim() && !fileName) || isLoading}
            className="btn btn-sm bg-andile-sunshine hover:bg-andile-sunshine/80 text-base-300 border-none font-bold px-5 rounded-xl flex items-center gap-2 disabled:opacity-30 disabled:text-white"
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Generating...
              </>
            ) : (
              "Generate Roadmap ➔"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}