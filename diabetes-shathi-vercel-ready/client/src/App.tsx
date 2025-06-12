import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { Navigation } from "@/components/layout/navigation";
import { useTheme } from "@/hooks/use-theme";
import Dashboard from "@/pages/dashboard";
import GlucoseTracker from "@/pages/glucose-tracker";
import MedicineTracker from "@/pages/medicine-tracker";
import FoodTracker from "@/pages/food-tracker";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen">
      <Header />
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/glucose" component={GlucoseTracker} />
          <Route path="/medicine" component={MedicineTracker} />
          <Route path="/food" component={FoodTracker} />
          <Route path="/reports" component={Reports} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  const { theme } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className={theme}>
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
