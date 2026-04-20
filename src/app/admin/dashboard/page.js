import Link from 'next/link';
import { FiBriefcase, FiTag, FiStar, FiMessageSquare, FiFileText, FiGlobe, FiArrowRight, FiMail, FiEye, FiTrendingUp } from 'react-icons/fi';
import { formatDate } from '@/lib/utils';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import Offer from '@/models/Offer';
import Testimonial from '@/models/Testimonial';
import Inquiry from '@/models/Inquiry';
import BlogPost from '@/models/BlogPost';
import Service from '@/models/Service';

export const metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

async function getStats() {
  try {
    await connectDB();
    const now = new Date();
    const [
      totalProjects, publishedProjects,
      totalOffers, activeOffers,
      totalTestimonials,
      totalInquiries, unreadInquiries,
      totalPosts, publishedPosts,
      totalServices, visibleServices,
      recentInquiries,
      totalViewsAgg,
      topPosts,
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: { $in: ['published', 'featured'] } }),
      Offer.countDocuments(),
      Offer.countDocuments({ isActive: true, startDate: { $lte: now }, endDate: { $gte: now } }),
      Testimonial.countDocuments(),
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ isRead: false }),
      BlogPost.countDocuments(),
      BlogPost.countDocuments({ status: 'published' }),
      Service.countDocuments(),
      Service.countDocuments({ isVisible: true }),
      Inquiry.find({ isRead: false }).sort({ createdAt: -1 }).limit(5).lean(),
      BlogPost.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      BlogPost.find({ status: 'published' }).sort({ views: -1 }).limit(5).select('title slug views').lean(),
    ]);
    return {
      projects:     { total: totalProjects, published: publishedProjects },
      offers:       { total: totalOffers, active: activeOffers },
      testimonials: { total: totalTestimonials },
      inquiries:    { total: totalInquiries, unread: unreadInquiries },
      blog:         { total: totalPosts, published: publishedPosts, totalViews: totalViewsAgg[0]?.total || 0 },
      services:     { total: totalServices, visible: visibleServices },
      recentInquiries: JSON.parse(JSON.stringify(recentInquiries)),
      topPosts:     JSON.parse(JSON.stringify(topPosts)),
    };
  } catch { return null; }
}

function StatCard({ icon: Icon, label, value, sub, color, href }) {
  return (
    <Link href={href || '#'} className="block group">
      <div className="bg-white/5 border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <FiArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </div>
        <div className="text-3xl font-display font-bold text-white mb-1">{value ?? '—'}</div>
        <div className="text-sm font-medium text-slate-400">{label}</div>
        {sub && <div className="text-xs text-slate-600 mt-1">{sub}</div>}
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const stats = await getStats();

  const statCards = [
    { icon: FiBriefcase,     label: 'Total Projects',   value: stats?.projects?.total,      sub: `${stats?.projects?.published || 0} published`,     color: 'bg-blue-600',   href: '/admin/projects' },
    { icon: FiTag,           label: 'Active Offers',    value: stats?.offers?.active,       sub: `${stats?.offers?.total || 0} total offers`,        color: 'bg-amber-500',  href: '/admin/offers' },
    { icon: FiStar,          label: 'Testimonials',     value: stats?.testimonials?.total,  sub: 'all time',                                          color: 'bg-purple-600', href: '/admin/testimonials' },
    { icon: FiMessageSquare, label: 'Inquiries',        value: stats?.inquiries?.total,     sub: `${stats?.inquiries?.unread || 0} unread`,          color: 'bg-green-600',  href: '/admin/inquiries' },
    { icon: FiFileText,      label: 'Blog Posts',       value: stats?.blog?.total,          sub: `${stats?.blog?.published || 0} published`,         color: 'bg-pink-600',   href: '/admin/blog' },
    { icon: FiEye,           label: 'Total Blog Views', value: stats?.blog?.totalViews,     sub: 'across all posts',                                  color: 'bg-cyan-600',   href: '/admin/blog' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back! Here's what's happening with your website.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => <StatCard key={card.label} {...card} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-1">
            {[
              { label: 'Add New Project',  href: '/admin/projects/create', color: 'bg-blue-600' },
              { label: 'Create New Offer', href: '/admin/offers/create',   color: 'bg-amber-500' },
              { label: 'Add Testimonial',  href: '/admin/testimonials',    color: 'bg-purple-600' },
              { label: 'View Inquiries',   href: '/admin/inquiries',       color: 'bg-green-600' },
              { label: 'New Blog Post',    href: '/admin/blog',            color: 'bg-pink-600' },
              { label: 'Update Settings',  href: '/admin/settings',        color: 'bg-slate-600' },
            ].map(({ label, href, color }) => (
              <Link key={label} href={href} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 transition-colors group">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-sm text-slate-400 group-hover:text-white transition-colors">{label}</span>
                <FiArrowRight className="w-3.5 h-3.5 text-slate-600 ml-auto group-hover:text-slate-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent inquiries */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Unread Inquiries</h2>
            <Link href="/admin/inquiries" className="text-xs text-blue-400 hover:text-blue-300">View all</Link>
          </div>
          {(!stats?.recentInquiries?.length) ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-600">
              <FiMail className="w-8 h-8 mb-2" />
              <p className="text-sm">No unread inquiries</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentInquiries.map((inq) => (
                <Link key={inq._id} href="/admin/inquiries" className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400 text-xs font-bold">
                    {inq.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">{inq.name}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    </div>
                    <p className="text-xs text-slate-500 truncate">{inq.message}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{formatDate(inq.createdAt, { month: 'short', day: 'numeric' })}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top blog posts by views */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Top Blog Posts</h2>
            <Link href="/admin/blog" className="text-xs text-blue-400 hover:text-blue-300">View all</Link>
          </div>
          {(!stats?.topPosts?.length) ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-600">
              <FiTrendingUp className="w-8 h-8 mb-2" />
              <p className="text-sm">No posts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topPosts.map((post, i) => (
                <div key={post._id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600 w-4">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-300 truncate">{post.title}</p>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 text-xs shrink-0">
                    <FiEye className="w-3 h-3" />
                    {post.views || 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
