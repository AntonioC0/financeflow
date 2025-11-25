import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

import { Camera, Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";



export default function Settings() {
  const { user, logout } = useAuth();
  


  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  

  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const deleteAccount = trpc.userSettings.deleteAccount.useMutation();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Arquivo muito grande! Máximo 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success("Foto selecionada! Clique em Salvar para confirmar.");
    }
  };





  const handleDeleteAccount = async () => {
    if (deleteConfirmation.toLowerCase() !== "excluir") {
      toast.error('Digite "excluir" para confirmar');
      return;
    }

    try {
      await deleteAccount.mutateAsync();
      toast.success("Conta excluída com sucesso");
      setTimeout(() => {
        logout();
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      toast.error("Erro ao excluir conta");
    }
  };

  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day} de ${new Date(date).toLocaleString("pt-BR", { month: "long" })} de ${year}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais
          </p>
        </div>

        {/* Foto de Perfil */}
        <Card>
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
            <CardDescription>
              Atualize sua foto de perfil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={photoPreview || undefined} />
                <AvatarFallback className="text-2xl">
                  {getUserInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="photo" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors inline-flex">
                    <Camera className="h-4 w-4" />
                    Alterar Foto
                  </div>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </Label>
                <p className="text-sm text-muted-foreground mt-2">
                  JPG, PNG ou GIF. Máximo 5MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações da Conta */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
            <CardDescription>
              Detalhes da sua conta no Gestor+
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium">Método de Login</p>
                <p className="text-sm text-muted-foreground">{user?.loginMethod || "N/A"}</p>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium">Membro desde</p>
                <p className="text-sm text-muted-foreground">
                  {user?.createdAt ? formatDate(new Date(user.createdAt)) : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="font-medium">Último acesso</p>
                <p className="text-sm text-muted-foreground">
                  {user?.lastSignedIn 
                    ? `${formatDate(new Date(user.lastSignedIn))} às ${new Date(user.lastSignedIn).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zona de Perigo */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
            <CardDescription>
              Ações irreversíveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                <div className="flex-1">
                  <h3 className="font-semibold text-destructive mb-1">Excluir Conta</h3>
                  <p className="text-sm text-muted-foreground">
                    Exclua permanentemente sua conta e todos os dados associados. Esta ação não pode ser desfeita.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="ml-4"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Excluir Conta Permanentemente
            </DialogTitle>
            <DialogDescription>
              Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos, incluindo:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Todas as contas bancárias e cartões</li>
              <li>Todas as transações e histórico financeiro</li>
              <li>Orçamentos, metas e investimentos</li>
              <li>Lembretes e configurações pessoais</li>
            </ul>
            <div className="space-y-2">
              <Label htmlFor="confirmDelete">
                Digite <strong>excluir</strong> para confirmar:
              </Label>
              <Input
                id="confirmDelete"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="excluir"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmation("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation.toLowerCase() !== "excluir"}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Minha Conta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
