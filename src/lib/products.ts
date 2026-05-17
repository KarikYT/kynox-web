import shoeImg from "@/assets/product-shoe.jpg";
import hoodieImg from "@/assets/product-hoodie.jpg";
import bottleImg from "@/assets/product-bottle.jpg";
import shirtImg from "@/assets/product-shirt.jpg";

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

export const products: Product[] = [
  {
    id: 1,
    slug: "iron-flask-750",
    tags: ["Futbal", "Hydratácia"],
    name: "Iron Flask 750",
    price: 39,
    images: [
      { src: bottleImg, alt: "KYNOX fľaša Iron Flask" },
      { src: shoeImg, alt: "Iron Flask detail" },
      { src: hoodieImg, alt: "Iron Flask v akcii" },
    ],
    badge: "Nové",
    description:
      "Termoizolačná fľaša z nehrdzavejúcej ocele. Drží ľad 24h, horúce 12h. Pre tých, čo nezastavujú medzi polčasmi.",
    details: ["750 ml objem", "Dvojstenná oceľ", "Bez BPA", "Vákuová izolácia"],
  },
  {
    id: 2,
    slug: "phantom-stick-pro",
    tags: ["Hokej", "Hokejky"],
    name: "Phantom Stick Pro",
    price: 139,
    images: [
      { src: hoodieImg, alt: "KYNOX hokejka Phantom" },
      { src: shirtImg, alt: "Phantom Stick detail" },
      { src: bottleImg, alt: "Phantom Stick rukoväť" },
    ],
    badge: null,
    description:
      "Karbónová hokejka stavaná pre rýchle strely. Vyvážená rukoväť, agresívna čepeľ. Pre hráčov, čo skórujú v predĺžení.",
    details: ["100% karbón", "Flex 85", "Hmotnosť 420g", "Pravá / ľavá"],
  },
  {
    id: 3,
    slug: "vortex-racket-01",
    tags: ["Tenis", "Rakety"],
    name: "Vortex Racket 01",
    price: 189,
    images: [
      { src: shoeImg, alt: "KYNOX tenisová raketa" },
      { src: shirtImg, alt: "Vortex Racket strunový vzor" },
      { src: hoodieImg, alt: "Vortex Racket rukoväť" },
    ],
    badge: null,
    description:
      "Tenisová raketa s rozšíreným sweet spotom. Pre brutálne forhendy a presné voleje pri sieti.",
    details: ["Hmotnosť 305g", "Hlava 100 sq.in", "Vzor 16x19", "Grafit + grafén"],
  },
  {
    id: 4,
    slug: "pulse-boxing-gloves",
    tags: ["Box", "Rukavice"],
    name: "Pulse Boxing Gloves",
    price: 59,
    images: [
      { src: shirtImg, alt: "KYNOX boxerské rukavice" },
      { src: hoodieImg, alt: "Pulse Gloves detail" },
      { src: bottleImg, alt: "Pulse Gloves zapínanie" },
    ],
    badge: "Limit",
    description:
      "Boxerské rukavice s viacvrstvovou penou. Chránia kĺby, vracajú silu úderov. Pre sparringy aj vrece.",
    details: ["12 / 14 / 16 oz", "Pravá koža", "Velcro pásik", "Anatomická päsť"],
  },
  {
    id: 5,
    slug: "iron-club-set",
    tags: ["Golf", "Palice"],
    name: "Iron Club Set",
    price: 299,
    images: [
      { src: shoeImg, alt: "KYNOX golfové palice" },
      { src: bottleImg, alt: "Iron Club hlavy" },
      { src: shirtImg, alt: "Iron Club rukoväte" },
    ],
    badge: null,
    description:
      "Sada 7 palíc pre kontrolovanú hru od fairway až po green. Pre tých, čo si parky pri 18-tich jamkách berú vážne.",
    details: ["7 palíc (4-PW)", "Oceľové driek", "Pravák", "Vrátane bagu"],
  },
  {
    id: 6,
    slug: "vortex-runner-01",
    tags: ["Futbal", "Obuv"],
    name: "Vortex Runner 01",
    price: 199,
    images: [
      { src: hoodieImg, alt: "KYNOX futbalová obuv" },
      { src: shoeImg, alt: "Vortex Runner podrážka" },
      { src: shirtImg, alt: "Vortex Runner profil" },
    ],
    badge: "Pro",
    description:
      "Futbalové kopačky s lepkavou syntetikou pre presnú prihrávku. Pre tých, čo prelomia obranu.",
    details: ["FG štuple", "Veľkosti 39 - 47", "Hmotnosť 215g", "Microfiber zvršok"],
  },
];

export const formatPrice = (n: number) => `${n} €`;

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
