import { useParams, useLocation } from "wouter";
import { useClient } from "@/hooks/use-clients";
import { useGenerateBlog } from "@/hooks/use-blogs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sparkles, ArrowLeft, Loader2, Target, Type, FileText, Settings2 } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const generateSchema = z.object({
  topic: z.string().min(5, "Topic is required and should be descriptive"),
  focusKeyword: z.string().optional(),
  targetWordCount: z.coerce.number().min(300).max(3000).default(1000),
  additionalInstructions: z.string().optional(),
});

type GenerateValues = z.infer<typeof generateSchema>;

export default function BlogGenerator() {
  const params = useParams();
  const clientId = parseInt(params.clientId || "0");
  const [, setLocation] = useLocation();
  
  const { data: client } = useClient(clientId);
  const generateBlog = useGenerateBlog();

  const { register, handleSubmit, formState: { errors } } = useForm<GenerateValues>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      targetWordCount: 1000
    }
  });

  const onSubmit = (data: GenerateValues) => {
    generateBlog.mutate({ clientId, data }, {
      onSuccess: (newBlog) => {
        setLocation(`/clients/${clientId}/blogs/${newBlog.id}/edit`);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link 
        href={`/clients/${clientId}/blogs`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to workspace
      </Link>

      <div className="bg-gradient-to-br from-indigo-900 via-primary to-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-10">
          <Sparkles className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-sm font-medium mb-4 border border-white/10">
            <Sparkles className="w-4 h-4" /> AI Powered
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">Generate Content</h1>
          <p className="text-indigo-100 text-lg max-w-xl">
            Let AI write a highly optimized, engaging blog post tailored to {client?.name || "your client"}'s brand voice.
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                <FileText className="w-4 h-4 text-primary" /> What should the post be about? *
              </label>
              <textarea 
                {...register("topic")}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none text-base"
                placeholder="e.g., The ultimate guide to remote work productivity for software engineering teams..."
              />
              {errors.topic && <p className="text-red-500 text-xs mt-1.5">{errors.topic.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                  <Target className="w-4 h-4 text-primary" /> Focus Keyword
                </label>
                <input 
                  {...register("focusKeyword")}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  placeholder="e.g., remote work productivity"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                  <Type className="w-4 h-4 text-primary" /> Target Word Count
                </label>
                <input 
                  type="number"
                  {...register("targetWordCount")}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
                {errors.targetWordCount && <p className="text-red-500 text-xs mt-1.5">{errors.targetWordCount.message}</p>}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                <Settings2 className="w-4 h-4 text-primary" /> Additional Instructions
              </label>
              <textarea 
                {...register("additionalInstructions")}
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                placeholder={`Any specific angles to cover? Formatting preferences?\nThe AI will already use ${client?.name}'s brand voice.`}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={generateBlog.isPending}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {generateBlog.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                  <span className="relative z-10">Generating Magic...</span>
                  <div className="absolute inset-0 bg-indigo-500 animate-pulse" />
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform" />
                  <span className="relative z-10">Generate Blog Post</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
