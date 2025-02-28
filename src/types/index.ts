
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: "student" | "teacher";
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  user: User;
  postId: string;
  createdAt: string;
}

export type PostCategory = "question" | "announcement" | "discussion";

export interface Post {
  id: string;
  title: string;
  content: string;
  image?: string;
  category: PostCategory;
  user: User;
  likes: string[]; // Array of user IDs who liked the post
  commentsCount: number;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, role: "student" | "teacher") => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  logout: () => void;
}

export interface PostsState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  createPost: (post: { title: string; content: string; category: PostCategory; image?: File }) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  filterByCategory: (category: PostCategory | null) => void;
  filteredPosts: Post[];
  activeFilter: PostCategory | null;
}

export interface CommentsState {
  comments: Record<string, Comment[]>; // postId -> comments[]
  isLoading: boolean;
  error: string | null;
  fetchComments: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string, postId: string) => Promise<void>;
}
