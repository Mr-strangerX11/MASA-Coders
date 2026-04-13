import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft, FiExternalLink, FiCalendar, FiUser } from 'react-icons/fi';
import ContactCTA from '@/components/sections/ContactCTA';
import { formatDate } from '@/lib/utils';

async function getProject(id) {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${base}/api/projects/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const { project } = await res.json();
    return project;
  } catch { return null; }
}

export async function generateMetadata({ params }) {
  const project = await getProject(params.id);
  if (!project) return { title: 'Project Not Found' };
  return { title: project.title, description: project.shortDesc };
}

export default async function ProjectDetailPage({ params }) {
  const project = await getProject(params.id);
  if (!project) notFound();

  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-12 bg-[#060912] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
        <div className="container-custom relative">
          <Link href="/projects" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-8">
            <FiArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>
          <div className="max-w-3xl">
            <span className="badge bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-4 inline-block">
              {project.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">{project.title}</h1>
            <p className="text-slate-400 text-lg leading-relaxed">{project.shortDesc}</p>
            <div className="flex flex-wrap gap-4 mt-6 text-sm text-slate-500">
              {project.clientName && (
                <span className="flex items-center gap-1.5">
                  <FiUser className="w-4 h-4" /> {project.clientName}
                </span>
              )}
              {project.completedAt && (
                <span className="flex items-center gap-1.5">
                  <FiCalendar className="w-4 h-4" /> {formatDate(project.completedAt, { year: 'numeric', month: 'long' })}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Thumbnail */}
      {project.thumbnail && (
        <div className="relative h-[400px] md:h-[550px] overflow-hidden">
          <Image src={project.thumbnail} alt={project.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
        </div>
      )}

      {/* Content */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2">
              <div className="prose-content">
                <h2>Project Overview</h2>
                <div dangerouslySetInnerHTML={{ __html: project.description?.replace(/\n/g, '<br />') || '' }} />

                {project.result && (
                  <>
                    <h2>Results & Impact</h2>
                    <div dangerouslySetInnerHTML={{ __html: project.result?.replace(/\n/g, '<br />') || '' }} />
                  </>
                )}
              </div>

              {/* Gallery */}
              {project.gallery && project.gallery.length > 0 && (
                <div className="mt-10">
                  <h3 className="font-display font-semibold text-xl text-slate-900 mb-5">Project Gallery</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {project.gallery.map((img, i) => (
                      <div key={i} className="relative h-48 rounded-xl overflow-hidden">
                        <Image src={img} alt={`Gallery ${i + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-5">
                {/* Project info */}
                <div className="card-premium p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Project Details</h3>
                  <dl className="space-y-3">
                    {project.clientName && (
                      <div>
                        <dt className="text-xs text-slate-400 uppercase tracking-wide mb-1">Client</dt>
                        <dd className="text-slate-900 font-medium text-sm">{project.clientName}</dd>
                      </div>
                    )}
                    {project.category && (
                      <div>
                        <dt className="text-xs text-slate-400 uppercase tracking-wide mb-1">Category</dt>
                        <dd className="text-slate-900 font-medium text-sm">{project.category}</dd>
                      </div>
                    )}
                    {project.completedAt && (
                      <div>
                        <dt className="text-xs text-slate-400 uppercase tracking-wide mb-1">Completed</dt>
                        <dd className="text-slate-900 font-medium text-sm">{formatDate(project.completedAt, { year: 'numeric', month: 'long' })}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Technologies */}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="card-premium p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Technologies Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span key={tech} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {project.projectUrl && (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full justify-center"
                  >
                    View Live Project <FiExternalLink className="w-4 h-4" />
                  </a>
                )}

                <Link href="/contact" className="btn-secondary w-full justify-center">
                  Start a Similar Project
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ContactCTA />
    </>
  );
}
