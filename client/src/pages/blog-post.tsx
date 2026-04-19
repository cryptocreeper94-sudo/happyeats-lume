import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Calendar, Tag, ArrowLeft, Clock, BookOpen, Share2, User } from "lucide-react";
import { useEffect } from "react";
import { AdUnit } from "@/components/ad-unit";
import type { BlogPost } from "@shared/schema";

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["blog-post", params.slug],
    queryFn: async () => {
      const res = await fetch(`/api/blog/post/${params.slug}`);
      if (!res.ok) throw new Error("Post not found");
      return res.json();
    },
    enabled: !!params.slug,
  });

  useEffect(() => {
    if (post) {
      document.title = post.seoTitle || post.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", post.seoDescription || post.excerpt || "");
      
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", post.seoTitle || post.title);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", post.seoDescription || post.excerpt || "");
    }
    return () => {
      document.title = "Happy Eats - Delivery for Drivers";
    };
  }, [post]);

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", { 
      month: "long", day: "numeric", year: "numeric" 
    });
  };

  const estimateReadTime = (content: string) => {
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const categories: Record<string, { label: string; color: string }> = {
    trucking: { label: "Trucking", color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
    food: { label: "Food & Dining", color: "text-orange-400 border-orange-500/30 bg-orange-500/10" },
    nashville: { label: "Nashville", color: "text-rose-400 border-rose-500/30 bg-rose-500/10" },
    business: { label: "Business", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
    lifestyle: { label: "Lifestyle", color: "text-violet-400 border-violet-500/30 bg-violet-500/10" },
    delivery: { label: "Delivery", color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10" },
    tips: { label: "Tips & Tricks", color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" },
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-white/5 rounded w-3/4" />
        <div className="h-64 bg-white/5 rounded-xl" />
        <div className="space-y-3">
          <div className="h-4 bg-white/5 rounded w-full" />
          <div className="h-4 bg-white/5 rounded w-5/6" />
          <div className="h-4 bg-white/5 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="glass-panel border-white/10">
          <CardContent className="p-12 text-center">
            <BookOpen className="size-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Post Not Found</h2>
            <p className="text-muted-foreground mb-6">This article doesn't exist or has been removed.</p>
            <Link href="/blog">
              <Button className="bg-gradient-to-r from-orange-500 to-rose-500">
                <ArrowLeft className="size-4 mr-2" /> Back to Blog
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const catInfo = categories[post.category] || { label: post.category, color: "text-white border-white/30 bg-white/10" };

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-20 px-1">
      <Link href="/blog">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white" data-testid="button-back-blog">
          <ArrowLeft className="size-4 mr-2" /> Back to Blog
        </Button>
      </Link>

      <article>
        {post.featuredImageUrl && (
          <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-6">
            <img 
              src={post.featuredImageUrl} 
              alt={post.title}
              className="w-full h-full object-cover brightness-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
          </div>
        )}

        <div className="space-y-4">
          <Badge className={`text-xs ${catInfo.color}`} data-testid="badge-category">
            {catInfo.label}
          </Badge>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-white leading-tight" data-testid="text-post-title">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground border-b border-white/10 pb-4">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5 sm:size-4" /> {post.authorName || "Happy Eats"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5 sm:size-4" /> {formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5 sm:size-4" /> {estimateReadTime(post.content)} min read
            </span>
          </div>
        </div>

        <AdUnit slot="blog-article-top" format="horizontal" className="my-6" />

        <div 
          className="prose prose-sm sm:prose-base prose-invert prose-orange max-w-none
            prose-headings:font-heading prose-headings:text-white
            prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-6 sm:prose-h2:mt-8 prose-h2:mb-3 sm:prose-h2:mb-4
            prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-5 sm:prose-h3:mt-6 prose-h3:mb-2 sm:prose-h3:mb-3
            prose-p:text-gray-300 prose-p:leading-relaxed
            prose-li:text-gray-300
            prose-a:text-orange-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white
            prose-ul:space-y-1 prose-ol:space-y-1
            prose-img:rounded-lg prose-img:w-full"
          dangerouslySetInnerHTML={{ __html: post.content }}
          data-testid="blog-content"
        />

        <AdUnit slot="blog-article-bottom" format="horizontal" className="my-8" />

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-white/10">
            <Tag className="size-4 text-muted-foreground" />
            {post.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-[10px] border-white/10 text-muted-foreground">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </article>

      <Card className="glass-panel border-orange-500/20">
        <CardContent className="p-6 text-center space-y-3">
          <h3 className="font-heading font-bold text-lg text-white">Hungry on the Road?</h3>
          <p className="text-sm text-muted-foreground">Order food, parts, and services delivered right to your truck stop.</p>
          <Link href="/vendors">
            <Button className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600" data-testid="button-order-now">
              Order Now
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
