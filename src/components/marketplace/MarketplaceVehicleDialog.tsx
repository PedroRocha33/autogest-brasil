import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Car, Calendar, Gauge, Fuel, MapPin, Store, Settings2, Palette,
  Phone, MessageCircle, ChevronLeft, ChevronRight, ExternalLink,
} from 'lucide-react';

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
  vehicle: Vehicle | null;
  tenant?: Tenant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MarketplaceVehicleDialog({ vehicle, tenant, open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const [photoIndex, setPhotoIndex] = useState(0);

  if (!vehicle) return null;

  const photos = (vehicle.photos as string[] | null) || [];
  const hasPhotos = photos.length > 0;

  const prev = () => setPhotoIndex(i => (i === 0 ? photos.length - 1 : i - 1));
  const next = () => setPhotoIndex(i => (i === photos.length - 1 ? 0 : i + 1));

  const whatsappMsg = encodeURIComponent(
    `Olá! Vi o ${vehicle.brand} ${vehicle.model} ${vehicle.year} no Carros na Carbonífera e gostaria de mais informações.`
  );
  const whatsappUrl = tenant?.phone
    ? `https://wa.me/55${tenant.phone.replace(/\D/g, '')}?text=${whatsappMsg}`
    : null;

  const specs = [
    { icon: Calendar, label: 'Ano', value: String(vehicle.year) },
    vehicle.km != null ? { icon: Gauge, label: 'Km', value: `${vehicle.km.toLocaleString('pt-BR')} km` } : null,
    vehicle.fuel ? { icon: Fuel, label: 'Combustível', value: vehicle.fuel } : null,
    vehicle.transmission ? { icon: Settings2, label: 'Câmbio', value: vehicle.transmission } : null,
    vehicle.color ? { icon: Palette, label: 'Cor', value: vehicle.color } : null,
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setPhotoIndex(0); }}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Photo gallery */}
        <div className="relative aspect-[16/10] bg-secondary">
          {hasPhotos ? (
            <>
              <img
                src={photos[photoIndex]}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <Badge className="absolute bottom-2 right-2 bg-background/80 text-foreground text-xs backdrop-blur-sm border-0">
                    {photoIndex + 1} / {photos.length}
                  </Badge>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Car className="h-16 w-16 text-muted-foreground/20" />
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {photos.length > 1 && (
          <div className="flex gap-1.5 px-4 pt-3 overflow-x-auto pb-1">
            {photos.map((p, i) => (
              <button
                key={i}
                onClick={() => setPhotoIndex(i)}
                className={`shrink-0 w-14 h-10 rounded overflow-hidden border-2 transition-colors ${
                  i === photoIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={p} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-heading">
              {vehicle.brand} {vehicle.model}
            </DialogTitle>
            {vehicle.version && (
              <p className="text-sm text-muted-foreground">{vehicle.version}</p>
            )}
          </DialogHeader>

          {/* Price */}
          <div className="py-3 px-4 rounded-lg bg-primary/5 border border-primary/10">
            <span className="text-2xl font-heading font-bold text-primary">
              {vehicle.sale_price
                ? `R$ ${Number(vehicle.sale_price).toLocaleString('pt-BR')}`
                : 'Consulte o valor'}
            </span>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {specs.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground leading-none">{s.label}</p>
                  <p className="font-medium text-sm leading-tight">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Dealer info */}
          {tenant && (
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {tenant.logo_url ? (
                    <img src={tenant.logo_url} alt={tenant.name} className="h-8 w-8 rounded-lg object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                      <Store className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm">{tenant.name}</p>
                    {tenant.city && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{tenant.city}
                      </p>
                    )}
                  </div>
                </div>
                {tenant.slug && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1.5 text-muted-foreground"
                    onClick={() => { onOpenChange(false); navigate(`/loja/${tenant.slug}`); }}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ver loja
                  </Button>
                )}
              </div>
              {tenant.address && (
                <p className="text-xs text-muted-foreground">{tenant.address}</p>
              )}
            </div>
          )}

          {/* Contact buttons */}
          <div className="flex gap-2 pt-2">
            {whatsappUrl && (
              <Button asChild className="flex-1 gap-2 bg-[hsl(142,70%,40%)] hover:bg-[hsl(142,70%,35%)] text-white">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            )}
            {tenant?.phone && (
              <Button variant="outline" asChild className="gap-2">
                <a href={`tel:+55${tenant.phone.replace(/\D/g, '')}`}>
                  <Phone className="h-4 w-4" />
                  Ligar
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
