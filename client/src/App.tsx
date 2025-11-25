import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import CreditCards from "./pages/CreditCards";
import Transactions from "./pages/Transactions";
import Goals from "./pages/Goals";
import Budgets from "./pages/Budgets";
import Reminders from "./pages/Reminders";
import Settings from "./pages/Settings";
import Investments from "./pages/Investments";
import DownloadApp from "./pages/DownloadApp";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/accounts"} component={Accounts} />
      <Route path={"/cards"} component={CreditCards} />
      <Route path={"/transactions"} component={Transactions} />
      <Route path={"/goals"} component={Goals} />
      <Route path={"/budgets"} component={Budgets} />
      <Route path={"/reminders"} component={Reminders} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/investments"} component={Investments} />
      <Route path={"/download-app"} component={DownloadApp} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
