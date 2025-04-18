
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FeedbackForm, FormSubmission } from '@/services/formService';
import { Check, ExternalLink, Trash } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

interface FormCardProps {
  form: FeedbackForm;
  status?: FormSubmission;
  stats?: {
    completed: number;
    total: number;
  };
  onComplete?: (formId: string) => Promise<void>;
  onDelete?: (formId: string) => void;
  onViewResponses?: (formId: string) => void;
}

const FormCard: React.FC<FormCardProps> = ({ 
  form, 
  status, 
  stats,
  onComplete,
  onDelete,
  onViewResponses
}) => {
  const { profile } = useAuth();
  const isTeacher = profile?.user_role === 'teacher';
  const isStudent = profile?.user_role === 'student';
  const isCompleted = !!status?.submitted_at;
  const isDueDate = form.due_date ? new Date(form.due_date) : null;
  const isExpired = isDueDate ? isPast(isDueDate) : false;
  
  const handleComplete = async () => {
    if (onComplete) {
      await onComplete(form.id);
    }
  };

  return (
    <Card className={`overflow-hidden ${isExpired ? 'border-muted' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle>{form.title}</CardTitle>
        {isDueDate && (
          <div className={`text-sm ${isExpired ? 'text-destructive' : 'text-muted-foreground'}`}>
            Due: {format(isDueDate, 'PPP')}
            {isExpired && <span className="ml-2">(Expired)</span>}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {form.description && <p className="text-sm text-muted-foreground mb-4">{form.description}</p>}
        
        {isTeacher && stats && (
          <div className="bg-muted p-3 rounded-md">
            <div className="flex justify-between mb-2">
              <span className="text-sm">Student Completion</span>
              <span className="text-sm font-medium">
                {stats.completed} / {stats.total} students
              </span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${stats.total > 0 ? (stats.completed / stats.total * 100) : 0}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t bg-muted/50 px-6 py-3">
        <div className="flex justify-between w-full">
          {isStudent && (
            <>
              {isCompleted ? (
                <div className="flex items-center text-success gap-1">
                  <Check size={16} />
                  <span className="text-sm">Completed</span>
                </div>
              ) : (
                <Button 
                  onClick={handleComplete}
                  disabled={isExpired}
                  size="sm"
                >
                  Fill Form
                </Button>
              )}
            </>
          )}
          
          {isTeacher && (
            <div className="flex gap-2">
              {onViewResponses && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewResponses(form.id)}
                >
                  <ExternalLink size={16} className="mr-1" />
                  View Responses
                </Button>
              )}
              
              {onDelete && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onDelete(form.id)}
                >
                  <Trash size={16} />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default FormCard;
