
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { formService, FeedbackForm } from '@/services/formService';
import FormCard from '@/components/FormCard';
import { useToast } from '@/components/ui/use-toast';
import { Plus, AlertCircle } from 'lucide-react';
import CreateFormModal from '@/components/CreateFormModal';
import FormResponseDialog from '@/components/FormResponseDialog';
import CompletionStats from '@/components/CompletionStats';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [studentCount, setStudentCount] = useState(0);
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
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

        // Get total student count
        const students = await formService.getAllStudents();
        setStudentCount(students.length);
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

    fetchData();
  }, [toast]);

  const handleCreateForm = async (
    formData: Omit<FeedbackForm, 'id' | 'created_at'>,
    questions: { form_id: string, question_text: string, question_order: number }[]
  ) => {
    try {
      // Create the form
      const newForm = await formService.createForm(formData);
      
      // Add form_id to questions
      const questionsWithFormId = questions.map(q => ({
        ...q,
        form_id: newForm.id
      }));
      
      // Create the questions
      await formService.createFormQuestions(questionsWithFormId);
      
      // Add the new form to the state
      const stats = { completed: 0, total: studentCount };
      setForms([{ ...newForm, stats }, ...forms]);
      
      toast({
        title: 'Success',
        description: 'Form created successfully.',
      });
    } catch (error) {
      console.error('Failed to create form:', error);
      toast({
        title: 'Error',
        description: 'Failed to create form.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDeleteForm = async (formId: string) => {
    try {
      await formService.deleteForm(formId);
      setForms(forms.filter(form => form.id !== formId));
      
      toast({
        title: 'Success',
        description: 'Form deleted successfully.',
      });
    } catch (error) {
      console.error('Failed to delete form:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete form.',
        variant: 'destructive',
      });
    }
    
    setDeleteFormId(null);
  };

  const handleViewResponses = (formId: string) => {
    setSelectedFormId(formId);
    setIsResponseDialogOpen(true);
  };

  const confirmDeleteForm = (formId: string) => {
    setDeleteFormId(formId);
  };

  const totalCompleted = forms.reduce((sum, form) => sum + form.stats.completed, 0);
  const totalPossible = forms.reduce((sum, form) => sum + form.stats.total, 0);

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
          <span>Create New Form</span>
        </Button>
      </div>

      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <CompletionStats
            completed={totalCompleted}
            total={totalPossible}
            title="Overall Student Completion"
          />
          <div className="bg-accent p-4 rounded-lg">
            <h3 className="font-medium mb-2">Registered Students</h3>
            <div className="text-3xl font-bold">{studentCount}</div>
          </div>
          <div className="bg-accent p-4 rounded-lg">
            <h3 className="font-medium mb-2">Total Forms</h3>
            <div className="text-3xl font-bold">{forms.length}</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map((form) => (
          <FormCard 
            key={form.id} 
            form={form} 
            stats={form.stats}
            onDelete={confirmDeleteForm}
            onViewResponses={handleViewResponses}
          />
        ))}
      </div>
      
      {forms.length === 0 && (
        <div className="text-center py-10 bg-muted rounded-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No forms created yet</h3>
          <p className="text-muted-foreground mb-4">
            Click the "Create New Form" button to create your first feedback form.
          </p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Create New Form
          </Button>
        </div>
      )}

      <CreateFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateForm} 
      />

      {selectedFormId && (
        <FormResponseDialog
          isOpen={isResponseDialogOpen}
          formId={selectedFormId}
          onClose={() => {
            setIsResponseDialogOpen(false);
            setSelectedFormId(null);
          }}
        />
      )}

      <AlertDialog 
        open={deleteFormId !== null} 
        onOpenChange={(open) => !open && setDeleteFormId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this feedback form and all associated responses.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteFormId && handleDeleteForm(deleteFormId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeacherDashboard;
