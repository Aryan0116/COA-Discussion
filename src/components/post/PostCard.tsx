
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useAuthStore } from "@/stores/authStore";
import { usePostsStore } from "@/stores/postsStore";
import { useCommentsStore } from "@/stores/commentsStore";
import { Post, PostCategory } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, 
  MessageCircle, 
  Trash2, 
  Send,
  HelpCircle,
  Megaphone,
  MessageSquare,
  GraduationCap,
  BookOpen
} from "lucide-react";
import { CommentItem } from "./CommentItem";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { likePost, unlikePost, deletePost } = usePostsStore();
  const { comments, fetchComments, addComment } = useCommentsStore();
  
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const postComments = comments[post.id] || [];
  const isLiked = user ? post.likes.includes(user.id) : false;
  const isAuthor = user?.id === post.user.id;
  
  const toggleComments = async () => {
    if (!showComments) {
      // Load comments when opening
      await fetchComments(post.id);
    }
    setShowComments(!showComments);
  };
  
  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      return;
    }
    
    if (isLiked) {
      await unlikePost(post.id);
    } else {
      await likePost(post.id);
    }
  };
  
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !newComment.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addComment(post.id, newComment);
      setNewComment("");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeletePost = async () => {
    await deletePost(post.id);
    setConfirmDelete(false);
  };

  const getCategoryIcon = (category: PostCategory) => {
    switch (category) {
      case "question":
        return <HelpCircle className="h-3 w-3 mr-1" />;
      case "announcement":
        return <Megaphone className="h-3 w-3 mr-1" />;
      case "discussion":
        return <MessageSquare className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const getCategoryColor = (category: PostCategory) => {
    switch (category) {
      case "question":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "announcement":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "discussion":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "";
    }
  };

  const getRoleBadge = () => {
    if (post.user.role === "teacher") {
      return (
        <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
          <BookOpen className="h-3 w-3 mr-1" />
          Teacher
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100 dark:border-blue-800">
          <GraduationCap className="h-3 w-3 mr-1" />
          Student
        </Badge>
      );
    }
  };
  
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-soft transition-all hover:shadow-medium animate-fade-in">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={post.user.avatar} alt={post.user.username} />
            <AvatarFallback>{post.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center">
              <h3 className="font-medium">{post.user.username}</h3>
              {getRoleBadge()}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        {isAuthor && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setConfirmDelete(true)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      {/* Post Content */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">{post.title}</h2>
          <Badge className={`${getCategoryColor(post.category)} flex items-center`}>
            {getCategoryIcon(post.category)}
            {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
          </Badge>
        </div>
        <p className="text-sm mb-4">{post.content}</p>
        
        {post.image && (
          <div className="mb-4">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-auto rounded-md object-cover max-h-96"
            />
          </div>
        )}
      </div>
      
      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center space-x-1 ${
              isLiked ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground'
            }`}
            onClick={handleLikeToggle}
            disabled={!isAuthenticated}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{post.likes.length}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1 text-muted-foreground"
            onClick={toggleComments}
          >
            <MessageCircle className="h-5 w-5" />
            <span>{postComments.length}</span>
          </Button>
        </div>
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-border p-4 bg-muted/30 space-y-4">
          {/* Comments List */}
          <div className="space-y-4">
            {postComments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              postComments.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  postId={post.id}
                />
              ))
            )}
          </div>
          
          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="flex items-start space-x-2">
              <Avatar className="flex-shrink-0">
                <AvatarImage src={user?.avatar} alt={user?.username} />
                <AvatarFallback>{user?.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-grow">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="resize-none bg-background"
                  rows={1}
                  required
                />
              </div>
              
              <Button
                type="submit"
                size="icon"
                className="flex-shrink-0"
                disabled={isSubmitting || !newComment.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              Please log in to comment on this post.
            </p>
          )}
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              post and all associated comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
