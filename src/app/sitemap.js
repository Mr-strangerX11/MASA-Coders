import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import BlogPost from '@/models/BlogPost';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://masacoders.tech';

export default async function sitemap() {
  const staticRoutes = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/projects`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/testimonials`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/offers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];

  try {
    await connectDB();

    const [projects, posts] = await Promise.all([
      Project.find({ status: { $in: ['published', 'featured'] } })
        .select('_id slug updatedAt')
        .lean(),
      BlogPost.find({ status: 'published' })
        .select('_id slug updatedAt publishedAt')
        .lean(),
    ]);

    const projectRoutes = projects.map((p) => ({
      url: `${BASE_URL}/projects/${p.slug || p._id}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

    const blogRoutes = posts.map((p) => ({
      url: `${BASE_URL}/blog/${p.slug || p._id}`,
      lastModified: p.updatedAt || p.publishedAt || new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    return [...staticRoutes, ...projectRoutes, ...blogRoutes];
  } catch {
    return staticRoutes;
  }
}
