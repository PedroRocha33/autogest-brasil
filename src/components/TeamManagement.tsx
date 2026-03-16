import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Users, UserPlus, Mail, Percent } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  gerente: 'Gerente',
  vendedor: 'Vendedor',
};

export default function TeamManagement() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'vendedor' as string,
    commission_rate: '5',
  });
  const [loading, setLoading] = useState(false);

  // Fetch team members (same tenant profiles)
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('tenant_id', tenantId);

      if (!profiles) return [];

      // Fetch roles for each member
      const userIds = profiles.map(p => p.user_id);
      const { data: roles } = await supabase
        .from('user_roles')
        .select('*')
        .in('user_id', userIds);

      return profiles.map(p => ({
        ...p,
        role: roles?.find(r => r.user_id === p.user_id)?.role || 'vendedor',
      }));
    },
    enabled: !!tenantId,
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('invite-team-member', {
        body: {
          name: inviteForm.name,
          email: inviteForm.email,
          password: inviteForm.password,
          role: inviteForm.role,
          commission_rate: parseFloat(inviteForm.commission_rate),
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`${inviteForm.name} foi adicionado à equipe!`);
      setInviteForm({ name: '', email: '', password: '', role: 'vendedor', commission_rate: '5' });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    } catch (err: any) {
      toast.error(err.message || 'Erro ao convidar membro');
    } finally {
      setLoading(false);
    }
  };

  const updateCommissionRate = async (userId: string, rate: number) => {
    const { error } = await supabase
      .from('profiles')
      .update({ commission_rate: rate })
      .eq('user_id', userId);

    if (error) {
      toast.error('Erro ao atualizar comissão');
    } else {
      toast.success('Comissão atualizada');
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Invite Form */}
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-heading font-semibold">Convidar Membro</p>
              <p className="text-xs text-muted-foreground">Adicione vendedores e gerentes à sua equipe</p>
            </div>
          </div>

          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  placeholder="Nome do colaborador"
                  value={inviteForm.name}
                  onChange={e => setInviteForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={inviteForm.email}
                  onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input
                  type="text"
                  placeholder="Senha inicial do colaborador"
                  value={inviteForm.password}
                  onChange={e => setInviteForm(f => ({ ...f, password: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Select value={inviteForm.role} onValueChange={v => setInviteForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                    <SelectItem value="gerente">Gerente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Comissão (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={inviteForm.commission_rate}
                  onChange={e => setInviteForm(f => ({ ...f, commission_rate: e.target.value }))}
                />
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              <Mail className="mr-2 h-4 w-4" />
              {loading ? 'Convidando...' : 'Convidar para a equipe'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Team List */}
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="font-heading font-semibold">Equipe ({teamMembers.length})</p>
              <p className="text-xs text-muted-foreground">Membros da sua revenda</p>
            </div>
          </div>

          {teamMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhum membro cadastrado ainda</p>
          ) : (
            <div className="space-y-3">
              {teamMembers.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {member.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Percent className="h-3 w-3" />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        className="w-16 h-7 text-xs"
                        defaultValue={member.commission_rate ?? 5}
                        onBlur={e => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val !== (member.commission_rate ?? 5)) {
                            updateCommissionRate(member.user_id, val);
                          }
                        }}
                      />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {ROLE_LABELS[member.role] || member.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
