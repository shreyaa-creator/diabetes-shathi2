import { Bell, Moon, Sun, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { bengaliText } from "@/data/bengali-text";

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="glass-card sticky top-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-bengali text-teal-800 dark:text-teal-200">
                {bengaliText.appName}
              </h1>
              <p className="text-xs text-teal-600 dark:text-teal-400">
                {bengaliText.appSubtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-teal-700 dark:text-teal-300" />
              ) : (
                <Sun className="w-5 h-5 text-teal-700 dark:text-teal-300" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Bell className="w-5 h-5 text-teal-700 dark:text-teal-300" />
            </Button>
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
