
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Navbar } from "@/components/layout/Navbar";
import { CreatePostForm } from "@/components/post/CreatePostForm";
import { PostList } from "@/components/post/PostList";
import { Button } from "@/components/ui/button";
import { PlusCircle, X, Cpu } from "lucide-react";

const Index = () => {
  const { isAuthenticated } = useAuthStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
  };
  
  const handlePostSuccess = () => {
    setShowCreateForm(false);
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-4xl">
        <div className="space-y-6">
          {/* Heading */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex items-center justify-center mb-2">
              <Cpu className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-3xl font-display font-bold">COA Hub</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A discussion forum for Computer Organization and Architecture
            </p>
          </div>
          
          {/* Create Post Button (Mobile) */}
          {isAuthenticated && (
            <div className="md:hidden">
              <Button 
                onClick={toggleCreateForm}
                className="w-full"
                variant={showCreateForm ? "secondary" : "default"}
              >
                {showCreateForm ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Post
                  </>
                )}
              </Button>
            </div>
          )}
          
          {/* Main Content Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column (Desktop) - Create Post Form */}
            {isAuthenticated && (
              <div className="hidden md:block md:col-span-1">
                <div className="sticky top-24">
                  <CreatePostForm onSuccess={handlePostSuccess} />
                </div>
              </div>
            )}
            
            {/* Mobile Create Post Form (Conditional) */}
            {isAuthenticated && showCreateForm && (
              <div className="md:hidden">
                <CreatePostForm onSuccess={handlePostSuccess} />
              </div>
            )}
            
            {/* Right Column - Post List */}
            <div className={`${isAuthenticated ? 'md:col-span-2' : 'md:col-span-3'}`}>
              <PostList />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-card border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} COA Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
