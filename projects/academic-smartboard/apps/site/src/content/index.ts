import { beranda } from "./beranda.ts";
import { programPemantauanPerkembangan } from "./program-pemantauan-perkembangan.ts";
import { programPemetaanBelajar } from "./program-pemetaan-belajar.ts";
import { programPendampinganPersonal } from "./program-pendampingan-personal.ts";
import type { NavItem, PageContent } from "./types.ts";

export const NAV_ITEMS: NavItem[] = [
  { label: "Beranda", href: "/" },
  { label: "Cara Belajar", href: "/cara-belajar" },
  { label: "Wawasan", href: "/wawasan" },
  { label: "Tentang", href: "/tentang" },
  { label: "Smartboard", href: "/smartboard" },
];

const caraBelajar: PageContent = {
  slug: "cara-belajar",
  title: "Stub — cara-belajar",
  description: "Stub — Cara Belajar",
  hero: { heading: "Stub cara-belajar", sub: "Stub — Cara Belajar" },
  sections: [],
};

const tentang: PageContent = {
  slug: "tentang",
  title: "Stub — tentang",
  description: "Stub — Tentang",
  hero: { heading: "Stub tentang", sub: "Stub — Tentang" },
  sections: [],
};

const wawasan: PageContent = {
  slug: "wawasan",
  title: "Stub — wawasan",
  description: "Stub — Wawasan",
  hero: { heading: "Stub wawasan", sub: "Stub — Wawasan" },
  sections: [],
};

const smartboard: PageContent = {
  slug: "smartboard",
  title: "Stub — smartboard",
  description: "Stub — Smartboard",
  hero: { heading: "Stub smartboard", sub: "Stub — Smartboard" },
  sections: [],
};

const kebijakanPrivasi: PageContent = {
  slug: "kebijakan-privasi",
  title: "Stub — kebijakan-privasi",
  description: "Stub — Kebijakan Privasi",
  hero: { heading: "Stub kebijakan-privasi", sub: "Stub — Kebijakan Privasi" },
  sections: [],
};

const ketentuanLayanan: PageContent = {
  slug: "ketentuan-layanan",
  title: "Stub — ketentuan-layanan",
  description: "Stub — Ketentuan Layanan",
  hero: { heading: "Stub ketentuan-layanan", sub: "Stub — Ketentuan Layanan" },
  sections: [],
};

export const allPages: PageContent[] = [
  beranda,
  caraBelajar,
  tentang,
  wawasan,
  programPemetaanBelajar,
  programPendampinganPersonal,
  programPemantauanPerkembangan,
  smartboard,
  kebijakanPrivasi,
  ketentuanLayanan,
];
