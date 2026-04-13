export const dynamic = 'force-dynamic';

import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight, FiCalendar, FiClock } from 'react-icons/fi';
import ContactCTA from '@/components/sections/ContactCTA';
import { formatDate } from '@/lib/utils';
import connectDB from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';

export const metadata = { title: 'Blog & Insights' };

async function getPosts() {
  try {
    await connectDB();
    return await BlogPost.find({ status: 'published' })
      .sort({ isFeatured: -1, publishedAt: -1, createdAt: -1 })
      .limit(9)
      .lean();
  } catch { return []; }
}

const demoPost = [
  { _id: '1', slug: '1', title: '10 Web Design Trends That Will Dominate 2024', excerpt: 'From glassmorphism to AI-generated visuals, these are the design trends shaping the digital landscape.', category: 'Design', readTime: 6, thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80', publishedAt: '2024-03-15', author: 'Sophia Williams' },
  { _id: '2', slug: '2', title: 'How to Increase Website Conversion Rate by 200%', excerpt: 'Proven CRO strategies and psychological principles that turn visitors into customers consistently.', category: 'Growth', readTime: 8, thumbnail: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=600&q=80', publishedAt: '2024-03-08', author: 'Alex Morgan' },
  { _id: '3', slug: '3', title: 'The Complete Guide to Technical SEO in 2024', excerpt: 'Master the technical aspects of SEO that search engines reward with higher rankings and visibility.', category: 'SEO', readTime: 12, thumbnail: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=600&q=80', publishedAt: '2024-02-29', author: 'Priya Patel' },
];

export default async function BlogPage() {
  const dbPosts = await getPosts();
  const posts = dbPosts.length > 0 ? dbPosts : demoPost;

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-[#060912] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 to-transparent pointer-events-none" />
        <div className="container-custom relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300 text-xs font-semibold mb-6">
            💡 Blog & Insights
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Digital <span className="gradient-text">Insights & Ideas</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Expert knowledge on web design, digital marketing, and business growth strategies.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="section bg-white">
        <div className="container-custom">
          {posts.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <p className="text-lg">Blog posts coming soon! Stay tuned.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <article key={post._id} className="group card-premium overflow-hidden">
                  {post.thumbnail && (
                    <div className="relative h-48 overflow-hidden">
                      <Image src={post.thumbnail} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="badge bg-white/20 backdrop-blur-sm text-white border border-white/20 text-xs">{post.category}</span>
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                      <span className="flex items-center gap-1.5">
                        <FiCalendar className="w-3.5 h-3.5" />
                        {post.publishedAt ? formatDate(post.publishedAt, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiClock className="w-3.5 h-3.5" />
                        {post.readTime} min read
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-slate-900 text-base mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                    <Link
                      href={`/blog/${post.slug || post._id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 group-hover:gap-3 transition-all"
                    >
                      Read Article <FiArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <ContactCTA />
    </>
  );
}
