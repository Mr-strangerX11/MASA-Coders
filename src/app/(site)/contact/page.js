import ContactForm from './ContactForm';
import { FiMail, FiPhone, FiMapPin, FiMessageCircle } from 'react-icons/fi';

export const metadata = { title: 'Contact Us' };

const contactInfo = [
  { icon: FiMail,    label: 'Email Us',       value: 'info@masacoders.tech',  href: 'mailto:info@masacoders.tech' },
  { icon: FiPhone,   label: 'Call Us',        value: '+977 9705478032',       href: 'tel:+9779705478032' },
  { icon: FiMapPin,  label: 'Our Office',     value: 'kasualtar Madhyapur Thimi - 3, Bhaktapur, Nepal (online based)', href: '#map' },
  { icon: FiMessageCircle, label: 'WhatsApp', value: 'Chat with us',          href: 'https://wa.me/9779705478032' },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-[#060912] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
        <div className="container-custom relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            We're Here to Help
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Let's Build Something <span className="gradient-text">Extraordinary</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Ready to start your project? We'd love to hear about it. Reach out and let's create something amazing together.
          </p>
        </div>
      </section>

      {/* Contact section */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="card-premium p-8">
                <h2 className="font-display font-bold text-2xl text-slate-900 mb-2">Send Us a Message</h2>
                <p className="text-slate-500 text-sm mb-8">Fill out the form and our team will get back to you within 24 hours.</p>
                <ContactForm />
              </div>
            </div>

            {/* Info sidebar */}
            <div className="lg:col-span-2 space-y-5">
              {/* Contact cards */}
              {contactInfo.map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="card-premium p-5 flex items-center gap-4 hover:border-blue-200 transition-colors group"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all">
                    <Icon className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</div>
                    <div className="text-slate-900 font-medium text-sm mt-0.5">{value}</div>
                  </div>
                </a>
              ))}

              {/* Response time */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-700 font-semibold text-sm">Typically responds in</span>
                </div>
                <p className="text-green-800 font-bold text-2xl">Under 24 hours</p>
                <p className="text-green-600 text-xs mt-1">Mon–Sat, 9am–6pm EST</p>
              </div>

              {/* Free consultation */}
              <div className="bg-blue-600 rounded-2xl p-6 text-white">
                <h3 className="font-display font-bold text-lg mb-2">Free Consultation</h3>
                <p className="text-blue-100 text-sm leading-relaxed mb-4">
                  Not sure where to start? Book a free 30-minute consultation with our experts.
                </p>
                <a href="mailto:info@masacoders.tech?subject=Free Consultation Request" className="btn-ghost text-sm px-4 py-2 bg-white/15 rounded-lg hover:bg-white/25 inline-block">
                  Book Free Call →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section id="map" className="h-[400px] bg-slate-100 overflow-hidden">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3525.4800000000005!2d85.37085469999999!3d27.680051200000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1sMadhyapur%20Thimi%2C%20Bhaktapur%2C%20Nepal!2s27.6800512%2C%2085.3708547!5e0!3m2!1sen!2snp!4v1712996800000"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Office Location"
        />
      </section>
    </>
  );
}
