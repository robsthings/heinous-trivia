import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Game from "@/pages/game";
import Admin from "@/pages/admin";
import HauntAdmin from "@/pages/haunt-admin";
import HauntAuth from "@/pages/haunt-auth";
import HostPanel from "@/pages/host-panel";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import UploadGuidelines from "@/pages/upload-guidelines";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={(params) => {
        // Check if there's a haunt parameter in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const haunt = urlParams.get('haunt');
        
        // If haunt parameter exists, show the game
        if (haunt) {
          return <Game />;
        }
        
        // Otherwise show the homepage
        return <Home />;
      }} />
      <Route path="/game" component={Game} />
      <Route path="/admin" component={Admin} />
      <Route path="/haunt-auth/:hauntId" component={HauntAuth} />
      <Route path="/haunt-admin/:hauntId" component={HauntAdmin} />
      <Route path="/host-panel/:hauntId" component={HostPanel} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/upload-guidelines" component={UploadGuidelines} />
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
