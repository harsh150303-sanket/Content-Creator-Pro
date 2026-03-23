import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  FileText,
  LineChart,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Extract client ID from URL if we are in a client context
  const clientMatch = location.match(/^\/clients\/(\d+)/);
  const activeClientId = clientMatch ? clientMatch[1] : null;

  const mainNav = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: Users },
  ];

  const clientNav = activeClientId ? [
    { name: "Blog Posts", href: `/clients/${activeClientId}/blogs`, icon: FileText },
    { name: "AI Writer", href: `/clients/${activeClientId}/blogs/generate`, icon: Sparkles },
    { name: "Search Console", href: `/clients/${activeClientId}/search-console`, icon: LineChart },
    { name: "Settings", href: `/clients/${activeClientId}/settings`, icon: Settings },
  ] : [];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight">BlogFlow</span>
      </div>

      <div className="px-4 py-2 flex-1 overflow-y-auto">
        <div className="space-y-1 mb-8">
          <p className="px-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">Main Menu</p>
          {mainNav.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href) && !activeClientId);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-sidebar-foreground/50")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {activeClientId && (
          <div className="space-y-1 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="px-2 mb-2 flex items-center gap-2">
              <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">Client Context</p>
              <div className="h-px bg-sidebar-border flex-1"></div>
            </div>
            {clientNav.map((item) => {
              const isActive = location === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-sidebar-foreground/50")} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-sidebar-accent/50 mb-3">
          {user?.profileImageUrl ? (
            <img src={user.profileImageUrl} alt="Profile" className="w-9 h-9 rounded-full bg-sidebar-border object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.firstName?.charAt(0) || "U"}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 shrink-0 border-r border-sidebar-border sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-sidebar z-50 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="h-16 border-b border-border/50 bg-white/50 backdrop-blur-md sticky top-0 z-30 flex items-center px-4 md:px-8 gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 -ml-2 rounded-lg text-muted-foreground hover:bg-slate-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
