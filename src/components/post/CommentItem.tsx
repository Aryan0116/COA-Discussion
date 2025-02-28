
import { formatDistanceToNow } from "date-fns";
import { useAuthStore } from "@/stores/authStore";
import { useCommentsStore } from "@/stores/commentsStore";
import { Comment } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, GraduationCap, BookOpen } from "lucide-react";
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
import { useState } from "react";

interface CommentItemProps {
  comment: Comment;
  postId: string;
}

export function CommentItem({ comment, postId }: CommentItemProps) {
  const { user } = useAuthStore();
  const { deleteComment } = useCommentsStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const isAuthor = user?.id === comment.user.id;
  
  const handleDeleteComment = async () => {
    await deleteComment(comment.id, postId);
    setConfirmDelete(false);
  };

  const getRoleBadge = () => {
    if (comment.user.role === "teacher") {
      return (
        <Badge variant="outline" className="ml-2 text-xs px-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
          <BookOpen className="h-2 w-2 mr-1" />
          Teacher
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="ml-2 text-xs px-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100 dark:border-blue-800">
          <GraduationCap className="h-2 w-2 mr-1" />
          Student
        </Badge>
      );
    }
  };
  
  return (
    <div className="flex space-x-3 animate-fade-in">
      <Avatar className="flex-shrink-0 h-8 w-8">
        <AvatarImage src={comment.user.avatar} alt={comment.user.username} />
        <AvatarFallback>{comment.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      
      <div className="flex-grow">
        <div className="bg-background rounded-md p-3 shadow-soft">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <h4 className="font-medium text-sm">{comment.user.username}</h4>
                {getRoleBadge()}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </p>
            </div>
            
            {isAuthor && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setConfirmDelete(true)}
                className="h-6 w-6 text-muted-foreground hover:text-destructive -mt-1 -mr-1"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <p className="mt-1 text-sm">{comment.content}</p>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
