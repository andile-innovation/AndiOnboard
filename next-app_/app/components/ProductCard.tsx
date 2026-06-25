"use client";

import { useState, useEffect } from "react";
import AddtoCart from "./AddtoCart";

export default function Home() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);

  const [queryInput, setQueryInput] = useState("");
  const [userName, setUserName] = useState("");
  // NEW: Track the physical skill map attachment 
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // ─── 1. STORAGE MOUNT LIFECYCLE CHECK ───
  useEffect(() => {
    const savedData = localStorage.getItem("andi_onboard_roadmap");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        const dataStr = typeof parsedData === 'string' ? parsedData : JSON.stringify(parsedData);
        
        if (dataStr.includes("503") || dataStr.includes("429") || dataStr.includes("RESOURCE_EXHAUSTED") || dataStr.includes("UNAVAILABLE")) {
          localStorage.removeItem("andi_onboard_roadmap");
        } else {
          setRoadmapData(parsedData);
          if (parsedData?.user_profile?.name) {
            setUserName(parsedData.user_profile.name);
          }
          setHasStarted(true); 
        }
      } catch (e) {
        console.error("Failed to parse cached roadmap data:", e);
        localStorage.removeItem("andi_onboard_roadmap");
      }
    }
    setIsCheckingStorage(false); 
  }, []);

  // ─── 2. PIPELINE EXECUTION ENGINE (MULTIPART FORM APPEND LOOP) ───
  const generateRoadmap = async (customQuery?: string) => {
    const activeQuery = customQuery || queryInput;
    
    // Guard checklist: ensure file object is attached alongside text tokens
    if (!userName.trim() || !activeQuery.trim() || !selectedFile) return; 

    setIsLoading(true);
    setError(null);
    setRoadmapData(null); 

    try {
      // Pack parameters into standard FormData boundaries
      const formData = new FormData();
      formData.append("name", userName.trim());
      formData.append("role", activeQuery.trim());
      formData.append("file", selectedFile);

      const response = await fetch("http://127.0.0.1:8000/api/generate-roadmap", {
        method: "POST",
        body: formData, // Automatically builds the boundary maps natively
      });

      if (!response.ok) {
        throw new Error("Failed to compile your custom onboarding roadmap.");
      }

      const data = await response.json();
      
      const contentCheck = typeof data === 'string' ? data : JSON.stringify(data);
      if (
        contentCheck.includes("503") || 
        contentCheck.includes("429") || 
        contentCheck.includes("RESOURCE_EXHAUSTED") || 
        contentCheck.includes("UNAVAILABLE")
      ) {
        throw new Error("API_LIMIT_REACHED");
      }
      
      localStorage.setItem("andi_onboard_roadmap", JSON.stringify(data));
      setRoadmapData(data); 
      setHasStarted(true);  
      setQueryInput(""); 
    } catch (err: any) {
      setError(err.message || "An unexpected network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnswer = () => {
    localStorage.removeItem("andi_onboard_roadmap"); 
    setRoadmapData(null);   
    setHasStarted(false);   
    setError(null);
    setUserName(""); 
    setSelectedFile(null); // Clear active selected file trace mapping
  };

  if (isCheckingStorage) {
    return (
      <div className="min-h-screen w-full bg-[#6141a2] flex items-center justify-center">
        <span className="loading loading-spinner loading-md text-primary"></span>
      </div>
    );
  }

  // ─── SPLASH WELCOME ENTRY VIEW ───
  if (!hasStarted && !isLoading) {
    return (
      <main className="min-h-screen w-full bg-[#6141a2] flex flex-col items-center justify-center text-white p-6">
        <div className="max-w-md w-full text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-base-100 border border-accent/20 flex items-center justify-center text-accent shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.59 2.51 14.98 14.98 0 0 0 3.43 14.63a14.98 14.98 0 0 0 12.16 2.32z" />
            </svg>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Welcome to <span className="text-primary">AndiOnboard</span>
            </h1>
            <p className="text-sm opacity-90 leading-relaxed text-white/90">
              Your intelligent gateway to mastering your career progression.
            </p>
          </div>

          {/* TRIPLE VALUE PIPELINE WRAPPER (NAME + ROLE + SKILLS ATTACHMENT) */}
          <div className="w-full flex flex-col gap-3">
            <div className="w-full text-left">
              <label className="text-[10px] tracking-wider font-bold text-white/70 uppercase pl-1 block mb-1">Your Name</label>
              <input 
                type="text" 
                placeholder="e.g., Tshepang, Sarah, Sipho" 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="input input-bordered w-full rounded-xl text-sm text-white bg-base-100 border-base-200 focus:border-accent outline-none"
              />
            </div>

            <div className="w-full text-left">
              <label className="text-[10px] tracking-wider font-bold text-white/70 uppercase pl-1 block mb-1">Target Advancement Role</label>
              <input 
                type="text" 
                placeholder="e.g., AI Solutions Engineer" 
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                className="input input-bordered w-full rounded-xl text-sm text-white bg-base-100 border-base-200 focus:border-accent outline-none"
              />
            </div>

            {/* DYNAMIC SKILLS UPLOAD COMPONENT */}
            <div className="w-full text-left">
              <label className="text-[10px] tracking-wider font-bold text-white/70 uppercase pl-1 block mb-1">Upload Your Skills / Resume PDF</label>
              <input 
                type="file" 
                accept="application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                className="file-input file-input-bordered file-input-primary w-full rounded-xl text-sm text-white bg-base-100 border-base-200 focus:border-accent outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="text-andile-power text-xs font-semibold bg-base-100/90 px-4 py-2 rounded-xl border border-andile-power/20 shadow-md">
              {error === "API_LIMIT_REACHED" ? "⚠️ Rate limit reached. Wait 30 seconds and retry!" : error}
            </div>
          )}

          <button
            onClick={() => generateRoadmap()}
            disabled={isLoading || !queryInput.trim() || !userName.trim() || !selectedFile}
            className="btn btn-md btn-primary font-bold px-8 rounded-xl w-full sm:w-auto shadow-lg disabled:opacity-50"
          >
            Get Started
          </button>
        </div>
      </main>
    );
  }

  // ─── MAIN APPLICATION LAYER VIEW ───
  return (
    <div className="min-h-screen w-full bg-[#6141a2] text-base-content flex flex-col justify-between">
      <main className="w-full max-w-5xl mx-auto px-4 pt-12 pb-16 flex flex-col items-center gap-8">
        
        <AddtoCart 
          inputValue={queryInput}
          setInputValue={setQueryInput}
          onSubmit={generateRoadmap}
          isLoading={isLoading}
        />

        {isLoading && (
          <div className="bg-base-100 border border-base-200 p-6 rounded-xl w-full shadow-md flex flex-col gap-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary via-accent to-secondary animate-pulse" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl animate-bounce">🚀</span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    AI Agent Computing Gap Metrics for {userName}
                    <span className="inline-flex h-2 w-2 rounded-full bg-accent animate-ping" />
                  </h3>
                  <p className="text-xs opacity-60">Extracting raw document skill layouts & loading vectors...</p>
                </div>
              </div>
              <span className="text-xl animate-spin [animation-duration:3s]">🧠</span>
            </div>
            <div className="space-y-3 pt-2 animate-pulse">
              <div className="h-4 bg-base-200/60 rounded-md w-full"></div>
              <div className="h-4 bg-base-200/60 rounded-md w-11/12"></div>
              <div className="h-4 bg-base-200/60 rounded-md w-4/5"></div>
            </div>
          </div>
        )}
        
        {roadmapData && !isLoading && (
          <div className="bg-base-100 border border-base-200 p-6 rounded-xl w-full shadow-md relative group transition-all duration-300">
            
            <button 
              onClick={handleDeleteAnswer}
              className="absolute top-4 right-4 bg-andile-power/10 hover:bg-andile-power text-andile-power hover:text-white transition-all duration-200 rounded-lg p-2 flex items-center justify-center border border-andile-power/20"
              title="Reset profile session"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 6.6m-3.6 0L10 9m4.77-3.52 1.14 1.14M18.334 6.273a24.105 24.105 0 0 0-2.28-.158m-11.31 0a24.106 24.106 0 0 1 2.28-.158m1.14-1.14A1.95 1.95 0 0 1 8.8 3h6.4a1.95 1.95 0 0 1 1.41.59l1.14 1.14M18 19.5a3.375 3.375 0 0 1-3.375 3.375H9.375A3.375 3.375 0 0 1 6 19.5V6.257h12V19.5z" />
              </svg>
            </button>

            <div className="border-b border-base-200 pb-4 mb-4">
              <h2 className="text-xl font-bold text-primary mb-1">
                🎯 Career Gap Analysis for {roadmapData?.user_profile?.name || "Team Member"}
              </h2>
              <p className="text-xs opacity-70 text-white">
                Target Objective Role: <span className="font-semibold text-accent">{roadmapData?.user_profile?.role || "Specified Position"}</span>
              </p>
            </div>
            
            <div className="prose max-w-none text-sm leading-relaxed whitespace-pre-line text-base-content/90">
              {roadmapData?.generated_roadmap_text || roadmapData?.details || JSON.stringify(roadmapData)}
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-base-100 border border-andile-power/30 p-6 rounded-xl w-full shadow-lg flex flex-col items-center justify-center gap-3 text-center transition-all">
            <span className="text-3xl animate-pulse">⏳</span>
            <div className="flex flex-col gap-1 max-w-md">
              <h4 className="text-sm font-bold text-white">Gemini Quota Window Engaged</h4>
              <p className="text-xs text-base-content opacity-70">
                Hi {userName || "there"}, you've hit the temporary free-tier request limit. Please wait about 25 seconds for the Google window to cycle open!
              </p>
            </div>
            <button 
              onClick={() => generateRoadmap()} 
              className="btn btn-xs bg-andile-power hover:bg-andile-power/80 border-none text-white px-4 py-1.5 rounded-lg text-xs font-semibold mt-1 shadow-md"
            >
              🔄 Retry Connection Pipeline
            </button>
          </div>
        )}
      </main>
    </div>
  );
}