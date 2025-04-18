
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { formService, FeedbackForm } from '@/services/formService';
import FormCard from '@/components/FormCard';
import { useToast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';
import NewFormModal from '@/components/NewFormModal';
import CompletionStats from '@/components/CompletionStats';

interface FormWithStats extends FeedbackForm {
  stats: {
    completed: number;
    total: number;
  };
}

const TeacherDashboard: React.FC = () => {
  const { toast } = useToast();
  const [forms, setForms] = useState<FormWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setIsLoading(true);
        const allForms = await formService.getAllForms();
        
        // Fetch stats for each form
        const formsWithStats = await Promise.all(
          allForms.map(async (form) => {
            const stats = await formService.getFormCompletionStats(form.id);
            return { ...form, stats };
          })
        );
        
        setForms(formsWithStats);
      } catch (error) {
        console.error('Failed to fetch forms:', error);
        toast({
          title: 'Error',
          description: 'Failed to load feedback forms.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchForms();
  }, [toast]);

  const handleCreateForm = async (formData: Omit<FeedbackForm, 'id'>) => {
    try {
      const newForm = await formService.createForm(formData);
      const stats = { completed: 0, total: 0 };
      setForms([...forms, { ...newForm, stats }]);
      
      toast({
        title: 'Success',
        description: 'Form created successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create form.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const totalCompleted = forms.reduce((sum, form) => sum + form.stats.completed, 0);
  const totalForms = forms.reduce((sum, form) => sum + form.stats.total, 0);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-10">Loading forms...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Feedback Forms</h2>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus size={16} />
          <span>Add New Form</span>
        </Button>
      </div>

      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <CompletionStats
            completed={totalCompleted}
            total={totalForms}
            title="Overall Student Completion"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map((form) => (
          <div key={form.id} className="flex flex-col">
            <FormCard form={form} />
            <div className="mt-2 p-4 bg-muted rounded-md">
              <h4 className="font-medium mb-2">Completion Stats</h4>
              <Progress value={(form.stats.completed / (form.stats.total || 1)) * 100} />
              <div className="mt-2 text-sm text-muted-foreground">
                {form.stats.completed} of {form.stats.total} students completed
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {forms.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          No forms created yet. Click the "Add New Form" button to create one.
        </div>
      )}

      <NewFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateForm} 
      />
    </div>
  );
};

// Progress component for the teacher dashboard
const Progress = ({ value }: { value: number }) => {
  return (
    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
      <div 
        className="h-full bg-primary" 
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
};

export default TeacherDashboard;
