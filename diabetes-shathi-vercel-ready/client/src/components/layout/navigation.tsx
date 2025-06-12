import { useLocation } from "wouter";
import { Home, Droplet, Pill, Utensils, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bengaliText } from "@/data/bengali-text";

const navItems = [
  { path: "/", icon: Home, label: bengaliText.dashboard },
  { path: "/glucose", icon: Droplet, label: bengaliText.glucose },
  { path: "/medicine", icon: Pill, label: bengaliText.medicine },
  { path: "/food", icon: Utensils, label: bengaliText.food },
  { path: "/reports", icon: BarChart3, label: bengaliText.reports },
];

export function Navigation() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="glass-card border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => setLocation(item.path)}
                className={`nav-tab ${isActive ? 'active' : ''} whitespace-nowrap`}
              >
                <Icon className="w-4 h-4 mr-2" />
                <span className="font-bengali">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
