/**
 * Registra o Service Worker para funcionalidade PWA
 */
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado com sucesso:', registration.scope);
          
          // Verificar atualizações a cada hora
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        })
        .catch((error) => {
          console.log('Falha ao registrar Service Worker:', error);
        });
    });
  }
}

/**
 * Verifica se o app está rodando como PWA instalado
 */
export function isPWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Solicita permissão para notificações push
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('Este navegador não suporta notificações');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Mostra prompt de instalação do PWA
 */
export function setupPWAInstallPrompt() {
  let deferredPrompt: any;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Previne o prompt automático do Chrome
    e.preventDefault();
    // Salva o evento para usar depois
    deferredPrompt = e;
    
    // Aqui você pode mostrar um botão customizado de instalação
    console.log('PWA pode ser instalado');
    
    // Exemplo de como disparar a instalação:
    // deferredPrompt.prompt();
    // deferredPrompt.userChoice.then((choiceResult) => {
    //   if (choiceResult.outcome === 'accepted') {
    //     console.log('Usuário aceitou instalar o PWA');
    //   }
    //   deferredPrompt = null;
    // });
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA foi instalado com sucesso');
    deferredPrompt = null;
  });
}
