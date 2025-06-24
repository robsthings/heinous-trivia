import { useToast } from "@/hooks/use-toast";
import { usePWAInstall } from "@/hooks/use-pwa-install";

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isMobile, install } = usePWAInstall();
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

  // Don't show if already installed or not on mobile
  if (isInstalled || !isMobile) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="text-xs  hover:text-orange-400 transition-colors" className="text-gray-400"
      title="Install app to home screen"
    >
      📱 Install App
    </button>
  );
}