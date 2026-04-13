import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import Offer from '@/models/Offer';
import Testimonial from '@/models/Testimonial';
import Inquiry from '@/models/Inquiry';
import BlogPost from '@/models/BlogPost';
import Service from '@/models/Service';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

function isAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;
  return token ? !!verifyToken(token) : false;
}

export async function GET() {
  try {
    if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();

    const now = new Date();
    const [
      totalProjects, publishedProjects, featuredProjects,
      totalOffers, activeOffers,
      totalTestimonials, publishedTestimonials,
      totalInquiries, unreadInquiries,
      totalPosts, publishedPosts,
      totalServices, visibleServices,
      recentInquiries,
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: { $in: ['published', 'featured'] } }),
      Project.countDocuments({ isFeatured: true }),
      Offer.countDocuments(),
      Offer.countDocuments({ isActive: true, startDate: { $lte: now }, endDate: { $gte: now } }),
      Testimonial.countDocuments(),
      Testimonial.countDocuments({ isPublished: true }),
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ isRead: false }),
      BlogPost.countDocuments(),
      BlogPost.countDocuments({ status: 'published' }),
      Service.countDocuments(),
      Service.countDocuments({ isVisible: true }),
      Inquiry.find({ isRead: false }).sort({ createdAt: -1 }).limit(5),
    ]);

    return NextResponse.json({
      projects: { total: totalProjects, published: publishedProjects, featured: featuredProjects },
      offers:   { total: totalOffers, active: activeOffers },
      testimonials: { total: totalTestimonials, published: publishedTestimonials },
      inquiries: { total: totalInquiries, unread: unreadInquiries },
      blog: { total: totalPosts, published: publishedPosts },
      services: { total: totalServices, visible: visibleServices },
      recentInquiries,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
