import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AlertCircle, CheckCircle2, TrendingDown, TrendingUp, Loader2, Calendar, Users, ChevronDown } from "lucide-react";
import { useSurvey } from "../context/SurveyContext";

export default function ManagerDashboard() {
  const { surveys, getSurveyResults } = useSurvey();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Calculate overall engagement score from all active surveys
  const activeSurveys = surveys.filter(s => s.status === 'active');
  let totalScore = 0;
  let totalResponses = 0;
  
  activeSurveys.forEach(survey => {
    const results = getSurveyResults(survey.id);
    if (results.totalResponses > 0) {
      totalScore += results.averageScore * results.totalResponses;
      totalResponses += results.totalResponses;
    }
  });

  const engagementScore = totalResponses > 0 ? Math.round(totalScore / totalResponses) : 78; // Fallback to 78 if no data

  const handleCreatePlan = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);
    }, 1200);
  };
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-500">Team engagement, AI recommendations, and risk alerts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-2 bg-indigo-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-100">Team Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold">{engagementScore}<span className="text-3xl text-indigo-200">/100</span></div>
            <p className="text-sm text-indigo-100 flex items-center mt-2">
              <TrendingUp className="w-4 h-4 mr-1" /> Based on {totalResponses} recent responses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Participation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">100%</div>
            <p className="text-sm text-gray-500 mt-2">12 / 12 team members</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Company Benchmark</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-700">85<span className="text-xl text-gray-400">/100</span></div>
            <p className="text-sm text-gray-500 flex items-center mt-2">
              <TrendingDown className="w-4 h-4 mr-1" /> -7 points below avg
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Action Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start p-5 bg-indigo-50/50 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-indigo-900">Schedule 1-on-1s focusing on Career Growth</h4>
                  <p className="text-sm text-indigo-700/80 mt-1">
                    Your team scored lowest in "Career Opportunities" (62/100). NLP analysis indicates confusion around promotion criteria.
                  </p>
                  {isSuccess ? (
                    <div className="mt-4 flex items-center text-sm font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-md w-fit">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Action Plan Created
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsModalOpen(true)}
                      className="mt-4 bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 shadow-sm"
                    >
                      Create Action Plan
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-start p-5 bg-slate-50 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-slate-400 mt-0.5 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-slate-900">Acknowledge Recent Wins</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    "Recognition" scores dropped slightly. Consider highlighting individual contributions in the next team meeting.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Risk Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start p-5 bg-red-50/50 rounded-xl">
              <AlertCircle className="w-6 h-6 text-red-500 mr-4 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">Elevated Attrition Risk Detected</h4>
                <p className="text-sm text-red-700/80 mt-1">
                  2 team members are in the high-risk category for attrition in the next 6 months based on engagement trends.
                </p>
                <p className="text-xs text-red-500/80 mt-3">
                  Focus on team-wide retention strategies to maintain anonymity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Plan Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => !isSubmitting && setIsModalOpen(false)}
        >
          <Card 
            className="w-full max-w-[640px] shadow-2xl border-0 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-xl">Create Action Plan</CardTitle>
              <CardDescription>Schedule 1-on-1s focusing on Career Growth</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Plan Created Successfully!</h3>
                  <p className="text-sm text-gray-500 text-center">
                    Calendar invites have been drafted for your team members.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Plan Title</label>
                    <input 
                      type="text" 
                      defaultValue="Q3 Career Growth 1-on-1s"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Agenda / Talking Points</label>
                    <textarea 
                      rows={4}
                      defaultValue="1. Review current role satisfaction&#10;2. Discuss short-term and long-term career goals&#10;3. Identify skill gaps and training opportunities&#10;4. Outline a 6-month progression plan"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Target Completion</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                          type="date" 
                          defaultValue={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Assignees</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none bg-white">
                          <option>All Team Members (12)</option>
                          <option>Direct Reports Only (5)</option>
                          <option>Custom Selection...</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            {!isSuccess && (
              <CardFooter className="flex justify-end space-x-3 border-t border-gray-100 pt-6">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsModalOpen(false)} 
                  disabled={isSubmitting}
                  className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
                  onClick={handleCreatePlan}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Plan & Draft Invites'
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
