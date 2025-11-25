import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { Plus, Bell, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Reminders() {
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    notifyBefore: "1",
  });

  const utils = trpc.useUtils();
  
  // Criar helper functions no db.ts primeiro
  const reminders = [] as any[]; // Placeholder até implementar
  const isLoading = false;

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      dueDate: "",
      notifyBefore: "1",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Funcionalidade em desenvolvimento!");
    setOpen(false);
    resetForm();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysUntil = (date: string) => {
    const today = new Date();
    const dueDate = new Date(date);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Dados de exemplo para demonstração
  const exampleReminders = [
    {
      id: 1,
      title: "Pagar fatura do cartão",
      description: "Vencimento da fatura Nubank",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      isCompleted: false,
      notifyBefore: 1,
    },
    {
      id: 2,
      title: "Aluguel",
      description: "Pagamento do aluguel mensal",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isCompleted: false,
      notifyBefore: 2,
    },
  ];

  const activeReminders = exampleReminders.filter(r => !r.isCompleted);
  const completedReminders = exampleReminders.filter(r => r.isCompleted);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lembretes</h1>
            <p className="text-muted-foreground">
              Nunca mais perca vencimentos importantes
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
                Novo Lembrete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Novo Lembrete</DialogTitle>
                  <DialogDescription>
                    Crie um lembrete para não esquecer pagamentos importantes
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Pagar conta de luz"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detalhes sobre o lembrete..."
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate">Data de Vencimento</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notifyBefore">Notificar com antecedência (dias)</Label>
                    <Input
                      id="notifyBefore"
                      type="number"
                      min="0"
                      max="30"
                      value={formData.notifyBefore}
                      onChange={(e) => setFormData({ ...formData, notifyBefore: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    Criar Lembrete
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Lembretes Ativos</h2>
            <div className="space-y-3">
              {activeReminders.length > 0 ? (
                activeReminders.map((reminder) => {
                  const daysUntil = getDaysUntil(reminder.dueDate);
                  const isUrgent = daysUntil <= 2;
                  const isOverdue = daysUntil < 0;
                  
                  return (
                    <Card key={reminder.id} className={isOverdue ? 'border-red-500' : isUrgent ? 'border-orange-500' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center ${
                              isOverdue ? 'bg-red-100' : isUrgent ? 'bg-orange-100' : 'bg-blue-100'
                            }`}>
                              <Bell className={`h-5 w-5 ${
                                isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-blue-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{reminder.title}</h3>
                              {reminder.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {reminder.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatDate(reminder.dueDate)}</span>
                                </div>
                                {isOverdue ? (
                                  <span className="text-red-600 font-medium">
                                    Vencido há {Math.abs(daysUntil)} dia{Math.abs(daysUntil) !== 1 ? 's' : ''}
                                  </span>
                                ) : daysUntil === 0 ? (
                                  <span className="text-orange-600 font-medium">
                                    Vence hoje!
                                  </span>
                                ) : (
                                  <span className={isUrgent ? 'text-orange-600 font-medium' : 'text-muted-foreground'}>
                                    {daysUntil} dia{daysUntil !== 1 ? 's' : ''} restante{daysUntil !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toast.success("Lembrete marcado como concluído!")}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => toast.success("Lembrete excluído!")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Nenhum lembrete ativo</p>
                    <Button onClick={() => setOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Lembrete
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {completedReminders.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Concluídos</h2>
              <div className="space-y-3">
                {completedReminders.map((reminder) => (
                  <Card key={reminder.id} className="opacity-60">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                          <h3 className="font-medium line-through">{reminder.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(reminder.dueDate)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
