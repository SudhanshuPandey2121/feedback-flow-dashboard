
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CompletionStatsProps {
  completed: number;
  total: number;
  title: string;
}

const CompletionStats: React.FC<CompletionStatsProps> = ({ completed, total, title }) => {
  const percentage = total > 0 ? Math.floor((completed / total) * 100) : 0;
  
  let statusColor = 'text-danger';
  if (percentage >= 75) statusColor = 'text-success';
  else if (percentage >= 50) statusColor = 'text-warning';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={percentage} className="h-2" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className={`font-medium ${statusColor}`}>{percentage}%</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {completed} of {total} forms completed
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletionStats;
