export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight } from 'react-icons/fi';
import ContactCTA from '@/components/sections/ContactCTA';
import SectionHeader from '@/components/ui/SectionHeader';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';

export const metadata = { title: 'Projects' };

const placeholder = [
  { _id: '1', slug: '1', title: 'E-commerce Platform Redesign', category: 'Web Development', shortDesc: 'Complete redesign of a 7-figure e-commerce store resulting in 45% increase in conversions.', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', technologies: ['Next.js', 'Tailwind', 'Stripe'] },
  { _id: '2', slug: '2', title: 'FinTech Mobile App', category: 'Mobile Development', shortDesc: 'Cross-platform banking app with biometric auth and real-time transactions.', thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80', technologies: ['React Native', 'Node.js', 'PostgreSQL'] },
  { _id: '3', slug: '3', title: 'SaaS Analytics Dashboard', category: 'UI/UX Design', shortDesc: 'Comprehensive analytics dashboard with 50+ custom data visualization components.', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80', technologies: ['Figma', 'React', 'D3.js'] },
  { _id: '4', slug: '4', title: 'Healthcare Platform', category: 'Web Development', shortDesc: 'Patient management platform serving 10k+ healthcare professionals daily.', thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80', technologies: ['Next.js', 'PostgreSQL', 'Prisma'] },
  { _id: '5', slug: '5', title: 'Brand Identity System', category: 'Branding', shortDesc: 'Complete rebrand for a Series B startup including logo, guidelines, and digital assets.', thumbnail: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&q=80', technologies: ['Figma', 'Illustrator', 'Photoshop'] },
  { _id: '6', slug: '6', title: 'Real Estate Marketplace', category: 'Web Development', shortDesc: 'Property listing platform with advanced search, virtual tours, and lead management.', thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80', technologies: ['Next.js', 'MongoDB', 'Mapbox'] },
];

async function getProjects() {
  try {
    await connectDB();
    return await Project.find({ status: { $in: ['published', 'featured'] } })
      .sort({ isFeatured: -1, order: 1, createdAt: -1 })
      .limit(12)
      .lean();
  } catch { return []; }
}

export default async function ProjectsPage() {
  const dbProjects = await getProjects();
  const projects = dbProjects.length > 0 ? dbProjects : placeholder;

  const categories = ['All', ...new Set(projects.map((p) => p.category).filter(Boolean))];

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-[#060912] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
        <div className="container-custom relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Our Portfolio
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Work That <span className="gradient-text">Speaks for Itself</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Each project is a story of collaboration, creativity, and measurable impact.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="section bg-white">
        <div className="container-custom">
          {projects.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <p className="text-lg">No projects published yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <article key={project._id} className="group card-premium overflow-hidden">
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={project.thumbnail || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80'}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="badge bg-white/20 backdrop-blur-sm text-white border border-white/20 text-xs">
                        {project.category}
                      </span>
                    </div>
                    {project.isFeatured && (
                      <div className="absolute top-3 right-3">
                        <span className="badge bg-amber-500 text-white text-xs">Featured</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-display font-semibold text-slate-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{project.shortDesc}</p>

                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.technologies.slice(0, 3).map((tech) => (
                          <span key={tech} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <Link
                      href={`/projects/${project.slug || project._id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 group-hover:gap-3 transition-all"
                    >
                      View Case Study <FiArrowRight className="w-4 h-4" />
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
