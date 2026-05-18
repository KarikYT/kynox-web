// Products sourced from Sportisimo.sk — Nike collection

import mercurialMain from "@/assets/mercurial-vapor-16-club-fgmg-jr-main-1.jpg";
import mercurialModra1 from "@/assets/mercurial-vapor-16-club-fgmg-jr-modra-modra-biela-ruzova-1.jpg";
import mercurialModra2 from "@/assets/mercurial-vapor-16-club-fgmg-jr-modra-modra-biela-ruzova-2.jpg";
import mercurialModra3 from "@/assets/mercurial-vapor-16-club-fgmg-jr-modra-modra-biela-ruzova-3.jpg";
import mercurialModra4 from "@/assets/mercurial-vapor-16-club-fgmg-jr-modra-modra-biela-ruzova-4.jpg";
import mercurialModra5 from "@/assets/mercurial-vapor-16-club-fgmg-jr-modra-modra-biela-ruzova-5.jpg";
import mercurialModra6 from "@/assets/mercurial-vapor-16-club-fgmg-jr-modra-modra-biela-ruzova-6.jpg";

export type ProductImage = { src: string; alt: string };

export type ColorVariant = {
  name: string;
  hex: string;
  images: ProductImage[];
};

export type Product = {
  id: number;
  slug: string;
  tags: string[];
  name: string;
  price: number;
  images: ProductImage[];
  colors: ColorVariant[];
  badge: string | null;
  description: string;
  details: string[];
};

const img = (id: number, n: number) =>
  `https://i.sportisimo.com/products/images/${id}/${id}_${n}.jpg`;

const modraImages: ProductImage[] = [
  { src: mercurialModra1, alt: "Mercurial Vapor 16 — modrá 1" },
  { src: mercurialModra2, alt: "Mercurial Vapor 16 — modrá 2" },
  { src: mercurialModra3, alt: "Mercurial Vapor 16 — modrá 3" },
  { src: mercurialModra4, alt: "Mercurial Vapor 16 — modrá 4" },
  { src: mercurialModra5, alt: "Mercurial Vapor 16 — modrá 5" },
  { src: mercurialModra6, alt: "Mercurial Vapor 16 — modrá 6" },
];

