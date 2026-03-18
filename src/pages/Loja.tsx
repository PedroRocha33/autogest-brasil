import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Search, Phone, MapPin, Car, Fuel, Calendar, Gauge, Settings2, MessageCircle, Send, SlidersHorizontal, Eye, Clock, Mail } from 'lucide-react';
import PhotoGallery from '@/components/PhotoGallery';
import { toast } from 'sonner';

interface Tenant {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  banner_url: string | null;
  city: string | null;
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
  const [sortBy, setSortBy] = useState('recent');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', message: '' });
  const [sendingLead, setSendingLead] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      const { data: t } = await supabase
        .from('tenants')
        .select('id, name, phone, address, logo_url, banner_url, city')
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

  const brands = [...new Set(vehicles.map(v => v.brand))].sort();
  const fuels = [...new Set(vehicles.map(v => v.fuel).filter(Boolean))].sort();

  const filtered = vehicles
    .filter(v => {
      const matchSearch = `${v.brand} ${v.model} ${v.version || ''}`.toLowerCase().includes(search.toLowerCase());
      const matchBrand = brandFilter === 'all' || v.brand === brandFilter;
      const matchFuel = fuelFilter === 'all' || v.fuel === fuelFilter;
      return matchSearch && matchBrand && matchFuel;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return (a.sale_price || 0) - (b.sale_price || 0);
      if (sortBy === 'price_desc') return (b.sale_price || 0) - (a.sale_price || 0);
      if (sortBy === 'year_desc') return b.year - a.year;
      if (sortBy === 'km_asc') return (a.km || 0) - (b.km || 0);
      return 0;
    });

  const whatsappLink = (vehicle: Vehicle) => {
    const phone = tenant?.phone?.replace(/\D/g, '') || '';
    const msg = encodeURIComponent(`Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.version || ''} ${vehicle.year}. Vi no site da ${tenant?.name}. Podemos conversar?`);
    return `https://wa.me/55${phone}?text=${msg}`;
  };

  const sendLead = async () => {
    if (!tenant || !selectedVehicle || !leadForm.name) return;
    setSendingLead(true);
    const { error } = await supabase.from('leads').insert({
      tenant_id: tenant.id,
      vehicle_id: selectedVehicle.id,
      name: leadForm.name.trim(),
      phone: leadForm.phone.trim() || null,
      message: leadForm.message.trim() || null,
    });
    setSendingLead(false);
    if (error) {
      toast.error('Erro ao enviar. Tente pelo WhatsApp.');
    } else {
      toast.success('Interesse enviado! A revenda entrará em contato.');
      setLeadForm({ name: '', phone: '', message: '' });
    }
  };

  const getFirstPhoto = (v: Vehicle) => {
    const photos = v.photos as string[] | null;
    return photos && photos.length > 0 ? photos[0] : null;
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
      {/* Navbar */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Name */}
            <div className="flex items-center gap-3">
              {tenant.logo_url ? (
                <img src={tenant.logo_url} alt={tenant.name} className="h-11 w-11 rounded-xl object-cover ring-2 ring-primary/20" />
              ) : (
                <div className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center">
                  <Car className="h-6 w-6 text-primary-foreground" />
                </div>
              )}
              <div className="leading-tight">
                <h1 className="text-lg font-heading font-bold tracking-tight">{tenant.name}</h1>
              </div>
            </div>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => document.getElementById('estoque')?.scrollIntoView({ behavior: 'smooth' })}>
                <Car className="h-4 w-4 mr-1.5" /> Estoque
              </Button>
              {tenant.phone && (
                <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                  <a href={`tel:+55${tenant.phone.replace(/\D/g, '')}`}>
                    <Phone className="h-4 w-4 mr-1.5" /> Ligar
                  </a>
                </Button>
              )}
              {(tenant.city || tenant.address) && (
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1.5" /> Localização
                </Button>
              )}
            </nav>

