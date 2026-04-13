# 🚀 NexusPro - Premium Business Website

A **production-ready, premium business website** built with Next.js, React, and MongoDB. Features a modern frontend, powerful admin dashboard, and intelligent content publishing system.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-Production%20Ready-success)

---

## ✨ Key Features

### 🎯 Frontend (Client-Facing)
- **Modern Design** - Glassmorphism, gradients, smooth animations
- **Responsive** - Mobile-first design for all devices
- **Fast** - Optimized for performance and SEO
- **Sections**:
  - Hero with CTA
  - Services showcase
  - Featured projects/portfolio
  - Active offers with countdown timers
  - Client testimonials
  - Process/workflow
  - FAQ
  - Blog for SEO
  - Contact form

### 🔐 Admin Dashboard (Password Protected)
- **Projects** - Create, edit, delete, publish/draft/featured statuses
- **Services** - Manage service offerings
- **Offers** - Time-limited promotions with auto-expiry
- **Blog** - Article publishing with categories and tags
- **Testimonials** - Customer reviews with ratings
- **Inquiries** - Lead tracking and management
- **Settings** - Site-wide configuration (branding, contact info, SEO)
- **Dashboard** - Real-time stats and quick actions

### 🛡️ Smart Publishing System
- **Draft Mode** - Save content before publishing
- **Published** - Visible on frontend
- **Featured** - Highlighted on homepage
- **Archived** - Hidden from public view
- **Admin Control** - Only selected content appears on frontend

### 🎨 Premium Features
- **Countdown Timers** - Urgency for limited-time offers
- **Scroll Animations** - Smooth reveal effects as users scroll
- **Gradient Text & Elements** - Modern premium look
- **WhatsApp Button** - Direct messaging integration
- **Scroll-to-Top** - Smooth navigation
- **Loading Skeletons** - Better UX during data loading
- **Dark/Light Modes** - Optional theme switching

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Icons** - Icon library

### Backend
- **Next.js API Routes** - Serverless backend
- **Node.js** - Runtime
- **Express-like middleware** - Request handling

### Database
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB

### Authentication
- **JWT** - JSON Web Tokens
- **bcryptjs** - Password hashing
- **HTTP-only Cookies** - Secure token storage

