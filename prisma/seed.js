const { PrismaClient } = require('@prisma/client');
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const packageCatalog = [
  {
    title: "Ramadan Last 10 Days",
    slug: "ramadan-last-10",
    season: "Ramadan",
    period: "Last 10 Days",
    priceFrom: 4890,
    durationDays: 10,
    makkahHotel: "Fairmont Makkah Clock Royal Tower",
    madinahHotel: "The Oberoi Madina",
    highlights: "Luxury Accommodation,Expert Guidance,VIP Transfers",
    status: "ACTIVE"
  },
  {
    title: "Ramadan First 20 Days",
    slug: "ramadan-first-20",
    season: "Ramadan",
    period: "First 20 Days",
    priceFrom: 6200,
    durationDays: 20,
    makkahHotel: "Raffles Makkah Palace",
    madinahHotel: "Anwar Al Madinah Mövenpick",
    highlights: "Full Spiritual Support,Gourmet Iftar,Central Hotels",
    status: "ACTIVE"
  },
  {
    title: "January Mid-Month",
    slug: "january-mid",
    season: "January",
    period: "Mid January",
    priceFrom: 2890,
    durationDays: 12,
    makkahHotel: "Swissôtel Makkah",
    madinahHotel: "Pullman Zamzam Madina",
    highlights: "Affordable Luxury,Guided Ziyarat,Small Groups",
    status: "ACTIVE"
  },
  {
    title: "Summer Special",
    slug: "summer-special",
    season: "July",
    period: "Early July",
    priceFrom: 2450,
    durationDays: 14,
    makkahHotel: "Hilton Suites Makkah",
    madinahHotel: "Crowne Plaza Madinah",
    highlights: "Family Friendly,Air Conditioned Travel,Great Value",
    status: "ACTIVE"
  }
];

