import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Car } from 'lucide-react';

export default function MarketplaceHeader() {
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => navigate('/marketplace')}
        >
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Car className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <span className="font-heading font-bold text-base tracking-tight block">
              Carros na Carbonífera
            </span>
            <span className="text-[10px] text-muted-foreground tracking-wide uppercase">
              Marketplace automotivo
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a href="/landing">Para Revendas</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
