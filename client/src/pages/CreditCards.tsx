import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Plus, CreditCard, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CreditCards() {
  const [open, setOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    lastFourDigits: "",
    creditLimit: "0",
    closingDay: "1",
    dueDay: "10",
    brand: "",
    icon: "💳",
    color: "#6366f1",
  });

  const utils = trpc.useUtils();
  const { data: creditCards, isLoading } = trpc.creditCards.list.useQuery();
  
  const createMutation = trpc.creditCards.create.useMutation({
    onSuccess: () => {
      utils.creditCards.list.invalidate();
      setOpen(false);
      resetForm();
      toast.success("Cartão criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar cartão: " + error.message);
    },
  });

  const updateMutation = trpc.creditCards.update.useMutation({
    onSuccess: () => {
      utils.creditCards.list.invalidate();
      setOpen(false);
      setEditingCard(null);
      resetForm();
      toast.success("Cartão atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar cartão: " + error.message);
    },
  });

  const deleteMutation = trpc.creditCards.delete.useMutation({
    onSuccess: () => {
      utils.creditCards.list.invalidate();
      toast.success("Cartão excluído com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir cartão: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      lastFourDigits: "",
      creditLimit: "0",
      closingDay: "1",
      dueDay: "10",
      brand: "",
      icon: "💳",
      color: "#6366f1",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const creditLimit = parseFloat(formData.creditLimit.replace(/[^\d.-]/g, '')) || 0;
    const closingDay = parseInt(formData.closingDay);
    const dueDay = parseInt(formData.dueDay);
    
    if (editingCard) {
      updateMutation.mutate({
        id: editingCard.id,
        ...formData,
        creditLimit,
        closingDay,
        dueDay,
      });
    } else {
      createMutation.mutate({
        ...formData,
        creditLimit,
        closingDay,
        dueDay,
      });
    }
  };

  const handleEdit = (card: any) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      lastFourDigits: card.lastFourDigits || "",
      creditLimit: (card.creditLimit / 100).toFixed(2),
      closingDay: card.closingDay.toString(),
      dueDay: card.dueDay.toString(),
      brand: card.brand || "",
      icon: card.icon || "💳",
      color: card.color || "#6366f1",
    });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este cartão?")) {
      deleteMutation.mutate({ id });
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const totalLimit = creditCards?.reduce((sum, card) => sum + card.creditLimit, 0) || 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cartões de Crédito</h1>
            <p className="text-muted-foreground">
              Gerencie seus cartões e acompanhe faturas
            </p>
          </div>
          <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
              setEditingCard(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cartão
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingCard ? "Editar Cartão" : "Novo Cartão"}</DialogTitle>
                  <DialogDescription>
                    {editingCard ? "Atualize as informações do cartão" : "Adicione um novo cartão de crédito"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome do Cartão</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Nubank, Inter..."
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="brand">Bandeira</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Ex: Visa, Mastercard..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastFourDigits">Últimos 4 Dígitos</Label>
                    <Input
                      id="lastFourDigits"
                      value={formData.lastFourDigits}
                      onChange={(e) => setFormData({ ...formData, lastFourDigits: e.target.value.slice(0, 4) })}
                      placeholder="1234"
                      maxLength={4}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="creditLimit">Limite de Crédito</Label>
                    <Input
                      id="creditLimit"
                      type="number"
                      step="0.01"
                      value={formData.creditLimit}
                      onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="closingDay">Dia do Fechamento</Label>
                      <Input
                        id="closingDay"
                        type="number"
                        min="1"
                        max="31"
                        value={formData.closingDay}
                        onChange={(e) => setFormData({ ...formData, closingDay: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dueDay">Dia do Vencimento</Label>
                      <Input
                        id="dueDay"
                        type="number"
                        min="1"
                        max="31"
                        value={formData.dueDay}
                        onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="icon">Ícone (Emoji)</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="💳"
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
                    {editingCard ? "Atualizar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Limite Total</CardTitle>
            <CardDescription>Soma dos limites de todos os cartões</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(totalLimit)}
            </div>
          </CardContent>
        </Card>

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
          ) : creditCards && creditCards.length > 0 ? (
            creditCards.map((card) => (
              <Card key={card.id} style={{ borderLeft: `4px solid ${card.color || '#6366f1'}` }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{card.icon || "💳"}</span>
                      <div>
                        <CardTitle className="text-lg">{card.name}</CardTitle>
                        <CardDescription>
                          {card.brand && `${card.brand} • `}
                          {card.lastFourDigits && `•••• ${card.lastFourDigits}`}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(card)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(card.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Limite</p>
                    <p className="text-2xl font-bold">{formatCurrency(card.creditLimit)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Fechamento</p>
                      <p className="font-medium">Dia {card.closingDay}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vencimento</p>
                      <p className="font-medium">Dia {card.dueDay}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum cartão cadastrado</p>
                <Button onClick={() => setOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Cartão
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
