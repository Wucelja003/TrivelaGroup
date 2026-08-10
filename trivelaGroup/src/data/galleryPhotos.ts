// Matchday galerija (auto-generisano). Slobodno menjaj title/description.

// Kategorije za filter u galeriji. "Full Gallery" nije ovde — to je
// virtuelni filter koji prikazuje sve fotke.
export type GalleryCategory =
  | "Match Day"
  | "Trivela Cases"
  | "Feel the atmosphere"
  | "Our loyal clients";

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  "Match Day",
  "Trivela Cases",
  "Feel the atmosphere",
  "Our loyal clients",
];

export interface GalleryPhoto {
  src: string;
  title: string;
  description: string;
  category: GalleryCategory;
}

export const galleryPhotos: GalleryPhoto[] = [
  { src: "/TrivelaGroupPhotos/IMG_0273.JPG", title: "Matchday 01", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_0362.PNG", title: "Matchday 02", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_0783.JPG", title: "Matchday 03", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_0961.JPG", title: "Matchday 04", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_1295.JPG", title: "Matchday 05", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_1451.JPG", title: "Matchday 06", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_1500.PNG", title: "Matchday 07", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_1987.JPG", title: "Matchday 08", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_2215.JPG", title: "Matchday 09", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_2399.JPG", title: "Matchday 10", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_2681.JPG", title: "Matchday 11", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_3292.JPG", title: "Matchday 12", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_3427.JPG", title: "Matchday 13", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_3620.JPG", title: "Matchday 14", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_4170.JPG", title: "Matchday 15", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_4181.JPG", title: "Matchday 16", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_4634.PNG", title: "Matchday 17", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_4660.JPG", title: "Matchday 18", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_4878.PNG", title: "Matchday 19", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_4886.JPG", title: "Matchday 20", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_5033.JPG", title: "Matchday 21", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_5316.JPG", title: "Matchday 22", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_5362.JPG", title: "Matchday 23", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_5392.JPG", title: "Matchday 24", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_5500.JPG", title: "Matchday 25", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_5558.JPG", title: "Matchday 26", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_5694.JPG", title: "Matchday 27", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_5697.JPG", title: "Matchday 28", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_6093.JPG", title: "Matchday 29", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_6180.JPG", title: "Matchday 30", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_7220.JPG", title: "Matchday 31", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_7251.JPG", title: "Matchday 32", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_7343.JPG", title: "Matchday 33", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_7449.JPG", title: "Matchday 34", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_7624.JPG", title: "Matchday 35", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_7923.JPG", title: "Matchday 36", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_8081.JPG", title: "Matchday 37", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_8553.JPG", title: "Matchday 38", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_8577.JPG", title: "Matchday 39", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_8766.JPG", title: "Matchday 40", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_8933.JPG", title: "Matchday 41", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_9064.PNG", title: "Matchday 42", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_9290.JPG", title: "Matchday 43", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_9469.JPG", title: "Matchday 44", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_9537.JPG", title: "Matchday 45", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_9583.JPG", title: "Matchday 46", description: "Trivela Group matchday design.", category: "Match Day" },
  { src: "/TrivelaGroupPhotos/IMG_9785.JPG", title: "Matchday 47", description: "Trivela Group matchday design.", category: "Match Day" },
];
