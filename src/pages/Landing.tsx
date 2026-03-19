import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Car,
  BarChart3,
  Users,
  Wrench,
  ClipboardCheck,
  DollarSign,
  Globe,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Star,
  HelpCircle,
} from "lucide-react";

const plans = [
  {
    name: "Básico",
    price: 97,
    description: "Para quem está começando",
    features: ["Até 5 veículos", "3 fotos por veículo", "Negociações em lista", "Financeiro básico", "Loja pública"],
    blocked: ["Vistorias", "Comissões", "Serviços", "Kanban", "Gráficos financeiros"],
    highlight: false,
  },
  {
    name: "Profissional",
    price: 197,
    description: "Para revendas em crescimento",
    features: [
      "Veículos ilimitados",
      "Fotos ilimitadas",
      "Kanban de negociações",
      "Financeiro com gráficos",
      "Vistorias completas",
      "Comissões",
      "Serviços",
      "Loja pública",
    ],
    blocked: ["Múltiplos usuários", "Marketplace"],
    highlight: true,
  },
  {
    name: "Marketplace",
    price: 297,
    description: "Para revendas profissionais",
    features: [
      "Tudo do Profissional",
      "Múltiplos vendedores",
      "Comissões por vendedor",
      "Relatórios por vendedor",
      "Presença no CarboCarros",
      "Suporte prioritário",
    ],
    blocked: [],
    highlight: false,
  },
];

const features = [
  { icon: Car, title: "Gestão de Estoque", desc: "Controle completo de veículos com fotos, opcionais e precificação" },
  { icon: Users, title: "CRM de Clientes", desc: "Cadastro de clientes com histórico de negociações e contato rápido" },
  { icon: BarChart3, title: "Negociações", desc: "Pipeline visual em kanban com todas as etapas da venda" },
  { icon: DollarSign, title: "Financeiro", desc: "Controle de receitas, despesas e lucro com gráficos detalhados" },
  { icon: ClipboardCheck, title: "Vistorias", desc: "Checklist completo com mapa de avarias e registro fotográfico" },
  { icon: Wrench, title: "Serviços", desc: "Ordens de serviço com controle de custos e mecânicos" },
  { icon: Globe, title: "Loja Pública", desc: "Vitrine online com seu domínio próprio para atrair clientes" },
  { icon: Shield, title: "Segurança", desc: "Dados isolados por revenda com controle de acesso por perfil" },
];

const faqs = [
  {
    question: "Preciso instalar algum programa?",
    answer: "Não. O AutoGest funciona 100% no navegador, seja no computador, tablet ou celular. Basta acessar e usar.",
  },
  {
    question: "Posso testar antes de assinar?",
    answer:
      "Sim! Oferecemos um período de teste gratuito para você conhecer todas as funcionalidades antes de decidir.",
  },
  {
    question: "Como funciona a loja pública?",
    answer:
      "Ao cadastrar seus veículos, eles ficam disponíveis automaticamente em uma vitrine online com a marca da sua revenda. Seus clientes podem ver fotos, detalhes e enviar interesse diretamente por lá.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Sim. Cada revenda tem seus dados completamente isolados. Utilizamos criptografia e controle de acesso por perfil para garantir a segurança das informações.",
  },
  {
    question: "Posso ter mais de um vendedor usando o sistema?",
    answer:
      "Sim! No plano Marketplace você pode adicionar múltiplos vendedores, acompanhar o desempenho individual e controlar comissões de cada um.",
  },
  {
    question: "O que é o CarboCarros?",
    answer:
      "É o nosso marketplace exclusivo. Seus veículos aparecem para milhares de compradores interessados, aumentando suas chances de venda sem custo extra de anúncio.",
  },
  {
    question: "Consigo controlar despesas e lucro por veículo?",
    answer:
      "Sim. O módulo financeiro permite registrar custos de aquisição, serviços realizados e preço de venda, calculando o lucro de cada operação.",
  },
  {
    question: "Como funciona a captura de leads?",
    answer:
      "Quando um visitante demonstra interesse por um veículo na sua loja, as informações dele são salvas automaticamente no seu CRM. Você recebe o lead com nome, telefone e veículo de interesse para fazer o follow-up.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg">AutoGest</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/marketplace">Marketplace</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Criar conta</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="text-sm px-4 py-1">
            <Zap className="h-3 w-3 mr-1" /> Plataforma #1 para revendas de veículos
          </Badge>
          <h1 className="text-4xl md:text-6xl font-heading font-bold leading-tight">
            Gerencie sua revenda com <span className="text-primary">controle total</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Estoque, vendas, financeiro, vistorias e loja pública — tudo em um só lugar. Pare de usar planilhas e comece
            a vender mais.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/register">
                Começar agora <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/marketplace">Ver Marketplace</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-3">Tudo que sua revenda precisa</h2>
            <p className="text-muted-foreground">
              Funcionalidades completas para gerenciar cada aspecto do seu negócio
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 px-4" id="planos">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-3">Planos para cada momento da sua revenda</h2>
            <p className="text-muted-foreground">Comece pequeno e cresça com a gente</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <Card
                key={p.name}
                className={`bg-card border-border relative overflow-hidden ${p.highlight ? "border-primary ring-1 ring-primary/30" : ""}`}
              >
                {p.highlight && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center text-xs py-1 font-medium">
                    <Star className="h-3 w-3 inline mr-1" />
                    Mais popular
                  </div>
                )}
                <CardContent className={`p-6 space-y-5 ${p.highlight ? "pt-9" : ""}`}>
                  <div>
                    <h3 className="text-xl font-heading font-bold">{p.name}</h3>
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-heading font-bold">R$ {p.price}</span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>
                  <div className="space-y-2">
                    {p.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                    {p.blocked.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground/50">
                        <CheckCircle2 className="h-4 w-4 shrink-0 opacity-30" />
                        <span className="line-through">{f}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full" variant={p.highlight ? "default" : "secondary"} asChild>
                    <Link to="/register">Começar com {p.name}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-card/50" id="faq">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl font-heading font-bold mb-3">Perguntas frequentes</h2>
            <p className="text-muted-foreground">Tire suas dúvidas sobre o AutoGest</p>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-lg px-5 bg-card data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Marketplace CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-heading font-bold">CarboCarros</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            O marketplace exclusivo do plano Marketplace. Seus veículos aparecem para milhares de compradores,
            aumentando suas vendas sem custo extra de anúncio. Loja própria + vitrine no marketplace = mais clientes.
          </p>
          <Button size="lg" asChild>
            <Link to="/register">
              Quero estar no Marketplace <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <Car className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-sm">AutoGest</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AutoGest. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
