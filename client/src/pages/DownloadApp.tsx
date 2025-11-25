import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Download } from "lucide-react";

export default function DownloadApp() {
  // Link temporário - será atualizado quando o app for publicado
  const playStoreUrl = "https://play.google.com/store/apps";


  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Baixar Aplicativo</h1>
        <p className="text-muted-foreground">
          Acesse o Gestor+ no seu smartphone e gerencie suas finanças em qualquer lugar
        </p>
      </div>

      <div className="max-w-md mx-auto">
        {/* Google Play Store */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Android</CardTitle>
                <CardDescription>Google Play Store</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Baixe o aplicativo Gestor+ para dispositivos Android diretamente da Google Play Store.
            </p>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => window.open(playStoreUrl, '_blank')}
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar na Play Store
            </Button>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Em breve disponível
            </p>
          </CardContent>
        </Card>


      </div>

      {/* Informações adicionais */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recursos do Aplicativo</CardTitle>
          <CardDescription>
            Todas as funcionalidades da versão web no seu bolso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Sincronização automática entre web e mobile</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Notificações push para vencimentos e alertas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Acesso offline aos seus dados financeiros</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Interface otimizada para dispositivos móveis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Biometria para acesso rápido e seguro</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
