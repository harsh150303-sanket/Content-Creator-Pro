import { useParams, useLocation } from "wouter";
import { useBlog, useUpdateBlog, useCreateBlog } from "@/hooks/use-blogs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  metaDescription: z.string().optional(),
  focusKeyword: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
});

type BlogValues = z.infer<typeof blogSchema>;

export default function BlogEditor() {
  const params = useParams();
  const clientId = parseInt(params.clientId || "0");
  const blogId = params.id ? parseInt(params.id) : null;
  const isEditing = !!blogId;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: blog, isLoading } = useBlog(clientId, blogId || 0);
  const updateBlog = useUpdateBlog();
  const createBlog = useCreateBlog();

  const { register, handleSubmit, reset, watch, formState: { isDirty } } = useForm<BlogValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      content: "",
      metaDescription: "",
      focusKeyword: "",
      status: "draft"
    }
  });

  useEffect(() => {
    if (blog && isEditing) {
      reset({
        title: blog.title,
        content: blog.content || "",
        metaDescription: blog.metaDescription || "",
        focusKeyword: blog.focusKeyword || "",
        status: blog.status as "draft" | "published" | "archived"
      });
    }
  }, [blog, isEditing, reset]);

  const onSubmit = (data: BlogValues) => {
    if (isEditing && blogId) {
      updateBlog.mutate({ clientId, id: blogId, data }, {
        onSuccess: () => {
          toast({ title: "Saved successfully", description: "Your changes have been saved." });
          reset(data); // reset isDirty
        }
      });
    } else {
      createBlog.mutate({ clientId, data }, {
        onSuccess: (newBlog) => {
          toast({ title: "Created successfully", description: "New blog post created." });
          setLocation(`/clients/${clientId}/blogs/${newBlog.id}/edit`);
        }
      });
    }
  };

  if (isEditing && isLoading) return <div className="p-8 animate-pulse text-slate-500">Loading editor...</div>;

  const contentVal = watch("content") || "";
  const wordCount = contentVal.trim() ? contentVal.trim().split(/\s+/).length : 0;

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col -m-4 md:-m-8">
      {/* Editor Toolbar */}
      <div className="h-16 shrink-0 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link 
            href={`/clients/${clientId}/blogs`}
            className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          <span className="text-sm font-medium text-slate-500 hidden sm:block">
            {isEditing ? 'Editing Post' : 'New Post'}
          </span>
          <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded">
            {wordCount} words
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isDirty && <span className="text-xs font-medium text-amber-500 hidden sm:flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Unsaved changes</span>}
          {!isDirty && isEditing && <span className="text-xs font-medium text-emerald-500 hidden sm:flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Saved</span>}
          
          <select 
            {...register("status")}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none cursor-pointer"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={updateBlog.isPending || createBlog.isPending}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-all shadow-md active:scale-95"
          >
            <Save className="w-4 h-4" />
            {updateBlog.isPending || createBlog.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Editor Main Area - Split pane layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50/50">
        
        {/* Writing Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:px-24">
          <div className="max-w-3xl mx-auto space-y-6">
            <input 
              {...register("title")}
              placeholder="Post Title..."
              className="w-full text-4xl sm:text-5xl font-display font-bold text-slate-900 bg-transparent outline-none placeholder:text-slate-300"
            />
            
            <textarea
              {...register("content")}
              placeholder="Start writing..."
              className="w-full min-h-[500px] text-lg leading-relaxed text-slate-700 bg-transparent outline-none resize-none placeholder:text-slate-300 font-sans"
            />
          </div>
        </div>

        {/* SEO Sidebar */}
        <div className="w-full lg:w-80 shrink-0 bg-white border-l border-slate-200 overflow-y-auto p-6">
          <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
            SEO Details
            {blog?.seoScore && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full ml-auto">
                {blog.seoScore}/100
              </span>
            )}
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Focus Keyword</label>
              <input 
                {...register("focusKeyword")}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Target search phrase"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Meta Description</label>
              <textarea 
                {...register("metaDescription")}
                rows={4}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                placeholder="Brief summary for search results..."
              />
              <p className="text-xs text-slate-400 mt-1 text-right">
                {watch("metaDescription")?.length || 0}/160 chars
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
