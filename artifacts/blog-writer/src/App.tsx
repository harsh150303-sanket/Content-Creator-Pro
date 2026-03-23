import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@workspace/replit-auth-web";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/Layout";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import ClientBlogs from "@/pages/ClientBlogs";
import BlogEditor from "@/pages/BlogEditor";
import BlogGenerator from "@/pages/BlogGenerator";
import SearchConsole from "@/pages/SearchConsole";

const queryClient = new QueryClient();

// A simple wrapper to protect routes
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, [key: string]: any }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <Layout>
      <Component {...rest} />
    </Layout>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/" /> : <Login />}
      </Route>
      
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      
      <Route path="/clients">
        <ProtectedRoute component={Clients} />
      </Route>
      
      <Route path="/clients/:clientId/blogs">
        <ProtectedRoute component={ClientBlogs} />
      </Route>
      
      <Route path="/clients/:clientId/blogs/new">
        <ProtectedRoute component={BlogEditor} />
      </Route>

      <Route path="/clients/:clientId/blogs/generate">
        <ProtectedRoute component={BlogGenerator} />
      </Route>
      
      <Route path="/clients/:clientId/blogs/:id/edit">
        <ProtectedRoute component={BlogEditor} />
      </Route>
      
      <Route path="/clients/:clientId/search-console">
        <ProtectedRoute component={SearchConsole} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
