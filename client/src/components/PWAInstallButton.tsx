import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePWAInstall } from "@/hooks/use-pwa-install";

export function PWAInstallButton() {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const { toast } = useToast();

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        toast({
          title: "App Installed!",
          description: "Heinous Trivia has been added to your home screen.",
        });
      }
    } else {
      toast({
        title: "Add to Home Screen",
        description: "Add this to your home screen for quicker access! Look for 'Add to Home Screen' in your browser menu.",
      });
    }
  };

  // Don't show if already installed
  if (isInstalled) return null;

  return (
    <Button
      onClick={handleInstallClick}
      variant="ghost"
      size="sm"
      className="flex items-center gap-2 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
    >
      <img 
        src="/icons/icon-128.png" 
        alt="Install App" 
        className="w-5 h-5"
      />
      <span className="text-sm">Install App</span>
    </Button>
  );
}