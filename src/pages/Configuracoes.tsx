import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Building2, Save, Upload, ImagePlus, Loader2, X, Check } from 'lucide-react';
import { usePlan } from '@/hooks/usePlan';
import TeamManagement from '@/components/TeamManagement';

import banner1 from '@/assets/banners/banner-1.jpg';
import banner2 from '@/assets/banners/banner-2.jpg';
import banner3 from '@/assets/banners/banner-3.jpg';
import banner4 from '@/assets/banners/banner-4.jpg';

const PRESET_BANNERS = [
  { id: 'preset-1', src: banner1, label: 'Speed Lines' },
  { id: 'preset-2', src: banner2, label: 'Red Lights' },
  { id: 'preset-3', src: banner3, label: 'Showroom' },
  { id: 'preset-4', src: banner4, label: 'City Night' },
];

export default function Configuracoes() {
  const { tenantId, role } = useAuth();
  const { plan } = usePlan();
  const queryClient = useQueryClient();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const { data: tenant } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      const { data, error } = await supabase.from('tenants').select('*').eq('id', tenantId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const [form, setForm] = useState({
    name: '',
    cnpj: '',
    phone: '',
    address: '',
    city: '',
    slug: '',
  });

  const updateTenant = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error('No tenant');
      const { error } = await supabase.from('tenants').update({
        name: form.name,
        cnpj: form.cnpj || null,
        phone: form.phone || null,
        address: form.address || null,
        city: form.city || null,
        slug: form.slug || null,
      }).eq('id', tenantId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
      toast.success('Configurações salvas!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Update form when tenant loads
  if (tenant && !form.name && tenant.name) {
    setForm({
      name: tenant.name,
      cnpj: tenant.cnpj || '',
      phone: tenant.phone || '',
      address: tenant.address || '',
      city: tenant.city || '',
      slug: tenant.slug || '',
    });
  }

  const uploadImage = useCallback(async (file: File, folder: string): Promise<string | null> => {
    if (!tenantId) return null;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo maior que 5MB.');
      return null;
    }
    const ext = file.name.split('.').pop();
    const path = `${tenantId}/${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('autogest').upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) { toast.error('Erro ao enviar imagem.'); return null; }
    const { data } = supabase.storage.from('autogest').getPublicUrl(path);
    return data.publicUrl;
  }, [tenantId]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tenantId) return;
    setUploadingLogo(true);
    const url = await uploadImage(file, 'logo');
    if (url) {
      await supabase.from('tenants').update({ logo_url: url }).eq('id', tenantId);
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
      toast.success('Logo atualizada!');
    }
    setUploadingLogo(false);
    e.target.value = '';
  };

  const removeLogo = async () => {
    if (!tenantId) return;
    await supabase.from('tenants').update({ logo_url: null }).eq('id', tenantId);
    queryClient.invalidateQueries({ queryKey: ['tenant'] });
    toast.success('Logo removida.');
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tenantId) return;
    setUploadingBanner(true);
    const url = await uploadImage(file, 'banner');
    if (url) {
      await supabase.from('tenants').update({ banner_url: url } as any).eq('id', tenantId);
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
      toast.success('Banner atualizado!');
    }
    setUploadingBanner(false);
    e.target.value = '';
  };

  const selectPresetBanner = async (presetSrc: string) => {
    if (!tenantId) return;
    await supabase.from('tenants').update({ banner_url: presetSrc } as any).eq('id', tenantId);
    queryClient.invalidateQueries({ queryKey: ['tenant'] });
    toast.success('Banner atualizado!');
  };

  const removeBanner = async () => {
    if (!tenantId) return;
    await supabase.from('tenants').update({ banner_url: null } as any).eq('id', tenantId);
    queryClient.invalidateQueries({ queryKey: ['tenant'] });
    toast.success('Banner removido.');
  };

  const currentBanner = (tenant as any)?.banner_url;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-heading font-bold">Configurações</h1>
        <p className="text-muted-foreground text-sm">Dados da sua revenda</p>
      </div>

      {/* Logo Section */}
      <Card className="bg-card border-border">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-heading font-semibold text-sm">Logo da Empresa</p>
              <p className="text-xs text-muted-foreground">Aparece na loja pública e no marketplace</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              {tenant?.logo_url ? (
                <div className="h-20 w-20 rounded-xl overflow-hidden border border-border">
                  <img src={tenant.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  <button
                    onClick={removeLogo}
                    className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="h-20 w-20 rounded-xl bg-secondary border-2 border-dashed border-border flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('logo-upload')?.click()}
                disabled={uploadingLogo}
              >
                {uploadingLogo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {uploadingLogo ? 'Enviando...' : 'Enviar Logo'}
              </Button>
              <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              <p className="text-[11px] text-muted-foreground mt-1">JPG, PNG ou WEBP • Máx. 5MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Banner Section */}
      <Card className="bg-card border-border">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-heading font-semibold text-sm">Banner da Loja</p>
              <p className="text-xs text-muted-foreground">Imagem de destaque no topo da sua loja pública</p>
            </div>
            {currentBanner && (
              <Button variant="ghost" size="sm" onClick={removeBanner} className="text-destructive hover:text-destructive">
                <X className="mr-1 h-3 w-3" /> Remover
              </Button>
            )}
          </div>

          {/* Current banner preview */}
          {currentBanner && (
            <div className="rounded-xl overflow-hidden border border-border aspect-[4/1]">
              <img src={currentBanner} alt="Banner atual" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Upload custom */}
          <div
            className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => document.getElementById('banner-upload')?.click()}
          >
            <input id="banner-upload" type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
            {uploadingBanner ? (
              <div className="flex items-center justify-center gap-2 py-2">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Enviando banner...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 py-2">
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Enviar banner personalizado</p>
                <p className="text-[11px] text-muted-foreground">Recomendado: 1920×512px • Máx. 5MB</p>
              </div>
            )}
          </div>

          {/* Preset banners */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Ou escolha um banner pronto:</p>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_BANNERS.map(preset => {
                const isSelected = currentBanner === preset.src;
                return (
                  <button
                    key={preset.id}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-[4/1] ${
                      isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/40'
                    }`}
                    onClick={() => selectPresetBanner(preset.src)}
                  >
                    <img src={preset.src} alt={preset.label} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary rounded-full p-1">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1.5 text-[10px] font-medium bg-background/70 backdrop-blur-sm px-1.5 py-0.5 rounded">
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Info */}
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              {tenant?.logo_url ? (
                <img src={tenant.logo_url} alt="" className="h-12 w-12 rounded-xl object-cover" />
              ) : (
                <Building2 className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <p className="font-heading font-semibold">{tenant?.name || 'Carregando...'}</p>
              <p className="text-xs text-muted-foreground">Plano: {tenant?.plan || 'free'}</p>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); updateTenant.mutate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Revenda</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input value={form.cnpj} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Ex: Criciúma" />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL pública)</Label>
              <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="minha-revenda" />
              <p className="text-xs text-muted-foreground">Para a loja pública: /loja/{form.slug || 'slug'}</p>
            </div>
            <Button type="submit" disabled={updateTenant.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {updateTenant.isPending ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Team Management - only for marketplace admins */}
      {plan === 'marketplace' && (role === 'admin' || role === 'gerente') && (
        <TeamManagement />
      )}
    </div>
  );
}
