
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formService, FeedbackForm, FormStatus } from '@/services/formService';
import FormCard from '@/components/FormCard';
import CompletionStats from '@/components/CompletionStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formStatuses, setFormStatuses] = useState<Array<FormStatus & { form: FeedbackForm }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchFormStatuses = async () => {
      try {
        setIsLoading(true);
        const statuses = await formService.getFormStatusesByUserId(user.id);
        setFormStatuses(statuses);
      } catch (error) {
        console.error('Failed to fetch form statuses:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your form statuses.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormStatuses();
  }, [user, toast]);

  const handleMarkAsComplete = async (formId: string) => {
    if (!user) return;
    
    try {
      await formService.markFormAsCompleted(formId, user.id);
      
      // Update local state
      setFormStatuses(prev => 
        prev.map(status => 
          status.formId === formId 
            ? { ...status, completed: true, completedAt: new Date().toISOString() } 
            : status
        )
      );
      
      toast({
        title: 'Success',
        description: 'Form marked as completed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark form as completed.',
        variant: 'destructive',
      });
    }
  };

  const completedForms = formStatuses.filter(status => status.completed);
  const pendingForms = formStatuses.filter(status => !status.completed);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-10">Loading your forms...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Your Feedback Forms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <CompletionStats 
            completed={completedForms.length}
            total={formStatuses.length}
            title="Overall Completion"
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Forms ({formStatuses.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedForms.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingForms.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          {formStatuses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formStatuses.map(status => (
                <FormCard 
                  key={status.formId}
                  form={status.form}
                  status={status}
                  onComplete={handleMarkAsComplete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No forms available.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-6">
          {completedForms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedForms.map(status => (
                <FormCard 
                  key={status.formId}
                  form={status.form}
                  status={status}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No completed forms yet.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-6">
          {pendingForms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingForms.map(status => (
                <FormCard 
                  key={status.formId}
                  form={status.form}
                  status={status}
                  onComplete={handleMarkAsComplete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-success">
              All forms completed! Well done!
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;
