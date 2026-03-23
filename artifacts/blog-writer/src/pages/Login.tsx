import { useAuth } from "@workspace/replit-auth-web";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left side - Branding & Hero */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-slate-950 items-center justify-center p-12">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/auth-bg.png`} 
            alt="Abstract background" 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-400 flex items-center justify-center mb-8 shadow-2xl shadow-primary/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-display font-bold text-white mb-6 leading-tight">
              Content creation on autopilot.
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Manage all your clients, generate SEO-optimized blog posts using AI, and track performance with Google Search Console—all from one beautiful dashboard.
            </p>
            
            <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
              <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full rounded-full object-cover" />
                  </div>
                ))}
              </div>
              <p>Trusted by 500+ agencies</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white relative">
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-slate-900">BlogFlow</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-sm w-full mx-auto"
        >
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-3">Welcome back</h2>
            <p className="text-slate-500">Sign in to manage your clients and content.</p>
          </div>

          <button
            onClick={login}
            className="group w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all duration-200 hover:shadow-xl hover:shadow-slate-900/20 active:scale-[0.98]"
          >
            <span>Continue with Replit</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="mt-8 text-center text-sm text-slate-500">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
