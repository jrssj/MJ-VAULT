export type Offer = {
  name: string;
  price: number;
  detail: string;
  image: string;
};

export const offerCollections: { id: string; title: string; offers: Offer[] }[] = [
  {
    id: "adidas",
    title: "Adidas",
    offers: [
      { name: "Campus 00s verde con blanco", price: 1400, detail: "Consulta tu talla", image: "/offers/campus-green.webp" },
      { name: "Campus 00s negro con blanco", price: 1580, detail: "Consulta tu talla", image: "/offers/campus-black.webp" },
      { name: "Campus 00s gris con blanco", price: 1500, detail: "Consulta tu talla", image: "/offers/campus-grey.webp" },
      { name: "Gazelle Bold gris", price: 900, detail: "Plataforma y suela color caramelo", image: "/offers/gazelle-bold-grey.webp" },
      { name: "Gazelle rojo con blanco", price: 1100, detail: "Consulta tu talla", image: "/offers/gazelle-red.webp" },
      { name: "Handball Spezial crema y verde", price: 2050, detail: "Cordones color vino", image: "/offers/spezial-cream-green.webp" },
      { name: "Handball Spezial gris taupe", price: 1890, detail: "Franjas blancas", image: "/offers/spezial-taupe.webp" },
      { name: "Runfalcon 6 beige con negro", price: 1200, detail: "Consulta tu talla", image: "/offers/runfalcon-beige.webp" },
      { name: "Grand Court Base 00 beige", price: 1200, detail: "Franjas y suela negras", image: "/offers/grand-court-beige.webp" },
      { name: "VL Court 3.0 blanco y azul claro", price: 1000, detail: "Suela color caramelo", image: "/offers/vl-court-white-blue.webp" },
      { name: "Adidas fútbol blanco y azul", price: 1600, detail: "Detalles dorados · consulta modelo y talla", image: "/offers/adidas-football.webp" },
    ],
  },
  {
    id: "new-balance",
    title: "New Balance",
    offers: [
      { name: "Fresh Foam azul marino", price: 1100, detail: "Suela clara · consulta tu talla", image: "/offers/nb-fresh-foam-navy.webp" },
      { name: "New Balance blanco y azul", price: 1300, detail: "Publicado en talla 5 unisex", image: "/offers/nb-white-blue.webp" },
      { name: "530 rojo vino y plateado", price: 1800, detail: "Publicado en talla 5.5", image: "/offers/nb-530-red.webp" },
      { name: "New Balance verde menta", price: 1800, detail: "Detalles beige · consulta tu talla", image: "/offers/nb-mint.webp" },
      { name: "New Balance azul gris y crema", price: 1800, detail: "Publicado en punto 3", image: "/offers/nb-blue-grey.webp" },
      { name: "New Balance crema y rosa", price: 1099, detail: "Consulta disponibilidad en tu talla", image: "/offers/nb-cream-pink.webp" },
      { name: "740 negro", price: 2100, detail: "Consulta tu talla", image: "/offers/nb-740-black.webp" },
      { name: "New Balance gris claro", price: 890, detail: "Publicado en talla 7", image: "/offers/nb-grey.webp" },
      { name: "New Balance infantil negro y gris", price: 990, detail: "Publicado del 19 al 21", image: "/offers/nb-kids-black-grey.webp" },
      { name: "Fresh Foam beige y gris", price: 800, detail: "Consulta tu talla", image: "/offers/nb-fresh-foam-beige.webp" },
      { name: "Fresh Foam negro", price: 1000, detail: "Suela clara · consulta tu talla", image: "/offers/nb-fresh-foam-black.webp" },
    ],
  },
  {
    id: "regalos",
    title: "Regalos y temporada",
    offers: [
      { name: "Bath & Body Works · Feel the Wonder", price: 1450, detail: "Calendario de Adviento", image: "/offers/bbw-advent.webp" },
      { name: "DAISE Dreamhouse", price: 1130, detail: "Calendario de Adviento", image: "/offers/daise-advent.webp" },
      { name: "The Ultimate Skincare Advent", price: 740, detail: "Calendario de cuidado de la piel", image: "/offers/skincare-advent.webp" },
      { name: "The Ultimate Spa Advent", price: 740, detail: "Calendario de spa", image: "/offers/spa-advent.webp" },
      { name: "Bufanda larga", price: 310, detail: "Consulta colores disponibles", image: "/offers/long-scarf.webp" },
      { name: "Manta delgada sin forro", price: 320, detail: "Consulta diseños disponibles", image: "/offers/light-blanket.webp" },
      { name: "Cobija con forro", price: 375, detail: "Consulta diseños disponibles", image: "/offers/lined-blanket.webp" },
    ],
  },
];
