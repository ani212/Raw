import React, { useState, useEffect, useRef } from "react";
import { 
  Flame, 
  ChefHat, 
  Upload, 
  FileText, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Coins, 
  Building, 
  Check, 
  Copy, 
  RotateCcw, 
  Info, 
  X, 
  ChevronRight, 
  ExternalLink, 
  ShieldAlert, 
  Users, 
  Target, 
  Award,
  BookOpen,
  Download,
  FileDown,
  Link
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { exportResumeToPDF } from "./utils/pdfGenerator";

// Mock Sample "Unseasoned" Resume for easy testing
const SAMPLE_RESUME = `Alex Mercer
alex.mercer@email.com | (555) 019-2834 | San Francisco, CA

PROFESSIONAL SUMMARY
Highly motivated, passionate, and dedicated Software Engineer with a proven track record as a team player in fast-paced environments. Self-motivated fast learner looking to leverage strategic thinking and problem-solving skills to build innovative web applications. Always willing to go the extra mile to deliver results.

EXPERIENCE
Software Developer | TechCorp Inc. | 2023 - Present
- Responsible for writing clean code and fixing critical bugs on the main company website.
- Attended weekly standup meetings and collaborated with cross-functional teams of developers and designers.
- Helped with the migration of legacy systems to the modern cloud environment.
- Worked on optimizing databases to make things run faster and improved user interface pages.

Junior Developer | WebStarts Agency | 2021 - 2023
- Developed several websites for various clients using HTML, CSS, JavaScript, and WordPress.
- Assisted senior engineers in debugging and testing features prior to production releases.
- Communicated with clients to understand their needs and took care of general updates.

PROJECTS
My Cool Chat App
- Built a web chat app using React and Node.js.
- Users can log in and send messages to each other in real-time.
- Put the code on GitHub and deployed it for free on a hosting site.

SKILLS
HTML, CSS, JavaScript, React, Node.js, Microsoft Office, Word, Excel, PowerPoint, Team Player, Hardworking, Fast Learner, Problem Solving, Strategic Thinker, Adaptability

EDUCATION
Bachelor of Science in Computer Science | State University | 2017 - 2021
- Completed various courses in programming, networking, and software systems.
- Member of the computer science club.

CERTIFICATIONS
- Introduction to Python Certificate
- Certified Hard Worker Badge`;

// Funny Ramsay Cooking Prep Messages
const LOADING_STEPS = [
  "Preheating the oven to 450°C and sharpening the knives...",
  "Searing your summary. Smells like generic, unseasoned corporate fluff...",
  "Trimming off the meaningless buzzword fat. Throwing 'passionate fast learner' straight in the bin...",
  "Seasoning experience bullets with measurable metrics and business impact...",
  "Plating the Michelin-star rewrite. Ensuring the titles don't look like an absolute dog's dinner..."
];

export default function App() {
  // Application State
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"pdf" | "docx" | "txt" | "paste">("paste");
  const [rawText, setRawText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Roast Data
  const [roastData, setRoastData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"roast" | "autopsy" | "rewrite" | "verdict">("roast");
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  // PDF Export States
  const [showPdfConfig, setShowPdfConfig] = useState(false);
  const [pdfContact, setPdfContact] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    summary: "",
    skills: "",
    experienceBullets: "",
    education: "",
    certifications: "",
  });

  // Automatically extract contact details and map overhaul sections when roastData changes
  useEffect(() => {
    if (roastData) {
      const textToParse = rawText || SAMPLE_RESUME;
      const lines = textToParse.split("\n").map(l => l.trim()).filter(Boolean);
      
      // Guess candidate name (first line is usually name)
      const guessedName = lines[0] && lines[0].length < 40 && !lines[0].includes("@") && !lines[0].includes("|")
        ? lines[0]
        : "Alex Mercer";

      // Email extraction
      const emailMatch = textToParse.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const guessedEmail = emailMatch ? emailMatch[0] : "alex.mercer@email.com";

      // Phone extraction
      const phoneMatch = textToParse.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      const guessedPhone = phoneMatch ? phoneMatch[0] : "(555) 019-2834";

      // Job Title from step10_rewrite or step3_autopsy header
      const titleRecommendations = roastData.step10_rewrite?.overallTitleRecommendations || "";
      const firstTitle = titleRecommendations.split("\n")
        .map(t => t.replace(/^[-\s*•\d.]+\s*/, "").trim())
        .filter(Boolean)[0] || "Senior Software Engineer";

      // Skills mapping
      const mappedSkills = roastData.step10_rewrite?.skillsReplacement || 
                           (roastData.step3_autopsy?.skills?.valuable || []).concat(roastData.step3_autopsy?.skills?.good || []).join(", ");

      // Education mapping from rawText
      let extractedEdu = "";
      const eduIndex = lines.findIndex(l => l.toUpperCase().includes("EDUCATION"));
      if (eduIndex !== -1 && lines[eduIndex + 1]) {
        extractedEdu = lines.slice(eduIndex + 1, eduIndex + 3).join("\n");
      } else {
        extractedEdu = "Bachelor of Science in Computer Science | State University";
      }

      // Certifications mapping from rawText
      let extractedCerts = "";
      const certIndex = lines.findIndex(l => l.toUpperCase().includes("CERTIFICATION"));
      if (certIndex !== -1 && lines[certIndex + 1]) {
        extractedCerts = lines.slice(certIndex + 1, certIndex + 3).join("\n");
      } else {
        extractedCerts = "Certified Kubernetes Administrator (CKA)";
      }

      setPdfContact({
        name: guessedName,
        title: firstTitle,
        email: guessedEmail,
        phone: guessedPhone,
        location: "San Francisco, CA",
        linkedin: "linkedin.com/in/alexmercer",
        github: "github.com/alexmercer",
        summary: roastData.step10_rewrite?.summary || "",
        skills: mappedSkills,
        experienceBullets: roastData.step10_rewrite?.experienceBulletsRewritten || "",
        education: extractedEdu,
        certifications: extractedCerts
      });
    }
  }, [roastData, rawText]);

  // Auto-advance loading text steps
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Load sample resume
  const handleLoadSample = () => {
    setFileType("paste");
    setRawText(SAMPLE_RESUME);
    setFile(null);
    setError(null);
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  // Handlers for File Drop/Upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (uploadedFile: File) => {
    const ext = uploadedFile.name.split(".").pop()?.toLowerCase() || "";
    if (ext === "pdf") {
      setFileType("pdf");
    } else if (ext === "docx") {
      setFileType("docx");
    } else if (ext === "txt") {
      setFileType("txt");
    } else if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) {
      setFileType(ext);
    } else {
      setError("unsupported");
      return;
    }
    setFile(uploadedFile);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Submit for Roasting
  const handleRoast = async () => {
    setLoading(true);
    setError(null);
    setRoastData(null);

    try {
      let payload: any = {
        fileName: file ? file.name : "pasted_text.txt",
        fileType: fileType,
        linkedinUrl: linkedinUrl.trim() || undefined,
      };

      if (fileType === "paste") {
        if (!rawText.trim()) {
          throw new Error("Please paste your resume text or upload a document first.");
        }
        payload.rawText = rawText;
      } else if (file) {
        // Convert file to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            // strip prefix like "data:application/pdf;base64,"
            const base64Data = result.split(",")[1];
            resolve(base64Data);
          };
          reader.onerror = (e) => reject(e);
        });

        if (fileType === "txt") {
          const textPromise = new Promise<string>((resolve, reject) => {
            const textReader = new FileReader();
            textReader.onload = () => resolve(textReader.result as string);
            textReader.onerror = (e) => reject(e);
            textReader.readAsText(file);
          });
          payload.rawText = await textPromise;
        } else {
          reader.readAsDataURL(file);
          payload.fileData = await base64Promise;
        }
      } else {
        throw new Error("No file or text provided.");
      }

      const response = await fetch("/api/roast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || errData.details || "Failed to roast the resume.");
      }

      const data = await response.json();
      setRoastData(data);
      setActiveTab("roast");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setFileType("paste");
    setRawText("");
    setLinkedinUrl("");
    setRoastData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#E11D48] selection:text-black pb-16">
      {/* Background Flare Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-radial from-[#E11D48]/10 via-transparent to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Header Bar */}
      <header className="border-b border-white/20 bg-[#0a0a0a] sticky top-0 z-30 px-4 md:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-[#E11D48] text-black font-black px-2.5 py-1 text-2xl tracking-tighter select-none">
              HK
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-[0.2em] uppercase text-white font-display">
                Resume Hell's Kitchen
              </h1>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">
                Chef: Gordon Ramsay
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-[#E11D48]/10 border border-[#E11D48]/30 text-[10px] font-mono text-[#E11D48] uppercase tracking-wider">
              <Flame className="w-3 h-3 animate-pulse text-[#E11D48]" />
              The Grid is HOT
            </span>
            {roastData && (
              <button
                onClick={resetAll}
                className="border border-white/20 px-5 py-2 text-xs uppercase tracking-widest text-white hover:bg-white hover:text-black transition-colors duration-200 cursor-pointer"
              >
                New Upload
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
        
        {/* Error Message Box */}
        {error && error !== "unsupported" && (
          <div className="mb-8 p-5 border border-[#E11D48]/30 bg-[#E11D48]/5 text-[#E11D48] flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-sm uppercase tracking-wider">Kitchen Disaster!</h4>
              <p className="text-xs mt-1 text-white/80">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-[#E11D48] hover:text-white transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 1. INPUT ZONE (Shown when no active roast is loaded) */}
        {!loading && !roastData && (
          <div className="max-w-4xl mx-auto">
            {/* Promo Banner / Intro */}
            <div className="text-center mb-12">
              <p className="text-[#E11D48] text-xs font-bold uppercase tracking-[0.3em] mb-4">
                STAGE 1: THE 7-SECOND SIZZLE TEST
              </p>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black italic uppercase leading-none tracking-tight text-white mb-6">
                RAW <span className="text-[#E11D48] font-normal not-italic font-sans font-extrabold">OR</span> MICHELIN?
              </h2>
              <p className="text-sm md:text-base text-white/60 font-serif italic max-w-2xl mx-auto border-l-2 border-[#E11D48] pl-4 leading-relaxed">
                "Is your resume a masterclass in career progression, or is it a bland, unseasoned corporate salad that I wouldn't serve to my dog?"
              </p>
            </div>

            {/* Main Interactive Selector Grid */}
            <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6 md:p-8 relative shadow-2xl">
              
              {/* Type Selector Tab */}
              <div className="flex border-b border-white/10 mb-6">
                <button
                  onClick={() => { setFileType("paste"); setFile(null); }}
                  className={`pb-3 px-4 text-xs uppercase tracking-wider font-bold transition-all duration-200 border-b-2 relative cursor-pointer ${
                    fileType === "paste" 
                      ? "border-[#E11D48] text-[#E11D48]" 
                      : "border-transparent text-white/40 hover:text-white"
                  }`}
                >
                  Paste Resume Text
                </button>
                <button
                  onClick={() => { setFileType("pdf"); }}
                  className={`pb-3 px-4 text-xs uppercase tracking-wider font-bold transition-all duration-200 border-b-2 relative cursor-pointer ${
                    fileType !== "paste" 
                      ? "border-[#E11D48] text-[#E11D48]" 
                      : "border-transparent text-white/40 hover:text-white"
                  }`}
                >
                  Upload File (PDF, DOCX, Images)
                </button>
              </div>

              {/* Upload Drop Zone */}
              {fileType !== "paste" ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed p-10 text-center transition-all duration-200 ${
                    isDragging 
                      ? "border-[#E11D48] bg-[#E11D48]/5" 
                      : file 
                        ? "border-white/30 bg-[#121212]" 
                        : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp,.gif,image/*"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <div className="w-16 h-16 rounded-none bg-[#121212] flex items-center justify-center mx-auto mb-4 border border-white/10">
                      <Upload className="w-5 h-5 text-white/40" />
                    </div>
                    {file ? (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white truncate max-w-md mx-auto uppercase tracking-wide">
                          {file.name}
                        </p>
                        <p className="text-xs text-white/40">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for dissection
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-bold uppercase tracking-wider text-white">
                          Drag & Drop Your Resume File
                        </p>
                        <p className="text-xs text-white/40 max-w-sm mx-auto">
                          Supports PDF, Word (.docx), Text (.txt), or Images (PNG, JPG, WEBP, GIF).
                        </p>
                        <p className="text-xs text-[#E11D48] font-mono tracking-widest uppercase mt-4">
                          or click to select file
                        </p>
                      </div>
                    )}
                  </label>
                  {error === "unsupported" && (
                    <p className="text-xs text-[#E11D48] mt-3 font-mono font-bold uppercase tracking-wide">
                      Disaster: Only PDF, DOCX, TXT, and Images (PNG, JPG, WEBP, GIF) are allowed in this kitchen!
                    </p>
                  )}
                </div>
              ) : (
                /* Text Area Paste Input */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono uppercase text-white/40 tracking-widest">
                      CV Text Paste (Raw Content)
                    </label>
                    <button
                      onClick={handleLoadSample}
                      className="text-xs border border-white/20 px-3 py-1 text-white/60 hover:text-white hover:border-white transition-all duration-200 cursor-pointer uppercase tracking-wider font-bold"
                    >
                      Load Raw Sample Resume
                    </button>
                  </div>
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="John Doe&#10;Software Engineer&#10;&#10;SUMMARY&#10;Passionate team player...&#10;&#10;EXPERIENCE&#10;TechCorp - Software Developer (2022 - Present)&#10;- Responsible for maintaining website..."
                    className="w-full h-80 bg-[#0d0d0d] border border-white/10 rounded-none p-4 text-sm font-mono text-white focus:outline-none focus:border-[#E11D48] placeholder-white/10 transition-all duration-200"
                  />
                </div>
              )}

              {/* Optional LinkedIn profile URL field */}
              <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5 text-[#E11D48]" />
                  <span className="text-[10px] font-mono uppercase text-white/50 tracking-widest font-bold">
                    Supplement with LinkedIn Profile (Optional)
                  </span>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  Provide your public LinkedIn profile URL. The engine will fetch and supplement your resume's work history, adding deep career footprint context to Gordon Ramsay's roast.
                </p>
                <div className="relative">
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/in/your-profile"
                    className="w-full bg-[#121212] border border-white/15 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#E11D48] transition-all duration-200 placeholder-white/15 font-mono"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/40 text-xs">
                  <Info className="w-4 h-4 text-[#E11D48]" />
                  <span>The parser conducts a deep structural analysis of your CV.</span>
                </div>
                <button
                  onClick={handleRoast}
                  disabled={fileType !== "paste" ? !file : !rawText.trim()}
                  className="w-full sm:w-auto px-8 py-3 bg-[#E11D48] text-black disabled:bg-[#1a1a1a] disabled:text-white/20 hover:bg-[#ff2f5a] font-bold text-xs uppercase tracking-widest transition-all duration-200 cursor-pointer"
                >
                  Start The Roast
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 2. LOADING STATE WITH FUNNY PROGRESS STEPS */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto bg-[#0d0d0d] border border-white/10 p-8 rounded-none text-center shadow-2xl mt-12"
            >
              <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-[#1a1a1a] border border-white/10">
                <ChefHat className="w-8 h-8 text-[#E11D48] animate-bounce" />
                <div className="absolute top-0 left-0 w-full h-full border border-t-[#E11D48] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              </div>

              <h3 className="text-xl uppercase font-bold tracking-[0.2em] text-white">
                Preparing the Kitchen
              </h3>
              <p className="text-white/60 text-xs font-serif italic max-w-md mx-auto mt-2 leading-relaxed">
                "Gordon is sharpening the cleaver, heating the flat-top to 500 degrees, and preparing to slaughter your buzzwords."
              </p>

              {/* Progress Steps List */}
              <div className="mt-8 space-y-3 text-left max-w-lg mx-auto">
                {LOADING_STEPS.map((step, idx) => {
                  const isActive = idx === loadingStep;
                  const isCompleted = idx < loadingStep;
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-3 p-3 transition-all duration-300 border ${
                        isActive 
                          ? "bg-[#1a1a1a] border-white/20 text-white" 
                          : isCompleted 
                            ? "bg-transparent border-transparent text-white/20" 
                            : "bg-transparent border-transparent text-white/10"
                      }`}
                    >
                      <div className="shrink-0">
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-white/40" />
                        ) : isActive ? (
                          <div className="w-4 h-4 border-2 border-[#E11D48] border-t-transparent animate-spin" />
                        ) : (
                          <div className="w-1.5 h-1.5 bg-white/10" />
                        )}
                      </div>
                      <span className={`text-xs uppercase tracking-wider ${isActive ? "font-bold text-[#E11D48]" : ""}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 text-xs font-mono text-[#E11D48] uppercase tracking-widest animate-pulse">
                “Fucking Raw! Hold On...” — Gordon
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. ACTIVE ROAST DISPLAY DASHBOARD */}
        {roastData && !loading && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Top Score & Remarks Executive Banner */}
            <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6 md:p-8 relative overflow-hidden shadow-2xl">
              
              {/* Fiery visual accents */}
              <div className="absolute top-0 right-0 w-80 h-full bg-radial from-[#E11D48]/5 via-transparent to-transparent blur-2xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row items-center gap-8 justify-between relative z-10">
                
                {/* Score Dial & Verdict Indicator */}
                <div className="flex items-center gap-6 shrink-0 w-full lg:w-auto pb-6 lg:pb-0 border-b lg:border-b-0 lg:border-r border-white/10 pr-0 lg:pr-8">
                  
                  {/* Gauge */}
                  <div className="relative w-32 h-32 flex items-center justify-center bg-[#0a0a0a] rounded-none border border-white/10 shadow-inner shrink-0">
                    {/* Ring background */}
                    <svg className="absolute w-28 h-28 transform -rotate-90">
                      <circle cx="56" cy="56" r="48" className="stroke-white/5" strokeWidth="4" fill="transparent" />
                      <circle 
                        cx="56" 
                        cy="56" 
                        r="48" 
                        className={`transition-all duration-1000 ${
                          roastData.step11_finalVerdict.overall >= 80 
                            ? "stroke-green-500" 
                            : roastData.step11_finalVerdict.overall >= 50 
                              ? "stroke-yellow-500" 
                              : "stroke-[#E11D48]"
                        }`} 
                        strokeWidth="4" 
                        fill="transparent" 
                        strokeDasharray="301.6" 
                        strokeDashoffset={301.6 - (301.6 * roastData.step11_finalVerdict.overall) / 100} 
                      />
                    </svg>
                    <div className="text-center z-10">
                      <span className="text-4xl font-mono font-black text-white">
                        {roastData.step11_finalVerdict.overall}
                      </span>
                      <span className="text-[9px] text-white/40 block font-mono tracking-widest uppercase mt-0.5">OVERALL</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">Verdict Badge</span>
                    <div className="flex items-center gap-2">
                      {roastData.step11_finalVerdict.interviewProbability === "Definitely" ? (
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 font-bold text-xs uppercase tracking-wider">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Definitely (🟢 5-Star)
                        </div>
                      ) : roastData.step11_finalVerdict.interviewProbability === "Maybe" ? (
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-bold text-xs uppercase tracking-wider">
                          <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                          Maybe (🟡 Undercooked)
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#E11D48]/10 border border-[#E11D48]/30 text-[#E11D48] font-bold text-xs uppercase tracking-wider">
                          <Flame className="w-3.5 h-3.5 text-[#E11D48]" />
                          Rejected (🔴 Fucking Raw!)
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-white/60 max-w-[200px] leading-tight">
                      Based on recruiter tests, ATS compliance, and culinary standards.
                    </p>
                  </div>

                </div>

                {/* Ramsay Quote Closing Remarks */}
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E11D48]/10 border border-[#E11D48]/20 text-[10px] font-mono text-[#E11D48] uppercase tracking-[0.2em] font-bold">
                    <Flame className="w-3 h-3 text-[#E11D48] animate-pulse" />
                    Ramsay's Final Review
                  </div>
                  <blockquote className="text-lg md:text-xl font-serif font-medium text-white italic relative pl-6 border-l-2 border-[#E11D48]">
                    "{roastData.step12_closingRemarks.oneLinerRoast}"
                  </blockquote>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-wider text-white/40">
                    <div className="flex items-center gap-1.5">
                      <ChefHat className="w-3.5 h-3.5 text-[#E11D48]" />
                      <span>Head Chef: Gordon Ramsay of CVs</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                      <span>250,000+ Reviews Completed</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Sub Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4 mt-8 pt-8 border-t border-white/10">
                {[
                  { label: "ATS Score", value: roastData.step11_finalVerdict.atsScore },
                  { label: "Recruiter Rating", value: roastData.step11_finalVerdict.recruiterScore },
                  { label: "Hiring Mgr", value: roastData.step11_finalVerdict.hiringManagerScore },
                  { label: "Tech Depth", value: roastData.step11_finalVerdict.technicalStrength },
                  { label: "Leadership", value: roastData.step11_finalVerdict.leadership },
                  { label: "Impact Score", value: roastData.step11_finalVerdict.impact },
                  { label: "Readability", value: roastData.step11_finalVerdict.clarity },
                ].map((item, i) => (
                  <div key={i} className="bg-[#1a1a1a] border border-white/10 p-3 rounded-none space-y-2 text-center">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-white/40 block">
                      {item.label}
                    </span>
                    <div className="flex items-baseline justify-center gap-0.5">
                      <span className="text-xl font-bold font-mono text-white">{item.value}</span>
                      <span className="text-[10px] text-white/20">/100</span>
                    </div>
                    {/* Tiny microbar indicator */}
                    <div className="w-full bg-[#0a0a0a] h-1 rounded-none overflow-hidden border border-white/5">
                      <div 
                        className={`h-full ${
                          item.value >= 80 
                            ? "bg-green-500" 
                            : item.value >= 50 
                              ? "bg-yellow-500" 
                              : "bg-[#E11D48]"
                        }`} 
                        style={{ width: `${item.value}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Dashboard Sub Navigation Tabs */}
            <div className="flex items-center overflow-x-auto border-b border-white/10 scrollbar-none gap-2 pb-0.5">
              {[
                { id: "roast", label: "Roast & Autopsy", icon: Flame },
                { id: "autopsy", label: "Deeper Diagnostics", icon: AlertTriangle },
                { id: "rewrite", label: "The 5-Star Rewrite", icon: Sparkles },
                { id: "verdict", label: "Hiring Verdict & Market", icon: Building },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-3.5 px-5 rounded-none text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer border-b-2 shrink-0 ${
                      isActive 
                        ? "border-[#E11D48] text-[#E11D48] bg-white/[0.01]" 
                        : "border-transparent text-white/40 hover:text-white hover:bg-white/[0.01]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT VIEWER */}
            <div className="space-y-6">
              
              {/* TAB 1: ROAST STATION */}
              {activeTab === "roast" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Opening Roast & Recruiter Test */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Opening Roast Card */}
                    <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6 relative overflow-hidden">
                      <div className="absolute top-2 right-2 p-2 text-[#E11D48]">
                        <Flame className="w-5 h-5 animate-pulse" />
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2 mb-4">
                        The Master Roast
                      </h3>
                      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line font-serif italic bg-[#1a1a1a] p-5 rounded-none border border-white/5">
                        {roastData.step2_firstRoast}
                      </p>
                    </div>

                    {/* 7-Second Recruiter Test */}
                    <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-white/5">
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                            The 7-Second Recruiter Test
                          </h3>
                          <p className="text-[11px] text-white/40 mt-1">
                            Simulating the visual path and mental reactions of an overworked corporate recruiter.
                          </p>
                        </div>
                        <div className="bg-[#0a0a0a] px-4 py-2 border border-white/10 text-center shrink-0">
                          <span className="text-[9px] font-mono tracking-widest text-white/40 block">7s SCORE</span>
                          <span className={`text-xl font-mono font-bold ${
                            roastData.step1_recruiterTest.score >= 8 
                              ? "text-green-500" 
                              : roastData.step1_recruiterTest.score >= 5 
                                ? "text-yellow-500" 
                                : "text-[#E11D48]"
                          }`}>
                            {roastData.step1_recruiterTest.score} <span className="text-xs text-white/20">/10</span>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#1a1a1a] p-4 rounded-none border border-white/5 space-y-2">
                          <span className="text-[10px] font-mono text-green-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                            Catches the Eye
                          </span>
                          <p className="text-xs text-white/80 leading-relaxed pt-1 font-serif italic">
                            {roastData.step1_recruiterTest.catchesEye}
                          </p>
                        </div>

                        <div className="bg-[#1a1a1a] p-4 rounded-none border border-white/5 space-y-2">
                          <span className="text-[10px] font-mono text-[#E11D48] font-bold flex items-center gap-1.5 uppercase tracking-wider">
                            <X className="w-3.5 h-3.5 text-[#E11D48]" />
                            Stop-Reading Trigger
                          </span>
                          <p className="text-xs text-white/80 leading-relaxed pt-1 font-serif italic">
                            {roastData.step1_recruiterTest.stopReading}
                          </p>
                        </div>

                        <div className="bg-[#1a1a1a] p-4 rounded-none border border-white/5 space-y-2">
                          <span className="text-[10px] font-mono text-yellow-500 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                            <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                            Confusing Elements
                          </span>
                          <p className="text-xs text-white/80 leading-relaxed pt-1 font-serif italic">
                            {roastData.step1_recruiterTest.confusing}
                          </p>
                        </div>

                        <div className="bg-[#1a1a1a] p-4 rounded-none border border-white/5 space-y-2">
                          <span className="text-[10px] font-mono text-blue-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            Impressive Elements
                          </span>
                          <p className="text-xs text-white/80 leading-relaxed pt-1 font-serif italic">
                            {roastData.step1_recruiterTest.impressive}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-mono">
                        <span className="text-white/40 uppercase tracking-widest text-[10px]">Recruiter Decision:</span>
                        {roastData.step1_recruiterTest.continueReading ? (
                          <span className="text-green-400 font-bold bg-green-500/10 px-3 py-1 border border-green-500/20 uppercase tracking-wider text-[10px]">
                            Passed 7s Screen (Keep Reading)
                          </span>
                        ) : (
                          <span className="text-[#E11D48] font-bold bg-[#E11D48]/10 px-3 py-1 border border-[#E11D48]/20 uppercase tracking-wider text-[10px]">
                            Failed 7s Screen (Straight to Trash)
                          </span>
                        )}
                      </div>

                    </div>

                  </div>

                  {/* Right Column: Buzzword Detector */}
                  <div className="space-y-6">
                    
                    {/* Buzzword Detector Widget */}
                    <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6 flex flex-col justify-between h-full space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                            Buzzword Detector
                          </h3>
                          <div className="bg-[#E11D48]/10 border border-[#E11D48]/30 text-[#E11D48] font-mono text-xs px-2.5 py-1 font-bold">
                            {roastData.step7_buzzwordDetector.bingoCount} Found
                          </div>
                        </div>
                        <p className="text-[11px] text-white/40 mb-4">
                          Clichés and filler words that make professional recruiters develop an eye-twitch.
                        </p>

                        {/* Words list */}
                        <div className="flex flex-wrap gap-2">
                          {roastData.step7_buzzwordDetector.detectedBuzzwords.map((word: string, i: number) => (
                            <span 
                              key={i} 
                              className="text-xs font-mono bg-[#1a1a1a] border border-white/10 text-white/80 px-2.5 py-1 hover:border-[#E11D48] hover:text-[#E11D48] transition-colors duration-200"
                            >
                              🚮 {word}
                            </span>
                          ))}
                          {roastData.step7_buzzwordDetector.detectedBuzzwords.length === 0 && (
                            <span className="text-xs text-white/40 font-mono italic">No fluff detected. Extraordinary.</span>
                          )}
                        </div>
                      </div>

                      {/* Commentary box */}
                      <div className="p-4 bg-[#0a0a0a] border border-white/10">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-white/40 block mb-1">
                          Ramsay's Verdict
                        </span>
                        <p className="text-xs text-white/80 italic font-serif leading-relaxed">
                          "{roastData.step7_buzzwordDetector.ramsayCommentary}"
                        </p>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 2: DEEPER DIAGNOSTICS */}
              {activeTab === "autopsy" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Diagnostics Panel */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Header Autopsy */}
                    <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6">
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#E11D48] mb-2 font-bold">
                        Station 1: Header & Visual Identity
                      </h4>
                      <h3 className="text-base uppercase tracking-wider font-bold text-white mb-4">
                        The Welcoming Course
                      </h3>
                      <div className="space-y-4 bg-[#1a1a1a] p-4 rounded-none border border-white/5 text-xs md:text-sm">
                        <p className="text-[#E11D48] font-serif italic">" {roastData.step3_autopsy.header.roast} "</p>
                        <div className="pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-[9px] font-mono text-white/40 block uppercase tracking-wider">Critical Error</span>
                            <p className="text-white/80 text-xs mt-1 leading-relaxed">{roastData.step3_autopsy.header.analysis}</p>
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-white/40 block uppercase tracking-wider">Kitchen Fix</span>
                            <p className="text-white/80 text-xs mt-1 leading-relaxed">{roastData.step3_autopsy.header.improvements}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary Autopsy */}
                    <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6">
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#E11D48] mb-2 font-bold">
                        Station 2: Summary Dissection
                      </h4>
                      <h3 className="text-base uppercase tracking-wider font-bold text-white mb-4">
                        Cliché Cleaver
                      </h3>
                      <div className="space-y-4 bg-[#1a1a1a] p-4 rounded-none border border-white/5 text-xs md:text-sm">
                        <div>
                          <span className="text-[9px] font-mono text-white/40 block uppercase tracking-wider">Original Summary</span>
                          <p className="text-white/60 text-xs italic mt-1 bg-[#0a0a0a] p-3 border border-white/5 font-serif">
                            {roastData.step3_autopsy.summary.original || "No original summary found."}
                          </p>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-[#E11D48] block uppercase font-bold tracking-wider">Ramsay's Roast</span>
                          <p className="text-[#E11D48] text-xs italic mt-1 font-serif">"{roastData.step3_autopsy.summary.roast}"</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-green-400 block uppercase font-bold tracking-wider">The Michelin-Star Alternative</span>
                          <p className="text-white text-xs mt-1 bg-[#0a0a0a] p-3 border border-white/5 font-serif italic">
                            {roastData.step3_autopsy.summary.rewritten}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Education & Certs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6">
                        <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#E11D48] mb-2 font-bold">
                          Education Audit
                        </h4>
                        <p className="text-xs text-[#E11D48] italic font-serif mb-4">"{roastData.step3_autopsy.education.roast}"</p>
                        <div className="p-4 bg-[#1a1a1a] border border-white/5">
                          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block font-bold">Ramsay's Advice</span>
                          <p className="text-xs text-white/80 mt-1.5 leading-relaxed font-serif">{roastData.step3_autopsy.education.advice}</p>
                        </div>
                      </div>

                      <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6">
                        <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#E11D48] mb-2 font-bold">
                          Certifications Audit
                        </h4>
                        <p className="text-xs text-[#E11D48] italic font-serif mb-4">"{roastData.step3_autopsy.certifications.roast}"</p>
                        <div className="p-4 bg-[#1a1a1a] border border-white/5">
                          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block font-bold">Ramsay's Advice</span>
                          <p className="text-xs text-white/80 mt-1.5 leading-relaxed font-serif">{roastData.step3_autopsy.certifications.advice}</p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Recruiter Psychology & Achievement Density */}
                  <div className="space-y-6">
                    
                    {/* Recruiter Psychology Box */}
                    <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6">
                      <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">
                        Recruiter Psychology
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="bg-[#1a1a1a] p-4 border border-white/5 grid grid-cols-2 gap-4 text-center">
                          <div>
                            <span className="text-[9px] font-mono text-white/40 block uppercase tracking-wider">Assumed Seniority</span>
                            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block mt-1">
                              {roastData.step5_recruiterPsychology.assumedSeniority}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-white/40 block uppercase tracking-wider">Suitability</span>
                            <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider font-mono block mt-1">
                              {roastData.step5_recruiterPsychology.suitability}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[9px] font-mono text-white/40 block mb-2 uppercase tracking-widest font-bold">
                            Psychological Triggers
                          </span>
                          <ul className="space-y-2 text-xs">
                            {roastData.step5_recruiterPsychology.reasons.map((reason: string, idx: number) => (
                              <li key={idx} className="flex gap-2 items-start bg-[#1a1a1a]/40 p-3 border border-white/5">
                                <span className="text-[#E11D48] mt-0.5 font-bold">•</span>
                                <span className="text-white/80 font-serif leading-relaxed text-[11px]">{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Achievement Density Widget */}
                    <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6">
                      <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">
                        Achievement Density
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-2xl font-bold font-mono text-white">
                              {roastData.step6_achievementDensity.densityPercentage}%
                            </span>
                            <span className="text-[9px] font-mono text-white/40 block uppercase tracking-widest font-bold">Density</span>
                          </div>
                          <div className="text-right text-[11px] font-mono text-white/60">
                            <div><strong className="text-green-500 font-bold">{roastData.step6_achievementDensity.achievementBulletsCount}</strong> Achievements</div>
                            <div><strong className="text-[#E11D48] font-bold">{roastData.step6_achievementDensity.totalBulletsCount}</strong> Total Bullets</div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-[#0a0a0a] h-2.5 border border-white/10 rounded-none overflow-hidden">
                          <div 
                            className="h-full bg-[#E11D48]" 
                            style={{ width: `${roastData.step6_achievementDensity.densityPercentage}%` }} 
                          />
                        </div>

                        <div className="p-4 bg-[#1a1a1a] rounded-none border border-white/5">
                          <p className="text-[11px] text-white/60 leading-relaxed font-serif">
                            {roastData.step6_achievementDensity.explanation}
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 3: THE 5-STAR REWRITE */}
              {activeTab === "rewrite" && (
                <div className="space-y-8">
                  
                  {/* Visual Instructions Alert */}
                  <div className="p-4 rounded-none border border-green-500/20 bg-green-500/5 text-white/90 flex items-center gap-3 text-xs md:text-sm">
                    <Sparkles className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="leading-relaxed">
                      <strong className="text-green-400 font-bold uppercase tracking-wider text-[11px] block sm:inline mr-1">The 5-Star Overhaul:</strong> The left sections show individual bullet points dissected. The right section includes a complete polished copy-ready rewrite. Everything remains completely truthful based on facts in your resume, but seasoned to Michelin standards.
                    </span>
                  </div>

                  {/* Grid layout containing individual experience dissected and complete rewrite */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left 7 Columns: Experience & Projects Dissected */}
                    <div className="lg:col-span-7 space-y-6">
                      
                      {/* Experience Slicing */}
                      <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2 mb-4">
                          Searing the Experience Bullets
                        </h3>
                        
                        <div className="space-y-6">
                          {roastData.step3_autopsy.experience.map((item: any, idx: number) => (
                            <div key={idx} className="bg-[#1a1a1a] p-4 rounded-none border border-white/5 space-y-3 relative overflow-hidden">
                              
                              <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                                <span className="text-xs font-mono font-bold text-white/80 truncate">
                                  💼 {item.roleTitle}
                                </span>
                                <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-none ${
                                  item.proofStatus.includes("Quantified") || item.proofStatus.includes("Delicious")
                                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                    : "bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/20"
                                }`}>
                                  {item.proofStatus}
                                </span>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[9px] font-mono text-white/40 block uppercase tracking-wider">Unseasoned Original</span>
                                <p className="text-xs text-white/60 bg-[#0a0a0a] p-2.5 border border-white/5 font-serif italic">
                                  "{item.originalBullet}"
                                </p>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[9px] font-mono text-[#E11D48] block uppercase font-bold tracking-wider">Ramsay's Roast</span>
                                <p className="text-xs text-[#E11D48] italic font-serif">
                                  "{item.roast}"
                                </p>
                              </div>

                              <div className="space-y-1 pt-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-mono text-green-400 block uppercase font-bold tracking-wider">Michelin-Star Rewrite</span>
                                  <button
                                    onClick={() => handleCopy(item.rewrittenBullet, `bullet-${idx}`)}
                                    className="text-[10px] uppercase font-bold tracking-wider text-white/40 hover:text-green-400 flex items-center gap-1 cursor-pointer"
                                  >
                                    {copiedStates[`bullet-${idx}`] ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                    {copiedStates[`bullet-${idx}`] ? "Copied" : "Copy"}
                                  </button>
                                </div>
                                <p className="text-xs text-white font-medium bg-[#0a0a0a] p-3 border border-white/5 font-serif italic">
                                  {item.rewrittenBullet}
                                </p>
                              </div>

                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Projects Slicing */}
                      <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2 mb-4">
                          Trimming the Project Descriptions
                        </h3>
                        
                        <div className="space-y-6">
                          {roastData.step3_autopsy.projects.map((item: any, idx: number) => (
                            <div key={idx} className="bg-[#1a1a1a] p-4 rounded-none border border-white/5 space-y-3">
                              <span className="text-xs font-mono font-bold text-white/80 block border-b border-white/5 pb-2">
                                🚀 {item.projectTitle}
                              </span>
                              
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono text-[#E11D48] block uppercase tracking-wider font-bold">Ramsay's Roast</span>
                                <p className="text-xs text-[#E11D48] italic font-serif">
                                  "{item.roast}"
                                </p>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[9px] font-mono text-green-400 block uppercase font-bold tracking-wider">Improved Description</span>
                                <p className="text-xs text-white/80 bg-[#0a0a0a] p-3 border border-white/5 font-serif italic">
                                  {item.improvedDescription}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Right 5 Columns: Visual Skills Pantry & Complete Resume Draft */}
                    <div className="lg:col-span-5 space-y-6">
                      
                      {/* visual Skills grading */}
                      <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">
                          The Skills Pantry
                        </h3>
                        <p className="text-[11px] text-white/40 mb-4">
                          Grading your technical list from high-value grade-A cutlets to resume dumpster filler.
                        </p>

                        <div className="space-y-4">
                          {/* Valuable */}
                          {roastData.step3_autopsy.skills.valuable.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono text-green-400 font-bold uppercase tracking-wider block">
                                🔥 Valuable (Grade-A Ingredients)
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {roastData.step3_autopsy.skills.valuable.map((skill: string, i: number) => (
                                  <span key={i} className="text-xs px-2.5 py-1 bg-green-500/10 text-green-400 rounded-none border border-green-500/20 font-mono font-bold">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Good */}
                          {roastData.step3_autopsy.skills.good.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono text-blue-400 font-bold uppercase tracking-wider block">
                                👍 Good (Standard Seasoning)
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {roastData.step3_autopsy.skills.good.map((skill: string, i: number) => (
                                  <span key={i} className="text-xs px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-none border border-blue-500/20 font-mono font-bold">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Generic */}
                          {roastData.step3_autopsy.skills.generic.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono text-yellow-500 font-bold uppercase tracking-wider block">
                                😐 Generic (Bland Corporate Salt)
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {roastData.step3_autopsy.skills.generic.map((skill: string, i: number) => (
                                  <span key={i} className="text-xs px-2.5 py-1 bg-yellow-500/10 text-yellow-500 rounded-none border border-yellow-500/20 font-mono text-white/60">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Outdated */}
                          {roastData.step3_autopsy.skills.outdated.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono text-orange-400 font-bold uppercase tracking-wider block">
                                🥱 Outdated (Stale leftovers)
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {roastData.step3_autopsy.skills.outdated.map((skill: string, i: number) => (
                                  <span key={i} className="text-xs px-2.5 py-1 bg-orange-500/10 text-orange-400 rounded-none border border-orange-500/20 font-mono text-white/60">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Filler */}
                          {roastData.step3_autopsy.skills.filler.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono text-[#E11D48] font-bold uppercase tracking-wider block">
                                🚮 Resume Filler (Straight in the Bin)
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {roastData.step3_autopsy.skills.filler.map((skill: string, i: number) => (
                                  <span key={i} className="text-xs px-2.5 py-1 bg-[#E11D48]/10 text-[#E11D48] rounded-none border border-[#E11D48]/20 font-mono text-white/40 line-through">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-5 pt-4 border-t border-white/10 bg-[#0a0a0a] p-4">
                          <span className="text-[9px] font-mono uppercase tracking-widest text-white/40 block mb-1 font-bold">
                            Pantry Recommendations
                          </span>
                          <p className="text-xs text-white/80 leading-relaxed italic font-serif">
                            {roastData.step3_autopsy.skills.recommendations}
                          </p>
                        </div>
                      </div>

                      {/* Overhauled Resume Block */}
                      <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6 relative overflow-hidden">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 border-b border-white/10 pb-3">
                          <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                              The Complete Overhaul
                            </h3>
                            <p className="text-xs text-white/40 mt-1 font-serif italic">
                              Your Michelin-star rewritten assets, ready to be exported.
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 shrink-0">
                            <button
                              onClick={() => {
                                const compiled = `SUMMARY:\n${roastData.step10_rewrite.summary}\n\nREWRITTEN EXPERIENCE BULLETS:\n${roastData.step10_rewrite.experienceBulletsRewritten}\n\nSKILLS SUGGESTIONS:\n${roastData.step10_rewrite.skillsReplacement}\n\nTITLE RECOMMENDATIONS:\n${roastData.step10_rewrite.overallTitleRecommendations}`;
                                handleCopy(compiled, "full-rewrite");
                              }}
                              className="text-[10px] uppercase font-bold tracking-wider border border-white/15 text-white hover:bg-white/5 px-4 py-2 flex items-center gap-1.5 transition-colors duration-200 cursor-pointer font-bold"
                            >
                              {copiedStates["full-rewrite"] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedStates["full-rewrite"] ? "Copied Draft!" : "Copy Full Overhaul"}
                            </button>
                            <button
                              onClick={() => setShowPdfConfig(true)}
                              className="text-[10px] uppercase font-bold tracking-wider bg-[#E11D48] text-black hover:bg-[#ff2f5a] px-4 py-2 flex items-center gap-1.5 transition-colors duration-200 cursor-pointer font-black"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                              Export Clean PDF
                            </button>
                          </div>
                        </div>

                        <div className="space-y-5 text-xs">
                          
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block font-bold">
                              Optimized Role Titles
                            </span>
                            <div className="bg-[#0a0a0a] p-3 border border-white/5 font-mono text-white/80 leading-relaxed">
                              {roastData.step10_rewrite.overallTitleRecommendations}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block font-bold">
                              Michelin-Star Summary Rewrite
                            </span>
                            <div className="bg-[#0a0a0a] p-4 border border-white/5 text-white/80 leading-relaxed font-serif italic">
                              {roastData.step10_rewrite.summary}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block font-bold">
                              High-Impact Resume Bullets
                            </span>
                            <div className="bg-[#0a0a0a] p-4 border border-white/5 text-white/80 leading-relaxed font-serif italic whitespace-pre-line">
                              {roastData.step10_rewrite.experienceBulletsRewritten}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block font-bold">
                              Clean Skills Mapping
                            </span>
                            <div className="bg-[#0a0a0a] p-4 border border-white/5 text-white/80 leading-relaxed font-serif italic">
                              {roastData.step10_rewrite.skillsReplacement}
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* TAB 4: HIRING VERDICT & MARKET */}
              {activeTab === "verdict" && (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* Market Value & Salary */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* Salary Box (Left 5 cols) */}
                    <div className="md:col-span-5 bg-[#0d0d0d] border border-white/10 rounded-none p-6 relative overflow-hidden flex flex-col justify-between">
                      <div className="space-y-4">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#E11D48] font-bold flex items-center gap-1.5">
                          <Coins className="w-4 h-4" />
                          Estimated Market Value
                        </span>
                        
                        <div className="space-y-3.5">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <span className="text-xs text-white/40 font-mono uppercase tracking-wider">Current Value</span>
                            <span className="text-sm font-bold font-mono text-[#E11D48]">
                              {roastData.step8_salaryCeiling.currentMarketValue}
                            </span>
                          </div>
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <span className="text-xs text-white/40 font-mono uppercase tracking-wider">Immediate Potential</span>
                            <span className="text-sm font-bold font-mono text-yellow-500">
                              {roastData.step8_salaryCeiling.potentialSalary}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pb-1">
                            <span className="text-xs text-white/60 font-mono uppercase tracking-wider font-bold">Maximum Realistic</span>
                            <span className="text-lg font-black font-mono text-green-400">
                              {roastData.step8_salaryCeiling.maxRealisticSalary}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-[#1a1a1a] border border-white/5 rounded-none mt-6">
                        <span className="text-[9px] font-mono text-white/40 uppercase block font-bold">Currency Context</span>
                        <p className="text-[10px] text-white/60 mt-0.5 leading-normal font-serif">
                          Estimates reflect US market medians. International locations vary.
                        </p>
                      </div>
                    </div>

                    {/* Salary Actions Checklist (Right 7 cols) */}
                    <div className="md:col-span-7 bg-[#0d0d0d] border border-white/10 rounded-none p-6">
                      <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-1.5 mb-4">
                        Actions Required to Unlock Salary Ceiling
                      </h3>
                      
                      <ul className="space-y-3">
                        {roastData.step8_salaryCeiling.actionsToIncrease.map((action: string, idx: number) => (
                          <li key={idx} className="flex gap-3 items-start bg-[#1a1a1a]/40 p-3.5 border border-white/5">
                            <div className="shrink-0 w-5 h-5 bg-[#E11D48]/10 border border-[#E11D48]/20 text-[#E11D48] flex items-center justify-center font-mono text-xs font-bold">
                              {idx + 1}
                            </div>
                            <span className="text-xs md:text-sm text-white/80 leading-relaxed font-serif italic">
                              {action}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* ATS Audit Panel */}
                  <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">
                          ATS Compliance Audit
                        </h3>
                        <p className="text-xs text-white/40 mt-1 font-serif italic">
                          Analyzing parser risks, keyword deficits, and automated filtering obstacles.
                        </p>
                      </div>
                      <div className="bg-[#0a0a0a] px-4 py-2 border border-white/5 rounded-none text-center">
                        <span className="text-[9px] font-mono text-white/40 block uppercase font-bold tracking-widest">ATS Score</span>
                        <span className={`text-xl font-bold font-mono ${
                          roastData.step4_atsAudit.score >= 80 
                            ? "text-green-400" 
                            : roastData.step4_atsAudit.score >= 50 
                              ? "text-yellow-500" 
                              : "text-[#E11D48]"
                        }`}>
                          {roastData.step4_atsAudit.score} <span className="text-xs text-white/30 font-mono">/100</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Left Block */}
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-mono text-[#E11D48] font-bold block uppercase tracking-widest">
                            ⚠️ Missing Critical Keywords
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {roastData.step4_atsAudit.missingKeywords.map((word: string, i: number) => (
                              <span key={i} className="text-xs px-2.5 py-1 bg-[#E11D48]/5 text-white/80 border border-[#E11D48]/10 font-mono">
                                {word}
                              </span>
                            ))}
                            {roastData.step4_atsAudit.missingKeywords.length === 0 && (
                              <span className="text-xs text-white/40 italic font-serif">No missing keywords found. Perfectly flavored!</span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[9px] font-mono text-yellow-500 font-bold block uppercase tracking-widest">
                            🗂️ Formatting Parsing Risks
                          </span>
                          <ul className="space-y-1.5 text-xs text-white/60">
                            {roastData.step4_atsAudit.formattingRisks.map((risk: string, i: number) => (
                              <li key={i} className="flex gap-2 items-center font-serif italic">
                                <span className="text-[#E11D48] font-bold">•</span>
                                <span>{risk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Right Block */}
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-mono text-yellow-500 font-bold block uppercase tracking-widest">
                            🔍 Structural Parser Problems
                          </span>
                          <ul className="space-y-1.5 text-xs text-white/60">
                            {roastData.step4_atsAudit.parsingProblems.map((problem: string, i: number) => (
                              <li key={i} className="flex gap-2 items-center font-serif italic">
                                <span className="text-yellow-500 font-bold">•</span>
                                <span>{problem}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[9px] font-mono text-green-400 font-bold block uppercase tracking-widest">
                            📈 Key Optimization Opportunities
                          </span>
                          <ul className="space-y-1.5 text-xs text-white/80">
                            {roastData.step4_atsAudit.optimizationOpportunities.map((opt: string, i: number) => (
                              <li key={i} className="flex gap-2 items-start font-serif italic">
                                <span className="text-green-400 font-bold mt-0.5">✓</span>
                                <span>{opt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* FAANG & Studio Survival Grid */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                        The Company Gauntlet
                      </h3>
                      <p className="text-xs text-white/40 mt-1 font-serif italic">
                        Would this CV survive the active firing lines at corporate giants and dynamic studios?
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      {[
                        { name: "Google", desc: roastData.step9_hiringVerdict.google },
                        { name: "Microsoft", desc: roastData.step9_hiringVerdict.microsoft },
                        { name: "Amazon", desc: roastData.step9_hiringVerdict.amazon },
                        { name: "Meta", desc: roastData.step9_hiringVerdict.meta },
                        { name: "NVIDIA", desc: roastData.step9_hiringVerdict.nvidia },
                        { name: "Ubisoft", desc: roastData.step9_hiringVerdict.ubisoft },
                        { name: "Epic Games", desc: roastData.step9_hiringVerdict.epicGames },
                        { name: "Rockstar", desc: roastData.step9_hiringVerdict.rockstar },
                        { name: "Fast Startup", desc: roastData.step9_hiringVerdict.startup },
                        { name: "Fortune 500", desc: roastData.step9_hiringVerdict.fortune500 },
                      ].map((item, i) => {
                        const isRejected = item.desc.toLowerCase().includes("reject") || item.desc.toLowerCase().includes("trash") || item.desc.toLowerCase().includes("bin") || item.desc.toLowerCase().includes("fail") || item.desc.toLowerCase().includes("shred");
                        return (
                          <div 
                            key={i} 
                            className={`p-4 rounded-none border flex flex-col justify-between h-40 transition-all duration-200 ${
                              isRejected 
                                ? "bg-[#E11D48]/[0.01] border-[#E11D48]/10 hover:border-[#E11D48]" 
                                : "bg-green-500/[0.01] border-green-500/10 hover:border-green-500"
                            }`}
                          >
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <span className="font-mono uppercase tracking-wider font-bold text-xs text-white">
                                {item.name}
                              </span>
                              <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-none font-bold ${
                                isRejected 
                                  ? "bg-[#E11D48]/10 text-[#E11D48]" 
                                  : "bg-green-500/10 text-green-400"
                              }`}>
                                {isRejected ? "💀 Shredded" : "🍳 Survives"}
                              </span>
                            </div>
                            <p className="text-[11px] text-white/60 leading-relaxed mt-2 italic font-serif flex-1 overflow-y-auto scrollbar-none">
                              "{item.desc}"
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Ramsay's Golden Priority Fixes */}
            <div className="p-6 md:p-8 bg-zinc-900/30 border border-zinc-900 rounded-3xl space-y-6">
              <div className="flex items-center gap-2.5">
                <ChefHat className="w-5 h-5 text-red-500" />
                <h3 className="text-xl font-display font-bold text-white">
                  Head Chef's Top 5 Golden Fixes
                </h3>
              </div>
              <p className="text-xs text-zinc-500 -mt-3">
                Ordered from absolute highest priority to lowest priority. Execute these first to redeem your resume.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {roastData.step12_closingRemarks.top5Fixes.map((fix: string, idx: number) => (
                  <div key={idx} className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-900 flex flex-col gap-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1 bg-red-600 text-white font-mono text-[9px] font-bold px-2 rounded-bl-lg shadow-sm">
                      PRIORITY {idx + 1}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center font-mono text-sm font-extrabold shadow-sm">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                      {fix}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* PDF Export Setup Modal */}
      {showPdfConfig && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#0c0c0c] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 flex flex-col gap-6 text-left shadow-2xl rounded-none"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-[#E11D48]" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    Export Professional PDF Resume
                  </h3>
                  <p className="text-xs text-white/40 mt-1 font-serif italic">
                    Review and refine your high-impact resume data before generating your custom PDF.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowPdfConfig(false)}
                className="p-1.5 hover:bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              
              {/* Personal Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#E11D48] border-b border-white/5 pb-1">
                  1. Contact Information
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/40 uppercase block">Full Name</label>
                    <input 
                      type="text" 
                      value={pdfContact.name}
                      onChange={(e) => setPdfContact({ ...pdfContact, name: e.target.value })}
                      className="w-full bg-[#141414] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-[#E11D48] font-medium"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/40 uppercase block">Target Job Title</label>
                    <input 
                      type="text" 
                      value={pdfContact.title}
                      onChange={(e) => setPdfContact({ ...pdfContact, title: e.target.value })}
                      className="w-full bg-[#141414] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-[#E11D48] font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/40 uppercase block">Email Address</label>
                    <input 
                      type="email" 
                      value={pdfContact.email}
                      onChange={(e) => setPdfContact({ ...pdfContact, email: e.target.value })}
                      className="w-full bg-[#141414] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-[#E11D48] font-medium"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/40 uppercase block">Phone Number</label>
                    <input 
                      type="text" 
                      value={pdfContact.phone}
                      onChange={(e) => setPdfContact({ ...pdfContact, phone: e.target.value })}
                      className="w-full bg-[#141414] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-[#E11D48] font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[10px] font-mono text-white/40 uppercase block">Location</label>
                    <input 
                      type="text" 
                      value={pdfContact.location}
                      onChange={(e) => setPdfContact({ ...pdfContact, location: e.target.value })}
                      className="w-full bg-[#141414] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-[#E11D48] font-medium"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[10px] font-mono text-white/40 uppercase block">LinkedIn</label>
                    <input 
                      type="text" 
                      value={pdfContact.linkedin}
                      onChange={(e) => setPdfContact({ ...pdfContact, linkedin: e.target.value })}
                      className="w-full bg-[#141414] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-[#E11D48] font-medium"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[10px] font-mono text-white/40 uppercase block">GitHub</label>
                    <input 
                      type="text" 
                      value={pdfContact.github}
                      onChange={(e) => setPdfContact({ ...pdfContact, github: e.target.value })}
                      className="w-full bg-[#141414] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-[#E11D48] font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#E11D48] border-b border-white/5 pb-1">
                    2. Academic & Certifications
                  </h4>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/40 uppercase block">Education (One per line)</label>
                    <textarea 
                      rows={2}
                      value={pdfContact.education}
                      onChange={(e) => setPdfContact({ ...pdfContact, education: e.target.value })}
                      className="w-full bg-[#141414] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-[#E11D48] font-medium font-serif text-white/80"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/40 uppercase block">Certifications (One per line)</label>
                    <textarea 
                      rows={2}
                      value={pdfContact.certifications}
                      onChange={(e) => setPdfContact({ ...pdfContact, certifications: e.target.value })}
                      className="w-full bg-[#141414] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-[#E11D48] font-medium font-serif text-white/80"
                    />
                  </div>
                </div>

              </div>

              {/* Overhaul Assets */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#E11D48] border-b border-white/5 pb-1">
                  3. Overhauled Sections
                </h4>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/40 uppercase block">Professional Summary Rewrite</label>
                  <textarea 
                    rows={4}
                    value={pdfContact.summary}
                    onChange={(e) => setPdfContact({ ...pdfContact, summary: e.target.value })}
                    className="w-full bg-[#141414] border border-white/15 p-3 text-white focus:outline-none focus:border-[#E11D48] font-serif italic leading-relaxed text-white/80"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/40 uppercase block">Optimized Skills Replacement</label>
                  <textarea 
                    rows={3}
                    value={pdfContact.skills}
                    onChange={(e) => setPdfContact({ ...pdfContact, skills: e.target.value })}
                    className="w-full bg-[#141414] border border-white/15 p-3 text-white focus:outline-none focus:border-[#E11D48] font-serif italic leading-relaxed text-white/80"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/40 uppercase block">High-Impact Experience Bullets (One per line)</label>
                  <textarea 
                    rows={6}
                    value={pdfContact.experienceBullets}
                    onChange={(e) => setPdfContact({ ...pdfContact, experienceBullets: e.target.value })}
                    className="w-full bg-[#141414] border border-white/15 p-3 text-white focus:outline-none focus:border-[#E11D48] font-serif italic leading-relaxed text-white/80"
                  />
                </div>

              </div>

            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-white/10 pt-4 gap-4 mt-2">
              <span className="text-[10px] font-mono text-white/40 uppercase leading-normal">
                💡 Output matches clean standard HR layouts optimized for ATS parser success.
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPdfConfig(false)}
                  className="px-5 py-2.5 border border-white/10 hover:bg-white/5 font-bold tracking-wider text-white uppercase text-[10px] transition-colors duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    exportResumeToPDF(pdfContact);
                    setShowPdfConfig(false);
                  }}
                  className="px-6 py-2.5 bg-[#E11D48] hover:bg-[#ff2f5a] text-black font-black tracking-wider uppercase text-[10px] transition-colors duration-200 cursor-pointer flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Generate & Download Resume
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </div>
  );
}
