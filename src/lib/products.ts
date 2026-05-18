import predator_club_fxg_if6344_tmavomodra_main_1Img from "@/assets/predator-club-fxg-if6344-tmavomodra-main-1.jpg";
import predator_club_fxg_if6344_tmavomodra_main_2Img from "@/assets/predator-club-fxg-if6344-tmavomodra-main-2.jpg";
import predator_club_fxg_if6344_tmavomodra_main_3Img from "@/assets/predator-club-fxg-if6344-tmavomodra-main-3.jpg";
import predator_club_fxg_if6344_tmavomodra_main_4Img from "@/assets/predator-club-fxg-if6344-tmavomodra-main-4.jpg";
import predator_club_fxg_if6344_tmavomodra_main_5Img from "@/assets/predator-club-fxg-if6344-tmavomodra-main-5.jpg";
import predator_club_fxg_if6344_tmavomodra_main_6Img from "@/assets/predator-club-fxg-if6344-tmavomodra-main-6.jpg";

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

export const products: Product[] = [
  {
    id: 1,
    slug: "predator-club-fxg-if6344-tmavomodra",
    tags: ["Futbal", "Obuv", "Kopačky"],
    name: "Predator Club Fxg IF6344 Tmavomodrá",
    price: 35,
    images: [
      { src: predator_club_fxg_if6344_tmavomodra_main_1Img, alt: "Predator Club Fxg IF6344 Tmavomodrá 1" },
      { src: predator_club_fxg_if6344_tmavomodra_main_2Img, alt: "Predator Club Fxg IF6344 Tmavomodrá 2" },
      { src: predator_club_fxg_if6344_tmavomodra_main_3Img, alt: "Predator Club Fxg IF6344 Tmavomodrá 3" },
      { src: predator_club_fxg_if6344_tmavomodra_main_4Img, alt: "Predator Club Fxg IF6344 Tmavomodrá 4" },
      { src: predator_club_fxg_if6344_tmavomodra_main_5Img, alt: "Predator Club Fxg IF6344 Tmavomodrá 5" },
      { src: predator_club_fxg_if6344_tmavomodra_main_6Img, alt: "Predator Club Fxg IF6344 Tmavomodrá 6" },
    ],
    colors: [
    ],
    badge: "Použité",
    description: "Obohaťte svoju hru vďaka futbalovým kopačkám adidas, vytvoreným s myšlienkou na športovcov. Vyrobené z vysokokvalitnej imitácie kože, ponúkajú vynikajúcu podporu a pohodlie. Šnurovanie zabezpečuje ideálne prispôsobenie, a mäkký textilný vnútrajšok garantuje komfort počas dlhých tréningov. Vybavené pokročilou vonkajšou podrážkou Controlplate 2.0, tieto topánky sú optimalizované na hru na prírodnom povrchu, čo umožňuje presné ovládanie lopty a spoľahlivú priľnavosť. --- POUŽITÉ!!! ---",
    details: ["Farba: Tmavomodrá", "Použité: Ano", "Farba Výrobcu: Lucblu/Ftwwht/Solred", "Konštrukcia: Syntetický vrch so Strikeprint textúrovaním na vnútornej strane a penová vrstva pre pohodlie", "Povrch: FxG podrážka"],
  },
];

export const formatPrice = (n: number): string =>
  (n % 1 === 0 ? `${n}` : n.toFixed(2).replace('.', ',')) + ' €';

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getImages(product: Product, colorName?: string): ProductImage[] {
  if (!colorName) return product.images;
  return product.colors.find((c) => c.name === colorName)?.images ?? product.images;
}
