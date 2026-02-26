import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Target, Plus, ChevronDown, ChevronUp, Users, Sparkles, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { GoogleGenAI, Type } from "@google/genai";

// Mock Data
const okrTemplates = [
  {
    id: 't1',
    category: 'Engineering',
    objective: 'Improve Platform Reliability and Performance',
    keyResults: [
      { title: 'Achieve 99.99% uptime for core services', target: 99.99, unit: '%' },
      { title: 'Reduce average API response time to < 100ms', target: 100, unit: 'ms' },
      { title: 'Resolve critical bugs within 4 hours', target: 100, unit: '%' }
    ]
  },
  {
    id: 't2',
    category: 'Sales',
    objective: 'Accelerate Enterprise Revenue Growth',
    keyResults: [
      { title: 'Close $1M in new enterprise ARR', target: 1000000, unit: '$' },
      { title: 'Increase win rate against top competitor to 40%', target: 40, unit: '%' },
      { title: 'Generate 50 new enterprise qualified leads', target: 50, unit: 'leads' }
    ]
  },
  {
    id: 't3',
    category: 'HR / Culture',
    objective: 'Enhance Employee Engagement and Retention',
    keyResults: [
      { title: 'Increase eNPS score to 40+', target: 40, unit: 'score' },
      { title: 'Achieve 95% participation in quarterly pulse surveys', target: 95, unit: '%' },
      { title: 'Reduce voluntary attrition to under 5%', target: 5, unit: '%' }
    ]
  }
];

const initialOKRs = [
  {
    id: '1',
    objective: 'Successfully launch the new Analytics Dashboard',
    progress: 65,
    owner: 'Sarah Jenkins',
    isTeam: false,
    status: 'on-track',
    deadline: '2026-03-31',
    keyResults: [
      { id: 'kr1', title: 'Complete frontend integration', progress: 80, target: 100, unit: '%' },
      { id: 'kr2', title: 'Achieve 95% test coverage', progress: 60, target: 95, unit: '%' },
      { id: 'kr3', title: 'Conduct user testing with 20 beta users', progress: 10, target: 20, unit: 'users' }
    ]
  },
  {
    id: '2',
    objective: 'Improve platform performance and reliability',
    progress: 30,
    owner: 'Sarah Jenkins',
    isTeam: false,
    status: 'at-risk',
    deadline: '2026-04-15',
    keyResults: [
      { id: 'kr4', title: 'Reduce API latency to < 100ms', progress: 40, target: 100, unit: '%' },
      { id: 'kr5', title: 'Migrate legacy database to Supabase', progress: 20, target: 100, unit: '%' }
    ]
  },
  {
    id: '3',
    objective: 'Expand Enterprise Customer Base',
    progress: 85,
    owner: 'Team Sales',
    isTeam: true,
    status: 'on-track',
    deadline: '2026-06-30',
    keyResults: [
      { id: 'kr6', title: 'Close 5 new enterprise deals', progress: 4, target: 5, unit: 'deals' },
      { id: 'kr7', title: 'Increase average contract value by 20%', progress: 25, target: 20, unit: '%' }
    ]
  },
  {
    id: '4',
    objective: 'Revamp Employee Onboarding Experience',
    progress: 15,
    owner: 'Team HR',
    isTeam: true,
    status: 'off-track',
    deadline: '2026-02-28',
    keyResults: [
      { id: 'kr8', title: 'Create 10 new training modules', progress: 2, target: 10, unit: 'modules' },
      { id: 'kr9', title: 'Achieve 90% satisfaction score from new hires', progress: 60, target: 90, unit: '%' }
    ]
  }
];

