import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiClock, FiCalendar, FiUser } from 'react-icons/fi';
import { formatDate } from '@/lib/utils';

export const revalidate = 60; // ISR: revalidate every 60 seconds

async function getBlogPost(id) {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${base}/api/blog/${id}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json().catch(() => null);
  } catch {
    return null;
  }
}

async function getRelatedPosts(id, category, limit = 3) {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${base}/api/blog?category=${category}&limit=${limit}`, {
      next: { revalidate: 60 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.posts || []).filter((p) => p._id !== id).slice(0, limit);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const post = await getBlogPost(params.id);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.title,
    description: post.excerpt || post.content?.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.thumbnail }],
      type: 'article',
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const data = await getBlogPost(params.id);

  if (!data || !data.post) {
    notFound();
  }

  const post = data.post;
  const related = await getRelatedPosts(post._id, post.category);

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-[#060912] relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />
        
        <div className="container-custom relative">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
          >
            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>

          <div className="max-w-4xl">
            {/* Category & Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="badge bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {post.category || 'Article'}
              </span>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <FiCalendar className="w-4 h-4" />
                  {formatDate(post.publishedAt, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                {post.readTime && (
                  <div className="flex items-center gap-1.5">
                    <FiClock className="w-4 h-4" />
                    {post.readTime} min read
                  </div>
                )}
                {post.author && (
                  <div className="flex items-center gap-1.5">
                    <FiUser className="w-4 h-4" />
                    {post.author}
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
                {post.excerpt}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.thumbnail && (
        <section className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden bg-slate-900">
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060912] via-transparent to-transparent" />
        </section>
      )}

      {/* Content */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <article className="prose prose-lg max-w-none text-slate-600">
                <div
                  className="text-base leading-relaxed space-y-6 mb-12"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </article>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="pt-8 border-t border-slate-200">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium text-slate-700">Tags:</span>
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog?tag=${tag}`}
                        className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm hover:bg-blue-100 hover:text-blue-700 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              {/* Author Card */}
              {post.author && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
                  <h3 className="font-semibold text-slate-900 mb-2">About the Author</h3>
                  <p className="text-sm text-slate-600">{post.author}</p>
                </div>
              )}

              {/* Share */}
              <div className="bg-slate-100 rounded-2xl p-6 mb-8">
                <h3 className="font-semibold text-slate-900 mb-3 text-sm">Share this article</h3>
                <div className="flex gap-2">
                  {[
                    { name: 'Twitter', url: `https://twitter.com/intent/tweet?url=${typeof window !== 'undefined' ? window.location.href : ''}` },
                    { name: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${typeof window !== 'undefined' ? window.location.href : ''}` },
                    { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? window.location.href : ''}` },
                  ].map(({ name, url }) => (
                    <a
                      key={name}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-white hover:bg-blue-500 hover:text-white flex items-center justify-center transition-colors text-sm font-medium text-slate-700"
                    >
                      {name.charAt(0)}
                    </a>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
                <h3 className="font-semibold mb-2">Ready to get started?</h3>
                <p className="text-sm text-blue-100 mb-4">Let us help you build something amazing.</p>
                <Link href="/contact" className="inline-block w-full text-center py-2 px-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
                  Get in Touch
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {related.length > 0 && (
        <section className="py-16 md:py-24 bg-[#060912] border-t border-white/5">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Related Articles</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Explore more insights to grow your business</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug || post._id}`}
                  className="group"
                >
                  <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all h-full">
                    {post.thumbnail && (
                      <div className="relative h-48 overflow-hidden bg-slate-800">
                        <Image
                          src={post.thumbnail}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      {post.category && (
                        <span className="badge badge-sm bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs mb-3">
                          {post.category}
                        </span>
                      )}
                      <h3 className="text-white font-semibold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-slate-500 text-sm line-clamp-2 mb-3">{post.excerpt}</p>
                      <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                        Read More
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-white rounded-full blur-[100px]" />
          <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-white rounded-full blur-[100px]" />
        </div>

        <div className="container-custom relative text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
            Ready to transform your business?
          </h2>
          <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
            Let's work together to bring your vision to life. Our team is ready to help you succeed.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all hover:scale-105 active:scale-95"
          >
            Start Your Project
            <span>→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
