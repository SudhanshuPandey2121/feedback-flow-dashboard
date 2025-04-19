
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FeedbackForm, FormQuestion, formService } from '@/services/formService';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

interface FormFillDialogProps {
  isOpen: boolean;
  formId: string;
  onClose: () => void;
  onSubmit: () => void;
}

const FormFillDialog: React.FC<FormFillDialogProps> = ({ 
  isOpen, 
  formId, 
  onClose,
  onSubmit
}) => {
  const [form, setForm] = useState<FeedbackForm | null>(null);
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setIsLoading(true);
        const formData = await formService.getFormById(formId);
        const questionsData = await formService.getFormQuestions(formId);
        
        setForm(formData || null);
        setQuestions(questionsData);

        // Initialize responses with empty values
        const initialResponses: Record<string, number> = {};
        questionsData.forEach(q => {
          initialResponses[q.id] = 0;
        });
        setResponses(initialResponses);
      } catch (error) {
        console.error('Error fetching form data:', error);
        toast({
          title: 'Error',
          description: 'Could not load form data.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && formId) {
      fetchFormData();
    }
  }, [formId, isOpen, toast]);

  const handleRatingChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: parseInt(value)
    }));
  };

  const handleSubmit = async () => {
    // Validate all questions have been answered
    const unansweredQuestions = questions.filter(q => !responses[q.id]);
    
    if (unansweredQuestions.length > 0) {
      toast({
        title: 'Error',
        description: 'Please answer all questions before submitting.',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit a form.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const responseArray = Object.keys(responses).map(questionId => ({
        questionId,
        rating: responses[questionId]
      }));
      
      await formService.submitForm(formId, user.id, responseArray);
      
      toast({
        title: 'Success',
        description: 'Form submitted successfully.',
      });
      
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit form.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading Form...</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">Loading form questions...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!form) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="py-4">Form not found.</div>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{form.title}</DialogTitle>
        </DialogHeader>
        
        {form.description && (
          <p className="text-sm text-muted-foreground mb-4">{form.description}</p>
        )}
        
        <form className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-3">
              <div className="font-medium">
                {index + 1}. {question.question_text}
              </div>
              
              <RadioGroup 
                value={responses[question.id]?.toString() || ''} 
                onValueChange={(value) => handleRatingChange(question.id, value)}
                className="flex flex-wrap gap-2 md:gap-4"
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={rating} className="flex flex-col items-center">
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value={rating.toString()} id={`${question.id}-${rating}`} />
                      <Label htmlFor={`${question.id}-${rating}`}>{rating}</Label>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {rating === 1 ? 'Poor' : rating === 5 ? 'Excellent' : ''}
                    </span>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </form>
        
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormFillDialog;
