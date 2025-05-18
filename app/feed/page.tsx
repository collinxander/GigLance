'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Database } from '@/lib/database.types';
import CreatePost from '@/components/CreatePost';

type Post = Database['public']['Tables']['posts']['Row'] & {
  user: {
    full_name: string;
    avatar_url: string;
  };
};

export default function FeedPage() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch posts from followed users and public posts
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:profiles(full_name, avatar_url)
        `)
        .or(`visibility.eq.public,user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        setPosts(data || []);
      }

      setLoading(false);
    };

    fetchPosts();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <CreatePost />
      
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={post.user.avatar_url || '/default-avatar.png'}
                alt={post.user.full_name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold">{post.user.full_name}</h3>
                <p className="text-gray-500 text-sm">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <p className="text-gray-800 mb-4">{post.content}</p>
            
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                {post.media_urls.map((url: string, index: number) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Post media ${index + 1}`}
                    className="rounded-lg w-full h-48 object-cover"
                  />
                ))}
              </div>
            )}
            
            <div className="flex items-center space-x-6 text-gray-500">
              <button className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>{post.likes_count}</span>
              </button>
              
              <button className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span>{post.comments_count}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 