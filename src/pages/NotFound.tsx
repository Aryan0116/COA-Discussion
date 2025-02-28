
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Cpu } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center space-y-6 max-w-lg px-6 animate-fade-in">
          <h1 className="text-8xl font-bold text-primary/20">404</h1>
          <div className="flex justify-center items-center">
            <Cpu className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-3xl font-display font-bold">Page Not Found</h2>
          </div>
          <p className="text-muted-foreground">
            Sorry, we couldn't find the page you were looking for. It might have been
            moved, deleted, or never existed in the first place.
          </p>
          <div>
            <Link to="/">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <footer className="bg-card border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} COA Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
