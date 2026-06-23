export interface Review {
  id: string;
  author: string;
  avatarUrl: string;
  date: string;
  rating: number;
  comment: string;
  sentimentBadges: string[];
}

export interface Host {
  name: string;
  avatarUrl: string;
  isSuperHost: boolean;
  rating: number;
  responseRate: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  reviewsCount: number;
  location: string;
  imageUrls: string[];
  category: string;
  amenities: string[];
  host: Host;
  coordinates: Coordinates;
  reviews: Review[];
}

export interface Booking {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  listingLocation: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'active' | 'upcoming' | 'past' | 'pending';
  digitalKey?: string;
  splitPayment?: {
    totalPeople: number;
    amountPerPerson: number;
    paidCount: number;
  };
}

export interface Wishlist {
  id: string;
  name: string;
  listingIds: string[];
  commentsCount: number;
  votesCount: number;
  sharedWith: string[];
}

export interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  date: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  propertyName: string;
  monthlyRent: number;
  startDate: string;
  paymentStatus: 'paid' | 'late' | 'pending';
  maintenanceTickets: MaintenanceTicket[];
}

// -------------------------------------------------------------
// Mock Data Store
// -------------------------------------------------------------

const MOCK_LISTINGS: Listing[] = [
  {
    id: 'l1',
    title: 'Villa Lumina - Vue Panoramique sur Mer',
    description: 'Une villa architecturale d\'exception suspendue au-dessus de la mer Méditerranée. Équipée d\'une piscine à débordement chauffée, d\'une cuisine professionnelle en plein air et de verrières géantes offrant une luminosité spectaculaire tout au long de la journée. Un design minimaliste et luxueux pensé pour le confort absolu.',
    price: 450,
    rating: 4.95,
    reviewsCount: 124,
    location: 'Nice, France',
    imageUrls: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Villas',
    amenities: ['Piscine débordement', 'Wifi 6', 'Climatisation', 'Cuisine Chef', 'Hammam', 'Parking privé'],
    host: {
      name: 'Alexandra Valois',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
      isSuperHost: true,
      rating: 4.98,
      responseRate: '100% (moins d\'une heure)',
    },
    coordinates: {
      latitude: 43.7102,
      longitude: 7.2620,
    },
    reviews: [
      {
        id: 'r1_1',
        author: 'Marc-Antoine',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
        date: 'Mai 2026',
        rating: 5,
        comment: 'Absolument incroyable. La vue est encore plus belle en vrai que sur les photos. Le service conciergerie recommandé par Alexandra est impeccable.',
        sentimentBadges: ['Propreté impeccable', 'Vue exceptionnelle', 'Conciergerie premium'],
      },
      {
        id: 'r1_2',
        author: 'Sophie L.',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
        date: 'Avril 2026',
        rating: 5,
        comment: 'Un séjour de rêve. Tout a été pensé dans les moindres détails. Nous reviendrons l\'année prochaine c\'est certain.',
        sentimentBadges: ['Lit ultra-confort', 'Design moderne'],
      }
    ],
  },
  {
    id: 'l2',
    title: 'A-Frame Cabin Sauvage & Jacuzzi',
    description: 'Niché au cœur d\'une forêt de sapins centenaires, ce chalet moderne en A-Frame vous offre une immersion totale dans la nature. Détendez-vous dans le jacuzzi extérieur chauffé au feu de bois sous un ciel étoilé, ou profitez du poêle à bois intérieur dans un salon chaleureux au design scandinave.',
    price: 180,
    rating: 4.88,
    reviewsCount: 92,
    location: 'Chamonix, France',
    imageUrls: [
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Cabines',
    amenities: ['Jacuzzi bois', 'Poêle à bois', 'Wifi Fibre', 'Brasero extérieur', 'Vélos dispo'],
    host: {
      name: 'Thomas Lemaire',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
      isSuperHost: true,
      rating: 4.90,
      responseRate: '98% (en 15 min)',
    },
    coordinates: {
      latitude: 45.9227,
      longitude: 6.8685,
    },
    reviews: [
      {
        id: 'r2_1',
        author: 'Julien et Lea',
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&h=100&q=80',
        date: 'Juin 2026',
        rating: 5,
        comment: 'Une déconnexion totale et magique. Le jacuzzi est fantastique et le poêle chauffe divinement bien. Thomas est très accueillant !',
        sentimentBadges: ['Calme absolu', 'Jacuzzi exceptionnel', 'Hôte attentionné'],
      }
    ],
  },
  {
    id: 'l3',
    title: 'Penthouse Glasshouse au cœur de Paris',
    description: 'Une verrière contemporaine unique posée sur les toits de Paris. Offrant une vue directe à 360° sur la Tour Eiffel et le Sacré-Cœur. Terrasse arborée privée de 80m², salon de verre au design organique, domotique complète de dernière génération et lit king-size flottant.',
    price: 380,
    rating: 4.97,
    reviewsCount: 208,
    location: 'Paris, France',
    imageUrls: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Design',
    amenities: ['Terrasse panoramique', 'Domotique', 'Climatisation', 'Ascenseur privé', 'Home Cinéma'],
    host: {
      name: 'Pierre-Yves',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
      isSuperHost: false,
      rating: 4.95,
      responseRate: '100% (en 5 min)',
    },
    coordinates: {
      latitude: 48.8566,
      longitude: 2.3522,
    },
    reviews: [
      {
        id: 'r3_1',
        author: 'Emily K.',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80',
        date: 'Avril 2026',
        rating: 5,
        comment: 'Avoir l\'impression de dormir sous les étoiles de Paris tout en regardant la Tour Eiffel scintiller... Des souvenirs gravés à vie.',
        sentimentBadges: ['Vue Tour Eiffel', 'Emplacement 5 étoiles', 'Technologie moderne'],
      }
    ],
  },
  {
    id: 'l4',
    title: 'Château fort médiéval d\'Artignosc',
    description: 'Faites un bond dans le temps dans ce château du XIVème siècle magnifiquement restauré. Alliant charme de l\'ancien (pierres de taille, fresques, cheminées monumentales) et luxe moderne (piscine chauffée dans les douves, salle de cinéma privée, court de tennis).',
    price: 750,
    rating: 4.92,
    reviewsCount: 37,
    location: 'Provence, France',
    imageUrls: [
      'https://images.unsplash.com/photo-1508333706533-1ab43ecb1606?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Châteaux',
    amenities: ['Piscine chauffée', 'Court de tennis', 'Salle de cinéma', 'Grand parc', 'Héliport'],
    host: {
      name: 'Comte de Brosses',
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80',
      isSuperHost: true,
      rating: 4.94,
      responseRate: '95% (dans la journée)',
    },
    coordinates: {
      latitude: 43.7025,
      longitude: 6.0270,
    },
    reviews: [
      {
        id: 'r4_1',
        author: 'Famille Dupont',
        avatarUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=100&h=100&q=80',
        date: 'Février 2026',
        rating: 5,
        comment: 'Nous y avons célébré un anniversaire de mariage familial. C\'était somptueux, magique et le personnel de maison était d\'une discrétion et d\'une aide sans pareil.',
        sentimentBadges: ['Service de classe mondiale', 'Histoire riche', 'Lits confortables'],
      }
    ],
  },
  {
    id: 'l5',
    title: 'Loft Industriel Organique & Jardin Privé',
    description: 'Ancien atelier d\'artiste transformé en un espace de vie hybride alliant métal, béton ciré et végétation luxuriante. Équipé d\'un puits de lumière géant, d\'une baignoire îlot en pierre volcanique et d\'une collection de vinyles rares pour vos soirées musicales.',
    price: 210,
    rating: 4.82,
    reviewsCount: 78,
    location: 'Lyon, France',
    imageUrls: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    ],
    category: 'Appartements',
    amenities: ['Jardin secret', 'Platine vinyle', 'Baignoire pierre', 'Wifi ultra-rapide', 'Projecteur HD'],
    host: {
      name: 'Simon G.',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80',
      isSuperHost: false,
      rating: 4.85,
      responseRate: '100% (en 30 min)',
    },
    coordinates: {
      latitude: 45.7640,
      longitude: 4.8357,
    },
    reviews: [
      {
        id: 'r5_1',
        author: 'Léna',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80',
        date: 'Janvier 2026',
        rating: 4,
        comment: 'Superbe loft très bien situé. Petit bémol sur l\'isolation phonique de la rue le samedi soir, mais l\'espace et le bain volcanique font tout oublier !',
        sentimentBadges: ['Style unique', 'Baignoire incroyable', 'Hôte réactif'],
      }
    ],
  }
];

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    listingId: 'l1',
    listingTitle: 'Villa Lumina - Vue Panoramique sur Mer',
    listingImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=80',
    listingLocation: 'Nice, France',
    startDate: '2026-07-15',
    endDate: '2026-07-20',
    totalPrice: 2250,
    status: 'upcoming',
    digitalKey: '🔑 NICE-VILLA-LUMINA-JULY26',
  },
  {
    id: 'b2',
    listingId: 'l2',
    listingTitle: 'A-Frame Cabin Sauvage & Jacuzzi',
    listingImage: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=300&q=80',
    listingLocation: 'Chamonix, France',
    startDate: '2026-06-10',
    endDate: '2026-06-14',
    totalPrice: 720,
    status: 'past',
  }
];

