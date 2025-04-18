
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Calendar, ExternalLink } from 'lucide-react';
import { FeedbackForm, FormStatus } from '@/services/formService';

interface FormCardProps {
  form: FeedbackForm;
  status?: FormStatus;
  onComplete?: (formId: string) => void;
}

const FormCard: React.FC<FormCardProps> = ({ form, status, onComplete }) => {
  const isCompleted = status?.completed || false;
  const formattedDate = new Date(form.dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const handleComplete = () => {
    if (onComplete) {
      onComplete(form.id);
    }
  };

  const handleOpenForm = () => {
    window.open(form.url, '_blank');
  };

  return (
    <Card className={`transition-all duration-300 ${isCompleted ? 'border-l-4 border-l-success' : 'border-l-4 border-l-danger'}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{form.title}</CardTitle>
            <CardDescription>{form.description}</CardDescription>
          </div>
          <div>
            {isCompleted ? (
              <CheckCircle className="text-success" size={24} />
            ) : (
              <XCircle className="text-danger" size={24} />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar size={16} className="mr-2" />
          <span>Due: {formattedDate}</span>
        </div>
        {status?.completedAt && (
          <div className="mt-2 text-sm text-success">
            Completed on: {new Date(status.completedAt).toLocaleDateString()}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleOpenForm}>
          <ExternalLink size={16} className="mr-2" />
          Open Form
        </Button>
        {!isCompleted && onComplete && (
          <Button onClick={handleComplete}>
            Mark as Complete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default FormCard;
