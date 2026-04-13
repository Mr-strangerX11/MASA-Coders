/**
 * Database Seed Script — MASA Coders
 * Creates initial admin user and default data
 *
 * Usage: npm run seed
 */

import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Service from '../src/models/Service.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/masacoders';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected:', MONGODB_URI);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'info@masacoders.tech';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

  // Remove stale admin accounts from old branding
  await User.deleteMany({ email: { $in: ['admin@nexuspro.com', 'admin@masacoders.tech'] } });

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    // Update password in case it changed in .env
    existing.password = adminPassword; // pre-save hook will hash it
    await existing.save();
    console.log('   ✅ Admin user updated:', adminEmail);
  } else {
    // NOTE: pass plain password — User model pre-save hook hashes it automatically
    await User.create({
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isActive: true,
    });
    console.log('   ✅ Admin user created:', adminEmail);
  }
  console.log('      Password:', adminPassword);
  console.log('      ⚠️  Change password after first login!\n');
}

async function seedServices() {
  const count = await Service.countDocuments();
  if (count > 0) {
    console.log('   ℹ️  Services already exist, skipping\n');
    return;
  }

  const services = [
    {
      title: 'Web Design & Development',
      slug: 'web-design-development',
      icon: 'FiLayout',
      description: 'Custom websites built with modern technologies. Responsive, fast, and conversion-focused.',
      shortDesc: 'Beautiful, conversion-focused websites',
      features: ['Custom design from scratch', 'Mobile-first approach', 'SEO-optimized structure', 'Admin dashboard included', 'Lightning-fast performance', 'Cross-browser compatibility'],
      price: 'Starting at Rs. 49,999',
      duration: '4-8 weeks',
      isVisible: true,
      isFeatured: true,
      order: 1,
    },
    {
      title: 'E-commerce Solutions',
      slug: 'ecommerce-solutions',
      icon: 'FiShoppingCart',
      description: 'Complete online store solutions with inventory management, payments, and analytics.',
      shortDesc: 'Full-featured online stores',
      features: ['Custom storefront', 'Payment integration', 'Inventory management', 'Order tracking', 'Multi-currency support', 'Analytics dashboard'],
      price: 'Starting at Rs. 79,999',
      duration: '6-10 weeks',
      isVisible: true,
      isFeatured: true,
      order: 2,
    },
    {
      title: 'Mobile App Development',
      slug: 'mobile-app-development',
      icon: 'FiSmartphone',
      description: 'Native iOS and Android apps with exceptional user experiences and performance.',
      shortDesc: 'Native and cross-platform apps',
      features: ['iOS & Android support', 'React Native / Flutter', 'API integration', 'Push notifications', 'Offline support', 'App Store deployment'],
      price: 'Starting at Rs. 1,49,999',
      duration: '8-16 weeks',
      isVisible: true,
      isFeatured: true,
      order: 3,
    },
    {
      title: 'Digital Marketing',
      slug: 'digital-marketing',
      icon: 'FiTrendingUp',
      description: 'Data-driven marketing strategies to attract customers and grow your business.',
      shortDesc: 'Growth-focused marketing strategies',
      features: ['Social media marketing', 'PPC advertising', 'Content strategy', 'Email campaigns', 'Analytics & reporting', 'Conversion optimization'],
      price: 'Starting at Rs. 24,999/mo',
      duration: 'Ongoing',
      isVisible: true,
      isFeatured: false,
      order: 4,
    },
    {
      title: 'SEO Optimization',
      slug: 'seo-optimization',
      icon: 'FiSearch',
      description: 'Comprehensive SEO strategies to boost rankings, drive organic traffic, and generate leads.',
      shortDesc: 'Rank higher, get found faster',
      features: ['Technical SEO audit', 'On-page optimization', 'Link building', 'Local SEO', 'Content optimization', 'Monthly reporting'],
      price: 'Starting at Rs. 14,999/mo',
      duration: 'Ongoing',
      isVisible: true,
      isFeatured: false,
      order: 5,
    },
    {
      title: 'Brand Identity Design',
      slug: 'brand-identity-design',
      icon: 'FiBriefcase',
      description: 'Complete brand identity systems that communicate your values and build trust.',
      shortDesc: 'Memorable brands that stand out',
      features: ['Logo design', 'Brand guidelines', 'Color palette', 'Typography system', 'Business collateral', 'Social media kit'],
      price: 'Starting at Rs. 34,999',
      duration: '2-4 weeks',
      isVisible: true,
      isFeatured: false,
      order: 6,
    },
  ];

  await Service.insertMany(services);
  console.log(`   ✅ ${services.length} default services created\n`);
}

(async () => {
  await connectDB();
  console.log('\n🌱 Starting database seed...\n');

  console.log('👤 Admin user:');
  await seedAdmin();

  console.log('🛠️  Services:');
  await seedServices();

  console.log('✅ Database seeding complete!');
  console.log('🚀 Run: npm run dev\n');
  await mongoose.connection.close();
})();
