import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UpgradeCardProps {
  title: string;
  description: string;
  requiredPlan?: string;
}

export default function UpgradeCard({ title, description, requiredPlan }: UpgradeCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="bg-card border-border border-warning/30">
      <CardContent className="p-8 text-center space-y-4">
        <div className="h-14 w-14 rounded-full bg-warning/20 flex items-center justify-center mx-auto">
          <Lock className="h-7 w-7 text-warning" />
        </div>
        <h3 className="text-lg font-heading font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
        <Button onClick={() => navigate('/configuracoes')} className="mt-2">
          <ArrowUpRight className="mr-2 h-4 w-4" />
          Fazer upgrade
        </Button>
      </CardContent>
    </Card>
  );
}
