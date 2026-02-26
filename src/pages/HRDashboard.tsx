import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useSurvey } from "../context/SurveyContext";
import { Plus, Download, FileText, X, Sparkles, Loader2, Upload } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";
import Markdown from "react-markdown";

const deptData = [
  { name: "Engineering", score: 82, participation: 95 },
  { name: "Sales", score: 76, participation: 88 },
  { name: "Marketing", score: 85, participation: 92 },
  { name: "Product", score: 88, participation: 98 },
  { name: "Support", score: 71, participation: 85 },
];

const surveyTemplates = [
  {
    id: 't1',
    title: 'Quarterly Engagement Pulse',
    description: 'Standard check-in on employee sentiment and engagement.',
    questions: [
      "How satisfied are you with your current work/life balance?",
      "Do you feel you have clear opportunities for career growth?",
      "How effectively does leadership communicate company goals?",
      "How would you rate the overall team collaboration?"
    ].join('\n')
  },
  {
    id: 't2',
    title: 'Manager Effectiveness',
    description: 'Anonymous feedback regarding direct manager performance.',
    questions: [
      "My manager provides clear expectations for my role.",
      "My manager gives me actionable feedback to help me improve.",
      "I feel comfortable discussing concerns with my manager.",
      "My manager recognizes my contributions to the team."
    ].join('\n')
  },
  {
    id: 't3',
    title: 'New Hire Onboarding',
    description: 'Feedback on the first 30 days of employment.',
    questions: [
      "The onboarding process prepared me well for my role.",
      "I have the tools and resources I need to do my job.",
      "I feel welcomed by my team members.",
      "The company culture aligns with what was presented during interviews."
    ].join('\n')
  }
];

