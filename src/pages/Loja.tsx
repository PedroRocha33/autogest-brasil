import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Phone, MapPin, Car, Fuel, Calendar, Gauge, Settings2, MessageCircle } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  version: string | null;
  year: number;
  color: string | null;
  fuel: string | null;
  transmission: string | null;
  km: number | null;
  sale_price: number | null;
  photos: string[] | null;
  features: string[] | null;
}

export default function Loja() {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [fuelFilter, setFuelFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      const { data: t } = await supabase
        .from('tenants')
        .select('id, name, phone, address, logo_url')
        .eq('slug', slug)
        .single();

      if (!t) { setLoading(false); return; }
      setTenant(t);

      const { data: v } = await supabase
        .from('vehicles')
        .select('id, brand, model, version, year, color, fuel, transmission, km, sale_price, photos, features')
        .eq('tenant_id', t.id)
        .eq('status', 'Disponível')
        .order('created_at', { ascending: false });

      setVehicles((v as Vehicle[]) || []);
      setLoading(false);
    }
    load();
  }, [slug]);

  const brands = [...new Set(vehicles.map(v => v.brand))];
  const fuels = [...new Set(vehicles.map(v => v.fuel).filter(Boolean))];

  const filtered = vehicles.filter(v => {
    const matchSearch = `${v.brand} ${v.model} ${v.version || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchBrand = brandFilter === 'all' || v.brand === brandFilter;
    const matchFuel = fuelFilter === 'all' || v.fuel === fuelFilter;
    return matchSearch && matchBrand && matchFuel;
  });

  const whatsappLink = (vehicle: Vehicle) => {
    const phone = tenant?.phone?.replace(/\D/g, '') || '';
    const msg = encodeURIComponent(`Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.version || ''} ${vehicle.year}. Vi no site da ${tenant?.name}. Podemos conversar?`);
    return `https://wa.me/55${phone}?text=${msg}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold">Revenda não encontrada</h1>
          <p className="text-muted-foreground mt-2">Verifique o endereço e tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Car className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-heading font-bold">{tenant.name}</h1>
              {tenant.address && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{tenant.address}
                </p>
              )}
            </div>
          </div>
          {tenant.phone && (
            <Button asChild variant="default" size="sm">
              <a href={`https://wa.me/55${tenant.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" />Fale Conosco
              </a>
            </Button>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-card to-background py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-2">Encontre seu próximo carro</h2>
          <p className="text-muted-foreground mb-6">{vehicles.length} veículos disponíveis</p>
          <div className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar marca, modelo..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Marca" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fuelFilter} onValueChange={setFuelFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Combustível" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {fuels.map(f => <SelectItem key={f!} value={f!}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Vehicle Grid */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum veículo encontrado com esses filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(v => (
              <Card key={v.id} className="bg-card border-border hover:border-primary/40 transition-all cursor-pointer group overflow-hidden"
                onClick={() => setSelectedVehicle(v)}>
                <div className="aspect-[4/3] bg-secondary flex items-center justify-center text-4xl">
                  🚗
                </div>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-heading font-semibold text-sm">{v.brand} {v.model}</h3>
                  {v.version && <p className="text-xs text-muted-foreground">{v.version}</p>}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{v.year}</span>
                    <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{v.km?.toLocaleString('pt-BR')} km</span>
                    {v.fuel && <span className="flex items-center gap-1"><Fuel className="h-3 w-3" />{v.fuel}</span>}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-heading font-bold text-primary">
                      {v.sale_price ? `R$ ${Number(v.sale_price).toLocaleString('pt-BR')}` : 'Consulte'}
                    </span>
                    <Button size="sm" variant="secondary" asChild onClick={e => e.stopPropagation()}>
                      <a href={whatsappLink(v)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedVehicle(null)}>
          <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="aspect-video bg-secondary flex items-center justify-center text-6xl rounded-t-xl">🚗</div>
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-heading font-bold">{selectedVehicle.brand} {selectedVehicle.model}</h2>
                {selectedVehicle.version && <p className="text-muted-foreground">{selectedVehicle.version}</p>}
              </div>
              <div className="text-3xl font-heading font-bold text-primary">
                {selectedVehicle.sale_price ? `R$ ${Number(selectedVehicle.sale_price).toLocaleString('pt-BR')}` : 'Consulte'}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Calendar, label: 'Ano', value: selectedVehicle.year },
                  { icon: Gauge, label: 'KM', value: `${selectedVehicle.km?.toLocaleString('pt-BR')} km` },
                  { icon: Fuel, label: 'Combustível', value: selectedVehicle.fuel },
                  { icon: Settings2, label: 'Câmbio', value: selectedVehicle.transmission },
                ].map(spec => spec.value && (
                  <div key={spec.label} className="bg-secondary rounded-lg p-3 text-center">
                    <spec.icon className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">{spec.label}</p>
                    <p className="text-sm font-semibold">{spec.value}</p>
                  </div>
                ))}
              </div>
              {selectedVehicle.color && (
                <p className="text-sm"><span className="text-muted-foreground">Cor:</span> {selectedVehicle.color}</p>
              )}
              {selectedVehicle.features && (selectedVehicle.features as string[]).length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Opcionais</p>
                  <div className="flex flex-wrap gap-1">
                    {(selectedVehicle.features as string[]).map(f => (
                      <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <Button className="w-full" asChild>
                <a href={whatsappLink(selectedVehicle)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />Tenho Interesse — WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} {tenant.name} • Powered by AutoGest</p>
      </footer>
    </div>
  );
}
