import { FiTarget, FiEye, FiUsers, FiAward } from 'react-icons/fi';
import ContactCTA from '@/components/sections/ContactCTA';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata = { title: 'About Us' };

const values = [
  { icon: FiTarget, title: 'Excellence',   desc: 'We never settle for good enough. Every pixel, every line of code, every strategy is crafted to be exceptional.' },
  { icon: FiUsers, title: 'Partnership',  desc: 'We work as an extension of your team, deeply invested in your success and long-term growth.' },
  { icon: FiEye,   title: 'Innovation',   desc: 'We stay ahead of the curve, always adopting the latest technologies and methodologies.' },
  { icon: FiAward, title: 'Integrity',    desc: 'Transparent communication, honest pricing, and reliable delivery — always.' },
];

const team = [
  { name: 'Alex Morgan',    role: 'CEO & Founder',         avatar: 'AM', gradient: 'from-blue-500 to-indigo-600' },
  { name: 'Sophia Williams', role: 'Creative Director',    avatar: 'SW', gradient: 'from-purple-500 to-pink-600' },
  { name: 'Daniel Chen',    role: 'Lead Developer',        avatar: 'DC', gradient: 'from-green-500 to-teal-600' },
  { name: 'Priya Patel',    role: 'Head of Strategy',      avatar: 'PP', gradient: 'from-orange-500 to-red-600' },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-[#060912] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
        <div className="container-custom relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            About MASA Coders
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            We Are <span className="gradient-text">MASA Coders</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A premium digital agency on a mission to transform how businesses connect with their audience in the digital world.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Our Story
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-5">
                Built on a Belief That <span className="gradient-text">Great Design Changes Everything</span>
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>Founded in 2016, MASA Coders was built on a single belief: great digital experiences change businesses. From our humble beginnings as a two-person studio, we've grown into a full-service digital agency serving clients across 20+ countries.</p>
                <p>We've always believed that the best digital products are born at the intersection of beautiful design and smart strategy. Every project we take on is treated as an opportunity to create something that not only looks extraordinary but drives real, measurable results.</p>
                <p>Today, with a team of 25+ passionate experts, we continue to push the boundaries of what's possible in digital — helping ambitious businesses build their digital future.</p>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '150+', label: 'Projects Delivered', color: 'bg-blue-500' },
                  { value: '80+',  label: 'Happy Clients',      color: 'bg-purple-500' },
                  { value: '20+',  label: 'Countries Served',   color: 'bg-green-500' },
                  { value: '8+',   label: 'Years of Excellence', color: 'bg-amber-500' },
                ].map(({ value, label, color }) => (
                  <div key={label} className="card-premium p-6 text-center">
                    <div className={`w-2 h-2 rounded-full ${color} mx-auto mb-3`} />
                    <div className="text-3xl font-display font-bold text-slate-900">{value}</div>
                    <div className="text-sm text-slate-500 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section bg-slate-50">
        <div className="container-custom">
          <SectionHeader badge="Purpose" title={<>Mission & <span className="gradient-text">Vision</span></>} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="card-premium p-8">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-5">
                <FiTarget className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 mb-3">Our Mission</h3>
              <p className="text-slate-600 leading-relaxed">
                To empower businesses with world-class digital solutions that are not just beautiful, but strategically designed to convert and scale.
              </p>
            </div>
            <div className="card-premium p-8">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-5">
                <FiEye className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 mb-3">Our Vision</h3>
              <p className="text-slate-600 leading-relaxed">
                To be the most trusted digital growth partner for ambitious companies worldwide, known for excellence, innovation, and real results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-white">
        <div className="container-custom">
          <SectionHeader badge="Core Values" title={<>What We <span className="gradient-text">Stand For</span></>} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="card-premium p-7 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/15 to-indigo-500/15 border border-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section bg-slate-50">
        <div className="container-custom">
          <SectionHeader badge="The Team" title={<>Meet the <span className="gradient-text">People Behind the Magic</span></>} subtitle="A diverse, passionate team united by the drive to create exceptional digital experiences." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-3xl mx-auto">
            {team.map(({ name, role, avatar, gradient }) => (
              <div key={name} className="card-premium p-6 text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg mx-auto mb-4`}>
                  {avatar}
                </div>
                <h4 className="font-semibold text-slate-900 text-sm">{name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactCTA />
    </>
  );
}
