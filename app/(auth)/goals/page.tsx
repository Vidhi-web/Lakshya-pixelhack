'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GOAL_TEMPLATES } from '@/lib/types';
import { Loader2, Target, Sparkles, ArrowRight } from 'lucide-react';

export default function GoalsPage() {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
    setError('');
  };

  const handleGenerateRoadmap = async () => {
    if (!selectedGoal) {
      setError('Please select a goal first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedTemplate = GOAL_TEMPLATES.find(g => g.id === selectedGoal);
      
      const requestData = {
        goalType: selectedGoal === 'CUSTOM' ? customInput : selectedTemplate?.title,
        userInput: selectedGoal === 'CUSTOM' ? customDescription : '',
      };

      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate roadmap');
      }

      const data = await response.json();
      
      // Redirect to dashboard after successful generation
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('Error generating roadmap:', err);
      setError(err.message || 'Failed to generate roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-6 shadow-lg">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Choose Your Goal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Select your primary goal and let AI create a personalized roadmap to help you achieve it
          </p>
        </div>

        {/* Goal Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {GOAL_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-xl ${
                selectedGoal === template.id
                  ? 'ring-2 ring-emerald-500 shadow-lg scale-105'
                  : 'hover:scale-102'
              }`}
              onClick={() => handleGoalSelect(template.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="text-4xl mb-2">{template.icon}</div>
                  {selectedGoal === template.id && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <CardTitle className="text-xl">{template.title}</CardTitle>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>
              {template.focusAreas && (
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {template.focusAreas.map((area, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Custom Goal Input */}
        {selectedGoal === 'CUSTOM' && (
          <Card className="mb-8 border-emerald-200 dark:border-emerald-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Describe Your Custom Goal
              </CardTitle>
              <CardDescription>
                Tell us about your goal and we'll create a personalized roadmap using AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customGoalTitle">Goal Title</Label>
                <Input
                  id="customGoalTitle"
                  placeholder="e.g., Learn Full Stack Development"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="customGoalDescription">Additional Details (Optional)</Label>
                <Textarea
                  id="customGoalDescription"
                  placeholder="Add any specific requirements, timeline, or context..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  rows={4}
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleGenerateRoadmap}
            disabled={!selectedGoal || loading || (selectedGoal === 'CUSTOM' && !customInput.trim())}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Your Roadmap...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate AI Roadmap
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ✨ Our AI will analyze your goal and create a detailed roadmap with milestones and tasks
          </p>
        </div>
      </div>
    </div>
  );
}
