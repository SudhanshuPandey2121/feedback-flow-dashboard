
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FeedbackForm, FormQuestion } from '@/services/formService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Minus } from 'lucide-react';

interface CreateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: Omit<FeedbackForm, 'id' | 'created_at'>, questions: Omit<FormQuestion, 'id' | 'created_at'>[]) => Promise<void>;
}

const CreateFormModal: React.FC<CreateFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [questions, setQuestions] = useState<{ text: string }[]>([{ text: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { text: '' }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = [...questions];
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
    }
  };

  const updateQuestionText = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = { text };
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !dueDate || questions.some(q => !q.text)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and questions",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a form",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const formData = {
        title,
        description,
        due_date: new Date(dueDate).toISOString(),
        created_by: user.id,
      };

      const formQuestions = questions.map((q, index) => ({
        question_text: q.text,
        question_order: index + 1,
        form_id: '' // This will be filled by the onSubmit function
      }));
      
      await onSubmit(formData, formQuestions);
      
      // Reset form
      setTitle('');
      setDescription('');
      setDueDate('');
      setQuestions([{ text: '' }]);
      
      onClose();
    } catch (error) {
      console.error('Error creating form:', error);
      toast({
        title: "Error",
        description: "Failed to create form",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Feedback Form</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter form title"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter form description"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Questions *</Label>
              <Button 
                type="button" 
                size="sm" 
                onClick={addQuestion}
                className="flex items-center gap-1"
              >
                <Plus size={16} /> Add Question
              </Button>
            </div>
            
            {questions.map((question, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    value={question.text}
                    onChange={(e) => updateQuestionText(index, e.target.value)}
                    placeholder={`Question ${index + 1}`}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Students will rate this question from 1 to 5
                  </p>
                </div>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline" 
                  onClick={() => removeQuestion(index)}
                  className="mt-1"
                  disabled={questions.length === 1}
                >
                  <Minus size={16} />
                </Button>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Form'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFormModal;
