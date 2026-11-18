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
      { name: "Campus 00s gris con blanco", price: 1500, detail: "Consulta tu talla", image: "https://imagedelivery.net/2DfovxNet9Syc-4xYpcsGg/32817500-f180-44ba-8715-2a767b031800/public" },
      { name: "Gazelle Bold gris", price: 900, detail: "Plataforma y suela color caramelo", image: "https://limitedresell.com/13266-full_default/adidas-gazelle-bold-grey-magic-beige-gum.jpg" },
      { name: "Gazelle rojo con blanco", price: 1100, detail: "Consulta tu talla", image: "https://thumblr.uniid.it/product/358712/7a8066930741.jpg" },
      { name: "Handball Spezial crema y verde", price: 2050, detail: "Cordones color vino", image: "https://assets.adidas.com/images/w_500%2Cf_auto%2Cq_auto/14288418167e4a60bf8a55aa529ed431_9366/Real_Madrid_Handball_Spezial_Shoes_Beige_KK3019_01_00_standard.jpg" },
      { name: "Handball Spezial gris taupe", price: 1890, detail: "Franjas blancas", image: "https://img.brandshop.ru/cache/products/k/kk1153-3_1104x1104.webp" },
      { name: "Runfalcon 6 beige con negro", price: 1200, detail: "Consulta tu talla", image: "https://assets.adidas.com/images/h_2000%2Cf_auto%2Cq_auto%2Cfl_lossy%2Cc_fill%2Cg_auto/e8b2f03bfa5e483997d12471c86c9e8a_9366/Runfalcon_6_CLOUDFOAM_Running_Shoes_Beige_KH5563_06_standard.jpg" },
      { name: "Grand Court Base 00 beige", price: 1200, detail: "Franjas y suela negras", image: "https://imgcentauro-a.akamaihd.net/1300x1300/M14I5S15A1.jpg" },
      { name: "VL Court 3.0 blanco y azul claro", price: 1000, detail: "Suela color caramelo", image: "https://assets.adidas.com/images/w_500%2Cf_auto%2Cq_auto/53b8aae87d064e369e39e7ea61e9e0eb_9366/VL_Court_3.0_Shoes_White_KI4577_01_00_standard.jpg" },
      { name: "Adidas fútbol blanco y azul", price: 1600, detail: "Detalles dorados · consulta modelo y talla", image: "https://assets.adidas.com/images/w_600%2Cf_auto%2Cq_auto/80223b1781fb499689420ac4700b1ae3_9366/Predator_Club_Fold-Over_Tongue_Firm_Ground-Multi_Ground_Football_Boots_White_JP6524_01_00_standard_hover.jpg" },
    ],
  },
  {
    id: "new-balance",
    title: "New Balance",
    offers: [
      { name: "Fresh Foam azul marino", price: 1100, detail: "Suela clara · consulta tu talla", image: "https://www.misterrunning.com/images/2024-media-12/new-balance-freshfoamx-kaiha-road-scarpe-running-uomo-nb-navy-mkaircg1_D.jpg" },
      { name: "New Balance blanco y azul", price: 1300, detail: "Publicado en talla 5 unisex", image: "https://cms-cdn.thesolesupplier.co.uk/2023/12/new-balance-1906r-silver-metallic-blue-1_w672_h672_pad_.jpg.webp" },
      { name: "530 rojo vino y plateado", price: 1800, detail: "Publicado en talla 5.5", image: "https://cdn.snkrdunk.com/upload_bg_removed/20260219032549-2.webp" },
      { name: "New Balance verde menta", price: 1800, detail: "Detalles beige · consulta tu talla", image: "https://newbalance.com.gt/cdn/shop/files/G90604BR-1_f1mpc1.jpg?v=1774384520&width=720" },
      { name: "New Balance azul gris y crema", price: 1800, detail: "Publicado en punto 3", image: "https://addictsneakers.com/cdn/shop/products/new-balance-9060-blue-haze-2.png?v=1757498070" },
      { name: "New Balance crema y rosa", price: 1099, detail: "Consulta disponibilidad en tu talla", image: "https://images-beta.laced.com/products/7efb8509-230b-42b9-ab70-3e5a99878fc8.jpg?width=3840" },
      { name: "740 negro", price: 2100, detail: "Consulta tu talla", image: "https://nrml.ca/cdn/shop/files/BO2.jpg?crop=center&height=1000&v=1742566656&width=1800" },
      { name: "New Balance gris claro", price: 890, detail: "Publicado en talla 7", image: "https://f.fcdn.app/imgs/1659d1/www.sportmarket.com.uy/smaruy/20fb/original/catalogo/MEVOZRE4_1042_1/460x460/championes-new-balance-de-hombre-evoz-v4-mevozre4-eld.jpg" },
      { name: "New Balance infantil negro y gris", price: 990, detail: "Publicado del 19 al 21", image: "https://image.nbkorea.com/NBRB_Product/20260123/NB20260123091236275001.jpg" },
      { name: "Fresh Foam beige y gris", price: 800, detail: "Consulta tu talla", image: "https://www.thenextsole.com/storage/images/WARISTM4D.png" },
      { name: "Fresh Foam negro", price: 1000, detail: "Suela clara · consulta tu talla", image: "https://media-www.sportchek.ca/product/div-05-footwear/dpt-80-footwear/sdpt-01-mens/334254633/new-balance-men-s-kaiha-road-running-shoes-7592f755-2063-423f-ba2e-d5f9f6c723a8-jpgrendition.jpg" },
    ],
  },
  {
    id: "regalos",
    title: "Regalos y temporada",
    offers: [
      { name: "Bath & Body Works · Feel the Wonder", price: 1450, detail: "Calendario de Adviento", image: "https://www.bathandbodyworks.com/dw/image/v2/BBDL_PRD/on/demandware.static/-/Sites-master-catalog/default/dw638e1291/hires/025510202.jpg?format=auto&q=75&sw=480" },
      { name: "DAISE Dreamhouse", price: 1130, detail: "Calendario de Adviento", image: "https://target.scene7.com/is/image/Target/GUEST_6afb3f19-03c6-46ec-9ef7-21f5f7ecd4c5?fmt=pjpeg&hei=300&wid=300" },
      { name: "The Ultimate Skincare Advent", price: 740, detail: "Calendario de cuidado de la piel", image: "https://target.scene7.com/is/image/Target/GUEST_e39f2aa1-5100-4463-829d-efb777a46284?fmt=pjpeg&hei=300&wid=300" },
      { name: "The Ultimate Spa Advent", price: 740, detail: "Calendario de spa", image: "https://target.scene7.com/is/image/Target/GUEST_aa6fd6fa-ebf0-473e-b970-80a08baebfdd?fmt=pjpeg&hei=300&wid=300" },
      { name: "Bufanda larga", price: 310, detail: "Consulta colores disponibles", image: "https://image.uniqlo.com/GU/ST3/AsianCommon/imagesgoods/351351/item/goods_09_351351.jpg" },
      { name: "Manta delgada sin forro", price: 320, detail: "Consulta diseños disponibles", image: "https://i5.walmartimages.com/seo/Bare-Home-Polar-Fleece-Bed-Blanket-Lightweight-Premium-Fleece-Throw-Sand_ef2241cd-1790-49b6-bcbb-2a0de0a55d49.cc73fee15f77bc775cfe195a385eb6f9.jpeg" },
      { name: "Cobija con forro", price: 375, detail: "Consulta diseños disponibles", image: "https://c.shld.net/rpx/i/s/pi/mp/3793/prod_19548563224?d=821ce5a63f537dd83e9f8d3130bf7d98cf90e920&src=https%3A%2F%2Fm.media-amazon.com%2Fimages%2FI%2F71i29LmBReL.jpg" },
    ],
  },
];
