import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  PieChart, 
  Target, 
  Bell, 
  Download, 
  Shield,
  Zap,
  Users,
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
            <span className="text-xl font-bold text-primary">{APP_TITLE}</span>
          </div>
          <Button asChild>
            <a href={getLoginUrl()}>Entrar</a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Controle Total das Suas Finanças
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            A plataforma completa para gerenciar suas finanças pessoais. 
            Contas, cartões, investimentos, orçamentos e muito mais em um só lugar.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <a href={getLoginUrl()}>
                Criar Conta
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#features">Conhecer Recursos</a>
            </Button>
          </div>

        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container py-24 bg-muted/40">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Tudo que você precisa para suas finanças
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Recursos completos inspirados nos melhores apps do mercado
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Wallet className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Gestão de Contas</CardTitle>
                <CardDescription>
                  Gerencie todas suas contas bancárias, poupança e carteiras digitais em um só lugar
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CreditCard className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Controle de Cartões</CardTitle>
                <CardDescription>
                  Acompanhe faturas, limites e vencimentos de todos os seus cartões de crédito
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Transações</CardTitle>
                <CardDescription>
                  Registre receitas e despesas com categorização inteligente e anexos de comprovantes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <PieChart className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Orçamentos</CardTitle>
                <CardDescription>
                  Crie orçamentos mensais por categoria e receba alertas quando ultrapassar limites
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Metas Financeiras</CardTitle>
                <CardDescription>
                  Defina objetivos e acompanhe seu progresso para realizar seus sonhos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Bell className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Lembretes</CardTitle>
                <CardDescription>
                  Nunca mais perca vencimentos com alertas automáticos de contas a pagar
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Download className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Importação/Exportação</CardTitle>
                <CardDescription>
                  Importe dados de outros apps e exporte relatórios em Excel, PDF e CSV
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Segurança Total</CardTitle>
                <CardDescription>
                  Seus dados criptografados e protegidos. Nunca compartilhamos com terceiros
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Relatórios Avançados</CardTitle>
                <CardDescription>
                  Gráficos interativos e análises detalhadas da sua saúde financeira
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="container py-24 bg-primary/5">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Pronto para transformar suas finanças?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Junte-se a milhares de pessoas que já estão no controle do seu dinheiro
          </p>
          <Button size="lg" asChild>
            <a href={getLoginUrl()}>
              Começar Agora
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={APP_LOGO} alt="Gestor+" className="h-6 w-6" />
              <span className="text-sm font-medium">Gestor+</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Gestor+. Gestão financeira pessoal inteligente.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
