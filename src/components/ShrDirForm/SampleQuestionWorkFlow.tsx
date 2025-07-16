import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { CheckCircle, ArrowRight, ArrowLeft, Edit3 } from 'lucide-react';
import questionsData from './questoins.json';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea';
  question: string;
  placeholder?: string;
  required: boolean;
  options?: Array<{ value: string; label: string }>;
  showIf?: {
    questionId: string;
    value: string;
  };
  validation?: {
    minLength?: number;
    pattern?: string;
    message: string;
  };
}

interface Answer {
  questionId: string;
  value: string;
}

const QuestionFlow: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Filter questions based on conditional logic
    const filtered = (questionsData.questions as Question[]).filter((question: Question) => {
      if (!question.showIf) return true;
      
      const dependentAnswer = answers.find(
        answer => answer.questionId === question.showIf!.questionId
      );
      
      return dependentAnswer?.value === question.showIf.value;
    });
    
    setFilteredQuestions(filtered);
  }, [answers]);

  // Load current answer when navigating back to a question
  useEffect(() => {
    const question = filteredQuestions[currentQuestionIndex];
    if (question) {
      const existingAnswer = answers.find(
        answer => answer.questionId === question.id
      );
      setCurrentAnswer(existingAnswer?.value || '');
    }
  }, [currentQuestionIndex, filteredQuestions, answers]);

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === filteredQuestions.length - 1;

  const goBackToQuestion = (questionId: string) => {
    const questionIndex = filteredQuestions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
      setCurrentQuestionIndex(questionIndex);
      setIsCompleted(false);
      setIsEditing(true);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setIsEditing(true);
    }
  };

  const validateAnswer = (question: Question, value: string): boolean => {
    if (question.required && !value.trim()) {
      toast({
        title: "Required field",
        description: "This field is required",
        variant: "destructive",
      });
      return false;
    }

    if (question.validation) {
      const { minLength, pattern, message } = question.validation;
      
      if (minLength && value.length < minLength) {
        toast({
          title: "Validation error",
          description: message,
          variant: "destructive",
        });
        return false;
      }

      if (pattern && !new RegExp(pattern).test(value)) {
        toast({
          title: "Validation error",
          description: message,
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!currentQuestion) return;

    if (!validateAnswer(currentQuestion, currentAnswer)) {
      return;
    }

    // Update answers
    const newAnswers = [...answers];
    const existingAnswerIndex = newAnswers.findIndex(
      answer => answer.questionId === currentQuestion.id
    );

    if (existingAnswerIndex >= 0) {
      newAnswers[existingAnswerIndex].value = currentAnswer;
    } else {
      newAnswers.push({
        questionId: currentQuestion.id,
        value: currentAnswer,
      });
    }

    setAnswers(newAnswers);
    setCurrentAnswer('');
    setIsEditing(false);

    if (isLastQuestion) {
      setIsCompleted(true);
      toast({
        title: "Form completed!",
        description: "Thank you for providing all the information.",
      });
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleOptionSelect = (value: string) => {
    setCurrentAnswer(value);
  };

  const handleInputChange = (value: string) => {
    setCurrentAnswer(value);
  };

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'select':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <Button
                key={option.value}
                variant={currentAnswer === option.value ? "default" : "outline"}
                className="w-full justify-start h-auto p-4 text-left option-button"
                onClick={() => handleOptionSelect(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        );
      
      case 'textarea':
        return (
          <div className="space-y-4">
            <Textarea
              value={currentAnswer}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={currentQuestion.placeholder}
              className="min-h-[100px] resize-none"
            />
            {currentAnswer && (
              <Button onClick={handleNext} className="w-full option-button">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        );
      
      default:
        return (
          <div className="space-y-4">
            <Input
              type={currentQuestion.type}
              value={currentAnswer}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={currentQuestion.placeholder}
              className="w-full"
            />
            {currentAnswer && (
              <Button onClick={handleNext} className="w-full option-button">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        );
    }
  };

  const renderCompletedAnswers = () => {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="summary-title">Your Information</h2>
          <div className="flex items-center justify-center gap-2 text-primary mb-4">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Form Completed Successfully!</span>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsCompleted(false)}
            className="text-sm hover:bg-accent hover:text-accent-foreground transition-smooth"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Answers
          </Button>
        </div>
        
        <div className="space-y-3">
          {answers.map((answer) => {
            const question = (questionsData.questions as Question[]).find(q => q.id === answer.questionId);
            return (
              <div 
                key={answer.questionId} 
                className="service-card cursor-pointer group"
                onClick={() => goBackToQuestion(answer.questionId)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1">
                      {question?.question}
                    </div>
                    <div className="font-medium">{answer.value}</div>
                  </div>
                  <Edit3 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPreviousAnswers = () => {
    const visibleAnswers = answers.slice(0, currentQuestionIndex);
    
    return (
      <div className="space-y-3 mb-6">
        {visibleAnswers.map((answer) => {
          const question = (questionsData.questions as Question[]).find(q => q.id === answer.questionId);
          return (
            <div 
              key={answer.questionId} 
              className="service-card cursor-pointer group animate-fade-in"
              onClick={() => goBackToQuestion(answer.questionId)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">
                    {question?.question}
                  </div>
                  <div className="font-medium">{answer.value}</div>
                </div>
                <Edit3 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-primary p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <h1 className="decorative-heading">Information Form</h1>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </div>
          
          <Card className="p-8 shadow-warm">
            {renderCompletedAnswers()}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <h1 className="decorative-heading">Information Form</h1>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </div>
        
        <div className="space-y-4">
          {renderPreviousAnswers()}
          
          {currentQuestion && (
            <Card className="question-card animate-fade-in">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="service-icon">
                    <span className="text-sm font-medium px-2">👤</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-question text-question-foreground rounded-2xl p-4 max-w-md">
                      <p className="question-title">{currentQuestion.question}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  {renderQuestionInput()}
                </div>
                
                {currentQuestion.type === 'select' && currentAnswer && (
                  <Button 
                    onClick={handleNext}
                    className="w-full option-button"
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                
                {currentQuestionIndex > 0 && (
                  <div className="flex justify-between items-center pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="text-sm hover:bg-muted transition-smooth"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {isEditing ? 'Editing answer' : 'Click any answer above to edit'}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {filteredQuestions.length}
        </div>
      </div>
    </div>
  );
};

export default QuestionFlow;