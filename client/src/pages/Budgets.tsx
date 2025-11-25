import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Plus, PieChart, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

export default function Budgets() {
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    period: "monthly" as const,
    categoryId: "",
    alertThreshold: "80",
  });

  const utils = trpc.useUtils();
  const { data: budgets, isLoading } = trpc.budgets.list.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: transactions } = trpc.transactions.list.useQuery({ limit: 1000 });
  
  const createMutation = trpc.budgets.create.useMutation({
    onSuccess: () => {
      utils.budgets.list.invalidate();
      setOpen(false);
      resetForm();
      toast.success("Orçamento criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar orçamento: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      amount: "",
      period: "monthly",
      categoryId: "",
      alertThreshold: "80",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount.replace(/[^\d.-]/g, '')) || 0;
    const alertThreshold = parseInt(formData.alertThreshold);
    
    const data: any = {
      name: formData.name,
      amount,
      period: formData.period,
      alertThreshold,
    };

    if (formData.categoryId) {
      data.categoryId = parseInt(formData.categoryId);
    }
    
    createMutation.mutate(data);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  // Calcular gastos por categoria no mês atual
  const currentMonthExpenses = useMemo(() => {
    if (!transactions) return {};
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const expensesByCategory: Record<number, number> = {};
    
    transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && 
               tDate.getMonth() === currentMonth && 
               tDate.getFullYear() === currentYear;
      })
      .forEach(t => {
        if (t.categoryId) {
          expensesByCategory[t.categoryId] = (expensesByCategory[t.categoryId] || 0) + t.amount;
        }
      });
    
    return expensesByCategory;
  }, [transactions]);

  const getBudgetStatus = (budget: any) => {
    const categoryExpenses = budget.categoryId ? currentMonthExpenses[budget.categoryId] || 0 : 0;
    const percentage = (categoryExpenses / budget.amount) * 100;
    
    if (percentage >= 100) return { status: 'exceeded', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (percentage >= budget.alertThreshold) return { status: 'warning', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { status: 'ok', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
            <p className="text-muted-foreground">
              Planeje e controle seus gastos mensais
            </p>
          </div>
          <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Novo Orçamento</DialogTitle>
                  <DialogDescription>
                    Defina um limite de gastos para controlar suas despesas
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome do Orçamento</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Orçamento Mensal, Alimentação..."
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Valor Limite</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="period">Período</Label>
                    <Select value={formData.period} onValueChange={(value: any) => setFormData({ ...formData, period: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="categoryId">Categoria (Opcional)</Label>
                    <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.filter(c => c.type === 'expense').map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="alertThreshold">Alerta em (%) - Padrão: 80%</Label>
                    <Input
                      id="alertThreshold"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.alertThreshold}
                      onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    Criar Orçamento
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-muted animate-pulse rounded w-2/3" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
                </CardContent>
              </Card>
            ))
          ) : budgets && budgets.length > 0 ? (
            budgets.filter(b => b.isActive).map((budget) => {
              const categoryExpenses = budget.categoryId ? currentMonthExpenses[budget.categoryId] || 0 : 0;
              const percentage = Math.min((categoryExpenses / budget.amount) * 100, 100);
              const status = getBudgetStatus(budget);
              const category = categories?.find(c => c.id === budget.categoryId);
              
              return (
                <Card key={budget.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{budget.name}</CardTitle>
                        <CardDescription>
                          {category ? `${category.icon} ${category.name}` : 'Todas as categorias'}
                        </CardDescription>
                      </div>
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${status.bgColor}`}>
                        {status.status === 'exceeded' ? (
                          <AlertTriangle className={`h-5 w-5 ${status.color}`} />
                        ) : status.status === 'warning' ? (
                          <AlertTriangle className={`h-5 w-5 ${status.color}`} />
                        ) : (
                          <CheckCircle2 className={`h-5 w-5 ${status.color}`} />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Gasto</span>
                        <span className={`font-medium ${status.color}`}>
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm text-muted-foreground">Gasto</p>
                        <p className={`text-xl font-bold ${status.color}`}>
                          {formatCurrency(categoryExpenses)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Limite</p>
                        <p className="text-xl font-bold">
                          {formatCurrency(budget.amount)}
                        </p>
                      </div>
                    </div>
                    {status.status === 'exceeded' && (
                      <div className="text-sm text-red-600 font-medium">
                        ⚠️ Orçamento ultrapassado!
                      </div>
                    )}
                    {status.status === 'warning' && (
                      <div className="text-sm text-orange-600 font-medium">
                        ⚠️ Atenção: Próximo do limite
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <PieChart className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum orçamento cadastrado</p>
                <Button onClick={() => setOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Orçamento
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
