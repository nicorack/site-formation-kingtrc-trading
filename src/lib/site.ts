export const SITE = {
  telegram: "https://t.me/+d6HdkL2gypNmMjg0",
  facebookFormateur: "https://www.facebook.com/share/1Jb7STY2qK/?mibextid=wwXIfr",
  journal: "https://trc-journal.lovable.app/",
  whatsapp: "https://wa.me/261329622668",
  whatsappDisplay: "032 96 226 68",
  mvolaNumber: "038 26 968 25",
  mvolaName: "Keystone",
  salleLieu: "Fianarantsoa",
  usdRate: 4500,
};

export const CAT_ONLINE = "Formation en ligne";
export const CAT_SALLE = "Formation en salle";

export function usdFromAr(price: number) {
  return Math.round(price / SITE.usdRate);
}

export function formatDual(price: number) {
  return `${usdFromAr(price)}$ ou ${new Intl.NumberFormat("fr-MG").format(price)} Ar`;
}
