
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  department: string;
  user_role: UserRole;
  student_id?: string;
  position?: string;
}

const Login: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    department: '',
    user_role: 'student'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signIn, signUp, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateSignInForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignUpForm = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.full_name) newErrors.full_name = 'Full name is required';
    if (!formData.department) newErrors.department = 'Department is required';
    
    if (formData.user_role === 'student' && !formData.student_id) {
      newErrors.student_id = 'Student ID is required';
    }
    
    if (formData.user_role === 'teacher' && !formData.position) {
      newErrors.position = 'Position is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignInForm()) return;
    
    try {
      await signIn(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Invalid email or password';
      
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignUpForm()) return;
    
    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        department: formData.department,
        user_role: formData.user_role,
        student_id: formData.student_id,
        position: formData.position,
      });
      toast({
        title: 'Account Created',
        description: 'Please check your email to verify your account.',
      });
      setMode('signin');
    } catch (error) {
      console.error('Sign up error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to create account';
      
      toast({
        title: 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const updateFormData = (key: keyof SignUpFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const renderError = (field: string) => {
    if (errors[field]) {
      return (
        <p className="text-sm text-destructive mt-1">{errors[field]}</p>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Department Feedback System</CardTitle>
          <CardDescription className="text-center">Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'signin' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {renderError('email')}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {renderError('password')}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
                
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    type="button"
                    onClick={() => setMode('signup')}
                  >
                    Don't have an account? Sign up
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <RadioGroup
                    value={formData.user_role}
                    onValueChange={(value) => updateFormData('user_role', value)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="student" id="student" />
                      <Label htmlFor="student">Student</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="teacher" id="teacher" />
                      <Label htmlFor="teacher">Teacher</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => updateFormData('full_name', e.target.value)}
                    className={errors.full_name ? "border-destructive" : ""}
                  />
                  {renderError('full_name')}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {renderError('email')}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {renderError('password')}
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters and include uppercase, lowercase, 
                    number, and special character
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    className={errors.confirmPassword ? "border-destructive" : ""}
                  />
                  {renderError('confirmPassword')}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => updateFormData('department', e.target.value)}
                    className={errors.department ? "border-destructive" : ""}
                  />
                  {renderError('department')}
                </div>

                {formData.user_role === 'student' && (
                  <div className="space-y-2">
                    <Label htmlFor="student_id">Student ID</Label>
                    <Input
                      id="student_id"
                      value={formData.student_id || ''}
                      onChange={(e) => updateFormData('student_id', e.target.value)}
                      className={errors.student_id ? "border-destructive" : ""}
                    />
                    {renderError('student_id')}
                  </div>
                )}

                {formData.user_role === 'teacher' && (
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={formData.position || ''}
                      onChange={(e) => updateFormData('position', e.target.value)}
                      className={errors.position ? "border-destructive" : ""}
                    />
                    {renderError('position')}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Sign Up'}
                </Button>
                
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    type="button"
                    onClick={() => setMode('signin')}
                  >
                    Already have an account? Sign in
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
