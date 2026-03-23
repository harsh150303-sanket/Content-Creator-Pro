import { useClients } from "@/hooks/use-clients";
import { Link } from "wouter";
import { Users, FileText, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: clients, isLoading } = useClients();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  const activeClients = clients?.length || 0;
  // In a real app we'd fetch stats from a dedicated endpoint. 
  // For now we mock the aggregate stats based on client count.
  const estimatedBlogs = activeClients * 12; 

  const stats = [
    { label: "Active Clients", value: activeClients.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Total Posts Managed", value: estimatedBlogs.toString(), icon: FileText, color: "text-indigo-600", bg: "bg-indigo-100" },
    { label: "Avg. Traffic Growth", value: "+24%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-100" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your clients today.</p>
        </div>
        <Link 
          href="/clients" 
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New Client
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="premium-card p-6 rounded-2xl flex items-start justify-between group"
          >
            <div>
              <p className="text-sm font-medium text-slate-500 mb-2">{stat.label}</p>
              <h3 className="text-3xl font-display font-bold text-slate-900">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-slate-900">Recent Clients</h2>
          <Link href="/clients" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {activeClients === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No clients yet</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">Get started by adding your first client to manage their blog content and SEO.</p>
            <Link 
              href="/clients" 
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              Add Client
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients?.slice(0, 3).map(client => (
              <Link key={client.id} href={`/clients/${client.id}/blogs`}>
                <div className="premium-card p-6 rounded-2xl cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg mb-4">
                    {client.name.charAt(0)}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 truncate">{client.name}</h3>
                  <p className="text-sm text-slate-500 truncate mb-4">{client.website}</p>
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                    <span className="text-slate-500">{client.industry || "No industry"}</span>
                    <span className="text-primary font-medium flex items-center gap-1">
                      Manage <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