const MOCK_WISHLISTS: Wishlist[] = [
  {
    id: 'w1',
    name: 'Vacances d\'Été 2026 🌴',
    listingIds: ['l1', 'l3'],
    commentsCount: 14,
    votesCount: 8,
    sharedWith: ['Alexandra V.', 'Thomas L.', 'Sophie L.'],
  },
  {
    id: 'w2',
    name: 'Chalets & Cocooning ❄️',
    listingIds: ['l2'],
    commentsCount: 3,
    votesCount: 2,
    sharedWith: ['Thomas L.'],
  }
];

const MOCK_TICKETS: MaintenanceTicket[] = [
  { id: 't1', title: 'Fuite d\'eau cuisine', description: 'Le robinet fuit en continu dans l\'évier principal.', urgency: 'high', status: 'todo', date: '2026-06-20' },
  { id: 't2', title: 'Serrure porte bloquée', description: 'La poignée de la chambre parentale se bloque parfois.', urgency: 'medium', status: 'in_progress', date: '2026-06-18' },
];

const MOCK_TENANTS: Tenant[] = [
  {
    id: 'ten1',
    name: 'Julien Dupont',
    email: 'julien.dupont@gmail.com',
    phone: '06 12 34 56 78',
    propertyId: 'l1',
    propertyName: 'Villa Lumina',
    monthlyRent: 2200,
    startDate: '2025-09-01',
    paymentStatus: 'paid',
    maintenanceTickets: [MOCK_TICKETS[0]],
  },
  {
    id: 'ten2',
    name: 'Sarah Martin',
    email: 'sarah.m@outlook.fr',
    phone: '06 87 65 43 21',
    propertyId: 'l2',
    propertyName: 'A-Frame Cabin Sauvage',
    monthlyRent: 1350,
    startDate: '2026-01-15',
    paymentStatus: 'late',
    maintenanceTickets: [MOCK_TICKETS[1]],
  },
  {
    id: 'ten3',
    name: 'Antoine Lefebvre',
    email: 'antoine.l@gmail.com',
    phone: '07 55 44 33 22',
    propertyId: 'l3',
    propertyName: 'Penthouse Glasshouse',
    monthlyRent: 3100,
    startDate: '2025-11-01',
    paymentStatus: 'pending',
    maintenanceTickets: [],
  }
];

