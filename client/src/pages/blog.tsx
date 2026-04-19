import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Calendar, Tag, ArrowRight, BookOpen, Clock, Loader2 } from "lucide-react";
import { useState } from "react";
import { AdUnit } from "@/components/ad-unit";
import type { BlogPost } from "@shared/schema";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const res = await fetch("/api/blog");
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const categories = [
    { id: "trucking", label: "Trucking", color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
    { id: "food", label: "Food & Dining", color: "text-orange-400 border-orange-500/30 bg-orange-500/10" },
    { id: "nashville", label: "Nashville", color: "text-rose-400 border-rose-500/30 bg-rose-500/10" },
    { id: "business", label: "Business", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
    { id: "lifestyle", label: "Lifestyle", color: "text-violet-400 border-violet-500/30 bg-violet-500/10" },
    { id: "delivery", label: "Delivery", color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10" },
    { id: "tips", label: "Tips & Tricks", color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" },
  ];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  return (
    <div className="space-y-6 pb-20">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-orange-900/40 via-rose-900/30 to-violet-900/40 border border-white/[0.06] p-6 md:p-10 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(249,115,22,0.12),transparent_60%)]" />
        <div className="relative space-y-3">
          <Badge className="bg-gradient-to-r from-orange-500/20 to-rose-500/20 text-orange-300 border-orange-500/30">
            <BookOpen className="size-3 mr-1" /> Happy Eats Blog
          </Badge>
          <h1 className="text-3xl md:text-4xl font-heading font-bold">
            <span className="bg-gradient-to-r from-white via-white to-orange-200 bg-clip-text text-transparent">
              Road Stories & Food Finds
            </span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Tips, stories, and guides for drivers on the road. From the best Nashville eats to trucker lifestyle hacks.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            data-testid="input-blog-search"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/[0.03] border-white/[0.06] backdrop-blur-xl rounded-xl"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        <button
          data-testid="button-category-all"
          onClick={() => setSelectedCategory(null)}
          className={`text-xs px-3 py-2 sm:py-1.5 rounded-full border transition-all ${
            !selectedCategory ? "bg-orange-500/20 text-orange-300 border-orange-500/30" : "text-muted-foreground border-white/10 hover:border-white/20"
          }`}
        >
          All Posts
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            data-testid={`button-category-${cat.id}`}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`text-xs px-3 py-2 sm:py-1.5 rounded-full border transition-all ${
              selectedCategory === cat.id ? cat.color : "text-muted-foreground border-white/10 hover:border-white/20"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <AdUnit slot="blog-top" format="horizontal" className="my-4" />

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-8 animate-spin text-orange-400" />
          <span className="ml-3 text-muted-foreground">Loading articles...</span>
        </div>
      )}

      {!isLoading && filteredPosts.length === 0 && (
        <Card className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl">
          <CardContent className="p-12 text-center">
            <BookOpen className="size-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {posts.length === 0 ? "No blog posts yet" : "No matching posts"}
            </h3>
            <p className="text-muted-foreground">
              {posts.length === 0 
                ? "Check back soon for fresh content about trucking, food, and Nashville life!"
                : "Try adjusting your search or category filters."}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post, index) => (
          <div key={post.id}>
            <Link href={`/blog/${post.slug}`}>
              <Card 
                data-testid={`card-blog-${post.id}`}
                className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl hover:border-orange-500/30 transition-all group cursor-pointer overflow-hidden h-full"
              >
                {post.featuredImageUrl && (
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <img 
                      src={post.featuredImageUrl} 
                      alt={post.title}
                      className="w-full h-full object-cover brightness-110 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                    <Badge className={`absolute top-3 left-3 text-[10px] ${
                      categories.find(c => c.id === post.category)?.color || "text-white border-white/30 bg-white/10"
                    }`}>
                      {categories.find(c => c.id === post.category)?.label || post.category}
                    </Badge>
                  </div>
                )}
                {!post.featuredImageUrl && (
                  <div className="relative h-40 sm:h-48 bg-gradient-to-br from-orange-500/20 via-rose-500/10 to-violet-500/20 flex items-center justify-center">
                    <BookOpen className="size-12 text-orange-400/30" />
                    <Badge className={`absolute top-3 left-3 text-[10px] ${
                      categories.find(c => c.id === post.category)?.color || "text-white border-white/30 bg-white/10"
                    }`}>
                      {categories.find(c => c.id === post.category)?.label || post.category}
                    </Badge>
                  </div>
                )}
                <CardContent className="p-4 sm:p-5 space-y-2 sm:space-y-3">
                  <h3 className="font-heading font-bold text-base sm:text-lg text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" /> {formatDate(post.publishedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" /> {estimateReadTime(post.content)} min read
                      </span>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>
            {index === 2 && filteredPosts.length > 3 && (
              <div className="mt-6">
                <AdUnit slot="blog-mid" format="horizontal" />
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredPosts.length > 0 && (
        <AdUnit slot="blog-bottom" format="horizontal" className="mt-6" />
      )}
    </div>
  );
}
