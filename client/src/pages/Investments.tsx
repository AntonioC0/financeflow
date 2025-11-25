import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { TrendingUp, Plus, Pencil, Trash2, DollarSign, TrendingDown, PieChart as PieChartIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useTheme } from "@/contexts/ThemeContext";

const investmentTypes = {
  stocks: { label: "Ações", color: "#10b981" },
  funds: { label: "Fundos", color: "#3b82f6" },
  fixed_income: { label: "Renda Fixa", color: "#8b5cf6" },
  crypto: { label: "Criptomoedas", color: "#f59e0b" },
  real_estate: { label: "Imóveis", color: "#ef4444" },
  other: { label: "Outros", color: "#6b7280" },
};

export default function Investments() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<any>(null);
  const { theme } = useTheme();
  
  const { data: investments, isLoading, refetch } = trpc.investments.list.useQuery();
  const createMutation = trpc.investments.create.useMutation({
    onSuccess: () => {
      toast.success("Investimento adicionado com sucesso!");
      refetch();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao adicionar investimento");
    },
  });

  const updateMutation = trpc.investments.update.useMutation({
    onSuccess: () => {
      toast.success("Investimento atualizado com sucesso!");
      refetch();
      setIsDialogOpen(false);
      setEditingInvestment(null);
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao atualizar investimento");
    },
  });

  const deleteMutation = trpc.investments.delete.useMutation({
    onSuccess: () => {
      toast.success("Investimento excluído com sucesso!");
      refetch();
    },
    onError: () => {
      toast.error("Erro ao excluir investimento");
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    type: "stocks" as keyof typeof investmentTypes,
    initialAmount: "",
    currentAmount: "",
    purchaseDate: "",
    broker: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      type: "stocks",
      initialAmount: "",
      currentAmount: "",
      purchaseDate: "",
      broker: "",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: formData.name,
      type: formData.type,
      initialAmount: parseFloat(formData.initialAmount),
      currentAmount: parseFloat(formData.currentAmount),
      purchaseDate: new Date(formData.purchaseDate),
      broker: formData.broker || undefined,
      notes: formData.notes || undefined,
    };

    if (editingInvestment) {
      updateMutation.mutate({ id: editingInvestment.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (investment: any) => {
    setEditingInvestment(investment);
    setFormData({
      name: investment.name,
      type: investment.type,
      initialAmount: (investment.initialAmount / 100).toString(),
      currentAmount: (investment.currentAmount / 100).toString(),
      purchaseDate: new Date(investment.purchaseDate).toISOString().split('T')[0],
      broker: investment.broker || "",
      notes: investment.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este investimento?")) {
      deleteMutation.mutate({ id });
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const calculateReturn = (initial: number, current: number) => {
    const returnValue = current - initial;
    const returnPercent = ((returnValue / initial) * 100).toFixed(2);
    return { returnValue, returnPercent };
  };

  // Estatísticas
  const totalInvested = investments?.reduce((sum, inv) => sum + inv.initialAmount, 0) || 0;
  const totalCurrent = investments?.reduce((sum, inv) => sum + inv.currentAmount, 0) || 0;
  const totalReturn = totalCurrent - totalInvested;
  const totalReturnPercent = totalInvested > 0 ? ((totalReturn / totalInvested) * 100).toFixed(2) : "0.00";

  // Dados para o gráfico de pizza
  const chartData = Object.entries(
    investments?.reduce((acc, inv) => {
      const type = inv.type as keyof typeof investmentTypes;
      acc[type] = (acc[type] || 0) + inv.currentAmount;
      return acc;
    }, {} as Record<string, number>) || {}
  ).map(([type, value]) => ({
    name: investmentTypes[type as keyof typeof investmentTypes].label,
    value: value / 100,
    color: investmentTypes[type as keyof typeof investmentTypes].color,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Investimentos</h1>
            <p className="text-muted-foreground">Acompanhe seus investimentos e rentabilidade</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingInvestment(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Investimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingInvestment ? "Editar Investimento" : "Novo Investimento"}</DialogTitle>
                <DialogDescription>
                  {editingInvestment ? "Atualize as informações do investimento" : "Adicione um novo investimento ao seu portfólio"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Investimento *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Ações Petrobras"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(investmentTypes).map(([value, { label }]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="initialAmount">Valor Investido *</Label>
                    <Input
                      id="initialAmount"
                      type="number"
                      step="0.01"
                      value={formData.initialAmount}
                      onChange={(e) => setFormData({ ...formData, initialAmount: e.target.value })}
                      placeholder="0,00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentAmount">Valor Atual *</Label>
                    <Input
                      id="currentAmount"
                      type="number"
                      step="0.01"
                      value={formData.currentAmount}
                      onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                      placeholder="0,00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchaseDate">Data de Compra *</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="broker">Corretora</Label>
                    <Input
                      id="broker"
                      value={formData.broker}
                      onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                      placeholder="Ex: XP Investimentos"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Adicione observações sobre este investimento"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingInvestment(null);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingInvestment ? "Atualizar" : "Criar"} Investimento
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {investments?.length || 0} investimentos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Atual</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCurrent)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Patrimônio investido
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rentabilidade</CardTitle>
              {totalReturn >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalReturn >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatCurrency(totalReturn)}
              </div>
              <p className={`text-xs mt-1 ${totalReturn >= 0 ? "text-green-500" : "text-red-500"}`}>
                {totalReturn >= 0 ? "+" : ""}{totalReturnPercent}%
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Gráfico de Distribuição */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Distribuição por Tipo
              </CardTitle>
              <CardDescription>Composição do seu portfólio</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value * 100)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground h-[300px] flex flex-col items-center justify-center">
                  <PieChartIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum investimento registrado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lista de Investimentos */}
          <Card>
            <CardHeader>
              <CardTitle>Seus Investimentos</CardTitle>
              <CardDescription>Detalhes de cada investimento</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Carregando...</p>
              ) : investments && investments.length > 0 ? (
                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {investments.map((investment) => {
                    const { returnValue, returnPercent } = calculateReturn(
                      investment.initialAmount,
                      investment.currentAmount
                    );
                    const isPositive = returnValue >= 0;

                    return (
                      <div
                        key={investment.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: investmentTypes[investment.type as keyof typeof investmentTypes].color }}
                            />
                            <p className="font-medium truncate">{investment.name}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {investmentTypes[investment.type as keyof typeof investmentTypes].label}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm">
                              {formatCurrency(investment.currentAmount)}
                            </span>
                            <span className={`text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
                              {isPositive ? "+" : ""}{returnPercent}%
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(investment)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(investment.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum investimento cadastrado</p>
                  <p className="text-sm mt-1">Clique em "Novo Investimento" para começar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
