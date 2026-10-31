/**
 * Mobile Exchange Wala shop details (Ashok Nagar, Nashik).
 */
export const shop = {
  name: "Mobile Exchange Wala",
  hindiName: "मोबाईल एक्सचेंज वाला",
  area: "Ashok Nagar",
  ownerTitle: "Avinash Dugdhe & Anil Kajalkar",
  contactName: "MOBILE EXCHANGE WALA ASHOK NAGAR",
  tagline: "Buy ● Sell ● Exchange",
  phoneDisplay: "+91 88887 14356",
  phoneTel: "+918888714356",
  whatsapp: "918888714356",
  whatsappDisplay: "+91 88887 14356",
  instagram: "https://www.instagram.com/exchangewala_ashoknagar7?mdxt=MW8za2djZzN4OGc4bQ==",
  ownerInstagram: "https://www.instagram.com/avinash_dugdhe?xtok=MTVtc2JsMDRmc2R6MQ==",
  ownerInstagramLabel: "Avinash Dugdhe",
  secondOwnerInstagram: "https://www.instagram.com/anil_kajalkar?dlrf=ZmY2b3p6dXowcGVw",
  secondOwnerInstagramLabel: "Anil Kajalkar",
  facebook: "https://www.facebook.com/share/19cDdhuzyF/",
  address: "Shop 1 & 2, Shyam Villa, Near Ashok Nagar Police Chowki, Nashik 422012",
  city: "Nashik",
  pincode: "422012",
  mapsQuery: "SS Mobile Ashok Nagar Nashik",
  placeId: "ChIJQ3gek5Xt3TsRzGvb3ycr6-E",
  mapsEmbed: "",
  hours: "Open Daily · 10:00 AM – 10:00 PM",
  brands: [
    "Buy ● Sell ● Exchange",
    "Unused Demo Upto 50% Discount",
    "Sell Old Phone & Get Instant Cash",
    "6 Months Brand Warranty",
    "Instant Cash Available",
    "Your Old Phones",
  ],
  offers: [
    "Unused demo phones — up to 50% discount",
    "Sell your old phone & get instant cash",
    "6 months brand warranty",
    "Buy & Sale — all top brand smartphones",
    "Instant cash available for your old phones",
  ],
};

export const categories = [
  { id: "all", label: "All" },
  { id: "buy_demo", label: "Unused Demo (50% Off)" },
  { id: "sell_cash", label: "Sell & Instant Cash" },
  { id: "exchange", label: "Exchange Phone" },
  { id: "warranty", label: "6M Warranty" },
  { id: "staff", label: "Staff & Service" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];

export function googleReviewUrl() {
  if (shop.placeId) {
    return `https://search.google.com/local/writereview?placeid=${shop.placeId}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.mapsQuery)}`;
}

export function mapsDirectionsUrl() {
  if (shop.placeId) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.mapsQuery)}&query_place_id=${shop.placeId}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.mapsQuery)}`;
}

export function mapsEmbedUrl() {
  if (shop.mapsEmbed) return shop.mapsEmbed;
  return `https://maps.google.com/maps?q=${encodeURIComponent(shop.mapsQuery)}&t=h&z=18&ie=UTF8&iwloc=&output=embed`;
}

export function whatsappUrl() {
  const num = shop.whatsapp.replace(/\D/g, "");
  if (!num || num.includes("X")) return "#";
  return `https://wa.me/${num}`;
}

export function vcard() {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:EXCHANGE WALA;MOBILE;;;`,
    `FN:MOBILE EXCHANGE WALA ASHOK NAGAR`,
    `ORG:${shop.name} ${shop.area}`,
    `TEL;TYPE=CELL,VOICE,PREF:${shop.phoneTel}`,
    `ADR;TYPE=WORK:;;${shop.address};;;;India`,
    shop.instagram.endsWith("instagram.com/") ? "" : `URL:${shop.instagram}`,
    shop.ownerInstagram ? `URL:${shop.ownerInstagram}` : "",
    shop.secondOwnerInstagram ? `URL:${shop.secondOwnerInstagram}` : "",
    shop.facebook.endsWith("facebook.com/") ? "" : `URL:${shop.facebook}`,
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\n");
}