export default function HRDashboard() {
  const { surveys, getSurveyResults, exportReport, importQuestions } = useSurvey();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSurveyTitle, setNewSurveyTitle] = useState('');
  const [newSurveyDesc, setNewSurveyDesc] = useState('');
  const [csvInput, setCsvInput] = useState('');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);

  const generateTemplateWithAI = async () => {
    if (!aiPrompt) return;
    setIsGeneratingTemplate(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are an expert HR professional. Create a survey template based on this request: "${aiPrompt}".
      Return ONLY a JSON object with the following structure:
      {
        "title": "Survey Title",
        "description": "Brief description for employees",
        "questions": [
          "Question 1?",
          "Question 2?",
          "Question 3?"
        ]
      }`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              questions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "description", "questions"]
          }
        }
      });
      
      const data = JSON.parse(response.text || "{}");
      if (data.title && data.questions) {
        setNewSurveyTitle(data.title);
        setNewSurveyDesc(data.description || '');
        setCsvInput(data.questions.join('\n'));
        setAiPrompt('');
      }
    } catch (error) {
      console.error("Error generating template:", error);
      alert("Failed to generate template. Please try again.");
    } finally {
      setIsGeneratingTemplate(false);
    }
  };

  const generateAISummary = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are an expert HR Data Analyst. Analyze the following department engagement and participation data. 
      Provide a brief executive summary (2-3 short paragraphs) with actionable recommendations. 
      Format the response in Markdown. Do not use top-level headings.
      
      Data:
      ${JSON.stringify(deptData, null, 2)}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      setAiSummary(response.text || "No summary generated.");
    } catch (error) {
      console.error("Error generating summary:", error);
      setAiSummary("Failed to generate AI summary. Please check your API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvInput(text);
    };
    reader.readAsText(file);
  };

  const handleApplyTemplate = (template: typeof surveyTemplates[0]) => {
    setNewSurveyTitle(template.title);
    setNewSurveyDesc(template.description);
    setCsvInput(template.questions);
  };

  const handleCreateSurvey = () => {
    if (!newSurveyTitle || !csvInput) return;
    importQuestions(csvInput, newSurveyTitle, newSurveyDesc);
    setIsCreateModalOpen(false);
    setNewSurveyTitle('');
    setNewSurveyDesc('');
    setCsvInput('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
          <p className="text-gray-500">Cross-department comparison and participation tracking.</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Survey
        </Button>
      </div>

      {/* Active Surveys Management */}
      <Card>
        <CardHeader>
          <CardTitle>Survey Management</CardTitle>
          <CardDescription>Active surveys and real-time response tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {surveys.map(survey => {
              const results = getSurveyResults(survey.id);
              return (
                <div key={survey.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-indigo-500 mr-4 bg-indigo-50 p-1.5 rounded-md" />
                    <div>
                      <h4 className="font-medium text-gray-900">{survey.title}</h4>
                      <p className="text-sm text-gray-500">
                        {survey.questions.length} Questions • {results.totalResponses} Responses
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right mr-4">
                      <div className="text-sm font-medium text-gray-900">Avg Score</div>
                      <div className="text-lg font-bold text-indigo-600">{results.averageScore}/100</div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportReport(survey.id)}
                      disabled={results.totalResponses === 0}
                      className="text-gray-600"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Department Engagement Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={400}>
              <BarChart data={deptData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} name="Engagement Score" />
                <Bar dataKey="participation" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} name="Participation %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Low Participation Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                <div>
                  <p className="font-medium text-red-900">Customer Support (EMEA)</p>
                  <p className="text-sm text-red-700">Participation below 60% threshold</p>
                </div>
                <div className="text-2xl font-bold text-red-700">54%</div>
              </div>
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div>
                  <p className="font-medium text-orange-900">Sales (Enterprise)</p>
                  <p className="text-sm text-orange-700">Approaching threshold</p>
                </div>
                <div className="text-2xl font-bold text-orange-700">62%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Executive Summary (AI Generated)</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateAISummary} 
              disabled={isGenerating}
              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {aiSummary ? "Regenerate" : "Generate Insights"}
            </Button>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-sm text-gray-500">Analyzing department data with Gemini...</p>
              </div>
            ) : aiSummary ? (
              <div className="prose prose-sm text-gray-600 max-w-none">
                <Markdown>{aiSummary}</Markdown>
              </div>
            ) : (
              <div className="prose prose-sm text-gray-600">
                <p>
                  Overall engagement has improved by 3% this quarter, driven largely by positive sentiment in the <strong>Engineering</strong> and <strong>Product</strong> departments regarding recent work-life balance initiatives.
                </p>
                <p className="mt-2">
                  However, <strong>Support</strong> shows declining scores in "Leadership Communication" and "Career Growth". NLP analysis of open-text responses indicates frustration with the new ticketing system rollout and lack of clear promotion paths.
                </p>
                <p className="mt-2 font-medium text-indigo-700">
                  Recommendation: Prioritize leadership town halls for the Support org and review Q3 compensation bands for Sales.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Survey Modal */}
      {isCreateModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <Card 
            className="w-full max-w-[700px] shadow-2xl border-0 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="pb-4 border-b border-gray-100 flex flex-row items-center justify-between flex-shrink-0">
              <div>
                <CardTitle className="text-xl">Create New Survey</CardTitle>
                <CardDescription>Import questions via CSV or use a template</CardDescription>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 overflow-y-auto flex-1">
              {/* AI Template Generator */}
              <div className="space-y-3 bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                <div className="flex items-center text-sm font-medium text-indigo-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate with AI
                </div>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., A survey to gather feedback on the new hybrid work policy..."
                    className="flex-1 px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && generateTemplateWithAI()}
                  />
                  <Button 
                    onClick={generateTemplateWithAI} 
                    disabled={isGeneratingTemplate || !aiPrompt}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white whitespace-nowrap"
                  >
                    {isGeneratingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
                  </Button>
                </div>
              </div>

              {/* Templates Section */}
              <div className="space-y-3">
                <div className="flex items-center text-sm font-medium text-gray-700">
                  Or start from a preset template
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {surveyTemplates.map(template => (
                    <div 
                      key={template.id}
                      onClick={() => handleApplyTemplate(template)}
                      className="p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-colors group"
                    >
                      <h5 className="font-medium text-gray-900 text-sm group-hover:text-indigo-700">{template.title}</h5>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Survey Title</label>
                  <input 
                    type="text" 
                    value={newSurveyTitle}
                    onChange={(e) => setNewSurveyTitle(e.target.value)}
                    placeholder="e.g., Q4 Engagement Survey"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <input 
                    type="text" 
                    value={newSurveyDesc}
                    onChange={(e) => setNewSurveyDesc(e.target.value)}
                    placeholder="Brief description for employees"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Questions (One per line)</label>
                    <div>
                      <input 
                        type="file" 
                        accept=".csv,.txt" 
                        id="csv-upload" 
                        className="hidden" 
                        onChange={handleFileUpload}
                      />
                      <label 
                        htmlFor="csv-upload" 
                        className="flex items-center text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer font-medium"
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Upload CSV/TXT
                      </label>
                    </div>
                  </div>
                  <textarea 
                    rows={6}
                    value={csvInput}
                    onChange={(e) => setCsvInput(e.target.value)}
                    placeholder="How satisfied are you with your role?&#10;Do you feel supported by your manager?&#10;Are your goals clear?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">Enter each question on a new line, or upload a file.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-3 border-t border-gray-100 pt-4 pb-4 flex-shrink-0">
              <Button 
                variant="ghost" 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" 
                onClick={handleCreateSurvey}
                disabled={!newSurveyTitle || !csvInput}
              >
                Create & Publish
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
