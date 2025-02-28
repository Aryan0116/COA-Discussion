
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Navbar } from "@/components/layout/Navbar";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { BookOpen, GraduationCap } from "lucide-react";

const profileFormSchema = z.object({
  username: z
    .string()
    .min(3, {
      message: "Username must be at least 3 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
  email: z
    .string()
    .email({
      message: "Please enter a valid email address.",
    }),
  avatar: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const Profile = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!user) {
    navigate("/auth");
    return null;
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile({
        username: data.username,
        email: data.email,
        avatar: data.avatar,
      });
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handleAvatarChange = () => {
    // Generate a new random avatar
    const newAvatar = `https://ui-avatars.com/api/?name=${user.username}&background=random&size=200`;
    setAvatarPreview(newAvatar);
    form.setValue("avatar", newAvatar);
  };

  const getRoleBadge = () => {
    if (user.role === "teacher") {
      return (
        <Badge className="ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
          <BookOpen className="h-3 w-3 mr-1" />
          Teacher
        </Badge>
      );
    } else {
      return (
        <Badge className="ml-2 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
          <GraduationCap className="h-3 w-3 mr-1" />
          Student
        </Badge>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-4xl">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {/* Profile Card */}
            <Card className="w-full md:w-1/3">
              <CardHeader className="text-center">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview || user.avatar} alt={user.username} />
                    <AvatarFallback className="text-lg">{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="mt-4 space-y-1">
                    <CardTitle className="flex items-center justify-center">
                      {user.username}
                      {getRoleBadge()}
                    </CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" onClick={handleAvatarChange}>
                  Change Avatar
                </Button>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground text-center">
                <p>Member since {new Date(user.createdAt).toLocaleDateString()}</p>
              </CardFooter>
            </Card>

            {/* Edit Profile Form */}
            <Card className="w-full md:w-2/3">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account profile information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            This is your public display name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormDescription>
                            Your email address.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="avatar"
                      render={({ field }) => (
                        <FormItem className="hidden">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Account Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Account Activity</CardTitle>
              <CardDescription>
                An overview of your account activity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Recent Activity</h3>
                  <Separator className="my-2" />
                  <p className="text-sm text-muted-foreground">
                    Your recent activity will appear here.
                  </p>
                </div>
              </div>
            </CardContent>
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

export default Profile;
