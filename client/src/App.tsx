import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Game from "@/pages/game";
import { Welcome } from "@/pages/Welcome";
import { RootRedirector } from "@/components/RootRedirector";
import Admin from "@/pages/admin";
import HauntAdmin from "@/pages/haunt-admin";
import HauntAuth from "@/pages/haunt-auth";

import Analytics from "@/pages/analytics";
import AnalyticsTest from "@/pages/analytics-test";
import AnalyticsSimple from "@/pages/analytics-simple";
import UberAdmin from "@/pages/uber-admin";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import UploadGuidelines from "@/pages/upload-guidelines";
import Info from "@/pages/info";
import NotFound from "@/pages/not-found";
import { TestProgressPage } from "@/pages/test-progress";
import { MonsterNameGenerator } from "@/pages/sidequests/MonsterNameGenerator";
import { GloryGrab } from "@/pages/sidequests/GloryGrab";
import { CrypticCompliments } from "@/pages/sidequests/CrypticCompliments";
import { WheelOfMisfortune } from "@/pages/sidequests/WheelOfMisfortune";
import { ChupacabraChallenge } from "@/pages/sidequests/ChupacabraChallenge";

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRedirector} />
      <Route path="/welcome/:hauntId" component={Welcome} />
      <Route path="/game" component={Game} />
      <Route path="/game/:hauntId" component={Game} />
      <Route path="/admin" component={Admin} />
      <Route path="/haunt-auth/:hauntId" component={HauntAuth} />
      <Route path="/haunt-admin/:hauntId" component={HauntAdmin} />

      <Route path="/analytics/:hauntId" component={Analytics} />
      <Route path="/analytics-test/:hauntId" component={AnalyticsTest} />
      <Route path="/uber-admin" component={UberAdmin} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/upload-guidelines" component={UploadGuidelines} />
      <Route path="/info" component={Info} />
      <Route path="/test-progress" component={TestProgressPage} />
      <Route path="/sidequest/monster-name-generator" component={MonsterNameGenerator} />
      <Route path="/sidequest/glory-grab" component={GloryGrab} />
      <Route path="/sidequest/cryptic-compliments" component={CrypticCompliments} />
      <Route path="/sidequest/wheel-of-misfortune" component={WheelOfMisfortune} />
      <Route path="/sidequests/monster-name-generator" component={MonsterNameGenerator} />
      <Route path="/sidequests/glory-grab" component={GloryGrab} />
      <Route path="/sidequests/cryptic-compliments" component={CrypticCompliments} />
      <Route path="/sidequests/wheel-of-misfortune" component={WheelOfMisfortune} />
      <Route path="/sidequest/chupacabra-challenge" component={ChupacabraChallenge} />
      <Route path="/sidequests/chupacabra-challenge" component={ChupacabraChallenge} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
