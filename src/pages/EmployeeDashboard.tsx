import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CheckCircle2, Clock, Loader2, X } from "lucide-react";
import { useSurvey, Survey } from "../context/SurveyContext";

export default function EmployeeDashboard() {
  const { surveys, responses, submitResponse } = useSurvey();
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [surveyStep, setSurveyStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  // Get active surveys that the employee hasn't completed yet
  const employeeId = 'emp_123'; // Mock employee ID
  
  const activeSurveys = surveys.filter(s => s.status === 'active');
  
  const handleStartSurvey = (survey: Survey) => {
    setActiveSurvey(survey);
    setSurveyStep(0);
    setAnswers({});
  };

  const handleNext = () => {
    if (!activeSurvey) return;
    if (surveyStep < activeSurvey.questions.length - 1) {
      setSurveyStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!activeSurvey) return;
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      submitResponse({
        surveyId: activeSurvey.id,
        employeeId: employeeId,
        answers: answers
      });
      setIsSubmitting(false);
      setActiveSurvey(null);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-500">Your feedback, OKRs, and company benchmarks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeSurveys.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No active surveys at the moment.</p>
              ) : (
                activeSurveys.map(survey => {
                  const isDone = responses.some(r => r.surveyId === survey.id && r.employeeId === employeeId);
                  
                  return isDone ? (
                    <div key={survey.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg opacity-75">
                      <div className="flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                        <div>
                          <h4 className="font-medium text-gray-900">{survey.title}</h4>
                          <p className="text-sm text-gray-500">Completed</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-green-600">Done</span>
                    </div>
                  ) : (
                    <div key={survey.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-orange-500 mr-3" />
                        <div>
                          <h4 className="font-medium text-gray-900">{survey.title}</h4>
                          <p className="text-sm text-gray-500">{survey.description}</p>
                        </div>
                      </div>
                      <Button 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={() => handleStartSurvey(survey)}
                      >
                        Start
                      </Button>
                    </div>
                  );
                })
              )}

              <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg opacity-75">
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Manager Upward Feedback</h4>
                    <p className="text-sm text-gray-500">Completed on Aug 12</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-green-600">Done</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My OKRs (Q3)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Launch New Analytics Dashboard</span>
                  <span className="text-sm font-medium text-gray-700">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Key Result: Complete frontend integration by Aug 30</p>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Improve Test Coverage</span>
                  <span className="text-sm font-medium text-gray-700">40%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Key Result: Reach 80% coverage on core services</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Benchmark Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Theme</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Avg</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry Benchmark</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Work/Life Balance</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">85</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">78</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">75</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Career Growth</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">60</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">65</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">70</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Leadership</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">90</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">82</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">80</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Survey Modal */}
      {activeSurvey && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => !isSubmitting && setActiveSurvey(null)}
        >
          <Card 
            className="w-full max-w-[600px] shadow-2xl border-0"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="pb-4 border-b border-gray-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">{activeSurvey.title}</CardTitle>
                <CardDescription>
                  Question {surveyStep + 1} of {activeSurvey.questions.length}
                </CardDescription>
              </div>
              <button 
                onClick={() => !isSubmitting && setActiveSurvey(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-8 pt-8 pb-8">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  {activeSurvey.questions[surveyStep]}
                </h3>
                
                <div className="flex justify-center gap-2 sm:gap-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setAnswers(prev => ({ ...prev, [surveyStep]: rating }))}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-lg font-medium transition-all duration-200 ${
                        answers[surveyStep] === rating 
                          ? 'bg-indigo-600 text-white shadow-md transform scale-110' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between max-w-[300px] mx-auto mt-3 text-xs text-gray-500 font-medium px-2">
                  <span>Strongly Disagree</span>
                  <span>Strongly Agree</span>
                </div>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-8">
                <div 
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${((surveyStep + 1) / activeSurvey.questions.length) * 100}%` }}
                ></div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between space-x-3 border-t border-gray-100 pt-6">
              <Button 
                variant="ghost" 
                onClick={() => setSurveyStep(prev => Math.max(0, prev - 1))} 
                disabled={surveyStep === 0 || isSubmitting}
                className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              >
                Previous
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm min-w-[100px]" 
                onClick={handleNext}
                disabled={!answers[surveyStep] || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : surveyStep === activeSurvey.questions.length - 1 ? (
                  'Submit'
                ) : (
                  'Next'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
