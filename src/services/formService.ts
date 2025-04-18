import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface FeedbackForm {
  id: string;
  title: string;
  description: string | null;
  created_by: string;
  due_date: string;
  created_at: string;
  url?: string; // Make url optional for form creation
}

export interface FormQuestion {
  id: string;
  form_id: string;
  question_text: string;
  question_order: number;
  created_at?: string;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  student_id: string;
  submitted_at: string;
}

export interface QuestionResponse {
  id: string;
  submission_id: string;
  question_id: string;
  rating: number;
  created_at?: string;
}

export interface StudentCount {
  total: number;
  completed: number;
}

// Methods to interact with the database
export const formService = {
  // Teacher methods
  getAllForms: async (): Promise<FeedbackForm[]> => {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
  
  getFormById: async (id: string): Promise<FeedbackForm | null> => {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },
  
  createForm: async (form: Omit<FeedbackForm, 'id' | 'created_at'>): Promise<FeedbackForm> => {
    const { data, error } = await supabase
      .from('forms')
      .insert(form)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  updateForm: async (id: string, updates: Partial<Omit<FeedbackForm, 'id' | 'created_at' | 'created_by'>>): Promise<FeedbackForm> => {
    const { data, error } = await supabase
      .from('forms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  deleteForm: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('forms')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
  
  // Question methods
  getFormQuestions: async (formId: string): Promise<FormQuestion[]> => {
    const { data, error } = await supabase
      .from('form_questions')
      .select('*')
      .eq('form_id', formId)
      .order('question_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },
  
  createFormQuestions: async (questions: Omit<FormQuestion, 'id' | 'created_at'>[]): Promise<FormQuestion[]> => {
    const { data, error } = await supabase
      .from('form_questions')
      .insert(questions)
      .select();
    
    if (error) throw error;
    return data || [];
  },
  
  updateFormQuestion: async (id: string, updates: Partial<Omit<FormQuestion, 'id' | 'created_at'>>): Promise<FormQuestion> => {
    const { data, error } = await supabase
      .from('form_questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  deleteFormQuestion: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('form_questions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
  
  // Student methods
  getFormSubmissions: async (formId: string): Promise<FormSubmission[]> => {
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('form_id', formId);
    
    if (error) throw error;
    return data || [];
  },
  
  getStudentSubmissions: async (studentId: string): Promise<FormSubmission[]> => {
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('student_id', studentId);
    
    if (error) throw error;
    return data || [];
  },
  
  hasStudentSubmitted: async (formId: string, studentId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('form_submissions')
      .select('id')
      .eq('form_id', formId)
      .eq('student_id', studentId)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  },
  
  submitForm: async (formId: string, studentId: string, responses: { questionId: string, rating: number }[]): Promise<void> => {
    // Create form submission
    const { data: submissionData, error: submissionError } = await supabase
      .from('form_submissions')
      .insert({
        form_id: formId,
        student_id: studentId
      })
      .select()
      .single();
    
    if (submissionError) throw submissionError;
    
    // Create question responses
    const questionResponses = responses.map(r => ({
      submission_id: submissionData.id,
      question_id: r.questionId,
      rating: r.rating
    }));
    
    const { error: responsesError } = await supabase
      .from('question_responses')
      .insert(questionResponses);
    
    if (responsesError) throw responsesError;
  },
  
  // Statistics for teachers
  getFormCompletionStats: async (formId: string): Promise<StudentCount> => {
    // Get total number of students
    const { count: totalCount, error: totalError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('user_role', 'student');
    
    if (totalError) throw totalError;
    
    // Get number of submissions for this form
    const { count: completedCount, error: completedError } = await supabase
      .from('form_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('form_id', formId);
    
    if (completedError) throw completedError;
    
    return {
      total: totalCount || 0,
      completed: completedCount || 0
    };
  },
  
  // Get student completion stats - add this missing method
  getStudentCompletionStats: async (studentId: string): Promise<StudentCount> => {
    // Get total number of forms
    const { count: totalCount, error: totalError } = await supabase
      .from('forms')
      .select('id', { count: 'exact', head: true });
    
    if (totalError) throw totalError;
    
    // Get number of forms submitted by this student
    const { count: completedCount, error: completedError } = await supabase
      .from('form_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', studentId);
    
    if (completedError) throw completedError;
    
    return {
      total: totalCount || 0,
      completed: completedCount || 0
    };
  },

  // Get response analytics
  getFormResponses: async (formId: string): Promise<any[]> => {
    const { data, error } = await supabase
      .from('question_responses')
      .select(`
        id,
        rating,
        form_questions(id, question_text),
        form_submissions(id, student_id)
      `)
      .eq('form_submissions.form_id', formId);
    
    if (error) throw error;
    return data || [];
  },
  
  // Get all students
  getAllStudents: async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_role', 'student');
    
    if (error) throw error;
    return data || [];
  }
};
