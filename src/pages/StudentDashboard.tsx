import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formService, FeedbackForm } from '@/services/formService';
import FormCard from '@/components/FormCard';
import CompletionStats from '@/components/CompletionStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import FormFillDialog from '@/components/FormFillDialog';
import { Check, Clock } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [forms, setForms] = useState<FeedbackForm[]>([]);
  const [submittedForms, setSubmittedForms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const allForms = await formService.getAllForms();
        const submissions = await formService.getStudentSubmissions(user.id);
        const submittedFormIds = submissions.map(sub => sub.form_id);
        
        setForms(allForms);
        setSubmittedForms(submittedFormIds);
      } catch (error) {
        console.error('Failed to fetch forms:', error);
        toast({
          title: 'Error',
          description: 'Failed to load forms.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const handleFillForm = (formId: string) => {
    setSelectedFormId(formId);
    setIsFormDialogOpen(true);
  };

  const handleFormSubmitted = async () => {
    if (selectedFormId && user) {
      setSubmittedForms(prev => [...prev, selectedFormId]);
      
      toast({
        title: 'Success',
        description: 'Form submitted successfully. Thank you for your feedback!',
      });
    }
    
    return Promise.resolve();
  };

  const completed = forms.filter(form => submittedForms.includes(form.id));
  const pending = forms.filter(form => !submittedForms.includes(form.id));

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-10">Loading forms...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Your Feedback Forms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <CompletionStats 
            completed={completed.length}
            total={forms.length}
            title="Your Completion Rate"
          />
          <div className="bg-accent p-4 rounded-lg flex items-center gap-3">
            <div className="p-3 rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Completed</h3>
              <div className="text-2xl font-bold">{completed.length} forms</div>
            </div>
          </div>
          <div className="bg-accent p-4 rounded-lg flex items-center gap-3">
            <div className="p-3 rounded-full bg-amber-100">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Pending</h3>
              <div className="text-2xl font-bold">{pending.length} forms</div>
            </div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Forms ({forms.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          {forms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map(form => (
                <FormCard 
                  key={form.id}
                  form={form}
                  status={submittedForms.includes(form.id) ? { id: '', form_id: form.id, student_id: user?.id || '', submitted_at: new Date().toISOString() } : undefined}
                  onComplete={() => {
                    handleFillForm(form.id);
                    return Promise.resolve();
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground bg-muted rounded-lg">
              No forms available. Please check back later.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-6">
          {completed.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completed.map(form => (
                <FormCard 
                  key={form.id}
                  form={form}
                  status={{ id: '', form_id: form.id, student_id: user?.id || '', submitted_at: new Date().toISOString() }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground bg-muted rounded-lg">
              You haven't completed any forms yet.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-6">
          {pending.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pending.map(form => (
                <FormCard 
                  key={form.id}
                  form={form}
                  onComplete={() => {
                    handleFillForm(form.id);
                    return Promise.resolve();
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-success bg-muted rounded-lg">
              <Check className="mx-auto h-8 w-8 mb-2" />
              All forms completed! Well done!
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedFormId && (
        <FormFillDialog
          isOpen={isFormDialogOpen}
          formId={selectedFormId}
          onClose={() => {
            setIsFormDialogOpen(false);
            setSelectedFormId(null);
          }}
          onSubmit={handleFormSubmitted}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