let listingsState = [...MOCK_LISTINGS];
let bookingsState = [...MOCK_BOOKINGS];
let wishlistsState = [...MOCK_WISHLISTS];
let tenantsState = [...MOCK_TENANTS];

// Helper to simulate Firebase API response delay
const delay = <T>(data: T, ms = 800): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, ms);
  });
};

// -------------------------------------------------------------
// Database Operations (API Simulation)
// -------------------------------------------------------------

export const mockDatabase = {
  // Get all listings
  getListings: async (category?: string): Promise<Listing[]> => {
    if (category && category !== 'Tous') {
      const filtered = listingsState.filter(l => l.category === category);
      return delay(filtered);
    }
    return delay(listingsState);
  },

  // Get a single listing by ID
  getListingById: async (id: string): Promise<Listing | null> => {
    const listing = listingsState.find(l => l.id === id) || null;
    return delay(listing);
  },

  // Add a new property (landlord flow)
  createProperty: async (propertyData: Omit<Listing, 'id' | 'rating' | 'reviewsCount' | 'reviews'>): Promise<Listing> => {
    const newProperty: Listing = {
      ...propertyData,
      id: `l${Date.now()}`,
      rating: 5.0,
      reviewsCount: 0,
      reviews: [],
    };
    listingsState = [...listingsState, newProperty];
    return delay(newProperty, 1000);
  },

  // Get landlord tenants
  getTenants: async (): Promise<Tenant[]> => {
    return delay(tenantsState);
  },

  // Update a tenant payment status
  updatePaymentStatus: async (tenantId: string, status: 'paid' | 'late' | 'pending'): Promise<Tenant> => {
    tenantsState = tenantsState.map(t => {
      if (t.id === tenantId) {
        return { ...t, paymentStatus: status };
      }
      return t;
    });
    const updated = tenantsState.find(t => t.id === tenantId)!;
    return delay(updated);
  },

  // Add maintenance ticket for a tenant
  createTicket: async (tenantId: string, ticketData: Omit<MaintenanceTicket, 'id' | 'status' | 'date'>): Promise<Tenant> => {
    const newTicket: MaintenanceTicket = {
      ...ticketData,
      id: `t${Date.now()}`,
      status: 'todo',
      date: new Date().toISOString().split('T')[0],
    };
    tenantsState = tenantsState.map(t => {
      if (t.id === tenantId) {
        return {
          ...t,
          maintenanceTickets: [...t.maintenanceTickets, newTicket]
        };
      }
      return t;
    });
    const updated = tenantsState.find(t => t.id === tenantId)!;
    return delay(updated);
  },

  // Update ticket status
  updateTicketStatus: async (tenantId: string, ticketId: string, status: 'todo' | 'in_progress' | 'done'): Promise<Tenant> => {
    tenantsState = tenantsState.map(t => {
      if (t.id === tenantId) {
        return {
          ...t,
          maintenanceTickets: t.maintenanceTickets.map(tk => {
            if (tk.id === ticketId) {
              return { ...tk, status };
            }
            return tk;
          })
        };
      }
      return t;
    });
    const updated = tenantsState.find(t => t.id === tenantId)!;
    return delay(updated);
  },

  // Get current user's bookings
  getBookings: async (): Promise<Booking[]> => {
    return delay(bookingsState);
  },

  // Add a new booking (checkout flow)
  createBooking: async (bookingData: Omit<Booking, 'id'>): Promise<Booking> => {
    const newBooking: Booking = {
      ...bookingData,
      id: `b${Date.now()}`,
    };
    bookingsState = [newBooking, ...bookingsState];
    return delay(newBooking, 1200); // slightly longer delay for checkout completion
  },

  // Get current user's wishlists
  getWishlists: async (): Promise<Wishlist[]> => {
    return delay(wishlistsState);
  },

  // Add property to wishlist
  toggleWishlistItem: async (wishlistId: string, listingId: string): Promise<Wishlist> => {
    wishlistsState = wishlistsState.map(w => {
      if (w.id === wishlistId) {
        const index = w.listingIds.indexOf(listingId);
        let newListings = [...w.listingIds];
        if (index > -1) {
          newListings.splice(index, 1);
        } else {
          newListings.push(listingId);
        }
        return {
          ...w,
          listingIds: newListings,
          votesCount: w.votesCount + (index > -1 ? -1 : 1),
        };
      }
      return w;
    });
    const updated = wishlistsState.find(w => w.id === wishlistId)!;
    return delay(updated);
  },

  // Create new collaborative wishlist
  createWishlist: async (name: string): Promise<Wishlist> => {
    const newWishlist: Wishlist = {
      id: `w${Date.now()}`,
      name,
      listingIds: [],
      commentsCount: 0,
      votesCount: 0,
      sharedWith: [],
    };
    wishlistsState = [...wishlistsState, newWishlist];
    return delay(newWishlist);
  }
};
