// Products sourced from Sportisimo.sk — Nike collection
// Images via i.sportisimo.com CDN

export type Product = {
  id: number;
  slug: string;
  tags: string[];
  name: string;
  price: number;
  images: { src: string; alt: string }[];
  badge: string | null;
  description: string;
  details: string[];
};

const img = (id: number, n: number) =>
  `https://i.sportisimo.com/products/images/${id}/${id}_${n}.jpg`;

export const products: Product[] = [
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
    badge: "Nové",
    description:
      "Klasický basketbalový look prenesený do každodenného života. Čistý dizajn, pohodlná výstelka a pevná podrážka – pre tých, čo chodia štýlovo.",
    details: [
      "Nízky strih",
      "Pogumovaná podrážka",
      "Syntetický zvršok",
      "Veľkosti 36 – 47.5",
    ],
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
    badge: null,
    description:
      "Ľahká bežecká obuv pre každodenný tréning. Mäkká pena tlmí nárazy, sieťovaný zvršok drží nohu chladnú. Pre bežcov, čo nezastávajú.",
    details: [
      "Pena Nike React",
      "Sieťovaný zvršok",
      "Hmotnosť ~230 g",
      "Veľkosti 36 – 49.5",
    ],
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
    badge: "Pro",
    description:
      "Kopačky na prírodný trávnik s precíznou kontrolou lopty. Anatomická výstelka a pevné lisované kolíky pre explozívny odraz. Pre hráčov, čo rozhodujú zápasy.",
    details: [
      "FG lisované kolíky",
      "Precízna textúra zvršku",
      "Hmotnosť 200 g",
      "Veľkosti 39 – 47.5",
    ],
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
    badge: null,
    description:
      "Tréningová obuv s viditeľnou Air jednotkou v päte pre komfort aj pri najťažších sériách. Stabilná platforma, flexibilná prednoha. Pre tých, čo trénujú naplno.",
    details: [
      "Viditeľná Air jednotka",
      "Nízky strih",
      "Multismerová drážkovanie podrážky",
      "Veľkosti 40 – 49.5",
    ],
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
    badge: null,
    description:
      "Ikonická Air Max silueta vo vstupnom segmente. Viditeľná vzduchová jednotka, retro tvar a denný komfort. Pre tých, čo chcú Air Max bez kompromisov v cene.",
    details: [
      "Viditeľná Air jednotka",
      "Syntetický a textilný zvršok",
      "Penová medzipodrážka",
      "Veľkosti 36 – 49.5",
    ],
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
    badge: "Limit",
    description:
      "Jednoduché šľapky s mäkkou penovou podrážkou a nastaviteľným remienkom. Bazén, šatňa alebo lazy sunday – všade tam, kde nechceš riešiť šnúrky.",
    details: [
      "Penová podrážka",
      "Nastaviteľný remienok",
      "Vodoodpudivý materiál",
      "Veľkosti 36 – 49.5",
    ],
  },
];

export const formatPrice = (n: number) => `${n} €`;

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
