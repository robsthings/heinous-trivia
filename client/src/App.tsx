import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";

import Home from "@/pages/home";
import Game from "@/pages/game";
import { Welcome } from "@/pages/Welcome";
import { RootRedirector } from "@/components/RootRedirector";
import Admin from "@/pages/admin";
import HauntAdmin from "@/pages/haunt-admin";
import HauntAuth from "@/pages/haunt-auth";

import Analytics from "@/pages/analytics";
import AnalyticsSimple from "@/pages/analytics-simple";
import AnalyticsProduction from "@/pages/analytics-production";
import UberAdmin from "@/pages/uber-admin";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import UploadGuidelines from "@/pages/upload-guidelines";
import Info from "@/pages/info";
import NotFound from "@/pages/not-found";
import { MonsterNameGenerator } from "@/sidequests/MonsterNameGenerator";
import { GloryGrab } from "@/sidequests/GloryGrab";
import { CrypticCompliments } from "@/sidequests/CrypticCompliments";
import { ChupacabraChallenge } from "@/sidequests/ChupacabraChallenge";
import { WretchedWiring } from "@/sidequests/WretchedWiring";
import { CurseCrafting } from "@/sidequests/CurseCrafting";
import { WackAChupacabra } from "@/sidequests/WackAChupacabra";
import { LabEscape } from "@/sidequests/LabEscape";



function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRedirector} />
      <Route path="/h/:hauntId" component={RootRedirector} />
      <Route path="/welcome/:hauntId" component={Welcome} />
      <Route path="/game" component={Game} />
      <Route path="/game/:hauntId" component={Game} />
      <Route path="/admin" component={Admin} />
      <Route path="/haunt-auth/:hauntId" component={HauntAuth} />
      <Route path="/haunt-admin/:hauntId" component={HauntAdmin} />
      <Route path="/analytics/:hauntId" component={AnalyticsProduction} />
      <Route path="/analytics-simple/:hauntId" component={AnalyticsSimple} />
      <Route path="/analytics-original/:hauntId" component={Analytics} />
      <Route path="/uber-admin" component={UberAdmin} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/upload-guidelines" component={UploadGuidelines} />
      <Route path="/info" component={Info} />
      <Route path="/sidequest/monster-name-generator" component={MonsterNameGenerator} />
      <Route path="/sidequest/glory-grab" component={GloryGrab} />
      <Route path="/sidequest/cryptic-compliments" component={CrypticCompliments} />
      <Route path="/sidequest/chupacabra-challenge" component={ChupacabraChallenge} />
      <Route path="/sidequest/wretched-wiring" component={WretchedWiring} />
      <Route path="/sidequest/curse-crafting" component={CurseCrafting} />
      <Route path="/sidequest/wack-a-chupacabra" component={WackAChupacabra} />
      <Route path="/sidequest/lab-escape" component={LabEscape} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #1c0b2e, #2e003e, #000000)'
      }}>
        <Router />
      </div>
    </QueryClientProvider>
  );
}

export default App;