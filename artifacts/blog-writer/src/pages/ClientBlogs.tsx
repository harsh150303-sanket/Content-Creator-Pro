import { useParams } from "wouter";
import { Link } from "wouter";
import { useBlogs } from "@/hooks/use-blogs";
import { useClient } from "@/hooks/use-clients";
import { Plus, Sparkles, Calendar, Search, Edit3, Trash2 } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function ClientBlogs() {
  const params = useParams();
  const clientId = parseInt(params.clientId || "0");
  
  const { data: client, isLoading: clientLoading } = useClient(clientId);
  const { data: blogs, isLoading: blogsLoading } = useBlogs(clientId);

  if (clientLoading || blogsLoading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading workspace...</div>;
  }

  if (!client) {
    return <div className="p-8 text-center text-red-500">Client not found</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header Context */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-indigo-400 text-white flex items-center justify-center font-display font-bold text-2xl shadow-inner">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">{client.name}</h1>
            <a href={client.website} target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-primary hover:underline">
              {client.website}
            </a>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Link 
            href={`/clients/${clientId}/blogs/new`}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Edit3 className="w-4 h-4" />
            Write Manually
          </Link>
          <Link 
            href={`/clients/${clientId}/blogs/generate`}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            AI Generator
          </Link>
        </div>
      </div>

      {/* Blogs List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-slate-900">Blog Posts</h2>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search posts..." 
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-64 transition-all"
            />
          </div>
        </div>

        {blogs?.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-16 text-center max-w-3xl mx-auto"
          >
            <img 
              src={`${import.meta.env.BASE_URL}images/empty-blogs.png`} 
              alt="No blogs" 
              className="w-48 h-48 mx-auto mb-6 drop-shadow-xl hover:scale-105 transition-transform duration-500" 
            />
            <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">No content yet</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Start building this client's content library by generating an SEO-optimized post with AI or writing one from scratch.</p>
            <div className="flex justify-center gap-4">
              <Link 
                href={`/clients/${clientId}/blogs/generate`}
                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-md"
              >
                <Sparkles className="w-4 h-4" /> Generate with AI
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider font-semibold text-slate-500">
                  <th className="p-4 pl-6">Title & Details</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 hidden md:table-cell">SEO Score</th>
                  <th className="p-4 hidden sm:table-cell">Date</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blogs?.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <p className="font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{blog.title}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {blog.focusKeyword && (
                          <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                            <Search className="w-3 h-3" /> {blog.focusKeyword}
                          </span>
                        )}
                        <span>{blog.wordCount || 0} words</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                        blog.status === 'published' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        blog.status === 'draft' ? "bg-slate-100 text-slate-700 border-slate-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full mr-1.5",
                          blog.status === 'published' ? "bg-emerald-500" :
                          blog.status === 'draft' ? "bg-slate-400" :
                          "bg-amber-500"
                        )} />
                        {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      {blog.seoScore ? (
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                blog.seoScore >= 80 ? "bg-emerald-500" : blog.seoScore >= 50 ? "bg-amber-500" : "bg-red-500"
                              )}
                              style={{ width: `${blog.seoScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-700">{blog.seoScore}/100</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm italic">Not scored</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-slate-500 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(blog.createdAt)}
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Link 
                        href={`/clients/${clientId}/blogs/${blog.id}/edit`}
                        className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
