import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const url =
  process.env.ASKELENA_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "file:./dev.db";
const adapter = new PrismaLibSql({ url });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("Nettoyage de la base de donnees...");
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.blockedDate.deleteMany();
  await prisma.image.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creation des utilisateurs...");
  const hashedPassword = await bcrypt.hash("Password123!", 10);

  const hosts = await Promise.all([
    prisma.user.create({
      data: {
        name: "Marie Dupont",
        email: "marie@askelena.fr",
        password: hashedPassword,
        role: "host",
        bio: "Passionnee de patrimoine et de vie sur l'eau, j'accueille mes hotes avec le sourire depuis 10 ans.",
        phone: "+33 6 12 34 56 78",
      },
    }),
    prisma.user.create({
      data: {
        name: "Jean-Pierre Moreau",
        email: "jp@askelena.fr",
        password: hashedPassword,
        role: "host",
        bio: "Ancien marin reconverti dans l'hebergement insolite. Mes peniches sont ma fierte.",
        phone: "+33 6 23 45 67 89",
      },
    }),
    prisma.user.create({
      data: {
        name: "Camille Bernard",
        email: "camille@askelena.fr",
        password: hashedPassword,
        role: "host",
        bio: "Architecte de formation, je renove des lieux d'exception pour offrir des sejours inoubliables.",
        phone: "+33 6 34 56 78 90",
      },
    }),
  ]);

  const guests = await Promise.all([
    prisma.user.create({
      data: {
        name: "Lucas Martin",
        email: "lucas@example.fr",
        password: hashedPassword,
        role: "guest",
      },
    }),
    prisma.user.create({
      data: {
        name: "Sophie Leroy",
        email: "sophie@example.fr",
        password: hashedPassword,
        role: "guest",
      },
    }),
  ]);

  console.log("Creation des annonces...");

  const listingsData = [
    // Peniches
    {
      title: "La Belle Epoque",
      description:
        "Peniche authentique amarree sur le Canal Saint-Martin, au coeur de Paris. Entierement renovee avec des materiaux nobles, elle offre un cadre romantique unique. Profitez du calme de l'eau tout en etant a deux pas des meilleurs restaurants parisiens. Ideal pour un week-end en amoureux ou une escapade culturelle.",
      type: "peniche",
      location: "Paris, Canal Saint-Martin",
      latitude: 48.8726,
      longitude: 2.3655,
      pricePerNight: 280,
      capacity: 4,
      amenities: JSON.stringify(["Wi-Fi", "Chauffage", "Cuisine equipee", "Terrasse sur pont", "Velo"]),
      hostId: hosts[0].id,
    },
    {
      title: "Le Confetti Bleu",
      description:
        "Charmante peniche amarree dans le centre historique de Bruges, avec vue sur les canaux medievaux. Decoration soignee alliant style flamand et confort moderne. La terrasse sur le pont est l'endroit parfait pour deguster une biere belge au coucher du soleil. Un sejour feerique au fil de l'eau.",
      type: "peniche",
      location: "Bruges, Belgique",
      latitude: 51.2093,
      longitude: 3.2247,
      pricePerNight: 220,
      capacity: 3,
      amenities: JSON.stringify(["Wi-Fi", "Chauffage", "Cuisine equipee", "Terrasse", "Velos fournis"]),
      hostId: hosts[1].id,
    },
    {
      title: "L'Odyssee",
      description:
        "Magnifique peniche sur les quais de Saone a Lyon, entre le Vieux-Lyon et la Presqu'ile. Trois cabines spacieuses avec literie haut de gamme et salle de bain privative. Le salon panoramique offre une vue imprenable sur la colline de Fourviere. Gastronomie lyonnaise a portee de passerelle.",
      type: "peniche",
      location: "Lyon, Saone",
      latitude: 45.7640,
      longitude: 4.8357,
      pricePerNight: 350,
      capacity: 6,
      amenities: JSON.stringify(["Wi-Fi", "Climatisation", "Cuisine professionnelle", "Salon panoramique", "Jacuzzi sur pont"]),
      hostId: hosts[0].id,
    },
    // Chateaux
    {
      title: "Chateau de Valmont",
      description:
        "Splendide chateau du XVIIe siecle au coeur de la Vallee de la Loire, entoure de 20 hectares de parc. Cinq chambres d'hotes meublees avec du mobilier d'epoque et tout le confort moderne. La piscine chauffee et le court de tennis completent ce domaine d'exception. Vivez comme un roi le temps d'un sejour.",
      type: "chateau",
      location: "Vallee de la Loire",
      latitude: 47.3490,
      longitude: 0.6848,
      pricePerNight: 850,
      capacity: 12,
      amenities: JSON.stringify(["Wi-Fi", "Piscine chauffee", "Court de tennis", "Parc 20ha", "Parking prive", "Petit-dejeuner inclus"]),
      hostId: hosts[2].id,
    },
    {
      title: "Chateau des Brumes",
      description:
        "Chateau medieval niché dans les collines de Dordogne, avec tours et douves d'origine. Les chambres sont un savant melange de pierres apparentes et de design contemporain. Le domaine produit son propre vin que vous pourrez deguster dans la cave voutee. Un voyage dans le temps garanti.",
      type: "chateau",
      location: "Dordogne, Perigord",
      latitude: 44.8600,
      longitude: 0.7200,
      pricePerNight: 720,
      capacity: 10,
      amenities: JSON.stringify(["Wi-Fi", "Cave a vin", "Cheminee", "Jardin a la francaise", "Parking", "Bibliotheque"]),
      hostId: hosts[2].id,
    },
    {
      title: "Manoir de la Falaise",
      description:
        "Manoir normand perche sur les falaises d'Etretat, offrant une vue spectaculaire sur la Manche. Architecture a colombages renovee avec gout, six chambres de charme et un salon avec cheminee monumentale. Le jardin descend jusqu'au bord de la falaise pour des couchers de soleil inoubliables. La Normandie dans toute sa splendeur.",
      type: "chateau",
      location: "Normandie, Etretat",
      latitude: 49.7070,
      longitude: 0.2060,
      pricePerNight: 680,
      capacity: 8,
      amenities: JSON.stringify(["Wi-Fi", "Vue mer", "Cheminee", "Jardin", "Parking", "Sauna"]),
      hostId: hosts[2].id,
    },
    // Phares
    {
      title: "Phare du Finistere",
      description:
        "Ancien phare reconverti en gite de charme a la Pointe du Raz, bout du monde breton. Vue panoramique a 360 degres sur l'ocean Atlantique depuis la lanterne restauree. L'interieur en colimaçon a ete amenage sur quatre niveaux avec un soin remarquable. Pour les amoureux de grands espaces et d'embruns.",
      type: "phare",
      location: "Pointe du Raz, Finistere",
      latitude: 48.0380,
      longitude: -4.7380,
      pricePerNight: 320,
      capacity: 4,
      amenities: JSON.stringify(["Wi-Fi", "Vue 360 ocean", "Chauffage", "Cuisine equipee", "Jumelles fournies"]),
      hostId: hosts[1].id,
    },
    {
      title: "Le Gardien",
      description:
        "Phare historique sur l'Ile de Re, transforme en refuge douillet pour deux. Montez les 120 marches pour decouvrir un panorama exceptionnel sur l'Atlantique et les marais salants. La chambre au sommet offre une experience unique, bercee par le bruit des vagues. Un sejour hors du commun pour les aventuriers romantiques.",
      type: "phare",
      location: "Ile de Re, Charente-Maritime",
      latitude: 46.2100,
      longitude: -1.4000,
      pricePerNight: 280,
      capacity: 2,
      amenities: JSON.stringify(["Wi-Fi", "Vue panoramique", "Petit-dejeuner inclus", "Velos"]),
      hostId: hosts[1].id,
    },
    // Cabanes
    {
      title: "Les Cimes Dorees",
      description:
        "Cabane perchee a 12 metres de hauteur dans la foret des Landes, accessible par un pont suspendu. Construite en bois de pin local, elle dispose d'une terrasse avec vue sur la canopee. Le matin, reveillez-vous au chant des oiseaux et savourez votre petit-dejeuner livre par panier monte. Deconnexion totale garantie.",
      type: "cabane",
      location: "Foret des Landes",
      latitude: 44.0000,
      longitude: -1.1000,
      pricePerNight: 180,
      capacity: 2,
      amenities: JSON.stringify(["Petit-dejeuner inclus", "Terrasse panoramique", "Pont suspendu", "Hamac"]),
      hostId: hosts[0].id,
    },
    {
      title: "Le Nid du Hibou",
      description:
        "Cabane forestiere dans les Vosges, nichee entre chenes et hetres centenaires. Interieur chaleureux en bois brut avec poele a bois et grande baie vitree sur la foret. Le spa nordique privatif en contrebas est l'endroit ideal pour se detendre sous les etoiles. Nature, calme et serenite au rendez-vous.",
      type: "cabane",
      location: "Vosges, Alsace",
      latitude: 48.1500,
      longitude: 6.9500,
      pricePerNight: 210,
      capacity: 3,
      amenities: JSON.stringify(["Spa nordique", "Poele a bois", "Petit-dejeuner", "Randonnees balisees"]),
      hostId: hosts[0].id,
    },
    {
      title: "Cabane des Elfes",
      description:
        "Cabane enchantee au coeur de la foret de Broceliande, terre de legendes arthuriennes. Architecture organique inspiree des contes, avec toit vegetal et fenetres rondes. L'interieur feerique ravira petits et grands avec ses details sculptes dans le bois. Un sejour magique a deux pas de la fontaine de Barenton.",
      type: "cabane",
      location: "Foret de Broceliande, Bretagne",
      latitude: 48.0700,
      longitude: -2.2800,
      pricePerNight: 160,
      capacity: 4,
      amenities: JSON.stringify(["Petit-dejeuner", "Jardin feerique", "Sentiers de randonnee", "Jeux en bois"]),
      hostId: hosts[0].id,
    },
    // Yourtes
    {
      title: "Yourte Celeste",
      description:
        "Yourte traditionnelle mongole installee sur un plateau du Massif Central, a 1200 metres d'altitude. Le dome transparent offre une vue directe sur la voute etoilee sans pollution lumineuse. Mobilier artisanal, tapis en laine de brebis et poele a bois pour un confort authentique. L'experience nomade ultime en terre auvergnate.",
      type: "yourte",
      location: "Massif Central, Auvergne",
      latitude: 45.5000,
      longitude: 3.1000,
      pricePerNight: 140,
      capacity: 4,
      amenities: JSON.stringify(["Dome transparent", "Poele a bois", "Observation des etoiles", "Petit-dejeuner bio"]),
      hostId: hosts[1].id,
    },
    {
      title: "La Nomade",
      description:
        "Grande yourte contemporaine au pied des Pyrenees, entre prairies et forets de sapins. Amenagee avec gout, elle allie tradition kirghize et confort occidental avec lit king-size et salle d'eau. La terrasse en bois donne sur les sommets enneiges et le potager bio en libre-service. Ressourcement et authenticite au programme.",
      type: "yourte",
      location: "Pyrenees, Ariege",
      latitude: 42.8800,
      longitude: 1.5500,
      pricePerNight: 120,
      capacity: 5,
      amenities: JSON.stringify(["Terrasse", "Potager bio", "Poele a bois", "Randonnees guidees"]),
      hostId: hosts[1].id,
    },
    // Tiny house
    {
      title: "Le Petit Cocon",
      description:
        "Tiny house design posee dans un oliveraie de la Cote d'Azur, entre mer et collines. Chaque centimetre carre est optimise avec elegance : cuisine compacte, mezzanine cosy et terrasse privative. Les grandes baies vitrees laissent entrer la lumiere mediterraneenne et offrent une vue sur les oliviers centenaires. Le luxe de la simplicite.",
      type: "tiny_house",
      location: "Cote d'Azur, Var",
      latitude: 43.4500,
      longitude: 6.2100,
      pricePerNight: 190,
      capacity: 2,
      amenities: JSON.stringify(["Wi-Fi", "Climatisation", "Terrasse privative", "Barbecue", "Piscine partagee"]),
      hostId: hosts[2].id,
    },
  ];

  const listings = [];
  for (const data of listingsData) {
    const listing = await prisma.listing.create({
      data: {
        ...data,
        isPublished: true,
      },
    });
    listings.push(listing);
  }

  console.log(`${listings.length} annonces creees.`);

  // Images (2-3 per listing)
  console.log("Creation des images...");
  const imagePromises = listings.flatMap((listing, i) => {
    const count = i % 3 === 0 ? 3 : 2;
    return Array.from({ length: count }, (_, j) =>
      prisma.image.create({
        data: {
          url: `/images/placeholder-${(i * 3 + j) % 12 + 1}.jpg`,
          alt: listing.title,
          order: j,
          listingId: listing.id,
        },
      })
    );
  });
  await Promise.all(imagePromises);

  // Bookings
  console.log("Creation des reservations...");
  const bookings = await Promise.all([
    // Completed bookings (needed for reviews)
    prisma.booking.create({
      data: {
        listingId: listings[0].id, // La Belle Epoque
        guestId: guests[0].id,
        startDate: new Date("2026-01-10"),
        endDate: new Date("2026-01-13"),
        nights: 3,
        totalPrice: 840,
        status: "completed",
        guestEmail: "lucas@example.fr",
        guestName: "Lucas Martin",
        confirmedAt: new Date("2026-01-05"),
      },
    }),
    prisma.booking.create({
      data: {
        listingId: listings[3].id, // Chateau de Valmont
        guestId: guests[1].id,
        startDate: new Date("2026-02-01"),
        endDate: new Date("2026-02-04"),
        nights: 3,
        totalPrice: 2550,
        status: "completed",
        guestEmail: "sophie@example.fr",
        guestName: "Sophie Leroy",
        confirmedAt: new Date("2026-01-25"),
      },
    }),
    prisma.booking.create({
      data: {
        listingId: listings[6].id, // Phare du Finistere
        guestId: guests[0].id,
        startDate: new Date("2026-02-15"),
        endDate: new Date("2026-02-18"),
        nights: 3,
        totalPrice: 960,
        status: "completed",
        guestEmail: "lucas@example.fr",
        guestName: "Lucas Martin",
        confirmedAt: new Date("2026-02-10"),
      },
    }),
    prisma.booking.create({
      data: {
        listingId: listings[8].id, // Les Cimes Dorees
        guestId: guests[1].id,
        startDate: new Date("2026-02-20"),
        endDate: new Date("2026-02-22"),
        nights: 2,
        totalPrice: 360,
        status: "completed",
        guestEmail: "sophie@example.fr",
        guestName: "Sophie Leroy",
        confirmedAt: new Date("2026-02-15"),
      },
    }),
    prisma.booking.create({
      data: {
        listingId: listings[11].id, // Yourte Celeste
        guestId: guests[0].id,
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-03-04"),
        nights: 3,
        totalPrice: 420,
        status: "completed",
        guestEmail: "lucas@example.fr",
        guestName: "Lucas Martin",
        confirmedAt: new Date("2026-02-25"),
      },
    }),
    // Confirmed (upcoming)
    prisma.booking.create({
      data: {
        listingId: listings[2].id, // L'Odyssee
        guestId: guests[1].id,
        startDate: new Date("2026-04-10"),
        endDate: new Date("2026-04-14"),
        nights: 4,
        totalPrice: 1400,
        status: "confirmed",
        guestEmail: "sophie@example.fr",
        guestName: "Sophie Leroy",
        confirmedAt: new Date("2026-03-15"),
      },
    }),
    // Cancelled
    prisma.booking.create({
      data: {
        listingId: listings[4].id, // Chateau des Brumes
        guestId: guests[0].id,
        startDate: new Date("2026-03-20"),
        endDate: new Date("2026-03-25"),
        nights: 5,
        totalPrice: 3600,
        status: "cancelled",
        guestEmail: "lucas@example.fr",
        guestName: "Lucas Martin",
        cancelledAt: new Date("2026-03-10"),
      },
    }),
    // Confirmed (upcoming)
    prisma.booking.create({
      data: {
        listingId: listings[13].id, // Le Petit Cocon
        guestId: guests[0].id,
        startDate: new Date("2026-05-01"),
        endDate: new Date("2026-05-05"),
        nights: 4,
        totalPrice: 760,
        status: "confirmed",
        guestEmail: "lucas@example.fr",
        guestName: "Lucas Martin",
        confirmedAt: new Date("2026-04-01"),
      },
    }),
  ]);

  console.log(`${bookings.length} reservations creees.`);

  // Reviews (only for completed bookings)
  console.log("Creation des avis...");
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        listingId: listings[0].id,
        bookingId: bookings[0].id,
        authorId: guests[0].id,
        rating: 5,
        comment:
          "Sejour absolument magique sur la Belle Epoque ! La peniche est superbement renovee et le cadre du Canal Saint-Martin est idyllique. Marie est une hote exceptionnelle, aux petits soins. On reviendra sans hesiter.",
      },
    }),
    prisma.review.create({
      data: {
        listingId: listings[3].id,
        bookingId: bookings[1].id,
        authorId: guests[1].id,
        rating: 5,
        comment:
          "Le Chateau de Valmont est un reve eveille. Les chambres sont somptueuses, le parc magnifique et le petit-dejeuner digne d'un palace. Nous avons passe trois jours hors du temps. Une experience inoubliable en Vallee de la Loire.",
      },
    }),
    prisma.review.create({
      data: {
        listingId: listings[6].id,
        bookingId: bookings[2].id,
        authorId: guests[0].id,
        rating: 4,
        comment:
          "Le Phare du Finistere offre une vue spectaculaire et un depaysement total. L'amenagement interieur est tres bien pense malgre l'espace contraint. Seul bemol : les escaliers en colimaçon avec les valises ! Mais l'experience vaut largement l'effort.",
      },
    }),
    prisma.review.create({
      data: {
        listingId: listings[8].id,
        bookingId: bookings[3].id,
        authorId: guests[1].id,
        rating: 5,
        comment:
          "Les Cimes Dorees, c'est la cabane dont on reve depuis l'enfance mais en version grand luxe. Se reveiller a 12 metres de hauteur au milieu des pins est une sensation incomparable. Le petit-dejeuner livre par panier est une attention delicieuse.",
      },
    }),
    prisma.review.create({
      data: {
        listingId: listings[11].id,
        bookingId: bookings[4].id,
        authorId: guests[0].id,
        rating: 4,
        comment:
          "La Yourte Celeste porte bien son nom : observer les etoiles depuis le dome transparent est feerique. Le confort est au rendez-vous avec le poele a bois. En revanche, prevoyez des vetements chauds pour les nuits en altitude ! Tres belle experience.",
      },
    }),
    // Additional reviews using the same completed bookings would violate unique constraint
    // So we create more completed bookings and reviews
  ]);

  // Create a few more completed bookings for additional reviews
  const extraBookings = await Promise.all([
    prisma.booking.create({
      data: {
        listingId: listings[1].id, // Le Confetti Bleu
        guestId: guests[1].id,
        startDate: new Date("2025-12-20"),
        endDate: new Date("2025-12-23"),
        nights: 3,
        totalPrice: 660,
        status: "completed",
        guestEmail: "sophie@example.fr",
        guestName: "Sophie Leroy",
        confirmedAt: new Date("2025-12-15"),
      },
    }),
    prisma.booking.create({
      data: {
        listingId: listings[9].id, // Le Nid du Hibou
        guestId: guests[0].id,
        startDate: new Date("2025-11-10"),
        endDate: new Date("2025-11-12"),
        nights: 2,
        totalPrice: 420,
        status: "completed",
        guestEmail: "lucas@example.fr",
        guestName: "Lucas Martin",
        confirmedAt: new Date("2025-11-05"),
      },
    }),
    prisma.booking.create({
      data: {
        listingId: listings[10].id, // Cabane des Elfes
        guestId: guests[1].id,
        startDate: new Date("2025-12-01"),
        endDate: new Date("2025-12-03"),
        nights: 2,
        totalPrice: 320,
        status: "completed",
        guestEmail: "sophie@example.fr",
        guestName: "Sophie Leroy",
        confirmedAt: new Date("2025-11-25"),
      },
    }),
    prisma.booking.create({
      data: {
        listingId: listings[5].id, // Manoir de la Falaise
        guestId: guests[0].id,
        startDate: new Date("2025-10-15"),
        endDate: new Date("2025-10-18"),
        nights: 3,
        totalPrice: 2040,
        status: "completed",
        guestEmail: "lucas@example.fr",
        guestName: "Lucas Martin",
        confirmedAt: new Date("2025-10-10"),
      },
    }),
    prisma.booking.create({
      data: {
        listingId: listings[12].id, // La Nomade
        guestId: guests[1].id,
        startDate: new Date("2025-09-05"),
        endDate: new Date("2025-09-08"),
        nights: 3,
        totalPrice: 360,
        status: "completed",
        guestEmail: "sophie@example.fr",
        guestName: "Sophie Leroy",
        confirmedAt: new Date("2025-09-01"),
      },
    }),
    prisma.booking.create({
      data: {
        listingId: listings[7].id, // Le Gardien
        guestId: guests[1].id,
        startDate: new Date("2025-08-10"),
        endDate: new Date("2025-08-13"),
        nights: 3,
        totalPrice: 840,
        status: "completed",
        guestEmail: "sophie@example.fr",
        guestName: "Sophie Leroy",
        confirmedAt: new Date("2025-08-05"),
      },
    }),
    prisma.booking.create({
      data: {
        listingId: listings[13].id, // Le Petit Cocon
        guestId: guests[1].id,
        startDate: new Date("2025-07-20"),
        endDate: new Date("2025-07-23"),
        nights: 3,
        totalPrice: 570,
        status: "completed",
        guestEmail: "sophie@example.fr",
        guestName: "Sophie Leroy",
        confirmedAt: new Date("2025-07-15"),
      },
    }),
  ]);

  const extraReviews = await Promise.all([
    prisma.review.create({
      data: {
        listingId: listings[1].id,
        bookingId: extraBookings[0].id,
        authorId: guests[1].id,
        rating: 4,
        comment:
          "Le Confetti Bleu a Bruges est une perle. La decoration est charmante et la localisation parfaite pour explorer les canaux. La terrasse sur le pont est un vrai bonheur pour l'aperitif du soir. Un tout petit peu bruyant le week-end avec les touristes.",
      },
    }),
    prisma.review.create({
      data: {
        listingId: listings[9].id,
        bookingId: extraBookings[1].id,
        authorId: guests[0].id,
        rating: 5,
        comment:
          "Le Nid du Hibou est un cocon de douceur au milieu des Vosges. Le spa nordique sous les etoiles est un moment de pur bonheur. Le poele a bois crepite pendant que la foret s'endort. Marie est une hote attentionnee et discrete. Coup de coeur !",
      },
    }),
    prisma.review.create({
      data: {
        listingId: listings[10].id,
        bookingId: extraBookings[2].id,
        authorId: guests[1].id,
        rating: 5,
        comment:
          "La Cabane des Elfes est un endroit feerique, tant pour les enfants que pour les adultes. On se croirait vraiment dans un conte de fees. Les details sculptes dans le bois sont remarquables. La foret de Broceliande ajoute une atmosphere mystique unique.",
      },
    }),
    prisma.review.create({
      data: {
        listingId: listings[5].id,
        bookingId: extraBookings[3].id,
        authorId: guests[0].id,
        rating: 4,
        comment:
          "Le Manoir de la Falaise est grandiose. Vue epoustouflante sur la mer depuis le jardin, chambres de caractere et cheminee pour les soirees fraiches. L'emplacement a Etretat est exceptionnel. Le sauna est un plus appreciable apres une randonnee sur les falaises.",
      },
    }),
    prisma.review.create({
      data: {
        listingId: listings[12].id,
        bookingId: extraBookings[4].id,
        authorId: guests[1].id,
        rating: 3,
        comment:
          "La Nomade est un concept interessant mais qui meriterait quelques ameliorations. La yourte est spacieuse et le cadre pyreneen superbe. Cependant, l'isolation phonique pourrait etre meilleure et la salle d'eau est un peu rudimentaire. Le potager bio est une belle idee.",
      },
    }),
    prisma.review.create({
      data: {
        listingId: listings[7].id,
        bookingId: extraBookings[5].id,
        authorId: guests[1].id,
        rating: 4,
        comment:
          "Le Gardien sur l'Ile de Re est une experience unique. Monter les 120 marches avec les bagages est sportif mais la vue depuis le sommet est a couper le souffle. Les marais salants au coucher du soleil, c'est magique. Le petit-dejeuner inclus est un vrai plus.",
      },
    }),
    prisma.review.create({
      data: {
        listingId: listings[13].id,
        bookingId: extraBookings[6].id,
        authorId: guests[1].id,
        rating: 5,
        comment:
          "Le Petit Cocon est la preuve qu'on peut vivre dans un petit espace sans sacrifier le confort. Le design est ingenieux, la terrasse privative divine et l'oliveraie est un ecrin de verdure. La piscine partagee est impeccable. Coup de coeur pour ce tiny house de luxe !",
      },
    }),
  ]);

  console.log(`${reviews.length + extraReviews.length} avis crees.`);
  console.log("Seed termine avec succes !");
}

main()
  .catch((e) => {
    console.error("Erreur lors du seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
