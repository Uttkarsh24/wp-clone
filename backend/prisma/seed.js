import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Default Admin User
  const adminUsername = 'admin';
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  const adminUser = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      username: adminUsername,
      email: adminEmail,
      passwordHash,
      role: 'ADMIN'
    }
  });

  console.log(`Created admin user: ${adminUser.username} (Password: ${adminPassword})`);

  // 2. Create Default Categories
  const categories = [
    { name: 'Technology', slug: 'technology' },
    { name: 'Design', slug: 'design' },
    { name: 'Lifestyle', slug: 'lifestyle' }
  ];

  const seededCategories = [];
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat
    });
    seededCategories.push(c);
  }
  console.log('Seeded categories');

  // 3. Create Default Tags
  const tags = [
    { name: 'React', slug: 'react' },
    { name: 'Node.js', slug: 'nodejs' },
    { name: 'CSS', slug: 'css' },
    { name: 'Aesthetics', slug: 'aesthetics' }
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag
    });
  }
  console.log('Seeded tags');

  // 4. Create Default Settings (De-branded)
  const settings = [
    { key: 'site_title', value: 'CMS Journal' },
    { key: 'site_tagline', value: 'Thoughtful reflections on web engineering, design aesthetics, and modern workflows.' },
    { key: 'primary_color', value: '#3b82f6' }, // Blue
    { key: 'accent_color', value: '#1d4ed8' },
    { key: 'navigation_menu', value: JSON.stringify([
      { label: 'Home', link: '/' },
      { label: 'About', link: '/about' },
      { label: 'Services', link: '/services' }
    ]) }
  ];

  for (const set of settings) {
    await prisma.setting.upsert({
      where: { key: set.key },
      update: {},
      create: set
    });
  }
  console.log('Seeded default settings');

  // 5. Create Default Pages
  const pages = [
    {
      title: 'About the Journal',
      slug: 'about',
      content: `
        <article style="line-height: 1.8;">
          <h2>Welcome to the CMS Journal!</h2>
          <p>This is a modern, high-performance publishing platform crafted entirely using React, Node.js, Express, and Prisma with SQLite. It serves as a fully responsive WordPress clone designed for digital publishers who prioritize speed, minimalism, and premium reading experiences.</p>
          <p>Our editing experience mimics block-based workflows but runs with lightweight clients and APIs. We hope you enjoy browsing the demo!</p>
        </article>
      `,
      status: 'PUBLISHED'
    },
    {
      title: 'Our Services',
      slug: 'services',
      content: `
        <article style="line-height: 1.8;">
          <h2>Consulting & Fullstack Engineering</h2>
          <p>We provide standard bespoke web applications, specializing in high-fidelity interfaces, custom content management systems, and performant server infrastructures.</p>
          <ul>
            <li>Front-end Design Systems (Tailwind / Vanilla CSS)</li>
            <li>Custom CMS and Admin Portals</li>
            <li>Scalable REST and GraphQL API Architectures</li>
          </ul>
        </article>
      `,
      status: 'PUBLISHED'
    }
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page
    });
  }
  console.log('Seeded pages');

  // 6. Create Default Posts (De-branded)
  const posts = [
    {
      title: 'The Art of Vanilla CSS in Modern Web Apps',
      slug: 'art-of-vanilla-css',
      content: `
        <p>In a world dominated by utility-first frameworks, the elegance of <strong>Vanilla CSS</strong> is making a massive comeback. With the introduction of CSS Custom Properties (variables), Nesting, Container Queries, and CSS Grid, developers now possess native browser superpowers that eliminate the need for heavy build pipelines and massive class list definitions.</p>
        
        <h3>Why Choose Vanilla CSS today?</h3>
        <p>Vanilla CSS provides absolute layout freedom. You don't have to battle configuration files to override default paddings or animations. By utilizing a robust design system in <code>index.css</code>, you can maintain modular and highly maintainable styling throughout your React pages.</p>
        
        <blockquote>
          "Simplicity is the ultimate sophistication. By mastering native CSS APIs, your pages load instantly and are highly maintainable."
        </blockquote>
        
        <p>In this post, we explore standard techniques for building sleek glassmorphic card patterns and smooth hover animations with transitions, all built from scratch using clean vanilla styles.</p>
      `,
      excerpt: 'Discover why native styling is returning to the spotlight, and how native container queries, nesting, and CSS variables empower developer styling.',
      status: 'PUBLISHED',
      categoryId: seededCategories[0].id, // Technology
      tagsList: ['css', 'aesthetics']
    },
    {
      title: 'Building Lightweight Monoliths with Node and SQLite',
      slug: 'lightweight-monoliths-sqlite',
      content: `
        <p>When starting a new SaaS or content publishing site, developers often default to complex serverless configurations or distributed microservices. However, for a massive share of web projects, a simple <strong>lightweight Node.js monolith</strong> backed by SQLite is not only sufficient, but vastly faster to ship, deploy, and maintain.</p>
        
        <h3>The Hidden Power of SQLite</h3>
        <p>Contrary to popular belief, SQLite is an exceptionally fast, transactional, and fully relational database engine. With WAL (Write-Ahead Logging) mode activated, SQLite handles thousands of concurrent requests with sub-millisecond response times, using nothing more than a single file on local storage.</p>
        
        <p>When combined with ORMs like Prisma, shifting to PostgreSQL or MySQL later takes seconds, while keeping local development extremely fast and bootstrap-free.</p>
      `,
      excerpt: 'Explore the performance and cost benefits of building modular monolithic Express applications backed by SQLite and Prisma ORM.',
      status: 'PUBLISHED',
      categoryId: seededCategories[0].id, // Technology
      tagsList: ['react', 'nodejs']
    }
  ];

  for (const p of posts) {
    const { tagsList, ...postData } = p;
    await prisma.post.upsert({
      where: { slug: postData.slug },
      update: {},
      create: {
        ...postData,
        authorId: adminUser.id,
        publishedAt: new Date(),
        tags: {
          connectOrCreate: tagsList.map(tag => ({
            where: { slug: tag },
            create: { name: tag.charAt(0).toUpperCase() + tag.slice(1), slug: tag }
          }))
        }
      }
    });
  }
  console.log('Seeded blog posts');

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
