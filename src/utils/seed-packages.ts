import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding packages...");

  const packages = [
    {
      title: "Ramadan Platinum Experience",
      slug: "ramadan-platinum-experience",
      imageUrl: "https://images.unsplash.com/photo-1565552643952-b482b4ae5201?q=80&w=2000&auto=format&fit=crop",
      season: "Ramadan",
      period: "Last 10 Days",
      priceFrom: 4500,
      durationDays: 14,
      makkahHotel: "Fairmont Makkah Clock Royal Tower",
      madinahHotel: "The Oberoi Madina",
      highlights: "VIP Transport, Private Guides, Luxury Iftar, Haram View",
      status: "ACTIVE",
    },
    {
      title: "Executive Hajj Package",
      slug: "executive-hajj-package",
      imageUrl: "https://images.unsplash.com/photo-1591807498711-d0b8fbc0bdf2?q=80&w=2000&auto=format&fit=crop",
      season: "Hajj",
      period: "Full Hajj",
      priceFrom: 12500,
      durationDays: 21,
      makkahHotel: "Raffles Makkah Palace",
      madinahHotel: "Dar Al Taqwa Hotel",
      highlights: "Private Mina Tents, Dedicated Scholar, VIP Medical Support",
      status: "ACTIVE",
    },
    {
      title: "Winter Spiritual Retreat",
      slug: "winter-spiritual-retreat",
      imageUrl: "https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=2000&auto=format&fit=crop",
      season: "Winter",
      period: "Early January",
      priceFrom: 2800,
      durationDays: 10,
      makkahHotel: "Swissôtel Makkah",
      madinahHotel: "Pullman Zamzam Madina",
      highlights: "Family Friendly, Ziyarat Tours, Flexible Dining",
      status: "ACTIVE",
    },
    {
      title: "Premium Weekend Umrah",
      slug: "premium-weekend-umrah",
      imageUrl: "https://images.unsplash.com/photo-1565552644265-d603cc37d2ce?q=80&w=2000&auto=format&fit=crop",
      season: "Anytime",
      period: "Long Weekend",
      priceFrom: 1800,
      durationDays: 5,
      makkahHotel: "Hilton Suites Makkah",
      madinahHotel: "Mövenpick Hotel Anwar Al Madinah",
      highlights: "Express Visa, Quick Escapes, Minimal Luggage",
      status: "ACTIVE",
    }
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { slug: pkg.slug },
      update: pkg,
      create: pkg,
    });
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
