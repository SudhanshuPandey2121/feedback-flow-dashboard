
// This is a mock service that would be replaced with actual API calls

export interface FeedbackForm {
  id: string;
  title: string;
  description: string;
  url: string;
  dueDate: string;
  createdBy: string;
}

export interface FormStatus {
  formId: string;
  userId: string;
  completed: boolean;
  completedAt?: string;
}

// Mock data
const mockForms: FeedbackForm[] = [
  {
    id: 'f1',
    title: 'Course Content Feedback',
    description: 'Please provide feedback on the course content and materials',
    url: 'https://forms.google.com/course-content',
    dueDate: '2025-05-01',
    createdBy: 't1'
  },
  {
    id: 'f2',
    title: 'Teaching Quality Assessment',
    description: 'Evaluate the teaching quality and methodology',
    url: 'https://forms.google.com/teaching-quality',
    dueDate: '2025-05-10',
    createdBy: 't1'
  },
  {
    id: 'f3',
    title: 'Facilities Feedback',
    description: 'Provide feedback on department facilities',
    url: 'https://forms.google.com/facilities',
    dueDate: '2025-05-15',
    createdBy: 't1'
  },
  {
    id: 'f4',
    title: 'Extra-Curricular Activities Review',
    description: 'Share your thoughts on extra-curricular activities',
    url: 'https://forms.google.com/extra-curricular',
    dueDate: '2025-05-20',
    createdBy: 't1'
  }
];

const mockFormStatuses: FormStatus[] = [
  { formId: 'f1', userId: 's1', completed: true, completedAt: '2025-04-15T10:30:00' },
  { formId: 'f2', userId: 's1', completed: false },
  { formId: 'f3', userId: 's1', completed: true, completedAt: '2025-04-16T14:20:00' },
  { formId: 'f4', userId: 's1', completed: false }
];

// Methods to interact with the mock data
export const formService = {
  // Teacher methods
  getAllForms: async (): Promise<FeedbackForm[]> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return [...mockForms];
  },
  
  getFormById: async (id: string): Promise<FeedbackForm | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockForms.find(form => form.id === id);
  },
  
  createForm: async (form: Omit<FeedbackForm, 'id'>): Promise<FeedbackForm> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newForm = { ...form, id: `f${mockForms.length + 1}` };
    mockForms.push(newForm);
    return newForm;
  },
  
  // Student methods
  getFormStatusesByUserId: async (userId: string): Promise<Array<FormStatus & { form: FeedbackForm }>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockFormStatuses
      .filter(status => status.userId === userId)
      .map(status => {
        const form = mockForms.find(form => form.id === status.formId)!;
        return { ...status, form };
      });
  },
  
  markFormAsCompleted: async (formId: string, userId: string): Promise<FormStatus> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const statusIndex = mockFormStatuses.findIndex(
      status => status.formId === formId && status.userId === userId
    );
    
    if (statusIndex >= 0) {
      mockFormStatuses[statusIndex].completed = true;
      mockFormStatuses[statusIndex].completedAt = new Date().toISOString();
      return mockFormStatuses[statusIndex];
    }
    
    const newStatus = {
      formId,
      userId,
      completed: true,
      completedAt: new Date().toISOString()
    };
    
    mockFormStatuses.push(newStatus);
    return newStatus;
  },
  
  // Statistics for teachers
  getFormCompletionStats: async (formId: string): Promise<{ total: number, completed: number }> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const statuses = mockFormStatuses.filter(status => status.formId === formId);
    const completed = statuses.filter(status => status.completed).length;
    return { total: statuses.length, completed };
  },
  
  getStudentCompletionStats: async (userId: string): Promise<{ total: number, completed: number }> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const statuses = mockFormStatuses.filter(status => status.userId === userId);
    const completed = statuses.filter(status => status.completed).length;
    return { total: statuses.length, completed };
  }
};
