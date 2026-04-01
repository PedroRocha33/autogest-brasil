import {
  LayoutDashboard,
  Car,
  Handshake,
  Users,
  Wrench,
  ClipboardCheck,
  FileText,
  Receipt,
  DollarSign,
  BarChart3,
  Globe,
  PenTool,
  Settings,
  Lock,
  Megaphone,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const navSections = [
  {
    label: 'Principal',
    items: [
      { title: 'Dashboard', url: '/', icon: LayoutDashboard },
      { title: 'Estoque', url: '/estoque', icon: Car },
      { title: 'Leads', url: '/leads', icon: Megaphone },
      { title: 'Negociações', url: '/negociacoes', icon: Handshake },
      { title: 'CRM / Clientes', url: '/clientes', icon: Users },
    ],
  },
  {
    label: 'Operacional',
    items: [
      { title: 'Serviços', url: '/servicos', icon: Wrench },
      { title: 'Vistorias', url: '/vistorias', icon: ClipboardCheck },
      { title: 'Contratos', url: '/contratos', icon: FileText },
      { title: 'Refinanciamentos', url: '/refinanciamentos', icon: Receipt },
      { title: 'Despachante', url: '#', icon: FileText, disabled: true },
    ],
  },
  {
    label: 'Financeiro',
    items: [
      { title: 'Financeiro', url: '/financeiro', icon: DollarSign },
      { title: 'Comissões', url: '/comissoes', icon: BarChart3 },
      { title: 'Relatórios', url: '/relatorios', icon: BarChart3 },
      { title: 'Nota Fiscal', url: '/nota-fiscal', icon: Receipt },
    ],
  },
  {
    label: 'Integrações',
    items: [
      { title: 'Portais de Anúncio', url: '#', icon: Globe, disabled: true },
      { title: 'Assinatura Eletrônica', url: '#', icon: PenTool, disabled: true },
    ],
  },
];

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  gerente: 'Gerente',
  vendedor: 'Vendedor',
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { profile, role } = useAuth();

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Car className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-heading font-bold text-sidebar-accent-foreground text-lg">AutoGest</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {navSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild disabled={item.disabled}>
                      {item.disabled ? (
                        <span className="flex items-center gap-2 opacity-40 cursor-not-allowed">
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                          {!collapsed && (
                            <Lock className="ml-auto h-3 w-3" />
                          )}
                        </span>
                      ) : (
                        <NavLink
                          to={item.url}
                          end={item.url === '/'}
                          className="flex items-center gap-2"
                          activeClassName="bg-sidebar-accent text-primary font-medium"
                        >
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/configuracoes"
                className="flex items-center gap-2"
                activeClassName="bg-sidebar-accent text-primary font-medium"
              >
                <Settings className="h-4 w-4" />
                {!collapsed && <span>Configurações</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm text-sidebar-accent-foreground truncate">{profile?.name}</span>
              <Badge variant="secondary" className="text-[10px] w-fit px-1.5 py-0">
                {role ? roleLabels[role] || role : '—'}
              </Badge>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
