export const revalidate = 3600; // Cache for 1 hour to reduce server load

import Hero from '@/components/sections/Hero';
import FeaturedServices from '@/components/sections/FeaturedServices';
import FeaturedProjects from '@/components/sections/FeaturedProjects';
import ActiveOffers from '@/components/sections/ActiveOffers';
import WhyChooseUs from '@/components/sections/WhyChooseUs';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import Process from '@/components/sections/Process';
import FAQ from '@/components/sections/FAQ';
import ContactCTA from '@/components/sections/ContactCTA';
import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';
import Project from '@/models/Project';
import Offer from '@/models/Offer';
import Testimonial from '@/models/Testimonial';

async function getData() {
  try {
    await connectDB();
    
    // Fetch directly from DB instead of HTTP calls - much faster
    const now = new Date();
    const [services, projects, offers, testimonials] = await Promise.all([
      Service.find({ isVisible: true }).sort({ isFeatured: -1, order: 1 }).limit(6).lean(),
      Project.find({ status: { $in: ['published', 'featured'] }, isFeatured: true }).sort({ order: 1, createdAt: -1 }).limit(3).lean(),
      Offer.find({ isActive: true, isFeatured: true, startDate: { $lte: now }, endDate: { $gte: now } }).lean(),
      Testimonial.find({ isPublished: true, isFeatured: true }).sort({ order: 1 }).lean(),
    ]);
    
    // Convert to JSON strings and back to ensure Date objects are serializable for Client Components
    return {
      services: JSON.parse(JSON.stringify(services)),
      projects: JSON.parse(JSON.stringify(projects)),
      offers: JSON.parse(JSON.stringify(offers)),
      testimonials: JSON.parse(JSON.stringify(testimonials)),
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return { services: [], projects: [], offers: [], testimonials: [] };
  }
}

export default async function HomePage() {
  const { services, projects, offers, testimonials } = await getData();
  return (
    <>
      <Hero />
      <FeaturedServices services={services} />
      <FeaturedProjects projects={projects} />
      <ActiveOffers offers={offers} />
      <WhyChooseUs />
      <TestimonialsSection testimonials={testimonials} />
      <Process />
      <FAQ />
      <ContactCTA />
    </>
  );
}
