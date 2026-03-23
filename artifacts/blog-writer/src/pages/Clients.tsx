import { useState } from "react";
import { useClients, useCreateClient } from "@/hooks/use-clients";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Globe, Building2, ExternalLink, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/utils";

const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  website: z.string().url("Must be a valid URL"),
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  toneOfVoice: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export default function Clients() {
  const { data: clients, isLoading } = useClients();
  const createClient = useCreateClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
  });

  const onSubmit = (data: ClientFormValues) => {
    createClient.mutate({ data }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        reset();
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500 mt-1">Manage all your client workspaces in one place.</p>
        </div>
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Client
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : clients?.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Building2 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-display font-bold text-slate-900 mb-2">No clients found</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">You haven't added any clients yet. Create a client to start generating SEO-optimized content for them.</p>
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            Add your first client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {clients?.map((client, i) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group premium-card bg-white rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 text-primary flex items-center justify-center font-display font-bold text-xl border border-indigo-100">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                      Added {formatDate(client.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{client.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <Globe className="w-4 h-4" />
                    <a href={client.website} target="_blank" rel="noreferrer" className="hover:text-primary truncate">
                      {client.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                  
                  {client.industry && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600">
                      <Building2 className="w-3.5 h-3.5" />
                      {client.industry}
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                  <Link 
                    href={`/clients/${client.id}/blogs`}
                    className="flex-1 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium text-center hover:bg-slate-50 hover:text-primary transition-colors shadow-sm"
                  >
                    View Workspace
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal / Dialog using simple state to avoid missing shadcn dependencies */}
      <AnimatePresence>
        {isDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsDialogOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-2xl font-display font-bold text-slate-900">Add New Client</h2>
                <p className="text-slate-500 text-sm mt-1">Enter the client details to create their workspace.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Client Name *</label>
                  <input 
                    {...register("name")}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="Acme Corp"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Website URL *</label>
                  <input 
                    {...register("website")}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="https://acme.com"
                  />
                  {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Industry</label>
                  <input 
                    {...register("industry")}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="e.g. SaaS, E-commerce, Healthcare"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Audience</label>
                    <input 
                      {...register("targetAudience")}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      placeholder="e.g. CMOs"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tone of Voice</label>
                    <input 
                      {...register("toneOfVoice")}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      placeholder="e.g. Professional yet conversational"
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={createClient.isPending}
                    className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {createClient.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create Client
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