async function main() {
  console.log(`Cleaning existing data ...`);
  await prisma.package.deleteMany();
  await prisma.user.deleteMany();

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
      role: "VIP",
      passwordHash: await bcrypt.hash("User@12345", 10),
    }
  });
  console.log(`Created user with id: ${user.id}`);

  const admin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@umrah.local",
      role: "ADMIN",
      passwordHash: await bcrypt.hash("Admin@12345", 10),
    },
  });
  console.log(`Created admin with id: ${admin.id}`);

  const cmsEntries = [
    { screen: "login", section: "hero", contentKey: "title", value: "Welcome Back" },
    { screen: "login", section: "hero", contentKey: "subtitle", value: "Access your elite sanctuary" },
    { screen: "signup", section: "hero", contentKey: "title", value: "Begin Your Journey" },
    { screen: "signup", section: "hero", contentKey: "subtitle", value: "Join our elite circle of pilgrims" },
    { screen: "packages", section: "hero", contentKey: "title", value: "Sacred Journey Schedules" },
    { screen: "packages", section: "hero", contentKey: "subtitle", value: "Browse our meticulously planned itineraries organized by the most blessed times of the year." },
    { screen: "checkout", section: "hero", contentKey: "title", value: "Finalize Your Ritual" },
    { screen: "admin-dashboard", section: "hero", contentKey: "title", value: "Executive Dashboard" },
    { screen: "admin-dashboard", section: "hero", contentKey: "subtitle", value: "Overview of all portal metrics and activities." },
    { screen: "home", section: "hero", contentKey: "badge", value: "Excellence in Pilgrimage" },
    { screen: "home", section: "hero", contentKey: "title", value: "Elevate Your Spiritual Journey to New Heights" },
    { screen: "home", section: "hero", contentKey: "subtitle", value: "Experience a seamless Umrah journey with curated luxury accommodations, expert guidance, and personalized attention at every step." },
    { screen: "home", section: "hero", contentKey: "cta_primary", value: "View Schedules" },
    { screen: "home", section: "seasonal", contentKey: "title", value: "Sacred Journeys by Time" },
    { screen: "home", section: "seasonal", contentKey: "subtitle", value: "Discover meticulously planned itineraries synchronized with the most blessed times of the year." },
    { screen: "home", section: "seasonal", contentKey: "cta_link", value: "View Full Calendar" },
    { screen: "home", section: "faq", contentKey: "q_1", value: "What distinguishes the Elite Tier from standard packages?" },
    { screen: "home", section: "faq", contentKey: "a_1", value: "Elite Tier offers front-row Haram views, private chauffeur service, and 24/7 dedicated concierge assistance throughout your entire stay." },
    { screen: "home", section: "faq", contentKey: "q_2", value: "How are local guides selected for the spiritual tours?" },
    { screen: "home", section: "faq", contentKey: "a_2", value: "Our guides are accredited scholars with deep knowledge of Islamic history and a commitment to providing an educational, serene experience." },
    { screen: "home", section: "faq", contentKey: "q_3", value: "Can packages be customized for families with children?" },
    { screen: "home", section: "faq", contentKey: "a_3", value: "Absolutely. We specialize in family logistics, providing tailored room configurations and child-friendly transportation options." },
    { screen: "home", section: "consultation", contentKey: "title", value: "Plan Your Pilgrimage with Our Experts" },
    { screen: "home", section: "consultation", contentKey: "subtitle", value: "Schedule a private session with our travel designers to craft your unique spiritual itinerary." },
    { screen: "home", section: "consultation", contentKey: "cta_primary", value: "Request Consultation" },
    { screen: "home", section: "consultation", contentKey: "cta_secondary", value: "Download Brochure" },
    { screen: "about", section: "hero", contentKey: "title", value: "About Umrah Premium" },
    { screen: "about", section: "mission", contentKey: "title", value: "Crafting Spiritual Journeys with Excellence" },
    { screen: "about", section: "mission", contentKey: "description", value: "Umrah Premium was founded on the principle that every pilgrim deserves a journey as sacred as their intention. We bridge the gap between traditional spirituality and modern luxury, providing a seamless experience that allows you to focus entirely on your worship." },
    { screen: "contact", section: "hero", contentKey: "title", value: "Connect With Us" },
    { screen: "contact", section: "support", contentKey: "title", value: "Sacred Support" },
    { screen: "contact", section: "support", contentKey: "description", value: "Our dedicated team of spiritual travel designers is available around the clock to assist with your inquiries and travel arrangements." },
    { screen: "contact", section: "channels", contentKey: "title_1", value: "WhatsApp Concierge" },
    { screen: "contact", section: "channels", contentKey: "detail_1", value: "+966 555 123 456" },
    { screen: "contact", section: "channels", contentKey: "title_2", value: "Priority Line" },
    { screen: "contact", section: "channels", contentKey: "detail_2", value: "800-UMRAH-PREMIUM" },
    { screen: "contact", section: "channels", contentKey: "title_3", value: "Email Inquiry" },
    { screen: "contact", section: "channels", contentKey: "detail_3", value: "concierge@umrahpremium.com" },
    { screen: "contact", section: "office", contentKey: "title", value: "Visit Our Makkah Office" },
    { screen: "contact", section: "office", contentKey: "address", value: "Clock Tower Commercial Complex, Floor 4, Suite 402, Makkah Al-Mukarramah, KSA" },
    { screen: "contact", section: "office", contentKey: "cta", value: "Get Directions" },
    { screen: "contact", section: "faq", contentKey: "title", value: "Common Inquiries" },
    { screen: "contact", section: "faq", contentKey: "q_1", value: "Visa processing time?" },
    { screen: "contact", section: "faq", contentKey: "a_1", value: "Standard visa processing typically takes 3-5 business days through our fast-track system." },
    { screen: "contact", section: "faq", contentKey: "q_2", value: "Local transfers?" },
    { screen: "contact", section: "faq", contentKey: "a_2", value: "All Premium and Elite packages include private chauffeured VIP transportation." },
    { screen: "contact", section: "faq", contentKey: "q_3", value: "Customization?" },
    { screen: "contact", section: "faq", contentKey: "a_3", value: "Our designers can customize any package to your specific spiritual and luxury requirements." },
    { screen: "contact", section: "faq", contentKey: "q_4", value: "Refund policy?" },
    { screen: "contact", section: "faq", contentKey: "a_4", value: "Cancellations made 30 days prior are eligible for up to 90% refund of the package value." },
    { screen: "destinations", section: "hero", contentKey: "title", value: "Sacred Cities" },
    { screen: "destinations", section: "hero", contentKey: "subtitle", value: "A journey through the holiest landscapes on earth, where history meets eternity and every step is a prayer." },
    { screen: "destinations", section: "makkah", contentKey: "title", value: "Makkah Al-Mukarramah" },
    { screen: "destinations", section: "makkah", contentKey: "description", value: "Makkah is not just a destination; it is the spiritual home of two billion hearts. From the first moment you witness the Kaaba, your soul finds its center. Our elite collections ensure your stay is as serene as your prayers, with direct access to the Holy Mosque." },
    { screen: "destinations", section: "landmarks", contentKey: "title_1", value: "Jabal al-Nour" },
    { screen: "destinations", section: "landmarks", contentKey: "desc_1", value: "The Mountain of Light, housing the Cave of Hira where the first revelation descended." },
    { screen: "destinations", section: "landmarks", contentKey: "title_2", value: "Quba Mosque" },
    { screen: "destinations", section: "landmarks", contentKey: "desc_2", value: "The first mosque built in Islamic history, located on the outskirts of Madinah." },
    { screen: "destinations", section: "landmarks", contentKey: "title_3", value: "Mount Uhud" },
    { screen: "destinations", section: "landmarks", contentKey: "desc_3", value: "A site of immense historical significance and the resting place of many martyrs." },
    { screen: "destinations", section: "madinah_sites", contentKey: "item_1", value: "Prophet's Mosque (Al-Masjid an-Nabawi)" },
    { screen: "destinations", section: "madinah_sites", contentKey: "item_2", value: "Quba Mosque" },
    { screen: "destinations", section: "madinah_sites", contentKey: "item_3", value: "Mount Uhud" },
    { screen: "destinations", section: "madinah_sites", contentKey: "item_4", value: "Baqi Cemetery" },
    { screen: "hotels", section: "hero", contentKey: "title", value: "The Elite Collection" },
    { screen: "hotels", section: "hero", contentKey: "subtitle", value: "Where luxury meets devotion. We have hand-selected the most prestigious addresses in Makkah and Madinah to ensure your spiritual focus is never compromised by discomfort." },
    { screen: "hotels", section: "standard", contentKey: "title", value: "Uncompromising Excellence" },
    { screen: "hotels", section: "standard", contentKey: "description", value: "Our hotel portfolio isn't just about five stars; it's about proximity, prayer-room acoustics, and the ability to witness the Kaaba from your window. We curate spaces that feel like an extension of the Holy Mosque." },
    { screen: "hotels", section: "cards", contentKey: "cta", value: "Request Pricing" },
    { screen: "hotels", section: "cards", contentKey: "name_1", value: "Swissotel Makkah" },
    { screen: "hotels", section: "cards", contentKey: "location_1", value: "Makkah" },
    { screen: "hotels", section: "cards", contentKey: "feature_1", value: "Direct Mall Access" },
    { screen: "hotels", section: "cards", contentKey: "name_2", value: "Oberoi Madinah" },
    { screen: "hotels", section: "cards", contentKey: "location_2", value: "Madinah" },
    { screen: "hotels", section: "cards", contentKey: "feature_2", value: "Closest to Rawdah" },
    { screen: "hotels", section: "cards", contentKey: "name_3", value: "Fairmont Clock Tower" },
    { screen: "hotels", section: "cards", contentKey: "location_3", value: "Makkah" },
    { screen: "hotels", section: "cards", contentKey: "feature_3", value: "Iconic Haram View" },
    { screen: "hotels", section: "cards", contentKey: "name_4", value: "Conrad Makkah" },
    { screen: "hotels", section: "cards", contentKey: "location_4", value: "Makkah" },
    { screen: "hotels", section: "cards", contentKey: "feature_4", value: "Modern Luxury" },
    { screen: "hotels", section: "cards", contentKey: "name_5", value: "Hilton Madinah" },
    { screen: "hotels", section: "cards", contentKey: "location_5", value: "Madinah" },
    { screen: "hotels", section: "cards", contentKey: "feature_5", value: "Prime Location" },
    { screen: "hotels", section: "cards", contentKey: "name_6", value: "Raffles Makkah" },
    { screen: "hotels", section: "cards", contentKey: "location_6", value: "Makkah" },
    { screen: "hotels", section: "cards", contentKey: "feature_6", value: "Bespoke Butler Service" },
    { screen: "hotels", section: "concierge", contentKey: "title", value: "Need a Specific Arrangement?" },
    { screen: "hotels", section: "concierge", contentKey: "subtitle", value: "Our elite concierge team can secure exclusive suites and interconnected rooms that aren't available on standard platforms." },
    { screen: "hotels", section: "concierge", contentKey: "cta", value: "Contact Concierge" },
    { screen: "dashboard", section: "hero", contentKey: "title", value: "My Sacred Journeys" },
    { screen: "dashboard", section: "hero", contentKey: "subtitle", value: "Manage your current and upcoming spiritual pilgrimages with elite precision." },
    { screen: "dashboard", section: "nav", contentKey: "item_1", value: "My Journeys" },
    { screen: "dashboard", section: "nav", contentKey: "item_2", value: "Identity Profile" },
    { screen: "dashboard", section: "nav", contentKey: "item_3", value: "Saved Sanctuaries" },
    { screen: "dashboard", section: "nav", contentKey: "item_4", value: "Visa Documents" },
    { screen: "dashboard", section: "nav", contentKey: "item_5", value: "Financial Records" },
    { screen: "dashboard", section: "nav", contentKey: "item_6", value: "Concierge Settings" },
    { screen: "dashboard", section: "concierge", contentKey: "title", value: "Private Concierge" },
    { screen: "dashboard", section: "concierge", contentKey: "subtitle", value: "Your dedicated advisor is ready to assist with your sacred journey." },
    { screen: "dashboard", section: "concierge", contentKey: "cta", value: "Instant Support" },
    { screen: "checkout", section: "summary", contentKey: "title", value: "Reservation Summary" },
    { screen: "checkout", section: "summary", contentKey: "selected_label", value: "Selected Sanctuary" },
    { screen: "checkout", section: "summary", contentKey: "season_label", value: "Season" },
    { screen: "checkout", section: "summary", contentKey: "duration_label", value: "Duration" },
    { screen: "checkout", section: "summary", contentKey: "starting_from_label", value: "Starting From" },
    { screen: "checkout", section: "summary", contentKey: "makkah_label", value: "Makkah Hotel" },
    { screen: "package-detail", section: "intro", contentKey: "description", value: "Experience a transformative spiritual journey in this season, meticulously synchronized with the most blessed periods of the Islamic calendar." },
    { screen: "package-detail", section: "path", contentKey: "title", value: "The Sacred Path" },
    { screen: "home", section: "testimonials", contentKey: "name_1", value: "Dr. Ahmed Rahman" },
    { screen: "home", section: "testimonials", contentKey: "role_1", value: "Elite Member" },
    { screen: "home", section: "testimonials", contentKey: "location_1", value: "London, UK" },
    { screen: "home", section: "testimonials", contentKey: "text_1", value: "The level of professionalism surpassed all my expectations. Every detail was meticulously planned." },
    { screen: "home", section: "testimonials", contentKey: "name_2", value: "Fatima Al-Sayed" },
    { screen: "home", section: "testimonials", contentKey: "role_2", value: "Platinum Member" },
    { screen: "home", section: "testimonials", contentKey: "location_2", value: "Dubai, UAE" },
    { screen: "home", section: "testimonials", contentKey: "text_2", value: "Truly a premium experience. The hotel views were breathtaking, and the support made everything seamless." },
    { screen: "home", section: "testimonials", contentKey: "name_3", value: "Omar Farooq" },
    { screen: "home", section: "testimonials", contentKey: "role_3", value: "Elite Member" },
    { screen: "home", section: "testimonials", contentKey: "location_3", value: "Riyadh, KSA" },
    { screen: "home", section: "testimonials", contentKey: "text_3", value: "Exceeded every requirement. The private transportation was punctual and exceptionally comfortable throughout." },
    { screen: "home", section: "testimonials", contentKey: "name_4", value: "Sarah Jenkins" },
    { screen: "home", section: "testimonials", contentKey: "role_4", value: "Gold Member" },
    { screen: "home", section: "testimonials", contentKey: "location_4", value: "Toronto, CA" },
    { screen: "home", section: "testimonials", contentKey: "text_4", value: "The guidance provided at the sacred sites was insightful and deeply moving. Highly recommended for first-timers." },
    { screen: "home", section: "testimonials", contentKey: "name_5", value: "Hassan Ali" },
    { screen: "home", section: "testimonials", contentKey: "role_5", value: "Platinum Member" },
    { screen: "home", section: "testimonials", contentKey: "location_5", value: "Singapore" },
    { screen: "home", section: "testimonials", contentKey: "text_5", value: "Luxury at its finest. From arrival to departure, the attention to detail was simply world-class." },
    { screen: "home", section: "testimonials", contentKey: "name_6", value: "Zainab Malik" },
    { screen: "home", section: "testimonials", contentKey: "role_6", value: "Elite Member" },
    { screen: "home", section: "testimonials", contentKey: "location_6", value: "Manchester, UK" },
    { screen: "home", section: "testimonials", contentKey: "text_6", value: "A truly transformative journey. The concierge service handled every request with grace and efficiency." }
  ];

  await prisma.cmsContent.deleteMany();
  for (const entry of cmsEntries) {
    await prisma.cmsContent.create({
      data: {
        ...entry,
        contentType: "TEXT",
        isPublished: true,
        updatedBy: "seed",
      },
    });
  }
  console.log(`Seeded CMS entries: ${cmsEntries.length}`);

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
