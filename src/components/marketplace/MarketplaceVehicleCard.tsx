import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, Calendar, Gauge, Fuel, MapPin, Store, Settings2 } from 'lucide-react';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  version: string | null;
  year: number;
  km: number | null;
  fuel: string | null;
  sale_price: number | null;
  photos: string[] | null;
  tenant_id: string;
  color: string | null;
  transmission: string | null;
}

interface Tenant {
  id: string;
  name: string;
  slug: string | null;
  city: string | null;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
}

interface Props {
  vehicle: Vehicle;
  tenant?: Tenant;
  onClick: () => void;
}

export default function MarketplaceVehicleCard({ vehicle: v, tenant, onClick }: Props) {
  const photo = (v.photos as string[] | null)?.[0];
  const photoCount = (v.photos as string[] | null)?.length || 0;

  return (
    <Card
      className="bg-card border-border hover:border-primary/40 transition-all cursor-pointer group overflow-hidden"
      onClick={onClick}
    >
      {/* Image */}
      <div className="aspect-[16/10] bg-secondary relative overflow-hidden">
        {photo ? (
          <img
            src={photo}
            alt={`${v.brand} ${v.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="h-14 w-14 text-muted-foreground/20" />
          </div>
        )}
        {photoCount > 1 && (
          <Badge className="absolute top-2 right-2 bg-background/80 text-foreground text-[10px] backdrop-blur-sm border-0">
            {photoCount} fotos
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-2.5">
        {/* Title */}
        <div>
          <h3 className="font-heading font-bold text-sm leading-tight">
            {v.brand} {v.model}
          </h3>
          {v.version && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{v.version}</p>
          )}
        </div>

        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 shrink-0" />{v.year}
          </span>
          {v.km != null && (
            <span className="flex items-center gap-1.5">
              <Gauge className="h-3 w-3 shrink-0" />{v.km.toLocaleString('pt-BR')} km
            </span>
          )}
          {v.fuel && (
            <span className="flex items-center gap-1.5">
              <Fuel className="h-3 w-3 shrink-0" />{v.fuel}
            </span>
          )}
          {v.transmission && (
            <span className="flex items-center gap-1.5">
              <Settings2 className="h-3 w-3 shrink-0" />{v.transmission}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="pt-2 border-t border-border">
          <span className="text-xl font-heading font-bold text-primary">
            {v.sale_price
              ? `R$ ${Number(v.sale_price).toLocaleString('pt-BR')}`
              : 'Consulte'}
          </span>
        </div>

        {/* Dealer */}
        {tenant && (
          <div className="flex items-center gap-2 pt-1">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="h-5 w-5 rounded object-cover" />
            ) : (
              <Store className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground truncate">{tenant.name}</span>
            {tenant.city && (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground ml-auto shrink-0">
                <MapPin className="h-3 w-3" />{tenant.city}
              </span>
            )}
          </div>
        )}
        {tenant?.address && (
          <p className="text-[10px] text-muted-foreground truncate">
            {tenant.address}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
