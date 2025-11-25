import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Wallet, CreditCard, TrendingUp, TrendingDown, Target, PieChart } from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

export default function Dashboard() {
  const { data: accounts, isLoading: loadingAccounts } = trpc.accounts.list.useQuery();
  const { data: creditCards, isLoading: loadingCards } = trpc.creditCards.list.useQuery();
  const { data: transactions, isLoading: loadingTransactions } = trpc.transactions.list.useQuery({ limit: 10 });
  const { data: goals, isLoading: loadingGoals } = trpc.goals.list.useQuery();
  
  const [chartPeriod, setChartPeriod] = useState(30);
  const { data: expensesByCategory } = trpc.statistics.expensesByCategory.useQuery();
  const { data: netWorthData } = trpc.statistics.netWorthEvolution.useQuery({ days: chartPeriod });
  const { theme } = useTheme();
  
  // Cores adaptativas para os gráficos baseadas no tema
  const isDark = theme === "dark";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  const textColor = isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)";

  const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.includeInTotal ? acc.balance : 0), 0) || 0;
  const totalCreditLimit = creditCards?.reduce((sum, card) => sum + card.creditLimit, 0) || 0;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const recentIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
  const recentExpenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das suas finanças
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Saldo Total
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
              <p className="text-xs text-muted-foreground">
                {accounts?.length || 0} contas ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Limite de Crédito
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCreditLimit)}</div>
              <p className="text-xs text-muted-foreground">
                {creditCards?.length || 0} cartões
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receitas Recentes
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(recentIncome)}</div>
              <p className="text-xs text-muted-foreground">
                Últimas transações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Despesas Recentes
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(recentExpenses)}</div>
              <p className="text-xs text-muted-foreground">
                Últimas transações
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Despesas por Categoria</CardTitle>
              <CardDescription>
                Distribuição dos seus gastos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expensesByCategory && expensesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.categoryName}: ${formatCurrency(entry.total * 100)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.categoryColor} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value * 100)} />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground h-[300px] flex flex-col items-center justify-center">
                  <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma despesa registrada</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Evolução do Patrimônio</CardTitle>
                  <CardDescription>
                    Acompanhe seu saldo ao longo do tempo
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={chartPeriod === 7 ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setChartPeriod(7)}
                  >
                    7d
                  </Button>
                  <Button 
                    variant={chartPeriod === 30 ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setChartPeriod(30)}
                  >
                    30d
                  </Button>
                  <Button 
                    variant={chartPeriod === 90 ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setChartPeriod(90)}
                  >
                    90d
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {netWorthData && netWorthData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={netWorthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      stroke={textColor}
                      tick={{ fill: textColor }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
                      stroke={textColor}
                      tick={{ fill: textColor }}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value * 100)}
                      labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="netWorth" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Patrimônio"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground h-[300px] flex flex-col items-center justify-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Sem dados suficientes para exibir</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions and Goals */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>
                Suas últimas movimentações financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{transaction.description || 'Sem descrição'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className={`text-sm font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma transação registrada</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metas Financeiras</CardTitle>
              <CardDescription>
                Acompanhe o progresso dos seus objetivos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingGoals ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : goals && goals.length > 0 ? (
                <div className="space-y-4">
                  {goals.slice(0, 3).map((goal) => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    return (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{goal.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all" 
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatCurrency(goal.currentAmount)}</span>
                          <span>{formatCurrency(goal.targetAmount)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma meta cadastrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