### Development
- **ESLint** - Code quality
- **Prettier** - Code formatting

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ ([download](https://nodejs.org/))
- MongoDB ([local](https://docs.mongodb.com/manual/installation/) or [Atlas](https://www.mongodb.com/cloud/atlas))

### Quick Start

1. **Clone & Install**
   ```bash
   cd web
   npm install
   ```

2. **Environment Setup**
   Create`.env.local`:
   ```
   MONGODB_URI=mongodb://localhost:27017/nexuspro
   JWT_SECRET=your_secure_secret_key_min_32_chars
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development
   ```

3. **Seed Database**
   ```bash
   npm run seed
   # Creates admin user: admin@nexuspro.com / Admin@123
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

5. **Login to Admin**
   ```
   URL: http://localhost:3000/admin/login
   Email: admin@nexuspro.com
   Password: Admin@123
   ```

---

## 📁 Project Structure

```
nexuspro/
├── src/
│   ├── app/
│   │   ├── (site)/                 # Public pages
│   │   │   ├── page.js            # Homepage
│   │   │   ├── about/             # About page
│   │   │   ├── services/          # Services listing
│   │   │   ├── projects/          # Portfolio
│   │   │   │   └── [id]/          # Project detail
│   │   │   ├── offers/            # Active offers
│   │   │   ├── blog/              # Blog listing
│   │   │   │   └── [id]/          # Blog post detail
│   │   │   ├── testimonials/      # Reviews
│   │   │   ├── contact/           # Contact form
│   │   │   └── layout.js          # Site layout
│   │   ├── admin/                  # Admin dashboard
│   │   │   ├── dashboard/         # Stats overview
│   │   │   ├── projects/          # Project CRUD
│   │   │   ├── services/          # Service management
│   │   │   ├── offers/            # Offer management
│   │   │   ├── blog/              # Blog management
│   │   │   ├── testimonials/      # Review management
│   │   │   ├── inquiries/         # Lead management
│   │   │   ├── settings/          # Site settings
│   │   │   ├── login/             # Authentication
│   │   │   └── layout.js          # Admin layout
│   │   ├── api/                    # REST API
│   │   │   ├── auth/              # Login/logout
│   │   │   ├── projects/          # Project endpoints
│   │   │   ├── services/          # Service endpoints
│   │   │   ├── offers/            # Offer endpoints
│   │   │   ├── blog/              # Blog endpoints
│   │   │   ├── testimonials/      # Review endpoints
│   │   │   ├── inquiries/         # Lead endpoints
│   │   │   ├── settings/          # Config endpoints
│   │   │   └── dashboard/         # Stats endpoints
│   │   ├── globals.css            # Global styles
│   │   └── layout.js              # Root layout
│   ├── components/
│   │   ├── layout/                # Navbar, Footer, etc.
│   │   ├── sections/              # Hero, Services, Projects
│   │   ├── ui/                    # Reusable UI components
│   │   └── admin/                 # Admin components
│   ├── lib/
│   │   ├── auth.js                # JWT utilities
│   │   ├── mongodb.js             # DB connection
│   │   └── utils.js               # Helper functions
│   ├── models/                    # MongoDB schemas
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Service.js
│   │   ├── Offer.js
│   │   ├── BlogPost.js
│   │   ├── Testimonial.js
│   │   ├── Inquiry.js
│   │   └── Settings.js
│   └── middleware.js              # Auth middleware
├── scripts/
│   └── seed.js                    # Database seeding
├── public/                        # Static assets
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json
├── .env.local                     # Environment variables (create this)
├── README.md                      # This file
└── SETUP_GUIDE.md                # Detailed setup guide
```

---

## 🚀 Deploy to Production

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repo
   - Add environment variables:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `NEXT_PUBLIC_APP_URL` (your domain)
   - Click "Deploy"

3. **Set Custom Domain**
   - In Vercel dashboard
   - Project → Settings → Domains
   - Add your custom domain

### Self-Hosted (Docker Example)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Deploy with Docker Compose, AWS, DigitalOcean, Heroku, etc.

---

## 📊 API Endpoints

### Authentication
```
POST   /api/auth/login       - Admin login
POST   /api/auth/logout      - Admin logout
GET    /api/auth/me          - Current user info
```

### Projects
```
GET    /api/projects         - List projects
POST   /api/projects         - Create project (admin)
GET    /api/projects/[id]    - Get project detail
PUT    /api/projects/[id]    - Update project (admin)
DELETE /api/projects/[id]    - Delete project (admin)
```

### Services
```
GET    /api/services         - List services
POST   /api/services         - Create service (admin)
PUT    /api/services/[id]    - Update service (admin)
DELETE /api/services/[id]    - Delete service (admin)
```

### Offers
```
GET    /api/offers           - List active offers
POST   /api/offers           - Create offer (admin)
PUT    /api/offers/[id]      - Update offer (admin)
DELETE /api/offers/[id]      - Delete offer (admin)
```

### Blog
```
GET    /api/blog             - List posts
POST   /api/blog             - Create post (admin)
GET    /api/blog/[id]        - Get post detail
PUT    /api/blog/[id]        - Update post (admin)
DELETE /api/blog/[id]        - Delete post (admin)
```

### Testimonials
```
GET    /api/testimonials     - List testimonials
POST   /api/testimonials     - Create testimonial (admin)
PUT    /api/testimonials/[id]- Update testimonial (admin)
DELETE /api/testimonials/[id]- Delete testimonial (admin)
```

### Inquiries
```
GET    /api/inquiries        - List inquiries (admin)
POST   /api/inquiries        - Submit inquiry (public)
PUT    /api/inquiries/[id]   - Update inquiry (admin)
DELETE /api/inquiries/[id]   - Delete inquiry (admin)
```

### Settings
```
GET    /api/settings         - Get all settings
PUT    /api/settings         - Update settings (admin)
```

### Dashboard
```
GET    /api/dashboard/stats  - Dashboard statistics (admin)
```

---

## 🎨 Customization

### Change Color Scheme
Edit `/src/app/globals.css`:
```css
:root {
  --primary:   #0a0f1e;
  --accent:    #2563eb;  /* Change this */
  --gold:      #f59e0b;
}
```

### Update Logo & Branding
1. Admin Dashboard → Settings
2. Update brand name, headline, contact info
3. Replace logo in components

### Customize Homepage
Edit `/src/app/(site)/page.js` or use admin settings.

### Add Custom Pages
Create new folders in `/src/app/(site)/`

---

## 🔒 Security

### Features Included
✅ JWT authentication  
✅ Password hashing (bcryptjs)  
✅ HTTP-only cookies  
✅ Route protection via middleware  
✅ Input validation  
✅ CORS configuration ready  

### Before Production
- [ ] Change JWT_SECRET to strong random value
- [ ] Set `secure: true` in cookies (HTTPS only)
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Use HTTPS/SSL certificate
- [ ] Add CAPTCHA to contact form (optional)
- [ ] Monitor inquiry submissions
- [ ] Regular backups of MongoDB

---

## 📈 Performance Optimization

### Already Optimized
- Image optimization with Next.js Image component
- CSS minification
- JavaScript code splitting
- Font optimization
- Lazy loading of components

### Further Optimization
- Add Cloudinary for image hosting
- Implement caching headers
- Use CDN for static assets
- Enable gzip compression
- Monitor Core Web Vitals

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Verify connection string in `.env.local`
- Check MongoDB is running
- Ensure firewall allows connection
- Check MongoDB Atlas IP whitelist

### Admin Login Not Working
- Clear browser cookies
- Check admin user exists: `npm run seed`
- Verify JWT_SECRET is set
- Check MongoDB connection

### Build Error on Vercel
- Check all environment variables are set
- Verify Node.js version (18+)
- Check for TypeScript errors
- Review build logs

### Animations Not Working
- Verify Framer Motion is installed
- Check globals.css has reveal classes
- Ensure CSS is being loaded
- Check browser DevTools

---

## 📞 Support

For issues and questions:
1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Review [Next.js docs](https://nextjs.org/docs)
3. Check [MongoDB documentation](https://docs.mongodb.com/)

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🎉 What's Next?

1. **Customize content** - Edit services, projects, offers
2. **Add your branding** - Update colors, logo, text
3. **Setup domain** - Connect custom domain
4. **Deploy** - Push to production
5. **Monitor** - Track analytics and inquiries
6. **Optimize** - Improve based on user behavior

---

## 🙏 Thank You

Built with ❤️ for ambitious businesses ready to scale.

**Ready to launch your premium website? Let's go! 🚀**

---

*Last Updated: 2024 | Next.js 14 | React 18 | MongoDB | Tailwind CSS*
