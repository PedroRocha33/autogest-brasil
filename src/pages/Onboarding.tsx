import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';
import { Building2, ArrowRight } from 'lucide-react';

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    cnpj: '',
    phone: '',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    // Create tenant
    const slug = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: form.name,
        cnpj: form.cnpj,
        phone: form.phone,
        address: form.address,
        slug,
      })
      .select()
      .single();

    if (tenantError) {
      toast.error('Erro ao criar revenda: ' + tenantError.message);
      setLoading(false);
      return;
    }

    // Link profile to tenant
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ tenant_id: tenant.id })
      .eq('user_id', user.id);

    if (profileError) {
      toast.error('Erro ao vincular perfil: ' + profileError.message);
      setLoading(false);
      return;
    }

    // Assign admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ user_id: user.id, role: 'admin' });

    if (roleError) {
      toast.error('Erro ao definir papel: ' + roleError.message);
      setLoading(false);
      return;
    }

    await refreshProfile();
    toast.success('Revenda criada com sucesso!');
    navigate('/');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg border-border bg-card">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="flex items-center justify-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Configure sua Revenda</h1>
          </div>
          <p className="text-muted-foreground text-sm">Preencha os dados da sua revenda para começar</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Revenda *</Label>
              <Input
                id="name"
                placeholder="Paulista Motors"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                value={form.cnpj}
                onChange={(e) => setForm(f => ({ ...f, cnpj: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                value={form.phone}
                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                placeholder="Av. Paulista, 1000 - São Paulo, SP"
                value={form.address}
                onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Revenda'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
