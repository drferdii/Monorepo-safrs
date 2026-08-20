import type { NavItem, PageContent } from "./types.ts";

export const NAV_ITEMS: NavItem[] = [
  { label: "Beranda", href: "/" },
  { label: "Cara Belajar", href: "/cara-belajar" },
  { label: "Wawasan", href: "/wawasan" },
  { label: "Tentang", href: "/tentang" },
  { label: "Smartboard", href: "/smartboard" },
];

const beranda: PageContent = {
  slug: "",
  title: "El-Kayyisa | Bimbingan Belajar Personal dan Terarah",
  description: "Stub — Beranda",
  hero: { heading: "Stub beranda", sub: "Stub — Beranda" },
  sections: [],
};

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

const programPemetaanBelajar: PageContent = {
  slug: "program/pemetaan-belajar",
  title: "Stub — program/pemetaan-belajar",
  description: "Stub — Program Pemetaan Belajar",
  hero: {
    heading: "Stub program/pemetaan-belajar",
    sub: "Stub — Program Pemetaan Belajar",
  },
  sections: [],
};

const programPendampinganPersonal: PageContent = {
  slug: "program/pendampingan-personal",
  title: "Stub — program/pendampingan-personal",
  description: "Stub — Program Pendampingan Personal",
  hero: {
    heading: "Stub program/pendampingan-personal",
    sub: "Stub — Program Pendampingan Personal",
  },
  sections: [],
};

const programPemantauanPerkembangan: PageContent = {
  slug: "program/pemantauan-perkembangan",
  title: "Stub — program/pemantauan-perkembangan",
  description: "Stub — Program Pemantauan Perkembangan",
  hero: {
    heading: "Stub program/pemantauan-perkembangan",
    sub: "Stub — Program Pemantauan Perkembangan",
  },
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
