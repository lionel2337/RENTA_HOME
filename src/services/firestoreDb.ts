import { db } from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc 
} from "firebase/firestore";
import { User, Listing, Tenancy, Request, MaintenanceTicket, Review } from "../types/database";

// Utilitaire pour générer des codes uniques aléatoires
const generateRandomCode = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
};

export const firestoreDb = {
  // ==========================================
  // 1. GESTION DES UTILISATEURS (USERS)
  // ==========================================

  // Enregistrer ou mettre à jour un profil utilisateur
  saveUserProfile: async (uid: string, userData: Omit<User, "uid">): Promise<User> => {
    const userDocRef = doc(db, "users", uid);
    const completeUser: User = { uid, ...userData };
    await setDoc(userDocRef, completeUser);
    return completeUser;
  },

  // Récupérer un profil utilisateur par son UID
  getUserProfile: async (uid: string): Promise<User | null> => {
    const userDocRef = doc(db, "users", uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as User;
    }
    return null;
  },

  // ==========================================
  // 2. GESTION DES ANNONCES (LISTINGS)
  // ==========================================

  // Créer une nouvelle propriété (par le bailleur)
  createListing: async (landlordId: string, listingData: Omit<Listing, "id" | "landlordId" | "propertyCode" | "rating" | "reviewsCount">): Promise<Listing> => {
    const listingsCollectionRef = collection(db, "listings");
    const newDocRef = doc(listingsCollectionRef);
    
    // Génère le Code Propriétaire unique de liaison (ex: PROP-AB12D)
    const propertyCode = generateRandomCode("PROP");

    const newListing: Listing = {
      id: newDocRef.id,
      landlordId,
      propertyCode,
      rating: 5.0,
      reviewsCount: 0,
      ...listingData
    };

    await setDoc(newDocRef, newListing);
    return newListing;
  },

  // Récupérer toutes les propriétés avec filtres optionnels (ville, quartier, catégorie)
  getListings: async (filters?: { city?: string; neighborhood?: string; category?: string }): Promise<Listing[]> => {
    const listingsCollectionRef = collection(db, "listings");
    let firestoreQuery = query(listingsCollectionRef);

    if (filters) {
      const conditions = [];
      if (filters.city && filters.city !== "Tous") {
        conditions.push(where("city", "==", filters.city));
      }
      if (filters.neighborhood) {
        conditions.push(where("neighborhood", "==", filters.neighborhood));
      }
      if (filters.category && filters.category !== "Tous") {
        conditions.push(where("category", "==", filters.category));
      }
      if (conditions.length > 0) {
        firestoreQuery = query(listingsCollectionRef, ...conditions);
      }
    }

    const querySnapshot = await getDocs(firestoreQuery);
    const listings: Listing[] = [];
    querySnapshot.forEach((docSnap) => {
      listings.push(docSnap.data() as Listing);
    });
    return listings;
  },

  // Récupérer une propriété unique par son ID
  getListingById: async (id: string): Promise<Listing | null> => {
    const listingDocRef = doc(db, "listings", id);
    const docSnap = await getDoc(listingDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as Listing;
    }
    return null;
  },

  // ==========================================
  // 3. LIAISON LOCATAIRE ET BAILLEUR (TENANCIES)
  // ==========================================

  // Associer un locataire à un logement via le "Code Propriétaire"
  linkTenantToProperty: async (tenantId: string, propertyCode: string, dates?: { startDate: string; endDate: string }): Promise<Tenancy> => {
    const listingsRef = collection(db, "listings");
    const q = query(listingsRef, where("propertyCode", "==", propertyCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Aucune propriété trouvée pour ce Code Propriétaire.");
    }

    const listingDoc = querySnapshot.docs[0];
    const listing = listingDoc.data() as Listing;

    const tenantMatricule = generateRandomCode("MAT");

    const startDate = dates?.startDate || new Date().toISOString().split("T")[0];
    const defaultEndDate = new Date();
    defaultEndDate.setMonth(defaultEndDate.getMonth() + 1);
    const endDate = dates?.endDate || defaultEndDate.toISOString().split("T")[0];

    const tenanciesCollectionRef = collection(db, "tenancies");
    const newTenancyDocRef = doc(tenanciesCollectionRef);

    const newTenancy: Tenancy = {
      id: newTenancyDocRef.id,
      propertyId: listing.id,
      landlordId: listing.landlordId,
      tenantId,
      tenantMatricule,
      startDate,
      endDate,
      paymentStatus: "pending",
      monthlyRent: listing.price
    };

    await setDoc(newTenancyDocRef, newTenancy);
    return newTenancy;
  },

  // Récupérer les contrats de location d'un propriétaire
  getTenanciesByLandlord: async (landlordId: string): Promise<Tenancy[]> => {
    const tenanciesRef = collection(db, "tenancies");
    const q = query(tenanciesRef, where("landlordId", "==", landlordId));
    const querySnapshot = await getDocs(q);
    
    const tenancies: Tenancy[] = [];
    querySnapshot.forEach((docSnap) => {
      tenancies.push(docSnap.data() as Tenancy);
    });
    return tenancies;
  },

  // Récupérer la location active d'un locataire
  getTenancyByTenant: async (tenantId: string): Promise<Tenancy | null> => {
    const tenanciesRef = collection(db, "tenancies");
    const q = query(tenanciesRef, where("tenantId", "==", tenantId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }
    return querySnapshot.docs[0].data() as Tenancy;
  },

  // ==========================================
  // 4. DEMANDES (VISITES / LOCATIONS)
  // ==========================================

  // Soumettre une demande
  createRequest: async (requestData: Omit<Request, "id" | "status" | "createdAt">): Promise<Request> => {
    const requestsRef = collection(db, "requests");
    const newDocRef = doc(requestsRef);

    const newRequest: Request = {
      id: newDocRef.id,
      status: "pending",
      createdAt: new Date().toISOString(),
      ...requestData
    };

    await setDoc(newDocRef, newRequest);
    return newRequest;
  },

  // Récupérer les demandes pour un propriétaire
  getRequestsByLandlord: async (landlordId: string): Promise<Request[]> => {
    const requestsRef = collection(db, "requests");
    const q = query(requestsRef, where("landlordId", "==", landlordId));
    const querySnapshot = await getDocs(q);

    const requests: Request[] = [];
    querySnapshot.forEach((docSnap) => {
      requests.push(docSnap.data() as Request);
    });
    return requests;
  },

  // Mettre à jour le statut d'une demande (Approuver / Rejeter)
  updateRequestStatus: async (requestId: string, status: "pending" | "approved" | "rejected"): Promise<void> => {
    const requestDocRef = doc(db, "requests", requestId);
    await updateDoc(requestDocRef, { status });
  },

  // ==========================================
  // 5. TICKETS DE MAINTENANCE
  // ==========================================

  // Créer un ticket de maintenance (par le locataire lié)
  createMaintenanceTicket: async (ticketData: Omit<MaintenanceTicket, "id" | "status" | "createdAt">): Promise<MaintenanceTicket> => {
    const ticketsRef = collection(db, "maintenance_tickets");
    const newDocRef = doc(ticketsRef);

    const newTicket: MaintenanceTicket = {
      id: newDocRef.id,
      status: "todo",
      createdAt: new Date().toISOString().split("T")[0],
      ...ticketData
    };

    await setDoc(newDocRef, newTicket);
    return newTicket;
  },

  // Récupérer les tickets d'un propriétaire
  getTicketsByLandlord: async (landlordId: string): Promise<MaintenanceTicket[]> => {
    const ticketsRef = collection(db, "maintenance_tickets");
    const q = query(ticketsRef, where("landlordId", "==", landlordId));
    const querySnapshot = await getDocs(q);

    const tickets: MaintenanceTicket[] = [];
    querySnapshot.forEach((docSnap) => {
      tickets.push(docSnap.data() as MaintenanceTicket);
    });
    return tickets;
  },

  // Récupérer les tickets d'un locataire
  getTicketsByTenant: async (tenantId: string): Promise<MaintenanceTicket[]> => {
    const ticketsRef = collection(db, "maintenance_tickets");
    const q = query(ticketsRef, where("tenantId", "==", tenantId));
    const querySnapshot = await getDocs(q);

    const tickets: MaintenanceTicket[] = [];
    querySnapshot.forEach((docSnap) => {
      tickets.push(docSnap.data() as MaintenanceTicket);
    });
    return tickets;
  },

  // Mettre à jour l'état d'avancement d'un ticket
  updateTicketStatus: async (ticketId: string, status: "todo" | "in_progress" | "done"): Promise<void> => {
    const ticketDocRef = doc(db, "maintenance_tickets", ticketId);
    await updateDoc(ticketDocRef, { status });
  }
};