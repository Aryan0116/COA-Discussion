
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Navbar } from "@/components/layout/Navbar";
import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LogOut, Moon, Sun, Laptop } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleClearData = () => {
    // This is a mock function since we're using localStorage
    // In a real app, this would clear user data from the database
    toast.success("Local data cleared successfully");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-4xl">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how COA Hub looks on your device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="mb-4 text-lg font-medium">Theme Preference</h3>
                  <RadioGroup 
                    defaultValue={theme} 
                    onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
                    className="flex flex-col space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light" className="flex items-center cursor-pointer">
                        <Sun className="h-4 w-4 mr-2" />
                        Light
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark" className="flex items-center cursor-pointer">
                        <Moon className="h-4 w-4 mr-2" />
                        Dark
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="system" />
                      <Label htmlFor="system" className="flex items-center cursor-pointer">
                        <Laptop className="h-4 w-4 mr-2" />
                        System
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="animations">Animations</Label>
                    <div className="text-sm text-muted-foreground">
                      Toggle interface animations on or off
                    </div>
                  </div>
                  <Switch defaultChecked id="animations" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Manage your account settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-medium">Account Information</h3>
                <p className="text-sm text-muted-foreground">
                  Username: {user?.username}
                </p>
                <p className="text-sm text-muted-foreground">
                  Email: {user?.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  Role: {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Danger Zone</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={handleClearData}
                    className="border-destructive text-destructive hover:bg-destructive/10"
                  >
                    Clear Local Data
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              <p>Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
            </CardFooter>
          </Card>
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

export default Settings;
