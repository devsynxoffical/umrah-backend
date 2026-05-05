import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});

const packageCatalog = [
  {
    title: "Ramadan Last 10 Days",
    season: "Ramadan",
    period: "Last 10 Days",
    priceFrom: 4890,
    durationDays: 10,
    makkahHotel: "Fairmont Makkah Clock Royal Tower",
    madinahHotel: "The Oberoi Madina",
    status: "ACTIVE"
  },
  {
    title: "Ramadan First 20 Days",
    season: "Ramadan",
    period: "First 20 Days",
    priceFrom: 6200,
    durationDays: 20,
    makkahHotel: "Raffles Makkah Palace",
    madinahHotel: "Anwar Al Madinah Mövenpick",
    status: "ACTIVE"
  },
  {
    title: "January Mid-Month",
    season: "January",
    period: "Mid January",
    priceFrom: 2890,
    durationDays: 12,
    makkahHotel: "Swissôtel Makkah",
    madinahHotel: "Pullman Zamzam Madina",
    status: "ACTIVE"
  },
  {
    title: "Summer Special",
    season: "July",
    period: "Early July",
    priceFrom: 2450,
    durationDays: 14,
    makkahHotel: "Hilton Suites Makkah",
    madinahHotel: "Crowne Plaza Madinah",
    status: "ACTIVE"
  }
];

async function main() {
  console.log(`Start seeding ...`);
  for (const p of packageCatalog) {
    const pkg = await prisma.package.create({
      data: p,
    });
    console.log(`Created package with id: ${pkg.id}`);
  }
  
  // Create a dummy user
  const user = await prisma.user.create({
    data: {
      name: "Ahmed Al-Sayed",
      email: "ahmed@example.com",
      role: "VIP"
    }
  });
  console.log(`Created user with id: ${user.id}`);

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
