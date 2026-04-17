import { useState } from 'react';
import { Sparkles, Map } from 'lucide-react';
import { InputSection } from './components/InputSection';
import { LoadingState } from './components/LoadingState';
import { ReadinessScore } from './components/ReadinessScore';
import { HorizonStepper } from './components/HorizonStepper';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
// Hardcoded token limit for MVP
import alumniData from './data/alumni.json';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface TaskItem {
  task?: string;
  link?: string;
  item?: string;
  checklist?: string[];
  cert?: string;
  provider?: string;
}

interface HorizonData {
  title: string;
  tasks: TaskItem[];
}

export interface AnalysisResponse {
  recommended_role: string;
  matched_alumni_name: string;
  readiness_score: number;
  match_reason: string;
  roadmap: {
    horizon_1: HorizonData;
    horizon_2: HorizonData;
    horizon_3: HorizonData;
  };
}

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    recommended_role: { type: SchemaType.STRING },
    matched_alumni_name: { type: SchemaType.STRING },
    readiness_score: { type: SchemaType.INTEGER },
    match_reason: { type: SchemaType.STRING },
    roadmap: {
      type: SchemaType.OBJECT,
      properties: {
        horizon_1: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            tasks: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: { task: { type: SchemaType.STRING }, link: { type: SchemaType.STRING } },
                required: ["task"]
              }
            }
          },
          required: ["title", "tasks"]
        },
        horizon_2: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            tasks: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  item: { type: SchemaType.STRING },
                  checklist: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                },
                required: ["item"]
              }
            }
          },
          required: ["title", "tasks"]
        },
        horizon_3: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            tasks: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: { cert: { type: SchemaType.STRING }, provider: { type: SchemaType.STRING } },
                required: ["cert"]
              }
            }
          },
          required: ["title", "tasks"]
        }
      },
      required: ["horizon_1", "horizon_2", "horizon_3"]
    }
  },
  required: ["recommended_role", "matched_alumni_name", "readiness_score", "match_reason", "roadmap"]
};


