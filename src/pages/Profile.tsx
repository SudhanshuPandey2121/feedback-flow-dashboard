
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formService } from '@/services/formService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const Profile: React.FC = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ total: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user || !profile) return;
      
      try {
        setIsLoading(true);
        
        if (profile.user_role === 'student') {
          const stats = await formService.getStudentCompletionStats(user.id);
          setStats(stats);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user, profile]);

  if (!user || !profile) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-10">User not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Profile</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Full Name</h4>
                <p className="text-base">{profile.full_name}</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                <p className="text-base">{profile.email}</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Department</h4>
                <p className="text-base">{profile.department}</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Role</h4>
                <p className="text-base capitalize">{profile.user_role}</p>
              </div>
              
              {profile.user_role === 'student' && profile.student_id && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Student ID</h4>
                    <p className="text-base">{profile.student_id}</p>
                  </div>
                </>
              )}
              
              {profile.user_role === 'teacher' && profile.position && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Position</h4>
                    <p className="text-base">{profile.position}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        {profile.user_role === 'student' && (
          <Card>
            <CardHeader>
              <CardTitle>Form Completion</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading stats...</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Forms Completed:</span>
                    <span className="font-medium">{stats.completed}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Forms:</span>
                    <span className="font-medium">{stats.total}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Completion Rate:</span>
                    <span className="font-medium">
                      {stats.total > 0 ? 
                        `${Math.round((stats.completed / stats.total) * 100)}%` : 
                        '0%'}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;
