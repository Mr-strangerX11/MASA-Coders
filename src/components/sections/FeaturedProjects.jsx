'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiExternalLink } from 'react-icons/fi';
import SectionHeader from '@/components/ui/SectionHeader';

const placeholder = [
  { _id: '1', title: 'E-commerce Platform Redesign', category: 'Web Development', shortDesc: 'Complete redesign of a 7-figure e-commerce store resulting in 45% increase in conversions.', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', technologies: ['Next.js', 'Tailwind', 'Stripe'] },
  { _id: '2', title: 'FinTech Mobile App', category: 'Mobile Development', shortDesc: 'Cross-platform banking app with biometric authentication and real-time transactions.', thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80', technologies: ['React Native', 'Node.js', 'PostgreSQL'] },
  { _id: '3', title: 'SaaS Dashboard Design', category: 'UI/UX Design', shortDesc: 'Comprehensive analytics dashboard with 50+ custom data visualization components.', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80', technologies: ['Figma', 'React', 'D3.js'] },
];

export default function FeaturedProjects({ projects }) {
  const items = (projects && projects.length > 0) ? projects : placeholder;

  return (
    <section className="section bg-slate-50">
      <div className="container-custom">
        <SectionHeader
          badge="Our Work"
          title={<>Projects That <span className="gradient-text">Deliver Results</span></>}
          subtitle="A selection of our finest work — each project crafted with purpose, precision, and a focus on measurable impact."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {items.slice(0, 3).map((project, i) => (
            <motion.article
              key={project._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={`group relative bg-white rounded-2xl overflow-hidden shadow-card border border-slate-100 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 ${i === 0 ? 'lg:col-span-2' : ''}`}
            >
              {/* Image */}
              <div className={`relative overflow-hidden ${i === 0 ? 'h-64' : 'h-48'}`}>
                <Image
                  src={project.thumbnail || `https://images.unsplash.com/photo-155128804${i}?w=800&q=80`}
                  alt={project.title}
                  fill
                  priority={i === 0}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="badge bg-white/20 backdrop-blur-sm text-white border border-white/20 text-xs">
                    {project.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-display font-semibold text-slate-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{project.shortDesc}</p>

                {/* Tech tags */}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <span key={tech} className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <Link
                  href={`/projects/${project.slug || project._id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 group-hover:gap-3 transition-all"
                >
                  View case study <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/projects" className="btn-primary">
            See All Projects <FiArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