function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str);
        text += strings.join(' ') + '\n';
      }
      return text;
    } catch (err: any) {
      console.error("PDF Parsing error:", err);
      throw new Error(`Failed to parse the uploaded PDF: ${err.message || 'Unknown error'}`);
    }
  };

  const handleSubmit = async (file: File, intent: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Missing VITE_GEMINI_API_KEY in frontend environment configuration.");
      }

      const extractedResumeText = await extractTextFromPDF(file);

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
          // @ts-ignore
          responseSchema: responseSchema,
        }
      });

      const systemPrompt = `
Act as a Strategic Career Architect.

CONTEXT:
1. Student Resume (2nd Year Level): ${extractedResumeText}
2. User Intent ("Vibe Check"): ${intent} (CRITICAL: Prioritize roles matching this vibe)
3. Alumni Knowledge Base: ${JSON.stringify(alumniData)}

TASK:
- Match the student to 1 of the 10 Alumni based on their skills, projects, and trajectory proximity (compare student's history vs alumni's history).
- Identify the most suitable job role based on the matched alumni.
- Calculate a consistent 'readiness_score' (1-100) strictly based on the objective overlap between the student's current skills and the matched role's baseline requirements.
- Identify the 'Missing Link' (the specific project that bridges the gap).
- Create a 3-Horizon roadmap starting from scratch.
  - Horizon 1 (Foundation): Next 30 days. MUST USE FREE RESOURCES ONLY (YouTube, Google Skill Builder, Microsoft Learn, Coursera free). IMPORTANT: For YouTube links, DO NOT hallucinate direct video URLs (which often lead to 404 errors). Instead, CREATE a YouTube SEARCH link using this exact format: \`https://www.youtube.com/results?search_query=YOUR+SEARCH+TERM+HERE\` (replace spaces with '+').
  - Horizon 2 (The Missing Link Project): A practical project mirroring the matched role's responsibilities to practice the skills learned. You must provide a clear checklist to complete the project.
  - Horizon 3 (Professional Polish): Advanced skills or certifications required for the role. MUST include FREE resources or mention if a cert is paid but highly recommended.

OUTPUT REQUIREMENTS:
- Return ONLY a valid JSON object.
- DO NOT INCLUDE markdown code blocks (like \`\`\`json). Just return the raw JSON text.
`;

      const resultCall = await model.generateContent(systemPrompt);
      let responseText = resultCall.response.text();
      responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();

      const parsedData: AnalysisResponse = JSON.parse(responseText);
      setResult(parsedData);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-900/10 to-transparent rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-900/10 to-transparent rounded-full blur-[120px]" />
      </div>

      <nav className="relative z-10 border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="bg-blue-600 p-2 rounded-xl group-hover:bg-blue-500 transition-colors">
                <Map className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                PathTrace Engine
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
              {/* Future navigation links can go here */}
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col items-center">
        {!result && !isLoading && (
          <div className="text-center max-w-3xl mb-16 space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-sm leading-tight">
              Follow the <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 animate-gradient-x">
                Footprints of Success
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed font-light px-4">
              Upload your resume and state your career intent. We'll compare your profile against successful alumni via client-side AI analysis and generate a custom 3-horizon roadmap.
            </p>
          </div>
        )}

        <div className="w-full relative">
          {!isLoading && !result && (
            <div className="animate-fade-in-up">
              <InputSection onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          )}

          {isLoading && (
            <div className="bg-gray-900/30 rounded-3xl border border-gray-800/50 backdrop-blur-sm p-8 max-w-2xl mx-auto mt-8 shadow-2xl">
              <LoadingState />
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl max-w-2xl mx-auto mt-8 flex items-start gap-4 shadow-lg shadow-red-500/5">
              <div className="bg-red-500/20 p-2 rounded-lg mt-1">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-1">Analysis Failed</h3>
                <p className="text-sm text-red-200/80">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 transition-colors bg-red-500/10 px-3 py-1 rounded"
              >
                Dismiss
              </button>
            </div>
          )}

          {result && !isLoading && (
            <div className="w-full animate-fade-in space-y-12 pb-20">
              <div className="flex justify-between items-center max-w-4xl mx-auto mb-4 px-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  Your Career Roadmap
                </h2>
                <button
                  onClick={() => setResult(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700 hover:border-gray-600"
                >
                  Start Over
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 max-w-5xl mx-auto">
                <div className="bg-gray-900/40 border border-gray-800/60 rounded-3xl p-6 md:p-10 backdrop-blur-md shadow-2xl">
                  <div className="mb-8 p-6 bg-blue-900/10 border border-blue-500/20 rounded-2xl">
                    <h3 className="text-lg font-bold text-blue-400 mb-2">Analysis Match</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Matched closely with alumni <span className="text-white font-semibold">{result.matched_alumni_name}</span>. Recommended target role: <span className="text-white font-semibold">{result.recommended_role}</span>.
                    </p>
                    <p className="text-gray-400 text-sm italic">"{result.match_reason}"</p>
                  </div>
                  <HorizonStepper roadmap={result.roadmap} />
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-900/40 border border-gray-800/60 rounded-3xl p-6 backdrop-blur-md flex flex-col items-center justify-center shadow-2xl sticky top-24">
                    <ReadinessScore score={result.readiness_score} />

                    <div className="w-full mt-6 pt-6 border-t border-gray-800/50 space-y-4">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest text-center">Diagnostics</h4>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Match Accuracy</span>
                        <span className="text-green-400 font-medium">Verified</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Alumni Baseline</span>
                        <span className="text-white font-medium">10 Profiles</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Engine model</span>
                        <span className="text-blue-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis w-32 text-right" title="gemini-2.5-flash-preview-09-2025">gemini-2.5-flash</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
