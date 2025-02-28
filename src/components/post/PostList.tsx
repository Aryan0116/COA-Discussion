
import { useEffect } from "react";
import { usePostsStore } from "@/stores/postsStore";
import { PostCard } from "./PostCard";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, 
  HelpCircle, 
  Megaphone, 
  MessageSquare,
  X
} from "lucide-react";
import { PostCategory } from "@/types";

export function PostList() {
  const { 
    filteredPosts, 
    fetchPosts, 
    isLoading, 
    filterByCategory, 
    activeFilter 
  } = usePostsStore();
  
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  
  const handleRefresh = () => {
    fetchPosts();
  };

  const handleFilter = (category: PostCategory | null) => {
    filterByCategory(category);
  };
  
  if (isLoading && filteredPosts.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="bg-card border border-border rounded-lg overflow-hidden shadow-soft p-4 h-48 animate-pulse"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-16 mt-1"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (filteredPosts.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-soft p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No posts found</h3>
        <p className="text-muted-foreground mb-4">
          {activeFilter 
            ? `No ${activeFilter} posts available. Try a different category or create a new post.`
            : "Be the first to create a post and start the conversation!"}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {activeFilter && (
            <Button variant="outline" onClick={() => handleFilter(null)}>
              <X className="mr-2 h-4 w-4" />
              Clear filter
            </Button>
          )}
          <Button onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={activeFilter === "question" ? "default" : "outline"} 
            size="sm" 
            onClick={() => handleFilter(activeFilter === "question" ? null : "question")}
            className="text-sm"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Questions
          </Button>
          <Button 
            variant={activeFilter === "announcement" ? "default" : "outline"} 
            size="sm" 
            onClick={() => handleFilter(activeFilter === "announcement" ? null : "announcement")}
            className="text-sm"
          >
            <Megaphone className="mr-2 h-4 w-4" />
            Announcements
          </Button>
          <Button 
            variant={activeFilter === "discussion" ? "default" : "outline"} 
            size="sm" 
            onClick={() => handleFilter(activeFilter === "discussion" ? null : "discussion")}
            className="text-sm"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Discussions
          </Button>
          {activeFilter && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleFilter(null)}
              className="text-sm"
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
          className="text-sm"
        >
          <RefreshCw className={`mr-2 h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      
      {filteredPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
