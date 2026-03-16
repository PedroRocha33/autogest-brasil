import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Car, Calendar, Gauge, Fuel, MapPin, Store } from 'lucide-react';

interface MarketplaceVehicle {
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
}

interface MarketplaceTenant {
  id: string;
  name: string;
  slug: string | null;
  city: string | null;
}

export default function Marketplace() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<MarketplaceVehicle[]>([]);
  const [tenants, setTenants] = useState<MarketplaceTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [fuelFilter, setFuelFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  useEffect(() => {
    async function load() {
      // Fetch marketplace tenants
      const { data: t } = await supabase
        .from('tenants')
        .select('id, name, slug, city')
        .eq('plan', 'marketplace')
        .eq('status', 'ativo');

      const tenantList = (t || []) as MarketplaceTenant[];
      setTenants(tenantList);

      if (tenantList.length === 0) { setLoading(false); return; }

      // Fetch available vehicles from these tenants
      const tenantIds = tenantList.map(t => t.id);
      const { data: v } = await supabase
        .from('vehicles')
        .select('id, brand, model, version, year, km, fuel, sale_price, photos, tenant_id')
        .eq('status', 'Disponível')
        .in('tenant_id', tenantIds)
        .order('created_at', { ascending: false });

      setVehicles((v as MarketplaceVehicle[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const getTenant = (tenantId: string) => tenants.find(t => t.id === tenantId);

  const brands = [...new Set(vehicles.map(v => v.brand))].sort();
  const fuels = [...new Set(vehicles.map(v => v.fuel).filter(Boolean))].sort();
  const cities = [...new Set(tenants.map(t => t.city).filter(Boolean))].sort();

  const filtered = vehicles.filter(v => {
    const matchSearch = `${v.brand} ${v.model} ${v.version || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchBrand = brandFilter === 'all' || v.brand === brandFilter;
    const matchFuel = fuelFilter === 'all' || v.fuel === fuelFilter;
    const tenant = getTenant(v.tenant_id);
    const matchCity = cityFilter === 'all' || tenant?.city === cityFilter;
    let matchPrice = true;
    if (priceRange !== 'all' && v.sale_price) {
      const price = Number(v.sale_price);
      if (priceRange === '0-50') matchPrice = price <= 50000;
      else if (priceRange === '50-100') matchPrice = price > 50000 && price <= 100000;
      else if (priceRange === '100-200') matchPrice = price > 100000 && price <= 200000;
      else if (priceRange === '200+') matchPrice = price > 200000;
    }
    return matchSearch && matchBrand && matchFuel && matchCity && matchPrice;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/marketplace')}>
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg">MinasDeCarros</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <a href="/landing">Para Revendas</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-card to-background py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
            Encontre seu carro ideal
          </h1>
          <p className="text-muted-foreground mb-8">
            {vehicles.length} veículos de {tenants.length} revendas parceiras
          </p>
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9 h-11" placeholder="Buscar marca, modelo..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="w-full sm:w-[140px] h-11"><SelectValue placeholder="Marca" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas marcas</SelectItem>
                  {brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={fuelFilter} onValueChange={setFuelFilter}>
                <SelectTrigger className="w-full sm:w-[130px] h-11"><SelectValue placeholder="Combustível" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {fuels.map(f => <SelectItem key={f!} value={f!}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-full sm:w-[150px] h-11"><SelectValue placeholder="Preço" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Qualquer preço</SelectItem>
                  <SelectItem value="0-50">Até R$ 50 mil</SelectItem>
                  <SelectItem value="50-100">R$ 50–100 mil</SelectItem>
                  <SelectItem value="100-200">R$ 100–200 mil</SelectItem>
                  <SelectItem value="200+">Acima de R$ 200 mil</SelectItem>
                </SelectContent>
              </Select>
              {cities.length > 0 && (
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger className="w-full sm:w-[140px] h-11"><SelectValue placeholder="Cidade" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas cidades</SelectItem>
                    {cities.map(c => <SelectItem key={c!} value={c!}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-2">
        <p className="text-sm text-muted-foreground">{filtered.length} veículos encontrados</p>
      </div>

      <section className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="text-center py-16">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum veículo encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(v => {
              const tenant = getTenant(v.tenant_id);
              const photo = (v.photos as string[] | null)?.[0];
              return (
                <Card
                  key={v.id}
                  className="bg-card border-border hover:border-primary/40 transition-all cursor-pointer group overflow-hidden"
                  onClick={() => tenant?.slug && navigate(`/loja/${tenant.slug}`)}
                >
                  <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
                    {photo ? (
                      <img src={photo} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-heading font-semibold text-sm">{v.brand} {v.model}</h3>
                    {v.version && <p className="text-xs text-muted-foreground truncate">{v.version}</p>}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{v.year}</span>
                      {v.km != null && <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{v.km.toLocaleString('pt-BR')} km</span>}
                      {v.fuel && <span className="flex items-center gap-1"><Fuel className="h-3 w-3" />{v.fuel}</span>}
                    </div>
                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-lg font-heading font-bold text-primary">
                        {v.sale_price ? `R$ ${Number(v.sale_price).toLocaleString('pt-BR')}` : 'Consulte'}
                      </span>
                    </div>
                    {tenant && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Store className="h-3 w-3" />
                        <span>{tenant.name}</span>
                        {tenant.city && (
                          <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{tenant.city}</span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <Car className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-sm">MinasDeCarros</span>
          </div>
          <p className="text-xs text-muted-foreground">Powered by AutoGest</p>
        </div>
      </footer>
    </div>
  );
}