export const products: Product[] = [
  {
    id: 0,
    slug: "mercurial-vapor-16-club-fgmg-jr",
    tags: ["Futbal", "Kopačky"],
    name: "Mercurial Vapor 16 Club FG/MG Jr",
    price: 51.95,
    images: [{ src: mercurialMain, alt: "Mercurial Vapor 16 Club FG/MG Jr" }],
    colors: [
      { name: "Modrá / biela / ružová", hex: "#0055ff", images: modraImages },
      { name: "Žltá / čierna", hex: "#ffd700", images: [] },
      { name: "Čierna / svetlomodrá", hex: "#1a1a1a", images: [] },
      { name: "Červená / ružová / tyrkys", hex: "#e00020", images: [] },
      { name: "Svetlomodrá / tyrkys", hex: "#00bfff", images: [] },
    ],
    badge: "Nike",
    description:
      "Detské kopačky Nike Mercurial Vapor 16 Club FG/MG. Ľahký zvršok, pevné kolíky a explozívne odrazy pre mladých útočníkov.",
    details: ["FG/MG kolíky", "Nízky strih", "Syntetický zvršok", "Hmotnosť 195 g"],
  },
  {
    id: 1,
    slug: "nike-court-vision-low",
    tags: ["Tenisky", "Lifestyle"],
    name: "Nike Court Vision Low",
    price: 65.95,
    images: [
      { src: img(1944899, 1), alt: "Nike Court Vision Low – pohľad zboku" },
      { src: img(1944899, 2), alt: "Nike Court Vision Low – detail podrážky" },
      { src: img(1944899, 3), alt: "Nike Court Vision Low – vrch topánky" },
    ],
    colors: [],
    badge: "Nové",
    description:
      "Klasický basketbalový look prenesený do každodenného života. Čistý dizajn, pohodlná výstelka a pevná podrážka – pre tých, čo chodia štýlovo.",
    details: ["Nízky strih", "Pogumovaná podrážka", "Syntetický zvršok", "Veľkosti 36 – 47.5"],
  },
  {
    id: 2,
    slug: "nike-revolution-7",
    tags: ["Beh", "Bežecká obuv"],
    name: "Nike Revolution 7",
    price: 53.95,
    images: [
      { src: img(1142378, 1), alt: "Nike Revolution 7 – bežecká obuv" },
      { src: img(1142378, 2), alt: "Nike Revolution 7 – podrážka" },
      { src: img(1142378, 3), alt: "Nike Revolution 7 – profil" },
    ],
    colors: [],
    badge: null,
    description:
      "Ľahká bežecká obuv pre každodenný tréning. Mäkká pena tlmí nárazy, sieťovaný zvršok drží nohu chladnú.",
    details: ["Pena Nike React", "Sieťovaný zvršok", "Hmotnosť ~230 g", "Veľkosti 36 – 49.5"],
  },
  {
    id: 3,
    slug: "nike-phantom-gx2-pro-fg",
    tags: ["Futbal", "Kopačky"],
    name: "Nike Phantom GX 2 Pro FG",
    price: 104.95,
    images: [
      { src: img(1387878, 1), alt: "Nike Phantom GX 2 Pro FG – kopačky" },
      { src: img(1387878, 2), alt: "Nike Phantom GX 2 Pro FG – zvršok" },
      { src: img(1387878, 3), alt: "Nike Phantom GX 2 Pro FG – podrážka" },
    ],
    colors: [],
    badge: "Pro",
    description:
      "Kopačky na prírodný trávnik s precíznou kontrolou lopty. Anatomická výstelka a pevné lisované kolíky pre explozívny odraz.",
    details: ["FG lisované kolíky", "Precízna textúra zvršku", "Hmotnosť 200 g", "Veľkosti 39 – 47.5"],
  },
  {
    id: 4,
    slug: "nike-air-max-alpha-trainer-6",
    tags: ["Fitness", "Tréning"],
    name: "Nike Air Max Alpha Trainer 6",
    price: 73.95,
    images: [
      { src: img(1695551, 1), alt: "Nike Air Max Alpha Trainer 6 – fitness obuv" },
      { src: img(1695551, 2), alt: "Nike Air Max Alpha Trainer 6 – detail" },
      { src: img(1695551, 3), alt: "Nike Air Max Alpha Trainer 6 – podrážka" },
    ],
    colors: [],
    badge: null,
    description:
      "Tréningová obuv s viditeľnou Air jednotkou v päte pre komfort aj pri najťažších sériách.",
    details: ["Viditeľná Air jednotka", "Nízky strih", "Multismerová drážkovanie podrážky", "Veľkosti 40 – 49.5"],
  },
  {
    id: 5,
    slug: "nike-air-max-sc",
    tags: ["Lifestyle", "Voľný čas"],
    name: "Nike Air Max SC",
    price: 52.95,
    images: [
      { src: img(886563, 1), alt: "Nike Air Max SC – lifestyle tenisky" },
      { src: img(886563, 2), alt: "Nike Air Max SC – detail Air" },
      { src: img(886563, 3), alt: "Nike Air Max SC – profil" },
    ],
    colors: [],
    badge: null,
    description:
      "Ikonická Air Max silueta vo vstupnom segmente. Viditeľná vzduchová jednotka, retro tvar a denný komfort.",
    details: ["Viditeľná Air jednotka", "Syntetický a textilný zvršok", "Penová medzipodrážka", "Veľkosti 36 – 49.5"],
  },
  {
    id: 6,
    slug: "nike-victori-one",
    tags: ["Plávanie", "Šľapky"],
    name: "Nike Victori One",
    price: 26.95,
    images: [
      { src: img(1203334, 1), alt: "Nike Victori One – šľapky" },
      { src: img(1203334, 2), alt: "Nike Victori One – remienok" },
      { src: img(1203334, 3), alt: "Nike Victori One – podrážka" },
    ],
    colors: [],
    badge: "Limit",
    description:
      "Jednoduché šľapky s mäkkou penovou podrážkou a nastaviteľným remienkom.",
    details: ["Penová podrážka", "Nastaviteľný remienok", "Vodoodpudivý materiál", "Veľkosti 36 – 49.5"],
  },
];

export const formatPrice = (n: number): string =>
  (n % 1 === 0 ? `${n}` : n.toFixed(2).replace(".", ",")) + " €";

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getImages(product: Product, colorName?: string): ProductImage[] {
  if (!colorName) return product.images;
  const variant = product.colors.find((c) => c.name === colorName);
  if (variant && variant.images.length > 0) return variant.images;
  return product.images;
}
