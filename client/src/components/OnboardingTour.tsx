import { useEffect, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export function OnboardingTour() {
  const [, setLocation] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const { data: settings } = trpc.userSettings.get.useQuery(undefined, {
    enabled: !!user,
  });
  const updateSettings = trpc.userSettings.update.useMutation();

  useEffect(() => {
    // Só executa se o usuário estiver logado e não tiver completado o tour
    if (!user || !settings || settings.hasCompletedTour) {
      return;
    }

    // Aguarda um pouco para garantir que a página foi renderizada
    const timer = setTimeout(() => {
      startTour();
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, settings]);

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      nextBtnText: "Próximo",
      prevBtnText: "Anterior",
      doneBtnText: "Finalizar",
      progressText: "{{current}} de {{total}}",
      onDestroyed: () => {
        // Marca o tour como completo quando o usuário finaliza ou fecha
        updateSettings.mutate({ hasCompletedTour: true });
      },
      steps: [
        {
          element: "body",
          popover: {
            title: "👋 Bem-vindo ao Gestor+!",
            description:
              "Sua plataforma completa de gestão financeira pessoal. Vamos fazer um tour rápido para você conhecer as principais funcionalidades.",
            align: "center",
          },
        },
        {
          element: '[href="/dashboard"]',
          popover: {
            title: "📊 Dashboard",
            description:
              "Aqui você tem uma visão geral das suas finanças: saldo total, limites de crédito, receitas e despesas recentes.",
            side: "right",
            align: "start",
          },
        },
        {
          element: '[href="/accounts"]',
          popover: {
            title: "🏦 Contas",
            description:
              "Gerencie suas contas bancárias, poupanças, carteiras digitais e dinheiro em espécie. Clique aqui para adicionar sua primeira conta!",
            side: "right",
            align: "start",
            onNextClick: () => {
              setLocation("/accounts");
              driverObj.moveNext();
            },
          },
        },
        {
          element: '[href="/cards"]',
          popover: {
            title: "💳 Cartões de Crédito",
            description:
              "Controle seus cartões de crédito, limites, faturas e datas de vencimento. Nunca mais perca o controle dos gastos!",
            side: "right",
            align: "start",
          },
        },
        {
          element: '[href="/transactions"]',
          popover: {
            title: "💰 Transações",
            description:
              "Registre todas as suas receitas e despesas. Você pode categorizar, adicionar notas e até anexar comprovantes.",
            side: "right",
            align: "start",
            onNextClick: () => {
              setLocation("/transactions");
              driverObj.moveNext();
            },
          },
        },
        {
          element: '[href="/budgets"]',
          popover: {
            title: "📋 Orçamentos",
            description:
              "Defina limites de gastos por categoria e receba alertas quando estiver próximo de ultrapassar.",
            side: "right",
            align: "start",
          },
        },
        {
          element: '[href="/goals"]',
          popover: {
            title: "🎯 Metas Financeiras",
            description:
              "Estabeleça objetivos financeiros como comprar um carro, fazer uma viagem ou criar uma reserva de emergência.",
            side: "right",
            align: "start",
          },
        },
        {
          element: '[href="/reminders"]',
          popover: {
            title: "🔔 Lembretes",
            description:
              "Crie lembretes para vencimentos de contas, pagamentos recorrentes e outras datas importantes.",
            side: "right",
            align: "start",
          },
        },
        {
          element: '[href="/settings"]',
          popover: {
            title: "⚙️ Configurações",
            description:
              "Personalize sua experiência: altere seu perfil, foto e preferências do sistema.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "body",
          popover: {
            title: "🎉 Pronto para começar!",
            description:
              "Agora você já conhece todas as funcionalidades do Gestor+. Comece adicionando suas contas e registrando suas transações. Boa gestão financeira!",
            align: "center",
          },
        },
      ],
    });

    driverObj.drive();
  };

  // Função para reiniciar o tour (pode ser chamada das configurações)
  const restartTour = () => {
    startTour();
  };

  return null;
}