            {/* CTA */}
            <div className="flex items-center gap-2">
              {tenant.phone && (
                <Button asChild size="sm" className="gap-2">
                  <a href={`https://wa.me/55${tenant.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero — with location */}
      <section className="relative overflow-hidden">
        {tenant.banner_url ? (
          <div className="absolute inset-0">
            <img src={tenant.banner_url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">
                {vehicles.length} veículos disponíveis
              </p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold leading-[1.15] mb-4">
                Encontre o carro<br />ideal para você
              </h2>
              <p className="text-muted-foreground text-sm max-w-md">
                Navegue pelo nosso estoque completo. Cada veículo com fotos reais, ficha técnica detalhada e contato direto.
              </p>
            </div>

            {/* Location card */}
            {(tenant.city || tenant.address || tenant.phone) && (
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 space-y-2.5 min-w-[260px]">
                {(tenant.city || tenant.address) && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Localização</p>
                      <p className="text-sm font-medium">{tenant.address || tenant.city}</p>
                      {tenant.address && tenant.city && <p className="text-xs text-muted-foreground">{tenant.city}</p>}
                    </div>
                  </div>
                )}
                {tenant.phone && (
                  <div className="flex items-start gap-2.5">
                    <Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Contato</p>
                      <p className="text-sm font-medium">{tenant.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Search & Filters — horizontal bar */}
      <div className="sticky top-[53px] z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 h-10 bg-secondary/50 border-border"
                placeholder="Buscar por marca, modelo ou versão..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="w-[130px] h-10 bg-secondary/50 border-border text-xs">
                  <SelectValue placeholder="Marca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas marcas</SelectItem>
                  {brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={fuelFilter} onValueChange={setFuelFilter}>
                <SelectTrigger className="w-[130px] h-10 bg-secondary/50 border-border text-xs">
                  <SelectValue placeholder="Combustível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {fuels.map(f => <SelectItem key={f!} value={f!}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] h-10 bg-secondary/50 border-border text-xs">
                  <SlidersHorizontal className="h-3 w-3 mr-1.5" />
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais recentes</SelectItem>
                  <SelectItem value="price_asc">Menor preço</SelectItem>
                  <SelectItem value="price_desc">Maior preço</SelectItem>
                  <SelectItem value="year_desc">Mais novos</SelectItem>
                  <SelectItem value="km_asc">Menor KM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2 flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {filtered.length === vehicles.length
            ? `${filtered.length} veículos`
            : `${filtered.length} de ${vehicles.length} veículos`}
        </p>
        {(search || brandFilter !== 'all' || fuelFilter !== 'all') && (
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => { setSearch(''); setBrandFilter('all'); setFuelFilter('all'); }}>
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Vehicle Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Car className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum veículo encontrado com esses filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-2">
            {filtered.map(v => {
              const photo = getFirstPhoto(v);
              const photoCount = (v.photos as string[] | null)?.length || 0;
              return (
                <Card
                  key={v.id}
                  className="bg-card border-border overflow-hidden cursor-pointer group hover:ring-1 hover:ring-primary/20 transition-all duration-200"
                  onClick={() => setSelectedVehicle(v)}
                >
                  {/* Image */}
                  <div className="aspect-[16/10] bg-secondary relative overflow-hidden">
                    {photo ? (
                      <img
                        src={photo}
                        alt={`${v.brand} ${v.model}`}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="h-10 w-10 text-muted-foreground/20" />
                      </div>
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium">
                          <Eye className="h-3 w-3" /> Ver detalhes
                        </div>
                      </div>
                    </div>
                    {photoCount > 1 && (
                      <span className="absolute bottom-2 left-2 bg-background/70 backdrop-blur-sm text-[10px] font-medium px-2 py-0.5 rounded-full">
                        {photoCount} fotos
                      </span>
                    )}
                  </div>

                  <CardContent className="p-4 space-y-3">
                    {/* Title */}
                    <div>
                      <h3 className="font-heading font-bold text-sm leading-tight">
                        {v.brand} {v.model}
                      </h3>
                      {v.version && (
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{v.version}</p>
                      )}
                    </div>

                    {/* Specs row */}
                    <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{v.year}</span>
                      {v.km != null && (
                        <>
                          <span className="text-border">•</span>
                          <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{v.km.toLocaleString('pt-BR')} km</span>
                        </>
                      )}
                      {v.fuel && (
                        <>
                          <span className="text-border">•</span>
                          <span>{v.fuel}</span>
                        </>
                      )}
                    </div>

                    <Separator />

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-heading font-bold text-primary">
                        {v.sale_price ? `R$ ${Number(v.sale_price).toLocaleString('pt-BR')}` : 'Consulte'}
                      </span>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary" asChild onClick={e => e.stopPropagation()}>
                        <a href={whatsappLink(v)} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Vehicle Detail Modal */}
      <Dialog open={!!selectedVehicle} onOpenChange={(open) => { if (!open) setSelectedVehicle(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          {selectedVehicle && (
            <>
              <div className="p-1">
                <PhotoGallery
                  photos={(selectedVehicle.photos as string[]) || []}
                  alt={`${selectedVehicle.brand} ${selectedVehicle.model}`}
                />
              </div>
              <div className="px-6 pb-6 space-y-5">
                <DialogHeader className="p-0">
                  <DialogTitle className="text-2xl font-heading font-bold">
                    {selectedVehicle.brand} {selectedVehicle.model}
                  </DialogTitle>
                  {selectedVehicle.version && <p className="text-muted-foreground">{selectedVehicle.version}</p>}
                </DialogHeader>

                <div className="text-3xl font-heading font-bold text-primary">
                  {selectedVehicle.sale_price ? `R$ ${Number(selectedVehicle.sale_price).toLocaleString('pt-BR')}` : 'Consulte'}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: Calendar, label: 'Ano', value: selectedVehicle.year },
                    { icon: Gauge, label: 'KM', value: selectedVehicle.km != null ? `${selectedVehicle.km.toLocaleString('pt-BR')} km` : null },
                    { icon: Fuel, label: 'Combustível', value: selectedVehicle.fuel },
                    { icon: Settings2, label: 'Câmbio', value: selectedVehicle.transmission },
                  ].map(spec => spec.value && (
                    <div key={spec.label} className="bg-secondary/50 rounded-lg p-3 text-center border border-border/50">
                      <spec.icon className="h-4 w-4 mx-auto text-primary/60 mb-1" />
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{spec.label}</p>
                      <p className="text-sm font-semibold mt-0.5">{spec.value}</p>
                    </div>
                  ))}
                </div>

                {selectedVehicle.color && (
                  <p className="text-sm"><span className="text-muted-foreground">Cor:</span> {selectedVehicle.color}</p>
                )}

                {selectedVehicle.features && (selectedVehicle.features as string[]).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Opcionais</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedVehicle.features as string[]).map(f => (
                        <Badge key={f} variant="secondary" className="text-xs font-normal">{f}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Lead Form */}
                <div className="rounded-xl p-5 space-y-4 bg-secondary/30 border border-border/50">
                  <div>
                    <p className="text-sm font-heading font-semibold">Tenho interesse neste veículo</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Preencha seus dados e entraremos em contato</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Nome *</Label>
                      <Input
                        placeholder="Seu nome completo"
                        value={leadForm.name}
                        onChange={e => setLeadForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Telefone</Label>
                      <Input
                        placeholder="(11) 99999-9999"
                        value={leadForm.phone}
                        onChange={e => setLeadForm(f => ({ ...f, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Mensagem</Label>
                    <Textarea
                      placeholder="Ex: Gostaria de agendar uma visita..."
                      value={leadForm.message}
                      onChange={e => setLeadForm(f => ({ ...f, message: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={sendLead}
                      disabled={!leadForm.name || sendingLead}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {sendingLead ? 'Enviando...' : 'Enviar Interesse'}
                    </Button>
                    <Button variant="secondary" asChild>
                      <a href={whatsappLink(selectedVehicle)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-2 h-4 w-4" />WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="h-5 w-5 rounded object-cover" />
            ) : (
              <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center">
                <Car className="h-3 w-3 text-primary" />
              </div>
            )}
            <span className="text-xs font-heading font-semibold">{tenant.name}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} {tenant.name} · Powered by <span className="font-medium text-foreground">AutoGest</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
