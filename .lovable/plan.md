
# AutoGest MVP — Phase 1

## Overview
Build the core foundation of AutoGest: authentication, multi-tenancy, dark-themed dashboard, and the 4 most critical modules (Estoque, Negociações, CRM, and Vistorias). All UI in Portuguese (BR).

## Design System
- Dark theme: background `#0a0c10`, surface `#12151c`, border `#1f2535`
- Accent red `#e84545`, green `#22c55e`, yellow `#f59e0b`, blue `#3b82f6`
- Fonts: Syne (headings/numbers) + DM Sans (body)
- Rounded cards with subtle borders, hover lift effect
- Status badges with colored backgrounds

## 1. Lovable Cloud Setup — Database Schema
Create the following tables with RLS scoped by `tenant_id`:
- **tenants** (id, name, cnpj, phone, address, logo_url, slug, plan, created_at)
- **profiles** (id, user_id FK→auth.users, tenant_id FK→tenants, name, email, avatar_url, created_at)
- **user_roles** (id, user_id FK→auth.users, role enum: admin/vendedor/gerente)
- **vehicles** (id, tenant_id, brand, model, version, year, color, fuel, transmission, km, plate, cost_price, sale_price, min_price, status, photos jsonb, features jsonb, observations, created_at)
- **clients** (id, tenant_id, name, cpf, phone, email, address, created_at)
- **deals** (id, tenant_id, vehicle_id, client_id, salesperson_id, stage, asking_price, offered_price, accepted_price, signal_amount, signal_method, created_at)
- **vistorias** (id, tenant_id, vehicle_id, type, inspector, checklist jsonb, damage_map jsonb, photos jsonb, odometer, fuel_level, observations, client_signature, status, created_at)
- **services** (id, tenant_id, vehicle_id, type, description, mechanic, estimated_cost, actual_cost, parts jsonb, status, created_at)
- **transactions** (id, tenant_id, description, category, type, value, date, created_at)
- **commissions** (id, tenant_id, deal_id, salesperson_id, value, paid, paid_at)

RLS: All tables scoped by tenant_id using a security definer function. Vendedor role sees only their own deals/commissions.

Seed data: 10 Brazilian car models (HB20, Gol, Onix, Compass, Corolla, etc.), 5 clients, 3 salespeople, deals in various stages, 2 vistorias, 3 service orders.

## 2. Authentication & Onboarding
- Login page (email + password) with dark theme styling
- Register page → after signup, redirect to onboarding flow
- Onboarding: multi-step form to create dealership (name, CNPJ, phone, address, logo upload)
- Auto-assign admin role to the registering user
- Auth context providing current user, tenant_id, and role

## 3. App Layout — Dark Sidebar
Dark sidebar navigation with sections:
- **Principal**: Dashboard, Estoque, Negociações, CRM / Clientes
- **Operacional**: Serviços, Vistorias (other items shown but disabled as "Em breve")
- **Financeiro**: Financeiro, Comissões (others disabled)
- Bottom: Settings link, user avatar with name + role badge
- Mobile: collapsible sidebar with hamburger trigger
- Active route highlighting using NavLink

## 4. Dashboard
- KPI cards: Veículos em Estoque, Vendas do Mês (R$), Negociações Ativas, Serviços em Andamento
- Quick action buttons: Avaliar Veículo, Buscar por Placa, Novo Negócio, Nova Vistoria, Gerar Contrato
- Recent stock table with status badges (Disponível / Em Vistoria / Negociando)
- Negotiation pipeline summary list
- Bar chart: vendas últimos 6 meses (Recharts)
- Commissions ranking table

## 5. Estoque (Vehicle Inventory)
- Table with filters: status, brand, year range, price range, fuel type
- Each row: photo placeholder, model, plate, year, km, price, status badge, days in stock
- "Cadastrar Veículo" button → full form with all fields (brand, model, version, year, color, fuel, transmission, km, plate, prices, features checklist, observations, multiple photo upload)
- Vehicle detail page: photo gallery, specs grid, history timeline, action buttons

## 6. Negociações (Deal Pipeline)
- Kanban board with 7 columns: Contato Inicial → Interesse Confirmado → Proposta Enviada → Sinal Pago → Documentação → Contrato → Entregue
- Drag-and-drop cards between columns
- Each card: client name, car, value, salesperson initials, days in stage
- Click card → detail drawer with client/car info, price negotiation fields, activity log, down payment recording

## 7. CRM / Clientes
- Client list with search and filters
- Client profile page: personal info (name, CPF with mask, phone, email, address), purchase history, active negotiations
- Add/edit client form with CPF validation

## 8. Vistorias (Vehicle Inspection)
- List with status: Agendada, Em Andamento, Concluída
- Create vistoria form: select vehicle, type (Entrada/Saída), inspector, date
- Full checklist: Lataria, Vidros, Interior, Mecânica, Pneus, Itens presentes — each with appropriate status options
- SVG damage map: clickable top-down car diagram to mark damage points
- Odometer, fuel level selector, observations, photo uploads
- Completed vistoria: read-only detail view
- PDF report generation with all data (mocked)

## 9. Serviços (Service Orders)
- List with status filters
- Create service order: link vehicle, type, description, mechanic, costs, parts list
- Detail page with status timeline

## Modules shown as "Em breve" (coming in future phases):
Contratos, Refinanciamentos, Despachante, Nota Fiscal, Relatórios, Portais de Anúncio, Assinatura Eletrônica, Public Storefront
