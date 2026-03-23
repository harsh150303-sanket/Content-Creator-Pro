import { useParams } from "wouter";
import { useClient } from "@/hooks/use-clients";
import { useSearchConsoleKeywords, useConnectSearchConsole } from "@/hooks/use-search-console";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LineChart, Link as LinkIcon, BarChart3, TrendingUp, MousePointerClick, Eye, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const connectSchema = z.object({
  siteUrl: z.string().url("Must be a valid URL starting with https://")
});

export default function SearchConsole() {
  const params = useParams();
  const clientId = parseInt(params.clientId || "0");
  
  const { data: client, isLoading: clientLoading } = useClient(clientId);
  const { data: keywords, isLoading: keywordsLoading } = useSearchConsoleKeywords(clientId);
  const connect = useConnectSearchConsole();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(connectSchema),
    defaultValues: { siteUrl: client?.website || "" }
  });

  const onSubmit = (data: { siteUrl: string }) => {
    connect.mutate({ clientId, data });
  };

  if (clientLoading) return <div className="p-8 animate-pulse text-slate-500">Loading...</div>;

  if (!client?.searchConsoleConnected) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <Link href={`/clients/${clientId}/blogs`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to workspace
        </Link>
        
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center shadow-xl shadow-slate-200/50">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-100 rotate-3">
            <LineChart className="w-10 h-10 text-blue-500 -rotate-3" />
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-3">Connect Search Console</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Link Google Search Console to import real keyword data and track how well your generated content performs in search.
          </p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto text-left space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Property URL</label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  {...register("siteUrl")}
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  placeholder="https://example.com"
                />
              </div>
              {errors.siteUrl && <p className="text-red-500 text-xs mt-1.5">{errors.siteUrl.message as string}</p>}
            </div>
            
            <button
              type="submit"
              disabled={connect.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {connect.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Connect Account"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate totals from mock data
  const totalClicks = keywords?.reduce((sum, k) => sum + k.clicks, 0) || 0;
  const totalImpressions = keywords?.reduce((sum, k) => sum + k.impressions, 0) || 0;
  const avgPosition = keywords?.length ? (keywords.reduce((sum, k) => sum + k.position, 0) / keywords.length).toFixed(1) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <LineChart className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Search Performance</h1>
          <p className="text-slate-500">{client.website}</p>
        </div>
      </div>

      {keywordsLoading ? (
        <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <MousePointerClick className="w-4 h-4 text-blue-500" /> Clicks
              </div>
              <p className="text-3xl font-display font-bold text-slate-900">{totalClicks.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Eye className="w-4 h-4 text-purple-500" /> Impressions
              </div>
              <p className="text-3xl font-display font-bold text-slate-900">{totalImpressions.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <BarChart3 className="w-4 h-4 text-emerald-500" /> Avg Position
              </div>
              <p className="text-3xl font-display font-bold text-slate-900">{avgPosition}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Top Queries</h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-xs uppercase tracking-wider font-semibold text-slate-500">
                  <th className="p-4 pl-6">Keyword</th>
                  <th className="p-4 text-right">Clicks</th>
                  <th className="p-4 text-right">Impressions</th>
                  <th className="p-4 text-right">CTR</th>
                  <th className="p-4 pr-6 text-right">Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {keywords?.map((row, i) => (
                  <motion.tr 
                    key={row.keyword}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4 pl-6 font-medium text-slate-900">{row.keyword}</td>
                    <td className="p-4 text-right font-mono text-sm">{row.clicks.toLocaleString()}</td>
                    <td className="p-4 text-right font-mono text-sm text-slate-500">{row.impressions.toLocaleString()}</td>
                    <td className="p-4 text-right font-mono text-sm">{(row.ctr * 100).toFixed(1)}%</td>
                    <td className="p-4 pr-6 text-right">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm">
                        {row.position.toFixed(1)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
