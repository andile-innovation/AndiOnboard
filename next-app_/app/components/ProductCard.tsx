"use client";

import React, { useState } from "react";
import Link from "next/link";

interface RoadmapResponse {
  user_profile: {
    name: string;
    role: string;
  };
  generated_roadmap_text: string;
}

// Explicit properties interface connecting back-navigation state context safely
interface DashboardProps {
  onBackToWelcome: () => void;
}

export default function ProductCard({ onBackToWelcome }: DashboardProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roadmapData, setRoadmapData] = useState<RoadmapResponse | null>(null);
  
  // Tab control management node configuration
  const [activeTab, setActiveTab] = useState<"dashboard" | "about-us" | "careers" | "contact" | "Lunch Time">("dashboard");

  const [contactMessage, setContactMessage] = useState("");
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please choose a valid text-extractable background profile PDF.");
      return;
    }

    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("role", role);
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/generate-roadmap", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to process profile analysis.");
      }

      const data: RoadmapResponse = await response.json();

      await fetch("http://127.0.0.1:8000/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: name || "Anonymous User",
          target_role: role || "Unspecified Role",
          message: `Generated AI career advancement profile tracking matrix for ${name || "Anonymous"}.`,
        }),
      }).catch((err) => console.error("Telemetry sync failure:", err));

      setRoadmapData(data);
      setActiveTab("dashboard"); 
    } catch (err: any) {
      setError(err.message || "An unexpected network link failure occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleHandleCustomTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;

    setSubmittingTicket(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: name || "Web Inquirer",
          target_role: role || "General Feedback",
          message: contactMessage,
        }),
      });

      if (!response.ok) throw new Error("Server reject.");
      setTicketSubmitted(true);
      setContactMessage("");
    } catch (err) {
      alert("Failed to submit your message. Please try again.");
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleResetForm = () => {
    setRoadmapData(null);
    setFile(null);
    setName("");
    setRole("");
    setError("");
  };

  // Triggers print view isolated cleanly via print-specific style directives
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: "#ffffff" }}>
      
      {/* Dynamic CSS Style Injector block to support clean PDF Export views natively */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body, html { background: #fff !important; color: #000 !important; }
          header, footer, section:first-of-type, .no-print { display: none !important; }
          main { max-w-full !important; width: 100% !important; padding: 0 !important; margin: 0 !important; display: block !important; }
          .print-target { border: none !important; box-shadow: none !important; width: 100% !important; min-height: 0 !important; padding: 0 !important; }
        }
      `}} />

      {/* HEADER: BRAND COLOR BLOCK (#a7a335 + #3c233f Anchor Line) */}
      <header className="p-6 shadow-sm no-print" style={{ backgroundColor: "#a7a335", borderBottom: "4px solid #3c233f" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* BACK LINK WITH STATE CLEANUP RESET */}
          <div 
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("andionboard_screen");
              }
              onBackToWelcome();
            }} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="font-extrabold w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-md transform group-hover:rotate-6 transition-transform duration-200" style={{ backgroundColor: "#3c233f", color: "#ffffff" }}>И</div>
            <span className="text-2xl font-bold tracking-tight text-white transition-colors duration-200 group-hover:text-[#3c233f]">AndiOnboard</span>
          </div>

          <button 
            onClick={() => window.location.href = "/admin/login"}
            className="text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: "#3c233f", color: "#ffffff" }}
          >
            Admin Gateway →
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL SIDEBAR CONTROLS */}
        <section className="lg:col-span-4 p-6 rounded-2xl border bg-white shadow-sm space-y-6 relative z-10 no-print" style={{ borderColor: "#a7a335" }}>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight flex items-center justify-between" style={{ color: "#3c233f" }}>
              AndiOnboard <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: "#ffc34c", color: "#3c233f" }}>COE</span>
            </h2>
            <p className="text-sm mt-1 font-medium text-gray-500">Centres of Excellence Career Management.</p>
          </div>

          <form onSubmit={handleSubmitProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#3c233f" }}>Name</label>
              <input 
                type="text" required disabled={loading || !!roadmapData} placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none text-sm focus:border-[#3c233f] disabled:opacity-60 bg-gray-50/50" 
                style={{ color: "#3c233f" }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#3c233f" }}>
                Role
              </label>
              <select 
                required 
                disabled={loading || !!roadmapData} 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none text-sm focus:border-[#3c233f] disabled:opacity-60 bg-gray-50/50 appearance-none" 
                style={{ color: "#3c233f" }}
              >
                <option value="" disabled hidden>Select target role</option>
                <option value="Senior Software Engineer">Senior Software Engineer</option>
                <option value="Junior Software Engineer">Junior Software Engineer</option>
                <option value="Graduate Program for Software Engineer">Graduate Program for Software Engineer</option>
                <option value="Graduate Program for System Analyst">Graduate Program for System Analyst</option>
                <option value="Senior System Analyst">Senior System Analyst</option>
                <option value="Junior System Analyst">Junior System Analyst</option>
                <option value="Cloud Engineer">Cloud Engineer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#3c233f" }}>
                File upload
              </label>
              <div className="w-full px-3 py-2 border border-gray-200 rounded-xl flex items-center space-x-2 bg-gray-50/50">
                <svg 
                  className={`w-5 h-5 flex-shrink-0 ${(loading || !!roadmapData) ? 'opacity-60' : ''}`}
                  fill="none" 
                  stroke="#3c233f" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16v1a3 3 0 003 3h12a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                </svg>

                <input 
                  type="file" 
                  accept=".pdf" 
                  required={!roadmapData} 
                  disabled={loading || !!roadmapData} 
                  onChange={handleFileChange} 
                  className="text-xs transition-all cursor-pointer disabled:opacity-60" 
                  style={{ color: "#3c233f" }} 
                />
              </div>
            </div>

            {error && (
              <p className="text-white text-xs font-medium p-3 rounded-xl shadow-sm" style={{ backgroundColor: "#f74434" }}>⚠️ Error: {error}</p>
            )}

            {!roadmapData ? (
              <button 
                type="submit" disabled={loading} className="w-full text-white font-bold py-3 rounded-xl shadow-sm text-sm uppercase tracking-wider hover:opacity-90 disabled:opacity-50 cursor-pointer" 
                style={{ backgroundColor: "#a7a335" }}
              >
                {loading ? "Analyzing Profile Chunks..." : "Submit Profile"}
              </button>
            ) : (
              <button 
                type="button" onClick={handleResetForm} className="w-full font-bold py-3 rounded-xl shadow-sm text-sm uppercase tracking-wider text-white hover:opacity-90 cursor-pointer" 
                style={{ backgroundColor: "#3c233f" }}
              >
                ↺ Generate New Roadmap
              </button>
            )}
          </form>

          <hr style={{ borderColor: "#e5e7eb" }} />
          
          <nav className="grid grid-cols-2 gap-y-2 text-xs font-bold">
            {["dashboard", "about-us", "careers", "contact", "Lunch Time"].map((tab) => (
              <button 
                key={tab}
                onClick={() => { setActiveTab(tab as any); if(tab === "contact") setTicketSubmitted(false); }} 
                className="text-left flex items-center p-2 rounded-lg capitalize transition-all cursor-pointer"
                style={{ 
                  color: "#a7a335", 
                  borderLeft: activeTab === tab ? "3px solid #a7a335" : "3px solid transparent",
                  backgroundColor: activeTab === tab ? "#f9fafb" : "transparent"
                }}
              >
                ● {tab.replace("-", " ")}
              </button>
            ))}
          </nav>
        </section>

        {/* RIGHT WORKSPACE CARD PANEL */}
        <section className="print-target lg:col-span-8 min-h-[500px] rounded-2xl p-8 bg-white border shadow-sm flex flex-col justify-between" style={{ borderColor: "#a7a335" }}>
          
          <div className="flex-1 flex flex-col justify-center">
            {activeTab === "dashboard" && (
              <>
                {loading && (
                  <div className="text-center space-y-4 animate-pulse">
                    <div className="w-12 h-12 rounded-full border-4 animate-spin mx-auto" style={{ borderTopColor: "#ffc34c", borderColor: "#3c233f", borderWidth: "3px" }} />
                    <h3 className="text-lg font-bold" style={{ color: "#3c233f" }}>Processing Document Metrics</h3>
                  </div>
                )}

                {!loading && !roadmapData && (
                  <div className="text-center space-y-4 max-w-md mx-auto no-print">
                    <span className="text-4xl block">🎯</span>
                    <h3 className="text-lg font-bold uppercase tracking-wide" style={{ color: "#3c233f" }}>Awaiting Profile Transmission</h3>
                    <p className="text-sm leading-relaxed text-gray-500">Submit your profile metrics in the left-hand configuration card to compile a corporate gap analysis model.</p>
                  </div>
                )}

                {!loading && roadmapData && (
                  <div className="space-y-6">
                    <div className="pb-4" style={{ borderBottom: "2px solid #ffc34c" }}>
                      <h3 className="text-xl font-extrabold tracking-tight" style={{ color: "#3c233f" }}>Tailored Professional Career Roadmap</h3>
                      <p className="text-xs font-bold mt-1 text-gray-500 uppercase tracking-wider">Target Destination: {roadmapData.user_profile.role}</p>
                    </div>
                    <div className="prose prose-slate max-w-none text-sm leading-relaxed whitespace-pre-line font-normal" style={{ color: "#3c233f" }}>
                      {roadmapData.generated_roadmap_text}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "about-us" && (
              <div className="space-y-4">
                <h3 className="text-2xl font-extrabold tracking-tight pb-2" style={{ color: "#3c233f", borderBottom: "2px solid #ffc34c" }}>About AndiOnboard</h3>
                <p className="text-sm leading-relaxed text-gray-700">AndiOnboard is an intelligent corporate internal career advancement architecture. By pairing high-performance Retrieval-Augmented Generation (RAG) through Pinecone with the reasoning capability of Gemini AI models, we allow centers of excellence to analyze background expertise gaps instantly against company benchmarks.</p>
              </div>
            )}

            {activeTab === "careers" && (
              <div className="space-y-4">
                <h3 className="text-2xl font-extrabold tracking-tight pb-2" style={{ color: "#3c233f", borderBottom: "2px solid #ffc34c" }}>Careers at Centers of Excellence</h3>
                <p className="text-sm leading-relaxed text-gray-700">Ready to transition into specialized high-proximity technological roles? Use the **Metrics Engine** layout panel to map your current technical certifications, engineering skillsets, and development methodologies to unlock active promotion pathways tailored to our team structural expansion targets.</p>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="space-y-6 w-full max-w-xl mx-auto">
                <div className="pb-3" style={{ borderBottom: "2px solid #ffc34c" }}>
                  <h3 className="text-2xl font-extrabold tracking-tight" style={{ color: "#3c233f" }}>Operations Support & Feedback</h3>
                </div>

                {!ticketSubmitted ? (
                  <form onSubmit={handleHandleCustomTicket} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#3c233f" }}>Write a ticket or platform review</label>
                      <textarea
                        required rows={5} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} placeholder="Type your support request or system review here..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none resize-none bg-gray-50/50 focus:bg-white focus:border-purple-600" style={{ color: "#3c233f" }}
                      />
                    </div>
                    <button type="submit" disabled={submittingTicket || !contactMessage.trim()} className="w-full text-white font-semibold py-3 rounded-xl shadow-sm text-sm uppercase tracking-wide hover:opacity-90 disabled:opacity-40 cursor-pointer" style={{ backgroundColor: "#3c233f" }}>
                      {submittingTicket ? "Sending message..." : "Submit Ticket / Review"}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-8 space-y-3 border rounded-2xl p-6 text-white" style={{ backgroundColor: "#849435" }}>
                    <span className="text-3xl block">✉️</span>
                    <h4 className="text-lg font-bold uppercase tracking-wider">Thank you for your feedback!</h4>
                    <p className="text-xs max-w-sm mx-auto opacity-90">Your message has been successfully logged with the administration operations team for review.</p>
                    <button onClick={() => setTicketSubmitted(false)} className="text-xs font-bold underline mt-2 block mx-auto text-white hover:opacity-80">Write another message</button>
                  </div>
                )}
              </div>
            )}

            {/* LUNCH BREAK GRID COMPONENT */}
            {activeTab === "Lunch Time" && (
              <div className="space-y-8 w-full">
                <div className="pb-3" style={{ borderBottom: "2px solid #ffc34c" }}>
                  <h3 className="text-2xl font-extrabold tracking-tight" style={{ color: "#3c233f" }}>
                    Rosebank Hub: Lunch & Dining Matrix
                  </h3>
                  <p className="text-xs font-medium text-gray-600 mt-1">
                    Select a venue below to explore local culinary nodes and business lunch hotspots.
                  </p>
                </div>

                {/* SECTION 1: TOP LUNCH SPOTS */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                    ━━ Top Lunch Spots
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    
                    {/* Proud Mary */}
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=Proud+Mary+Rosebank+Johannesburg"
                      target="_blank" rel="noopener noreferrer"
                      className="flex flex-col p-5 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-[#a7a335] transition-all group cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-3xl block transform group-hover:scale-110 transition-transform">🥩</span>
                        <span className="text-base font-black tracking-tight" style={{ color: "#000000" }}>Steak (Proud Mary)</span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed flex-1">
                        A trendy spot serving great steaks, burgers, and drinks. It has a beautiful bar area that is perfect for business lunches.
                      </p>
                    </a>

                    {/* Modern Tailors */}
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=Modern+Tailors+Rosebank+Johannesburg" 
                      target="_blank" rel="noopener noreferrer"
                      className="flex flex-col p-5 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-[#a7a335] transition-all group cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-3xl block transform group-hover:scale-110 transition-transform">🍛</span>
                        <span className="text-base font-black tracking-tight" style={{ color: "#000000" }}>Curry (Modern Tailors)</span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed flex-1">
                        Located in The Zone, this spot is highly recommended for flavorful modern Indian dishes and curries.
                      </p>
                    </a>

                    {/* Momo Kuro */}
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=Momo+Kuro+Rosebank+Johannesburg" 
                      target="_blank" rel="noopener noreferrer"
                      className="flex flex-col p-5 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-[#a7a335] transition-all group cursor-pointer relative"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-3xl block transform group-hover:scale-110 transition-transform">🥢</span>
                        <span className="text-base font-black tracking-tight" style={{ color: "#000000" }}>Sushi (Momo Kuro)</span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed flex-1">
                        Popular for great Asian-fusion food. Note that it does not serve alcohol, but it is a "bring your own bottle" (BYOB) spot.
                      </p>
                      <span className="absolute top-3 right-3 text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-sm animate-pulse" style={{ backgroundColor: "#ffc34c", color: "#3c233f" }}>BYOB</span>
                    </a>

                    {/* Tashas */}
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=Tashas+Rosebank+Johannesburg" 
                      target="_blank" rel="noopener noreferrer"
                      className="flex flex-col p-5 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-[#a7a335] transition-all group cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-3xl block transform group-hover:scale-110 transition-transform">🥗</span>
                        <span className="text-base font-black tracking-tight" style={{ color: "#000000" }}>Salad (Tashas)</span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed flex-1">
                        A well-loved café with a light and healthy menu. It is famous for great breakfasts, salads, and toasted sandwiches.
                      </p>
                    </a>

                    {/* Woolworths Cafe */}
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=Woolworths+Cafe+Rosebank+Johannesburg" 
                      target="_blank" rel="noopener noreferrer"
                      className="flex flex-col p-5 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-[#a7a335] transition-all group cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-3xl block transform group-hover:scale-110 transition-transform">🥐</span>
                        <span className="text-base font-black tracking-tight" style={{ color: "#000000" }}>Coffee (Woolworths Cafe)</span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed flex-1">
                        Located inside Rosebank Mall, this is a clean, reliable spot for fresh cafe-style meals, coffee, and pastries.
                      </p>
                    </a>

                  </div>
                </div>

                {/* SECTION 2: QUICK & BUDGET-FRIENDLY BITES */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                    ━━ Quick & Budget-Friendly Bites
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    
                    {/* RocoMamas */}
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=RocoMamas+Rosebank+Johannesburg" 
                      target="_blank" rel="noopener noreferrer"
                      className="flex flex-col p-4 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-[#a7a335] transition-all group cursor-pointer"
                    >
                      <span className="text-3xl block transform group-hover:scale-110 transition-transform mb-2">🍔</span>
                      <span className="text-sm font-bold tracking-tight" style={{ color: "#3c233f" }}>RocoMamas</span>
                      <p className="text-[11px] text-gray-600 mt-1 leading-normal">
                        Known for huge, messy, and fully customizable American-style gourmet burgers and ribs.
                      </p>
                    </a>

                    {/* Fugazzi */}
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=Fugazzi+Rosebank+Johannesburg" 
                      target="_blank" rel="noopener noreferrer"
                      className="flex flex-col p-4 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-[#a7a335] transition-all group cursor-pointer"
                    >
                      <span className="text-3xl block transform group-hover:scale-110 transition-transform mb-2">🍕</span>
                      <span className="text-sm font-bold tracking-tight" style={{ color: "#3c233f" }}>Fugazzi</span>
                      <p className="text-[11px] text-gray-600 mt-1 leading-normal">
                        A fun Italian spot perfect for grabbing a fresh slice or pasta on the go.
                      </p>
                    </a>

                    {/* Now Now */}
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=Now+Now+Rosebank+Johannesburg" 
                      target="_blank" rel="noopener noreferrer"
                      className="flex flex-col p-4 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-[#a7a335] transition-all group cursor-pointer"
                    >
                      <span className="text-3xl block transform group-hover:scale-110 transition-transform mb-2">🌯</span>
                      <span className="text-sm font-bold tracking-tight" style={{ color: "#3c233f" }}>Now Now</span>
                      <p className="text-[11px] text-gray-600 mt-1 leading-normal">
                        A quick and easy food bar in Rosebank Mall featuring fresh, healthy wraps and lunch bowls.
                      </p>
                    </a>

                    {/* Father Coffee */}
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=Father+Coffee+Rosebank+Johannesburg" 
                      target="_blank" rel="noopener noreferrer"
                      className="flex flex-col p-4 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-[#a7a335] transition-all group cursor-pointer"
                    >
                      <span className="text-3xl block transform group-hover:scale-110 transition-transform mb-2">☕</span>
                      <span className="text-sm font-bold tracking-tight" style={{ color: "#3c233f" }}>Father Coffee</span>
                      <p className="text-[11px] text-gray-600 mt-1 leading-normal">
                        A cozy local shop in The Zone serving light snacks and some of the best coffee selections around town.
                      </p>
                    </a>

                  </div>
                </div>
              </div>
            )}
          </div>

          {/* WORKSPACE ACTION FOOTER */}
          {!loading && roadmapData && activeTab === "dashboard" && (
            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-end space-x-3 no-print">
              <button
                onClick={handleResetForm}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all hover:bg-gray-50 text-gray-500 cursor-pointer border-gray-200"
              >
                ↺ Clear Content
              </button>
              <button
                onClick={handleExportPDF}
                className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: "#3c233f" }}
              >
                📥 Export Roadmap
              </button>
            </div>
          )}

        </section>
      </main>

      {/* FOOTER BLOCK */}
      <footer className="py-6 px-8 text-center text-xs text-white border-t no-print" style={{ backgroundColor: "#a7a335", borderColor: "#3c233f" }}>
        © 2026 Andile. All rights reserved. <br />
        <span className="font-mono text-[10px] mt-1 block opacity-60">Internal Career Management Node.</span>
      </footer>
    </div>
  );
}
