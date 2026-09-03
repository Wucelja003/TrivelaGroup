// Trivela galerija (auto-generisano iz public/TrivelaGallery). Slobodno menjaj title/description.

// Kategorije za filter u galeriji. "Full Gallery" nije ovde — to je
// virtuelni filter koji prikazuje sve fotke.
export type GalleryCategory =
  | "Match Day"
  | "Trivela Cases"
  | "Feel the atmosphere"
  | "Our loyal clients"
  | "Trivela Verifications";

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  "Match Day",
  "Trivela Cases",
  "Feel the atmosphere",
  "Our loyal clients",
  "Trivela Verifications",
];

export interface GalleryPhoto {
  src: string;
  title: string;
  description: string;
  category: GalleryCategory;
}

export const galleryPhotos: GalleryPhoto[] = [
  { src: "/TrivelaGallery/IMG_0783.JPG", title: "Trivela 01", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_0858.JPG", title: "Trivela 02", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_0961.JPG", title: "Trivela 03", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_1295.JPG", title: "Trivela 04", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_1451.JPG", title: "Trivela 05", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_1500.jpg", title: "Trivela 06", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_1554.JPG", title: "Trivela 07", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_2215.JPG", title: "Trivela 08", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_2399.JPG", title: "Trivela 09", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_2681.JPG", title: "Trivela 10", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_3292.JPG", title: "Trivela 11", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_3427.JPG", title: "Trivela 12", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_3620.JPG", title: "Trivela 13", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_4170.JPG", title: "Trivela 14", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_4179.JPG", title: "Trivela 15", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_4181.JPG", title: "Trivela 16", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_4660.JPG", title: "Trivela 17", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_4878.jpg", title: "Trivela 18", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_4886.JPG", title: "Trivela 19", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_5033.JPG", title: "Trivela 20", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_5220.jpg", title: "Trivela 21", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_5316.JPG", title: "Trivela 22", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_5327.JPG", title: "Trivela 23", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_5362.JPG", title: "Trivela 24", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_5392.JPG", title: "Trivela 25", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_5500.JPG", title: "Trivela 26", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_5558.JPG", title: "Trivela 27", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_6093.JPG", title: "Trivela 28", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_6958.JPG", title: "Trivela 29", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_7220.JPG", title: "Trivela 30", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_7248.JPG", title: "Trivela 31", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_7343.JPG", title: "Trivela 32", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_7449.JPG", title: "Trivela 33", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_7624.JPG", title: "Trivela 34", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_7923.JPG", title: "Trivela 35", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_8081.JPG", title: "Trivela 36", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_8329.JPG", title: "Trivela 37", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_8553.JPG", title: "Trivela 38", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_8577.JPG", title: "Trivela 39", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_8659.JPG", title: "Trivela 40", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_8766.JPG", title: "Trivela 41", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_8793.JPG", title: "Trivela 42", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_8933.JPG", title: "Trivela 43", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_9290.JPG", title: "Trivela 44", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_9469.JPG", title: "Trivela 45", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_9537.JPG", title: "Trivela 46", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_9583.JPG", title: "Trivela 47", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_9738.JPG", title: "Trivela 48", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/IMG_9785.JPG", title: "Trivela 49", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/Kostov.jpg", title: "Trivela 50", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/MITROVIC.jpg", title: "Trivela 51", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/SRBvsAZE.jpg", title: "Trivela 52", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/Saric_Plzen.jpg", title: "Trivela 53", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/WhatsApp Image 2025-01-19 at 20.34.07.jpeg", title: "Trivela 54", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/djole copy.jpg", title: "Trivela 55", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/image00001.jpeg", title: "Trivela 56", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/kostov hapoel 1.jpg", title: "Trivela 57", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/lucic.jpg", title: "Trivela 58", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/mitrovic1.jpg", title: "Trivela 59", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/petko_lagalaxy.jpg", title: "Trivela 60", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/petkovic.jpg", title: "Trivela 61", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/petkovic1.jpg", title: "Trivela 62", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/petkovsatl.jpg", title: "Trivela 63", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/pisa.jpg", title: "Trivela 64", description: "Trivela Group.", category: "Match Day" },
  { src: "/TrivelaGallery/ratkov.jpg", title: "Trivela 65", description: "Trivela Group.", category: "Match Day" },
  { src: "/trivelaVerifications/verifiDzodic.jpg", title: "Dzodic", description: "Trivela verification.", category: "Trivela Verifications" },
  { src: "/trivelaVerifications/verifiKostov.jpg", title: "Kostov", description: "Trivela verification.", category: "Trivela Verifications" },
  { src: "/trivelaVerifications/verifiMilosavljevic.jpg", title: "Milosavljevic", description: "Trivela verification.", category: "Trivela Verifications" },
  { src: "/trivelaVerifications/verifiPrijovic.jpg", title: "Prijovic", description: "Trivela verification.", category: "Trivela Verifications" },
  { src: "/trivelaVerifications/verifiRadojevic.jpg", title: "Radojevic", description: "Trivela verification.", category: "Trivela Verifications" },
  { src: "/trivelaVerifications/verifiSavicRestoran.jpg", title: "Savic Restoran", description: "Trivela verification.", category: "Trivela Verifications" },
  { src: "/trivelaVerifications/verifiUgresic.jpg", title: "Ugresic", description: "Trivela verification.", category: "Trivela Verifications" },
  { src: "/trivelaVerifications/verifiZaric.jpg", title: "Zaric", description: "Trivela verification.", category: "Trivela Verifications" },
  { src: "/trivelaVerifications/verification1.jpg", title: "cation1", description: "Trivela verification.", category: "Trivela Verifications" },
];
