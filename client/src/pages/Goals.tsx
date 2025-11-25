import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Plus, Target, Trophy, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Goals() {
  const [open, setOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAmount: "",
    currentAmount: "0",
    deadline: "",
    icon: "🎯",
    color: "#10b981",
  });

  const utils = trpc.useUtils();
  const { data: goals, isLoading } = trpc.goals.list.useQuery();
  
  const createMutation = trpc.goals.create.useMutation({
    onSuccess: () => {
      utils.goals.list.invalidate();
      setOpen(false);
      resetForm();
      toast.success("Meta criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar meta: " + error.message);
    },
  });

  const updateMutation = trpc.goals.update.useMutation({
    onSuccess: () => {
      utils.goals.list.invalidate();
      setOpen(false);
      setEditingGoal(null);
      resetForm();
      toast.success("Meta atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar meta: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      targetAmount: "",
      currentAmount: "0",
      deadline: "",
      icon: "🎯",
      color: "#10b981",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetAmount = parseFloat(formData.targetAmount.replace(/[^\d.-]/g, '')) || 0;
    const currentAmount = parseFloat(formData.currentAmount.replace(/[^\d.-]/g, '')) || 0;
    
    const data: any = {
      name: formData.name,
      description: formData.description,
      targetAmount,
      currentAmount,
      icon: formData.icon,
      color: formData.color,
    };

    if (formData.deadline) {
      data.deadline = new Date(formData.deadline);
    }
    
    if (editingGoal) {
      updateMutation.mutate({
        id: editingGoal.id,
        ...data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (goal: any) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      description: goal.description || "",
      targetAmount: (goal.targetAmount / 100).toFixed(2),
      currentAmount: (goal.currentAmount / 100).toFixed(2),
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : "",
      icon: goal.icon || "🎯",
      color: goal.color || "#10b981",
    });
    setOpen(true);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const activeGoals = goals?.filter(g => !g.isCompleted) || [];
  const completedGoals = goals?.filter(g => g.isCompleted) || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Metas Financeiras</h1>
            <p className="text-muted-foreground">
              Defina e acompanhe seus objetivos financeiros
            </p>
          </div>
          <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
              setEditingGoal(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingGoal ? "Editar Meta" : "Nova Meta"}</DialogTitle>
                  <DialogDescription>
                    {editingGoal ? "Atualize sua meta financeira" : "Crie uma nova meta financeira"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome da Meta</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Viagem, Carro novo..."
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detalhes sobre sua meta..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="targetAmount">Valor Alvo</Label>
                      <Input
                        id="targetAmount"
                        type="number"
                        step="0.01"
                        value={formData.targetAmount}
                        onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="currentAmount">Valor Atual</Label>
                      <Input
                        id="currentAmount"
                        type="number"
                        step="0.01"
                        value={formData.currentAmount}
                        onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="deadline">Prazo (Opcional)</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="icon">Ícone (Emoji)</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="🎯"
                      maxLength={2}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="color">Cor</Label>
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingGoal ? "Atualizar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {completedGoals.length > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <CardTitle>Parabéns!</CardTitle>
              </div>
              <CardDescription>
                Você completou {completedGoals.length} meta{completedGoals.length > 1 ? 's' : ''}!
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
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
          ) : activeGoals.length > 0 ? (
            activeGoals.map((goal) => {
              const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
              const daysLeft = goal.deadline 
                ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                : null;
              
              return (
                <Card key={goal.id} style={{ borderLeft: `4px solid ${goal.color || '#10b981'}` }}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{goal.icon || "🎯"}</span>
                        <div>
                          <CardTitle className="text-lg">{goal.name}</CardTitle>
                          <CardDescription>{goal.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(goal)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm text-muted-foreground">Atual</p>
                        <p className="text-xl font-bold">{formatCurrency(goal.currentAmount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Meta</p>
                        <p className="text-xl font-bold">{formatCurrency(goal.targetAmount)}</p>
                      </div>
                    </div>
                    {daysLeft !== null && (
                      <div className="text-sm text-muted-foreground">
                        {daysLeft > 0 ? (
                          <span>⏰ {daysLeft} dias restantes</span>
                        ) : daysLeft === 0 ? (
                          <span className="text-orange-600 font-medium">⏰ Vence hoje!</span>
                        ) : (
                          <span className="text-red-600 font-medium">⏰ Prazo vencido há {Math.abs(daysLeft)} dias</span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="md:col-span-2">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Nenhuma meta cadastrada</p>
                <Button onClick={() => setOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Meta
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {completedGoals.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Metas Concluídas</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {completedGoals.map((goal) => (
                <Card key={goal.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{goal.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(goal.targetAmount)}</p>
                    <p className="text-sm text-muted-foreground mt-1">Meta atingida! 🎉</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