export default function OKRDashboard() {
  const [okrs, setOkrs] = useState(initialOKRs);
  const [expandedOkr, setExpandedOkr] = useState<string | null>('1');
  const [view, setView] = useState<'mine' | 'team'>('mine');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [updatingKR, setUpdatingKR] = useState<{ okrId: string; krId: string; title: string; currentProgress: number; target: number; unit: string } | null>(null);
  const [newProgress, setNewProgress] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<'progress' | 'status' | 'deadline'>('deadline');

  // AI State
  const [draftIdea, setDraftIdea] = useState('');
  const [newObjectiveTitle, setNewObjectiveTitle] = useState('');
  const [newKeyResults, setNewKeyResults] = useState<{title: string, target: number, unit: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedOkr(expandedOkr === id ? null : id);
  };

  const handleUpdateProgress = () => {
    if (!updatingKR || newProgress === '') return;
    
    const numProgress = Number(newProgress);
    if (isNaN(numProgress)) return;

    setOkrs(prevOkrs => prevOkrs.map(okr => {
      if (okr.id !== updatingKR.okrId) return okr;

      const updatedKeyResults = okr.keyResults.map(kr => {
        if (kr.id !== updatingKR.krId) return kr;
        return { ...kr, progress: Math.min(Math.max(0, numProgress), kr.target) };
      });

      // Recalculate overall progress
      const totalProgress = updatedKeyResults.reduce((sum, kr) => sum + (kr.progress / kr.target) * 100, 0);
      const avgProgress = Math.round(totalProgress / updatedKeyResults.length);

      // Update status based on progress
      let status = okr.status;
      if (avgProgress >= 70) status = 'on-track';
      else if (avgProgress >= 40) status = 'at-risk';
      else status = 'off-track';

      return { ...okr, keyResults: updatedKeyResults, progress: avgProgress, status };
    }));

    setUpdatingKR(null);
    setNewProgress('');
  };

  const handleAIAssist = async () => {
    if (!draftIdea) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: `I want to create an OKR about: "${draftIdea}". Suggest a polished Objective title and 2-3 measurable Key Results.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              objective: { type: Type.STRING },
              keyResults: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    target: { type: Type.NUMBER },
                    unit: { type: Type.STRING }
                  },
                  required: ["title", "target", "unit"]
                }
              }
            },
            required: ["objective", "keyResults"]
          }
        }
      });
      
      const result = JSON.parse(response.text || '{}');
      if (result.objective) setNewObjectiveTitle(result.objective);
      if (result.keyResults) setNewKeyResults(result.keyResults);
    } catch (error) {
      console.error("AI generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async (okr: any) => {
    setIsAnalyzing(prev => ({ ...prev, [okr.id]: true }));
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const prompt = `Analyze this OKR and provide a short, 2-sentence actionable recommendation to improve progress.
      Objective: ${okr.objective} (Status: ${okr.status}, Progress: ${okr.progress}%)
      Key Results:
      ${okr.keyResults.map((kr: any) => `- ${kr.title}: ${kr.progress}/${kr.target} ${kr.unit}`).join('\n')}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
      });
      
      setAnalysis(prev => ({ ...prev, [okr.id]: response.text || '' }));
    } catch (error) {
      console.error("AI analysis failed", error);
      setAnalysis(prev => ({ ...prev, [okr.id]: "Failed to generate analysis. Please try again." }));
    } finally {
      setIsAnalyzing(prev => ({ ...prev, [okr.id]: false }));
    }
  };

  const handleApplyTemplate = (template: typeof okrTemplates[0]) => {
    setNewObjectiveTitle(template.objective);
    setNewKeyResults(template.keyResults);
    setDraftIdea('');
  };

  const filteredAndSortedOKRs = okrs
    .filter(okr => view === 'mine' ? !okr.isTeam : okr.isTeam)
    .sort((a, b) => {
      if (sortBy === 'progress') {
        return b.progress - a.progress; // High to low
      } else if (sortBy === 'status') {
        const order = { 'on-track': 1, 'at-risk': 2, 'off-track': 3 };
        return order[a.status as keyof typeof order] - order[b.status as keyof typeof order];
      } else {
        // deadline
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Objectives & Key Results</h1>
          <p className="text-gray-500">Track and manage your goals and team alignment.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Objective
        </Button>
      </div>

      {/* View Toggle and Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setView('mine')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              view === 'mine' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <Target className="w-4 h-4 inline-block mr-2" />
            My OKRs
          </button>
          <button
            onClick={() => setView('team')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              view === 'team' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <Users className="w-4 h-4 inline-block mr-2" />
            Team OKRs
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 font-medium">Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="deadline">Deadline</option>
            <option value="progress">Progress</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* OKR List */}
      <div className="space-y-4">
        {filteredAndSortedOKRs.map((okr) => (
          <Card key={okr.id} className="overflow-hidden transition-all duration-200 hover:shadow-md">
            <div 
              className="p-6 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              onClick={() => toggleExpand(okr.id)}
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">{okr.objective}</h3>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-medium",
                    okr.status === 'on-track' ? "bg-green-100 text-green-800" : 
                    okr.status === 'at-risk' ? "bg-orange-100 text-orange-800" : 
                    "bg-red-100 text-red-800"
                  )}>
                    {okr.status === 'on-track' ? 'On Track' : okr.status === 'at-risk' ? 'At Risk' : 'Off Track'}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Owner: {okr.owner}</span>
                  <span>•</span>
                  <span>Due: {new Date(okr.deadline).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-6 w-full md:w-auto">
                <div className="flex-1 md:w-48">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-sm font-medium text-gray-900">{okr.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={cn(
                        "h-2.5 rounded-full",
                        okr.progress >= 70 ? "bg-green-500" : 
                        okr.progress >= 40 ? "bg-orange-500" : "bg-red-500"
                      )} 
                      style={{ width: `${okr.progress}%` }}
                    ></div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  {expandedOkr === okr.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Expanded Key Results */}
            {expandedOkr === okr.id && (
              <div className="bg-gray-50 border-t border-gray-100 p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Key Results</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAnalyze(okr)}
                      disabled={isAnalyzing[okr.id]}
                      className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                    >
                      {isAnalyzing[okr.id] ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      AI Analysis
                    </Button>
                  </div>

                  {analysis[okr.id] && (
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-900">
                      <div className="flex items-start">
                        <Sparkles className="w-4 h-4 mr-2 mt-0.5 text-indigo-600 flex-shrink-0" />
                        <p>{analysis[okr.id]}</p>
                      </div>
                    </div>
                  )}

                  {okr.keyResults.map((kr) => (
                    <div key={kr.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{kr.title}</p>
                      </div>
                      <div className="flex items-center space-x-4 w-full sm:w-auto">
                        <div className="flex-1 sm:w-40">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-gray-500">{kr.progress} / {kr.target} {kr.unit}</span>
                            <span className="text-xs font-medium text-gray-700">{Math.round((kr.progress / kr.target) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                              className="bg-indigo-500 h-2 rounded-full" 
                              style={{ width: `${(kr.progress / kr.target) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8"
                          onClick={() => {
                            setUpdatingKR({
                              okrId: okr.id,
                              krId: kr.id,
                              title: kr.title,
                              currentProgress: kr.progress,
                              target: kr.target,
                              unit: kr.unit
                            });
                            setNewProgress(kr.progress);
                          }}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                    <Plus className="w-4 h-4 mr-2" /> Add Key Result
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Create Modal (Simple Implementation) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle>Create New Objective</CardTitle>
              <CardDescription>Define a clear, inspiring goal for the quarter.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 overflow-y-auto flex-1">
              {/* Templates Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Start from a Template</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {okrTemplates.map((template) => (
                    <div 
                      key={template.id}
                      onClick={() => handleApplyTemplate(template)}
                      className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors group"
                    >
                      <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1 block">{template.category}</span>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-900 line-clamp-2">{template.objective}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 text-sm text-gray-500">or create your own</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Draft Idea (AI Assist)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={draftIdea}
                    onChange={e => setDraftIdea(e.target.value)}
                    placeholder="e.g., Make our app faster and more reliable" 
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Button 
                    onClick={handleAIAssist} 
                    disabled={isGenerating || !draftIdea}
                    className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Objective Title</label>
                <input 
                  type="text" 
                  value={newObjectiveTitle}
                  onChange={e => setNewObjectiveTitle(e.target.value)}
                  placeholder="e.g., Successfully launch the new Analytics Dashboard" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {newKeyResults.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Key Results</label>
                  <div className="space-y-2">
                    {newKeyResults.map((kr, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
                        <p className="font-medium text-gray-900">{kr.title}</p>
                        <p className="text-gray-500 mt-1">Target: {kr.target} {kr.unit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Owner</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>Sarah Jenkins (Me)</option>
                  <option>Team Engineering</option>
                </select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 border-t pt-4 flex-shrink-0">
              <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setIsCreateModalOpen(false)}>Create Objective</Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Update Progress Modal */}
      {updatingKR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader>
              <CardTitle>Update Key Result</CardTitle>
              <CardDescription className="truncate">{updatingKR.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Current Progress ({updatingKR.unit})
                </label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="number" 
                    value={newProgress}
                    onChange={(e) => setNewProgress(e.target.value === '' ? '' : Number(e.target.value))}
                    min={0}
                    max={updatingKR.target}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-gray-500 font-medium whitespace-nowrap">/ {updatingKR.target}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 border-t pt-4">
              <Button variant="ghost" onClick={() => setUpdatingKR(null)}>Cancel</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleUpdateProgress}>Save Progress</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
