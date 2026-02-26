import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: string[];
  status: 'active' | 'closed';
  createdAt: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  employeeId: string; // Mock employee ID for now
  answers: Record<number, number>; // questionIndex -> rating (1-5)
  submittedAt: string;
}

interface SurveyContextType {
  surveys: Survey[];
  responses: SurveyResponse[];
  addSurvey: (survey: Omit<Survey, 'id' | 'createdAt'>) => void;
  submitResponse: (response: Omit<SurveyResponse, 'id' | 'submittedAt'>) => void;
  importQuestions: (csvText: string, title: string, description: string) => void;
  exportReport: (surveyId: string) => void;
  getSurveyResults: (surveyId: string) => { averageScore: number; totalResponses: number };
}

const defaultSurveys: Survey[] = [
  {
    id: 's1',
    title: 'Q3 Pulse Survey',
    description: 'Quarterly check-in on work/life balance and team collaboration.',
    questions: [
      "How satisfied are you with your current work/life balance?",
      "Do you feel you have clear opportunities for career growth?",
      "How effectively does leadership communicate company goals?",
      "How would you rate the overall team collaboration?"
    ],
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [surveys, setSurveys] = useState<Survey[]>(() => {
    const saved = localStorage.getItem('engage_surveys');
    return saved ? JSON.parse(saved) : defaultSurveys;
  });

  const [responses, setResponses] = useState<SurveyResponse[]>(() => {
    const saved = localStorage.getItem('engage_responses');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('engage_surveys', JSON.stringify(surveys));
  }, [surveys]);

  useEffect(() => {
    localStorage.setItem('engage_responses', JSON.stringify(responses));
  }, [responses]);

  const addSurvey = (surveyData: Omit<Survey, 'id' | 'createdAt'>) => {
    const newSurvey: Survey = {
      ...surveyData,
      id: `s_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setSurveys(prev => [newSurvey, ...prev]);
  };

  const submitResponse = (responseData: Omit<SurveyResponse, 'id' | 'submittedAt'>) => {
    const newResponse: SurveyResponse = {
      ...responseData,
      id: `r_${Date.now()}`,
      submittedAt: new Date().toISOString()
    };
    setResponses(prev => [...prev, newResponse]);
  };

  const importQuestions = (csvText: string, title: string, description: string) => {
    // Simple CSV parser: split by newline, ignore empty lines
    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    // Assume each line is a question (or strip quotes if needed)
    const questions = lines.map(line => line.replace(/^["']|["']$/g, ''));
    
    if (questions.length > 0) {
      addSurvey({ title, description, questions, status: 'active' });
    }
  };

  const exportReport = (surveyId: string) => {
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) return;

    const surveyResponses = responses.filter(r => r.surveyId === surveyId);
    
    // Create CSV header
    const headers = ['Response ID', 'Employee ID', 'Submitted At', ...survey.questions.map((_, i) => `Q${i + 1}`)];
    
    // Create CSV rows
    const rows = surveyResponses.map(r => {
      const rowData = [
        r.id,
        r.employeeId,
        new Date(r.submittedAt).toLocaleString(),
        ...survey.questions.map((_, i) => r.answers[i] || 'N/A')
      ];
      return rowData.map(val => `"${val}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${survey.title.replace(/\s+/g, '_')}_Report.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSurveyResults = (surveyId: string) => {
    const surveyResponses = responses.filter(r => r.surveyId === surveyId);
    if (surveyResponses.length === 0) return { averageScore: 0, totalResponses: 0 };

    let totalScore = 0;
    let totalQuestionsAnswered = 0;

    surveyResponses.forEach(r => {
      Object.values(r.answers).forEach(score => {
        totalScore += score;
        totalQuestionsAnswered += 1;
      });
    });

    // Convert 1-5 scale to 0-100 scale for engagement score
    // 1 = 0, 2 = 25, 3 = 50, 4 = 75, 5 = 100
    const rawAverage = totalQuestionsAnswered > 0 ? totalScore / totalQuestionsAnswered : 0;
    const normalizedScore = rawAverage > 0 ? ((rawAverage - 1) / 4) * 100 : 0;

    return {
      averageScore: Math.round(normalizedScore),
      totalResponses: surveyResponses.length
    };
  };

  return (
    <SurveyContext.Provider value={{ surveys, responses, addSurvey, submitResponse, importQuestions, exportReport, getSurveyResults }}>
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurvey() {
  const context = useContext(SurveyContext);
  if (context === undefined) {
    throw new Error('useSurvey must be used within a SurveyProvider');
  }
  return context;
}
