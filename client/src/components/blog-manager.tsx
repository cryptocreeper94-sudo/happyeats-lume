import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { 
  BookOpen, Plus, Sparkles, Pencil, Trash2, Eye, EyeOff, 
  Send, Loader2, Calendar, Tag, FileText, ArrowRight, Bot, RefreshCw
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { BlogPost } from "@shared/schema";

type EditorMode = "list" | "create" | "edit";

interface GeneratedContent {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
}

export function BlogManager() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const adminPin = user?.pin || "";
  const [mode, setMode] = useState<EditorMode>("list");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [aiTopic, setAiTopic] = useState("");
  const [aiCategory, setAiCategory] = useState("");
  const [aiTone, setAiTone] = useState("");
  const [showAiPanel, setShowAiPanel] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "general",
    tags: [] as string[],
    tagInput: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [] as string[],
    keywordInput: "",
    featuredImageUrl: "",
    status: "draft",
    authorType: "manual" as string,
    authorName: "Happy Eats",
  });

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const res = await fetch("/api/blog/admin/all", {
        headers: { "x-admin-pin": adminPin },
      });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
    enabled: !!adminPin,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/blog/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-pin": adminPin },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      resetForm();
      setMode("list");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`/api/blog/admin/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-pin": adminPin },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      resetForm();
      setMode("list");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/blog/admin/${id}`, { 
        method: "DELETE",
        headers: { "x-admin-pin": adminPin },
      });
      if (!res.ok) throw new Error("Failed to delete post");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (params: { topic: string; category?: string; tone?: string }) => {
      const res = await fetch("/api/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-pin": adminPin },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("Failed to generate content");
      return res.json() as Promise<GeneratedContent>;
    },
    onSuccess: (data) => {
      setForm(prev => ({
        ...prev,
        title: data.title || prev.title,
        slug: data.slug || prev.slug,
        excerpt: data.excerpt || prev.excerpt,
        content: data.content || prev.content,
        category: data.category || prev.category,
        tags: data.tags || prev.tags,
        seoTitle: data.seoTitle || prev.seoTitle,
        seoDescription: data.seoDescription || prev.seoDescription,
        seoKeywords: data.seoKeywords || prev.seoKeywords,
        authorType: "ai",
      }));
      setShowAiPanel(false);
    },
  });

  const resetForm = () => {
    setForm({
      title: "", slug: "", excerpt: "", content: "",
      category: "general", tags: [], tagInput: "",
      seoTitle: "", seoDescription: "", seoKeywords: [], keywordInput: "",
      featuredImageUrl: "", status: "draft", authorType: "manual", authorName: "Happy Eats",
    });
    setEditingPost(null);
  };

  const openEditor = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setForm({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: post.content,
        category: post.category,
        tags: post.tags || [],
        tagInput: "",
        seoTitle: post.seoTitle || "",
        seoDescription: post.seoDescription || "",
        seoKeywords: post.seoKeywords || [],
        keywordInput: "",
        featuredImageUrl: post.featuredImageUrl || "",
        status: post.status,
        authorType: post.authorType,
        authorName: post.authorName || "Happy Eats",
      });
      setMode("edit");
    } else {
      resetForm();
      setMode("create");
    }
  };

  const handleSave = () => {
    const { tagInput, keywordInput, ...rest } = form;
    const payload = {
      ...rest,
      publishedAt: rest.status === "published" ? new Date().toISOString() : undefined,
    };

    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);
  };

  const addTag = () => {
    if (form.tagInput.trim() && !form.tags.includes(form.tagInput.trim())) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, prev.tagInput.trim()], tagInput: "" }));
    }
  };

  const addKeyword = () => {
    if (form.keywordInput.trim() && !form.seoKeywords.includes(form.keywordInput.trim())) {
      setForm(prev => ({ ...prev, seoKeywords: [...prev.seoKeywords, prev.keywordInput.trim()], keywordInput: "" }));
    }
  };

  const categories = [
    { id: "general", label: "General" },
    { id: "trucking", label: "Trucking" },
    { id: "food", label: "Food & Dining" },
    { id: "nashville", label: "Nashville" },
    { id: "business", label: "Business" },
    { id: "lifestyle", label: "Lifestyle" },
    { id: "delivery", label: "Delivery" },
    { id: "tips", label: "Tips & Tricks" },
  ];

  const statusColors: Record<string, string> = {
    draft: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    published: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    scheduled: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  };

  if (mode === "list") {
    return (
      <Card className="glass-panel border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-white space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="size-4 text-orange-400" /> Blog Manager
            </span>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => { setShowAiPanel(true); openEditor(); }}
                className="bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs flex-1 sm:flex-none"
                data-testid="button-ai-generate-post"
              >
                <Bot className="size-3 mr-1" /> AI Generate
              </Button>
              <Button 
                size="sm" 
                onClick={() => openEditor()}
                className="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs flex-1 sm:flex-none"
                data-testid="button-create-post"
              >
                <Plus className="size-3 mr-1" /> New Post
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <div className="text-center py-8 text-muted-foreground">Loading posts...</div>}
          
          {!isLoading && posts.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="size-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No blog posts yet. Create one or generate with AI!</p>
            </div>
          )}

          {posts.map(post => (
            <div 
              key={post.id} 
              className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-all"
              data-testid={`blog-item-${post.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white text-sm line-clamp-1">{post.title}</h4>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <Badge className={`text-[9px] shrink-0 ${statusColors[post.status] || statusColors.draft}`}>
                      {post.status}
                    </Badge>
                    {post.authorType === "ai" && (
                      <Badge className="text-[9px] shrink-0 bg-violet-500/20 text-violet-300 border-violet-500/30">
                        <Bot className="size-2.5 mr-0.5" /> AI
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground truncate">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button 
                    size="sm" variant="ghost" 
                    onClick={() => openEditor(post)}
                    className="size-9 sm:size-8 p-0 text-muted-foreground hover:text-white"
                    data-testid={`button-edit-${post.id}`}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button 
                    size="sm" variant="ghost"
                    onClick={() => {
                      const newStatus = post.status === "published" ? "draft" : "published";
                      updateMutation.mutate({ id: post.id, data: { status: newStatus } });
                    }}
                    className="size-9 sm:size-8 p-0 text-muted-foreground hover:text-white"
                    data-testid={`button-toggle-${post.id}`}
                  >
                    {post.status === "published" ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </Button>
                  <Button 
                    size="sm" variant="ghost"
                    onClick={() => { if (confirm("Delete this post?")) deleteMutation.mutate(post.id); }}
                    className="size-9 sm:size-8 p-0 text-muted-foreground hover:text-red-400"
                    data-testid={`button-delete-${post.id}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-white space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <span className="flex items-center gap-2">
            <FileText className="size-4 text-orange-400" /> 
            {editingPost ? "Edit Post" : "Create Post"}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => { resetForm(); setMode("list"); setShowAiPanel(false); }} className="text-xs flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={() => setShowAiPanel(!showAiPanel)}
              className="bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs flex-1 sm:flex-none"
              data-testid="button-toggle-ai"
            >
              <Bot className="size-3 mr-1" /> {showAiPanel ? "Hide AI" : "AI Assist"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAiPanel && (
          <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/20 space-y-3">
            <h4 className="text-sm font-semibold text-violet-300 flex items-center gap-2">
              <Sparkles className="size-4" /> AI Content Generator
            </h4>
            <Input
              data-testid="input-ai-topic"
              placeholder="What should this post be about? (e.g., 'Best Nashville food trucks for lunch')"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              className="bg-white/5 border-white/10"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                data-testid="select-ai-category"
                value={aiCategory}
                onChange={(e) => setAiCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-sm text-white"
              >
                <option value="">Any Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <select
                data-testid="select-ai-tone"
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2.5 text-sm text-white"
              >
                <option value="">Default Tone</option>
                <option value="casual">Casual & Fun</option>
                <option value="professional">Professional</option>
                <option value="southern">Southern Charm</option>
                <option value="informative">Informative</option>
                <option value="humorous">Humorous</option>
              </select>
            </div>
            <Button
              data-testid="button-generate-ai"
              onClick={() => generateMutation.mutate({ topic: aiTopic, category: aiCategory, tone: aiTone })}
              disabled={!aiTopic.trim() || generateMutation.isPending}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-500"
            >
              {generateMutation.isPending ? (
                <><Loader2 className="size-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="size-4 mr-2" /> Generate Blog Post</>
              )}
            </Button>
            {generateMutation.isError && (
              <p className="text-xs text-red-400">Failed to generate. Please try again.</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground uppercase">Title</label>
            <Input
              data-testid="input-post-title"
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm(prev => ({ ...prev, title, slug: prev.slug || generateSlug(title) }));
              }}
              placeholder="Post title..."
              className="bg-white/5 border-white/10"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground uppercase">URL Slug</label>
            <Input
              data-testid="input-post-slug"
              value={form.slug}
              onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="url-friendly-slug"
              className="bg-white/5 border-white/10"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground uppercase">Excerpt / Summary</label>
          <Textarea
            data-testid="input-post-excerpt"
            value={form.excerpt}
            onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
            placeholder="Brief summary for search results and social sharing..."
            rows={2}
            className="bg-white/5 border-white/10"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground uppercase">Content (HTML)</label>
          <Textarea
            data-testid="input-post-content"
            value={form.content}
            onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
            placeholder="<p>Write your post content here...</p>"
            rows={12}
            className="bg-white/5 border-white/10 font-mono text-xs"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground uppercase">Category</label>
            <select
              data-testid="select-post-category"
              value={form.category}
              onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white"
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground uppercase">Status</label>
            <select
              data-testid="select-post-status"
              value={form.status}
              onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground uppercase">Author</label>
            <Input
              data-testid="input-post-author"
              value={form.authorName}
              onChange={(e) => setForm(prev => ({ ...prev, authorName: e.target.value }))}
              placeholder="Author name"
              className="bg-white/5 border-white/10"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground uppercase">Tags</label>
          <div className="flex gap-2">
            <Input
              data-testid="input-post-tag"
              value={form.tagInput}
              onChange={(e) => setForm(prev => ({ ...prev, tagInput: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              placeholder="Add tag..."
              className="bg-white/5 border-white/10"
            />
            <Button size="sm" variant="outline" onClick={addTag} className="border-white/10">
              <Plus className="size-3" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {form.tags.map(tag => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="text-[10px] border-white/10 cursor-pointer hover:border-red-500/30 hover:text-red-400"
                onClick={() => setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}
              >
                {tag} ×
              </Badge>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-3">
          <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <Tag className="size-3" /> SEO Settings
          </h4>
          <Input
            data-testid="input-seo-title"
            value={form.seoTitle}
            onChange={(e) => setForm(prev => ({ ...prev, seoTitle: e.target.value }))}
            placeholder="SEO Page Title (50-60 chars)"
            className="bg-white/5 border-white/10 text-xs"
          />
          <Textarea
            data-testid="input-seo-description"
            value={form.seoDescription}
            onChange={(e) => setForm(prev => ({ ...prev, seoDescription: e.target.value }))}
            placeholder="Meta Description (150-160 chars)"
            rows={2}
            className="bg-white/5 border-white/10 text-xs"
          />
          <div className="flex gap-2">
            <Input
              data-testid="input-seo-keyword"
              value={form.keywordInput}
              onChange={(e) => setForm(prev => ({ ...prev, keywordInput: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
              placeholder="Add SEO keyword..."
              className="bg-white/5 border-white/10 text-xs"
            />
            <Button size="sm" variant="outline" onClick={addKeyword} className="border-white/10">
              <Plus className="size-3" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {form.seoKeywords.map(kw => (
              <Badge 
                key={kw} 
                variant="outline" 
                className="text-[9px] border-emerald-500/20 text-emerald-400 cursor-pointer hover:border-red-500/30 hover:text-red-400"
                onClick={() => setForm(prev => ({ ...prev, seoKeywords: prev.seoKeywords.filter(k => k !== kw) }))}
              >
                {kw} ×
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground uppercase">Featured Image URL</label>
          <Input
            data-testid="input-featured-image"
            value={form.featuredImageUrl}
            onChange={(e) => setForm(prev => ({ ...prev, featuredImageUrl: e.target.value }))}
            placeholder="https://example.com/image.jpg"
            className="bg-white/5 border-white/10"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleSave}
            disabled={!form.title || !form.slug || !form.content || createMutation.isPending || updateMutation.isPending}
            className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600"
            data-testid="button-save-post"
          >
            {(createMutation.isPending || updateMutation.isPending) ? (
              <><Loader2 className="size-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              <><Send className="size-4 mr-2" /> {editingPost ? "Update Post" : "Save Post"}</>
            )}
          </Button>
          {!editingPost && (
            <Button 
              variant="outline"
              onClick={() => {
                setForm(prev => ({ ...prev, status: "published" }));
                setTimeout(handleSave, 0);
              }}
              disabled={!form.title || !form.slug || !form.content}
              className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              data-testid="button-publish-post"
            >
              <Eye className="size-4 mr-2" /> Save & Publish
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
