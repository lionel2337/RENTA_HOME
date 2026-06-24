import { db } from "./firebase";
import { collection, doc, writeBatch } from "firebase/firestore";
import { User, Listing, Tenancy, Request } from "../types/database";

const SEED_USERS: User[] = [
  {
    uid: "test_landlord_1",
    name: "Lemaire",
    firstName: "Thomas",
    email: "thomas.lemaire@rentahome.com",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    city: "Chamonix",
    address: "Chalet des Sapins, Route des Alpes",
    phone: "06 12 34 56 78",
    role: "landlord",
    privacyAccepted: true
  },
  {
    uid: "test_tenant_1",
    name: "Dupont",
    firstName: "Julien",
    email: "julien.dupont@gmail.com",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&h=100&q=80",
    city: "Nice",
    address: "Avenue Jean Médecin",
    phone: "06 87 65 43 21",
    role: "tenant",
    privacyAccepted: true
  }
];

const SEED_LISTINGS: Listing[] = [
  {
    id: "seed_listing_1",
    landlordId: "test_landlord_1",
    title: "Chalet A-Frame Sauvage & Jacuzzi",
    description: "Niché au cœur d'une forêt de sapins centenaires, ce chalet moderne en A-Frame vous offre une immersion totale dans la nature. Détendez-vous dans le jacuzzi extérieur chauffé au feu de bois sous un ciel étoilé.",
    price: 180,
    category: "chalets",
    city: "Chamonix",
    neighborhood: "Les Bossons",
    imageUrls: [
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Jacuzzi bois", "Poêle à bois", "Wifi Fibre", "Brasero extérieur"],
    coordinates: {
      latitude: 45.9227,
      longitude: 6.8685
    },
    propertyCode: "PROP-CHAM1",
    rating: 4.9,
    reviewsCount: 15
  },
  {
    id: "seed_listing_2",
    landlordId: "test_landlord_1",
    title: "Villa Lumina - Vue Panoramique",
    description: "Une villa architecturale d'exception suspendue au-dessus de la mer Méditerranée. Équipée d'une piscine à débordement chauffée.",
    price: 450,
    category: "villas",
    city: "Nice",
    neighborhood: "Mont Boron",
    imageUrls: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Piscine débordement", "Climatisation", "Cuisine Chef", "Hammam"],
    coordinates: {
      latitude: 43.7102,
      longitude: 7.2620
    },
    propertyCode: "PROP-NICE2",
    rating: 4.95,
    reviewsCount: 42
  },
  {
    id: "seed_listing_3",
    landlordId: "test_landlord_1",
    title: "Appartement Design au centre",
    description: "Bel appartement rénové au cœur du centre historique, proche des commerces et du tramway.",
    price: 90,
    category: "appartements",
    city: "Nice",
    neighborhood: "Vieux Nice",
    imageUrls: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Wifi Fibre", "Climatisation", "Cuisine équipée"],
    coordinates: {
      latitude: 43.6961,
      longitude: 7.2782
    },
    propertyCode: "PROP-APPT3",
    rating: 4.5,
    reviewsCount: 8
  }
];

const SEED_TENANCIES: Tenancy[] = [
  {
    id: "seed_tenancy_1",
    propertyId: "seed_listing_1",
    landlordId: "test_landlord_1",
    tenantId: "test_tenant_1",
    tenantMatricule: "MAT-JULIEN9",
    startDate: "2026-06-01",
    endDate: "2026-07-01",
    paymentStatus: "paid",
    monthlyRent: 180
  }
];

const SEED_REQUESTS: Request[] = [
  {
    id: "seed_request_1",
    propertyId: "seed_listing_2",
    tenantId: "test_tenant_1",
    landlordId: "test_landlord_1",
    type: "rental",
    status: "pending",
    message: "Bonjour, je serais très intéressé pour louer cette villa pour le mois de juillet.",
    createdAt: new Date().toISOString()
  }
];

export const seedDatabase = async (): Promise<void> => {
  const batch = writeBatch(db);

  SEED_USERS.forEach((user) => {
    const docRef = doc(db, "users", user.uid);
    batch.set(docRef, user);
  });

  SEED_LISTINGS.forEach((listing) => {
    const docRef = doc(db, "listings", listing.id);
    batch.set(docRef, listing);
  });

  SEED_TENANCIES.forEach((tenancy) => {
    const docRef = doc(db, "tenancies", tenancy.id);
    batch.set(docRef, tenancy);
  });

  SEED_REQUESTS.forEach((req) => {
    const docRef = doc(db, "requests", req.id);
    batch.set(docRef, req);
  });

  await batch.commit();
  console.log("Firebase Database populated successfully!");
};
