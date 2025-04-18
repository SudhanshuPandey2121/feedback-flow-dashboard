
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FeedbackForm, FormQuestion, formService } from '@/services/formService';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface FormResponseDialogProps {
  isOpen: boolean;
  formId: string;
  onClose: () => void;
}

const FormResponseDialog: React.FC<FormResponseDialogProps> = ({ 
  isOpen, 
  formId, 
  onClose
}) => {
  const [form, setForm] = useState<FeedbackForm | null>(null);
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<{ total: number, completed: number }>({ total: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'individual'>('summary');
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const formData = await formService.getFormById(formId);
        const questionsData = await formService.getFormQuestions(formId);
        const responsesData = await formService.getFormResponses(formId);
        const statsData = await formService.getFormCompletionStats(formId);
        const studentsData = await formService.getAllStudents();
        
        setForm(formData || null);
        setQuestions(questionsData);
        setResponses(responsesData);
        setStats(statsData);
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching form data:', error);
        toast({
          title: 'Error',
          description: 'Could not load form responses.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && formId) {
      fetchData();
    }
  }, [formId, isOpen, toast]);

  const calculateAverageRatings = () => {
    const questionAverages: Record<string, { 
      questionId: string, 
      questionText: string, 
      averageRating: number,
      counts: Record<number, number>
    }> = {};
    
    // Initialize question data
    questions.forEach(question => {
      questionAverages[question.id] = {
        questionId: question.id,
        questionText: question.question_text,
        averageRating: 0,
        counts: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
      };
    });
    
    // Calculate counts and sum
    responses.forEach(response => {
      const questionId = response.form_questions.id;
      if (questionAverages[questionId]) {
        questionAverages[questionId].counts[response.rating]++;
      }
    });
    
    // Calculate averages
    Object.keys(questionAverages).forEach(questionId => {
      const counts = questionAverages[questionId].counts;
      const totalResponses = Object.values(counts).reduce((sum, count) => sum + count, 0);
      
      if (totalResponses > 0) {
        let sum = 0;
        for (let rating = 1; rating <= 5; rating++) {
          sum += rating * counts[rating];
        }
        questionAverages[questionId].averageRating = sum / totalResponses;
      }
    });
    
    return Object.values(questionAverages);
  };

  const getChartData = (questionId: string) => {
    const data = [];
    const questionData = calculateAverageRatings().find(q => q.questionId === questionId);
    
    if (questionData) {
      for (let rating = 1; rating <= 5; rating++) {
        data.push({
          rating: rating.toString(),
          count: questionData.counts[rating]
        });
      }
    }
    
    return data;
  };

  const renderSummaryTab = () => {
    const averageRatings = calculateAverageRatings();
    
    return (
      <div className="space-y-8">
        <div className="bg-muted p-4 rounded-md">
          <h3 className="font-medium mb-2">Completion Status</h3>
          <div className="flex justify-between mb-2">
            <span className="text-sm">Student Completion</span>
            <span className="text-sm font-medium">
              {stats.completed} / {stats.total} students ({Math.round((stats.completed / (stats.total || 1)) * 100)}%)
            </span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary" 
              style={{ width: `${stats.total > 0 ? (stats.completed / stats.total * 100) : 0}%` }}
            />
          </div>
        </div>
        
        {averageRatings.map((question) => (
          <div key={question.questionId} className="border rounded-md overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-medium">{question.questionText}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Average Rating: <span className="font-medium">{question.averageRating.toFixed(2)}</span>
              </p>
            </div>
            <div className="p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData(question.questionId)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" name="Number of Responses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderIndividualTab = () => {
    const completedStudentIds = [...new Set(responses.map(r => r.form_submissions.student_id))];
    
    const getStudentName = (id: string) => {
      const student = students.find(s => s.id === id);
      return student ? student.full_name : 'Unknown Student';
    };
    
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Showing {completedStudentIds.length} student submissions out of {stats.total} students.
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Submission Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {completedStudentIds.map(studentId => {
              const student = students.find(s => s.id === studentId);
              const submission = responses.find(r => r.form_submissions.student_id === studentId);
              const submissionDate = submission ? new Date(submission.form_submissions.submitted_at) : null;
              
              return (
                <TableRow key={studentId}>
                  <TableCell>{student?.full_name || 'Unknown'}</TableCell>
                  <TableCell>{student?.student_id || 'N/A'}</TableCell>
                  <TableCell>{student?.department || 'N/A'}</TableCell>
                  <TableCell>
                    {submissionDate ? submissionDate.toLocaleDateString() : 'N/A'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Loading Responses...</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">Loading form responses...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!form) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px]">
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Form Responses: {form.title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 ${activeTab === 'summary' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'individual' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('individual')}
          >
            Individual Responses
          </button>
        </div>
        
        {activeTab === 'summary' ? renderSummaryTab() : renderIndividualTab()}
        
        <DialogFooter className="pt-4">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormResponseDialog;
