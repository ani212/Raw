import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import mammoth from "mammoth";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set limits for base64 file payloads
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // Initialize Gemini API client safely
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      })
    : null;

  // 1. Health & readiness checks
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      apiReady: !!ai,
      message: ai ? "Ready to roast some raw resumes!" : "Missing GEMINI_API_KEY environment variable. Configure it in Secrets.",
    });
  });

  // 2. Main resume roasting API endpoint
  app.post("/api/roast", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({
          error: "Gemini API client not initialized. Please ensure your GEMINI_API_KEY is configured in the Secrets panel.",
        });
      }

      const { fileName, fileType, fileData, rawText } = req.body;
      let resumeContentPart: any = null;

      // Extract text or build Gemini inlineData depending on the upload format
      if (fileType === "pdf" && fileData) {
        // PDF is natively read by Gemini 3.5-flash! 
        // We supply the base64 pdf data directly as inlineData
        resumeContentPart = {
          inlineData: {
            mimeType: "application/pdf",
            data: fileData,
          },
        };
      } else if (fileType === "docx" && fileData) {
        // Convert docx buffer to raw text using mammoth
        const docBuffer = Buffer.from(fileData, "base64");
        const extractResult = await mammoth.extractRawText({ buffer: docBuffer });
        resumeContentPart = {
          text: `[Uploaded DOCX File: ${fileName || "Resume"}]\n\n${extractResult.value}`,
        };
      } else if (rawText) {
        // Direct pasted text
        resumeContentPart = {
          text: `[Pasted Resume Text]\n\n${rawText}`,
        };
      } else {
        return res.status(400).json({ error: "No resume content or file uploaded." });
      }

      // Detailed prompt detailing Gordon Ramsay's persona and instructions for each of the 12 steps
      const gordonPrompt = `
You are Gordon Ramsay of CVs — Resume Hell's Kitchen.
You have reviewed over 250,000 resumes across FAANG, Fortune 500 companies, startups, game studios, VFX companies, consulting firms, and AI companies.
Your reputation is legendary because you don't hand out compliments—you earn them.
Your mission is simple:
Take terrible resumes and turn them into interview magnets.
You are brutally honest, sarcastic, witty, and unforgiving of mediocrity, but every roast must include practical advice that genuinely improves the resume.
Think Gordon Ramsay in Hell's Kitchen—except the kitchen is Microsoft Word.

Your Personality:
- Roast weak resumes.
- Destroy clichés.
- Mock meaningless buzzwords.
- Hate corporate fluff.
- Love measurable impact.
- Respect people who can prove results.
- Care about clarity more than fancy wording.
- Your humor should target the resume, never the person.
  - Good: "This bullet point has all the nutritional value of unsalted rice cakes."
  - Good: "This resume is trying to sell a Ferrari while showing me a bicycle."

You must execute the following 12-STEP review process based on the attached resume. Return the results strictly conforming to the requested JSON schema.

STEP 1 — The 7-Second Recruiter Test
Pretend you're a recruiter with 500 resumes waiting. You have exactly 7 seconds. 
What catches your eye? What makes you want to stop reading? What's confusing? What's impressive? Would you continue reading? Give a score out of 10.

STEP 2 — First Roast
Write a hilarious, spicy, and accurate opening roast. No holding back, culinary metaphors are highly encouraged.

STEP 3 — Resume Autopsy
Review every section:
- Header: Roast layout, title strength, missing links, bad emails, or outdated elements. Suggest fixes.
- Summary: Roast clichés (e.g. passionate, team player, fast learner). Explain why they're useless and write a 5-star replacement.
- Experience: Review up to 6 key bullets. For each: Ask "So what?", "What changed?", "Where's the proof?" Identify weak verbs, passive writing, fluff, missing metrics, and rewrite each bullet immediately to be outcome-driven. Mark a "proofStatus" (e.g., "Raw", "Undercooked - No Numbers", "No Impact", "Deliciously Quantified").
- Projects: Roast vague or academic projects that lack users, revenue, performance gains, or demo links, then rewrite descriptions.
- Skills: Group skills into: Valuable, Good, Generic, Outdated, and Resume filler. Recommend modern industry replacements.
- Education: Analyze placement, size, and highlight any missing achievements.
- Certifications: Separate valuable certifications from useless marketing fluff.

STEP 4 — ATS Audit
Score out of 100. Pinpoint missing industry keywords, formatting risks, parsing issues, weak titles, and clear optimization tips.

STEP 5 — Recruiter Psychology
What assumptions would you make as a hiring manager? (Junior? Mid? Senior? Leader? Under/Overqualified?) Explain the exact indicators that trigger this assumption.

STEP 6 — Achievement Density
Calculate: (number of achievement bullets that prove success with metrics/outcomes) ÷ (total bullets that merely describe duties). Explain the findings.

STEP 7 — Buzzword Detector
List all the corporate jargon, fluff, and "LinkedIn Bingo" words found (e.g. passionate, dedicated, innovative, strategic, dynamic). Provide a sarcastic commentary.

STEP 8 — Salary Ceiling
Estimate: Current market value, potential salary, and maximum realistic salary (in USD). Detail exactly what changes or skills would unlock the high end.

STEP 9 — Hiring Verdict
Would this resume survive at: Google, Microsoft, Amazon, Meta, NVIDIA, Ubisoft, Epic Games, Rockstar, a fast-growing startup, and a Fortune 500 company? Write a 1-2 sentence outcome for each.

STEP 10 — The Hell's Kitchen Rewrite
Complete a fully overhauled draft of: Summary, Skills group replacement suggestions, Key Rewritten Bullets, and Role Title optimization. Make it look like a top 5% candidate. Do NOT invent achievements or make up metrics, simply rewrite existing experience to showcase impact.

STEP 11 — Final Verdict
Assign scores from 1-100 for ATS, Recruiter, Hiring Manager, Technical, Leadership, Impact, Clarity, and Overall. Provide an Interview Probability badge (Definitely, Maybe, or Rejected).

STEP 12 — Ramsay's Closing Remarks
End with a legendary summarizing one-liner roast (e.g., "This resume isn't undercooked—it's still frozen.") and list the TOP 5 high-impact fixes in order of priority.

DO NOT invent experience, achievements, or metrics. Be completely truthful to the candidate's background while maximizing the impact of their presentation.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          resumeContentPart,
          { text: gordonPrompt }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              step1_recruiterTest: {
                type: Type.OBJECT,
                properties: {
                  catchesEye: { type: Type.STRING },
                  stopReading: { type: Type.STRING },
                  confusing: { type: Type.STRING },
                  impressive: { type: Type.STRING },
                  continueReading: { type: Type.BOOLEAN },
                  score: { type: Type.INTEGER }
                },
                required: ["catchesEye", "stopReading", "confusing", "impressive", "continueReading", "score"]
              },
              step2_firstRoast: { type: Type.STRING },
              step3_autopsy: {
                type: Type.OBJECT,
                properties: {
                  header: {
                    type: Type.OBJECT,
                    properties: {
                      roast: { type: Type.STRING },
                      analysis: { type: Type.STRING },
                      improvements: { type: Type.STRING }
                    },
                    required: ["roast", "analysis", "improvements"]
                  },
                  summary: {
                    type: Type.OBJECT,
                    properties: {
                      original: { type: Type.STRING },
                      roast: { type: Type.STRING },
                      rewritten: { type: Type.STRING }
                    },
                    required: ["original", "roast", "rewritten"]
                  },
                  experience: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        roleTitle: { type: Type.STRING },
                        originalBullet: { type: Type.STRING },
                        roast: { type: Type.STRING },
                        rewrittenBullet: { type: Type.STRING },
                        proofStatus: { type: Type.STRING }
                      },
                      required: ["roleTitle", "originalBullet", "roast", "rewrittenBullet", "proofStatus"]
                    }
                  },
                  projects: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        projectTitle: { type: Type.STRING },
                        roast: { type: Type.STRING },
                        improvedDescription: { type: Type.STRING }
                      },
                      required: ["projectTitle", "roast", "improvedDescription"]
                    }
                  },
                  skills: {
                    type: Type.OBJECT,
                    properties: {
                      valuable: { type: Type.ARRAY, items: { type: Type.STRING } },
                      good: { type: Type.ARRAY, items: { type: Type.STRING } },
                      generic: { type: Type.ARRAY, items: { type: Type.STRING } },
                      outdated: { type: Type.ARRAY, items: { type: Type.STRING } },
                      filler: { type: Type.ARRAY, items: { type: Type.STRING } },
                      recommendations: { type: Type.STRING }
                    },
                    required: ["valuable", "good", "generic", "outdated", "filler", "recommendations"]
                  },
                  education: {
                    type: Type.OBJECT,
                    properties: {
                      roast: { type: Type.STRING },
                      advice: { type: Type.STRING }
                    },
                    required: ["roast", "advice"]
                  },
                  certifications: {
                    type: Type.OBJECT,
                    properties: {
                      roast: { type: Type.STRING },
                      advice: { type: Type.STRING }
                    },
                    required: ["roast", "advice"]
                  }
                },
                required: ["header", "summary", "experience", "projects", "skills", "education", "certifications"]
              },
              step4_atsAudit: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.INTEGER },
                  missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                  formattingRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  parsingProblems: { type: Type.ARRAY, items: { type: Type.STRING } },
                  optimizationOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["score", "missingKeywords", "formattingRisks", "parsingProblems", "optimizationOpportunities"]
              },
              step5_recruiterPsychology: {
                type: Type.OBJECT,
                properties: {
                  assumedSeniority: { type: Type.STRING },
                  suitability: { type: Type.STRING },
                  reasons: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["assumedSeniority", "suitability", "reasons"]
              },
              step6_achievementDensity: {
                type: Type.OBJECT,
                properties: {
                  achievementBulletsCount: { type: Type.INTEGER },
                  totalBulletsCount: { type: Type.INTEGER },
                  densityPercentage: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["achievementBulletsCount", "totalBulletsCount", "densityPercentage", "explanation"]
              },
              step7_buzzwordDetector: {
                type: Type.OBJECT,
                properties: {
                  detectedBuzzwords: { type: Type.ARRAY, items: { type: Type.STRING } },
                  bingoCount: { type: Type.INTEGER },
                  ramsayCommentary: { type: Type.STRING }
                },
                required: ["detectedBuzzwords", "bingoCount", "ramsayCommentary"]
              },
              step8_salaryCeiling: {
                type: Type.OBJECT,
                properties: {
                  currentMarketValue: { type: Type.STRING },
                  potentialSalary: { type: Type.STRING },
                  maxRealisticSalary: { type: Type.STRING },
                  actionsToIncrease: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["currentMarketValue", "potentialSalary", "maxRealisticSalary", "actionsToIncrease"]
              },
              step9_hiringVerdict: {
                type: Type.OBJECT,
                properties: {
                  google: { type: Type.STRING },
                  microsoft: { type: Type.STRING },
                  amazon: { type: Type.STRING },
                  meta: { type: Type.STRING },
                  nvidia: { type: Type.STRING },
                  ubisoft: { type: Type.STRING },
                  epicGames: { type: Type.STRING },
                  rockstar: { type: Type.STRING },
                  startup: { type: Type.STRING },
                  fortune500: { type: Type.STRING }
                },
                required: ["google", "microsoft", "amazon", "meta", "nvidia", "ubisoft", "epicGames", "rockstar", "startup", "fortune500"]
              },
              step10_rewrite: {
                type: Type.OBJECT,
                properties: {
                  summary: { type: Type.STRING },
                  skillsReplacement: { type: Type.STRING },
                  experienceBulletsRewritten: { type: Type.STRING },
                  overallTitleRecommendations: { type: Type.STRING }
                },
                required: ["summary", "skillsReplacement", "experienceBulletsRewritten", "overallTitleRecommendations"]
              },
              step11_finalVerdict: {
                type: Type.OBJECT,
                properties: {
                  atsScore: { type: Type.INTEGER },
                  recruiterScore: { type: Type.INTEGER },
                  hiringManagerScore: { type: Type.INTEGER },
                  technicalStrength: { type: Type.INTEGER },
                  leadership: { type: Type.INTEGER },
                  impact: { type: Type.INTEGER },
                  clarity: { type: Type.INTEGER },
                  overall: { type: Type.INTEGER },
                  interviewProbability: { type: Type.STRING }
                },
                required: ["atsScore", "recruiterScore", "hiringManagerScore", "technicalStrength", "leadership", "impact", "clarity", "overall", "interviewProbability"]
              },
              step12_closingRemarks: {
                type: Type.OBJECT,
                properties: {
                  oneLinerRoast: { type: Type.STRING },
                  top5Fixes: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["oneLinerRoast", "top5Fixes"]
              }
            },
            required: [
              "step1_recruiterTest",
              "step2_firstRoast",
              "step3_autopsy",
              "step4_atsAudit",
              "step5_recruiterPsychology",
              "step6_achievementDensity",
              "step7_buzzwordDetector",
              "step8_salaryCeiling",
              "step9_hiringVerdict",
              "step10_rewrite",
              "step11_finalVerdict",
              "step12_closingRemarks"
            ]
          },
        },
      });

      const parsedResult = JSON.parse(response.text?.trim() || "{}");
      return res.json(parsedResult);
    } catch (err: any) {
      console.error("Roast execution failed:", err);
      return res.status(500).json({
        error: "Failed to roast the resume. Please check if the file or content is valid and try again.",
        details: err.message,
      });
    }
  });

  // 3. Vite development server vs Production static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind to host 0.0.0.0 and port 3000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
