import { getDb } from "../api/queries/connection";
import { hashPassword } from "../api/auth/password";
import { items, projects, subscriptions, tutors, users } from "./schema";

// All demo accounts share this password so you can sign in right away.
const DEMO_PASSWORD = "password123";
const ADMIN_EMAIL = "admin@university.edu";
const ADMIN_PASSWORD = "CampusAdmin!2026";
const MODERATOR_EMAIL = "moderator@university.edu";
const MODERATOR_PASSWORD = "CampusMod!2026";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Seed demo users (ids 1-4) so the marketplace data below has real owners.
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const sampleUsers = [
    { email: "alex@campus.edu", name: "Alex Rahman", university: "NUST", campus: "H-12 Islamabad", department: "Electrical Engineering" },
    { email: "sara@campus.edu", name: "Sara Khan", university: "NUST", campus: "H-12 Islamabad", department: "Computer Science" },
    { email: "bilal@campus.edu", name: "Bilal Ahmed", university: "NUST", campus: "H-12 Islamabad", department: "Mechatronics" },
    { email: "hina@campus.edu", name: "Hina Malik", university: "NUST", campus: "H-12 Islamabad", department: "Humanities" },
  ].map((u) => ({
    ...u,
    passwordHash,
    avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(u.name)}`,
  }));

  // Seed Items (Rentals + Marketplace)
  const sampleItems = [
    {
      title: "Engineering Drawing Kit",
      description: "Complete drawing kit with compass, set squares, protractor, and pencils. Perfect for first-year engineering students.",
      price: "500.00",
      priceType: "per_day" as const,
      category: "tools" as const,
      type: "rental" as const,
      image: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=400",
      condition: "good" as const,
      securityDeposit: "1000.00",
      tags: "drawing,engineering,tools",
      ownerId: 1,
      university: "NUST",
      campus: "H-12 Islamabad",
      viewCount: 45,
    },
    {
      title: "Canon EOS R5 DSLR Camera",
      description: "Professional DSLR camera with 24-105mm lens, dual battery, and 128GB SD card. Perfect for media studies and architecture projects.",
      price: "1500.00",
      priceType: "per_day" as const,
      category: "electronics" as const,
      type: "rental" as const,
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
      condition: "like_new" as const,
      securityDeposit: "5000.00",
      tags: "camera,photography,video",
      ownerId: 2,
      university: "NUST",
      campus: "H-12 Islamabad",
      viewCount: 120,
    },
    {
      title: "Scientific Calculator Casio FX-991",
      description: "Advanced scientific calculator with matrix, integration and differential calculation functions.",
      price: "200.00",
      priceType: "per_day" as const,
      category: "electronics" as const,
      type: "rental" as const,
      image: "https://images.unsplash.com/photo-1609697299491-69d2d5ed2c36?q=80&w=1334&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      condition: "good" as const,
      securityDeposit: "500.00",
      tags: "calculator,math,engineering",
      ownerId: 1,
      university: "NUST",
      campus: "H-12 Islamabad",
      viewCount: 78,
    },
    {
      title: "Arduino Uno Starter Kit",
      description: "Complete Arduino kit with sensors, motors, LEDs, and breadboard. Perfect for IoT and embedded systems projects.",
      price: "800.00",
      priceType: "per_week" as const,
      category: "electronics" as const,
      type: "rental" as const,
      image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400",
      condition: "good" as const,
      securityDeposit: "1500.00",
      tags: "arduino,iot,electronics",
      ownerId: 3,
      university: "NUST",
      campus: "H-12 Islamabad",
      viewCount: 92,
    },
    {
      title: "Calculus II Notes - Complete Set",
      description: "Comprehensive handwritten notes covering limits, derivatives, integrals, and series. Includes solved past papers from 2019-2024.",
      price: "300.00",
      priceType: "fixed" as const,
      category: "notes" as const,
      type: "sale" as const,
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
      condition: "like_new" as const,
      tags: "calculus,math,notes",
      ownerId: 2,
      university: "NUST",
      campus: "H-12 Islamabad",
      viewCount: 156,
    },
    {
      title: "Chemistry Lab Coat & Goggles",
      description: "Standard white lab coat and safety goggles. Required for all chemistry lab sessions.",
      price: "150.00",
      priceType: "per_day" as const,
      category: "fashion" as const,
      type: "rental" as const,
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400",
      condition: "good" as const,
      securityDeposit: "300.00",
      tags: "lab,chemistry,safety",
      ownerId: 4,
      university: "NUST",
      campus: "H-12 Islamabad",
      viewCount: 67,
    },
    {
      title: "Linear Algebra - Gilbert Strang",
      description: "4th Edition, excellent condition. Essential textbook for all engineering and CS students.",
      price: "450.00",
      priceType: "fixed" as const,
      category: "books" as const,
      type: "sale" as const,
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
      condition: "good" as const,
      tags: "math,linear algebra,textbook",
      ownerId: 1,
      university: "NUST",
      campus: "H-12 Islamabad",
      viewCount: 203,
    },
    {
      title: "3D Printer Access - Ender 3",
      description: "Access to Ender 3 3D printer with PLA filament included. Perfect for prototyping and design projects.",
      price: "1000.00",
      priceType: "per_day" as const,
      category: "tools" as const,
      type: "rental" as const,
      image: "https://images.unsplash.com/photo-1631541909061-71e349d1f203?w=400",
      condition: "good" as const,
      securityDeposit: "2000.00",
      tags: "3d printing,prototyping,design",
      ownerId: 3,
      university: "NUST",
      campus: "H-12 Islamabad",
      viewCount: 88,
    },
  ];

  // Seed Projects (Project Graveyard)
  const sampleProjects = [
    {
      title: "Smart Irrigation System - Arduino",
      description: "A fully functioning automated plant watering system using Arduino Uno, capacitive moisture sensors, and a water pump. Includes complete circuit diagrams and code.",
      category: "hardware" as const,
      completion: 85,
      price: "12500.00",
      originalPrice: "25000.00",
      techStack: "C++, IoT, Arduino",
      documentation: true,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400",
      sellerId: 3,
      university: "NUST",
      viewCount: 142,
    },
    {
      title: "E-commerce App - Flutter",
      description: "Basic UI, Firebase Auth, and Product Grid completed. Needs Cart logic and Payment Gateway integration.",
      category: "mobile_app" as const,
      completion: 40,
      price: "4500.00",
      originalPrice: "15000.00",
      techStack: "Dart, Firebase, Flutter",
      documentation: false,
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400",
      sellerId: 2,
      university: "NUST",
      viewCount: 98,
    },
    {
      title: "FaceAuth Library",
      description: "Python wrapper for OpenFace optimized for low-spec campus kiosks. Fully documented with API reference.",
      category: "ai_ml" as const,
      completion: 95,
      price: "8200.00",
      originalPrice: "18000.00",
      techStack: "Python, OpenCV, ML",
      documentation: true,
      image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400",
      sellerId: 1,
      university: "NUST",
      viewCount: 76,
    },
    {
      title: "Campus Navigation App",
      description: "Interactive campus map with indoor navigation using beacon technology. 60% complete with working map rendering.",
      category: "mobile_app" as const,
      completion: 60,
      price: "6800.00",
      originalPrice: "20000.00",
      techStack: "React Native, Node.js, MongoDB",
      documentation: true,
      image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400",
      sellerId: 4,
      university: "NUST",
      viewCount: 115,
    },
    {
      title: "IoT Weather Station",
      description: "ESP32-based weather monitoring system with temperature, humidity, pressure sensors. Data uploaded to cloud dashboard.",
      category: "iot" as const,
      completion: 70,
      price: "5500.00",
      originalPrice: "12000.00",
      techStack: "ESP32, C++, MQTT, AWS",
      documentation: true,
      image: "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=400",
      sellerId: 3,
      university: "NUST",
      viewCount: 63,
    },
  ];

  // Seed Subscriptions
  const sampleSubscriptions = [
    {
      serviceName: "Netflix",
      plan: "Premium (4 Screens)",
      totalCost: "2200.00",
      maxSlots: 4,
      filledSlots: 3,
      costPerSlot: "550.00",
      ownerId: 1,
      university: "NUST",
    },
    {
      serviceName: "Canva Pro",
      plan: "Team (5 Members)",
      totalCost: "4500.00",
      maxSlots: 5,
      filledSlots: 4,
      costPerSlot: "900.00",
      ownerId: 2,
      university: "NUST",
    },
    {
      serviceName: "Spotify Premium",
      plan: "Family (6 Members)",
      totalCost: "450.00",
      maxSlots: 6,
      filledSlots: 4,
      costPerSlot: "75.00",
      ownerId: 3,
      university: "NUST",
    },
    {
      serviceName: "YouTube Premium",
      plan: "Family (5 Members)",
      totalCost: "700.00",
      maxSlots: 5,
      filledSlots: 2,
      costPerSlot: "140.00",
      ownerId: 4,
      university: "NUST",
    },
    {
      serviceName: "Adobe Creative Cloud",
      plan: "All Apps (2 Seats)",
      totalCost: "12000.00",
      maxSlots: 2,
      filledSlots: 1,
      costPerSlot: "6000.00",
      ownerId: 1,
      university: "NUST",
    },
  ];

  // Seed Tutors
  const sampleTutors = [
    {
      userId: 1,
      title: "Math & Physics Tutor",
      bio: "3rd year Electrical Engineering student with a passion for teaching. Specialized in Calculus, Linear Algebra, and Physics I & II.",
      subjects: "Calculus, Linear Algebra, Physics, Circuit Analysis",
      hourlyRate: "500.00",
      rating: "4.8",
      totalSessions: 42,
      availability: "Mon-Fri 4PM-8PM, Sat 10AM-4PM",
      university: "NUST",
    },
    {
      userId: 2,
      title: "Programming & CS Tutor",
      bio: "CS senior with internship experience at top tech companies. Can help with Data Structures, Algorithms, Web Dev, and Mobile Apps.",
      subjects: "Data Structures, Algorithms, Python, JavaScript, React, Flutter",
      hourlyRate: "600.00",
      rating: "4.9",
      totalSessions: 67,
      availability: "Evenings & Weekends",
      university: "NUST",
    },
    {
      userId: 3,
      title: "Chemistry & Biology Tutor",
      bio: "Pre-med student with excellent grasp of organic chemistry and biology. Can help with lab reports and exam prep.",
      subjects: "Organic Chemistry, Biology, Biochemistry, Lab Techniques",
      hourlyRate: "450.00",
      rating: "4.7",
      totalSessions: 28,
      availability: "Tue-Thu 2PM-6PM, Sun All Day",
      university: "NUST",
    },
    {
      userId: 4,
      title: "English & Communication Skills",
      bio: "Help with academic writing, presentations, and communication skills. Perfect for thesis and report writing.",
      subjects: "Academic Writing, Presentation Skills, Technical Communication",
      hourlyRate: "400.00",
      rating: "4.6",
      totalSessions: 35,
      availability: "Flexible - Contact to Schedule",
      university: "NUST",
    },
  ];

  try {
    await db.insert(users).values(sampleUsers);
    console.log(`✓ Users seeded (login with any email below / "${DEMO_PASSWORD}")`);
    for (const u of sampleUsers) console.log(`    - ${u.email}`);
  } catch (e) {
    console.log("Users may already exist:", (e as Error).message);
  }

  try {
    await db.insert(users).values([
      {
        email: ADMIN_EMAIL,
        passwordHash: await hashPassword(ADMIN_PASSWORD),
        name: "Campus Super Admin",
        university: "NUST",
        campus: "H-12 Islamabad",
        role: "admin",
        avatar: `https://api.dicebear.com/9.x/initials/svg?seed=Campus%20Admin`,
      },
      {
        email: MODERATOR_EMAIL,
        passwordHash: await hashPassword(MODERATOR_PASSWORD),
        name: "Campus Moderator",
        university: "NUST",
        campus: "H-12 Islamabad",
        role: "moderator",
        avatar: `https://api.dicebear.com/9.x/initials/svg?seed=Campus%20Moderator`,
      },
    ]).onConflictDoNothing({ target: users.email });
    console.log("✓ Elevated accounts ready");
    console.log(`    - ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log(`    - ${MODERATOR_EMAIL} / ${MODERATOR_PASSWORD}`);
  } catch (e) {
    console.log("Elevated accounts may already exist:", (e as Error).message);
  }

  try {
    await db.insert(items).values(sampleItems);
    console.log("✓ Items seeded");
  } catch (e) {
    console.log("Items may already exist:", (e as Error).message);
  }

  try {
    await db.insert(projects).values(sampleProjects);
    console.log("✓ Projects seeded");
  } catch (e) {
    console.log("Projects may already exist:", (e as Error).message);
  }

  try {
    await db.insert(subscriptions).values(sampleSubscriptions);
    console.log("✓ Subscriptions seeded");
  } catch (e) {
    console.log("Subscriptions may already exist:", (e as Error).message);
  }

  try {
    await db.insert(tutors).values(sampleTutors);
    console.log("✓ Tutors seeded");
  } catch (e) {
    console.log("Tutors may already exist:", (e as Error).message);
  }

  console.log("Seed complete!");
}

seed().catch(console.error);
