export const SITE = {
  telegram: "https://t.me/+d6HdkL2gypNmMjg0",
  facebookFormateur: "https://www.facebook.com/share/1Jb7STY2qK/?mibextid=wwXIfr",
  journal: "https://trc-journal.lovable.app/",
  whatsapp: "https://wa.me/261382696825",
  whatsappDisplay: "038 26 968 25",
  mvolaNumber: "038 26 968 25",
  mvolaName: "Keystone",
  salleLieu: "Fianarantsoa",
  usdRate: 4500,
};

export const CAT_ONLINE = "Formation en ligne";
export const CAT_SALLE = "Formation en salle";
export const CAT_SPECIAL = "Formation Special";

const USD_OVERRIDES: Record<number, number> = {
  12000: 3,
  84000: 20,
  225000: 50,
};

export function usdFromAr(price: number) {
  return USD_OVERRIDES[price] ?? Math.round(price / SITE.usdRate);
}

export function formatDual(price: number) {
  return `${usdFromAr(price)}$ ou ${new Intl.NumberFormat("fr-MG").format(price)} Ar`;
}

