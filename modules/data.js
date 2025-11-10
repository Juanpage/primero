const state = {
  loaded: false,
  destinations: [],
  promos: []
};

const DESTINATIONS = [
  {
    id: "bartolome",
    name: "Isla Bartolomé",
    country: "Ecuador",
    region: "Norte",
    summary:
      "Ascenso al mirador de Pinnacle Rock, snorkel con pingüinos y lobos marinos en aguas cristalinas.",
    description:
      "Disfruta de un día inolvidable explorando formaciones volcánicas únicas y vistas panorámicas de las Galápagos.",
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=900&q=80",
    pdf:
      "https://galapagos-pro.com/wp-content/uploads/2017/07/Bartolome.pdf"
  },
  {
    id: "isabela",
    name: "Volcanes de Isabela",
    country: "Ecuador",
    region: "Occidente",
    summary:
      "Trekking por los volcanes Sierra Negra y Chico, observación de tortugas gigantes en su hábitat natural.",
    description:
      "Recorre senderos lunares, conoce manglares y sumérgete en lagunas de lava que dan vida a esta isla.",
    image:
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=900&q=80",
    pdf:
      "https://galapagos-pro.com/wp-content/uploads/2017/07/Isabela.pdf"
  },
  {
    id: "santa-cruz",
    name: "Santa Cruz Premium",
    country: "Ecuador",
    region: "Centro",
    summary:
      "Tour por la Estación Charles Darwin, túneles de lava y playas de Tortuga Bay.",
    description:
      "Ideal para familias: alojamiento boutique, navegación a islas cercanas y encuentros con fauna endémica.",
    image:
      "https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=900&q=80",
    pdf:
      "https://galapagos-pro.com/wp-content/uploads/2017/07/Santa-Cruz.pdf"
  },
  {
    id: "san-cristobal",
    name: "Aventura en San Cristóbal",
    country: "Ecuador",
    region: "Este",
    summary:
      "Kayak junto a lobos marinos, buceo en León Dormido y degustación de gastronomía local.",
    description:
      "Experimenta la calidez de Puerto Baquerizo Moreno con actividades de aventura y relax frente al mar.",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
    pdf:
      "https://galapagos-pro.com/wp-content/uploads/2017/07/San-Cristobal.pdf"
  }
];

const PROMOTIONS = [
  {
    id: "promo-crucero",
    title: "Crucero de lujo 5 noches",
    description: "Hasta 20% de descuento en salidas de temporada baja con guía bilingüe incluido.",
    destino: "Crucero de lujo",
    highlight: "Reserva antes del 30 de junio"
  },
  {
    id: "promo-familias",
    title: "Paquete familiar Galápagos",
    description: "Niños menores de 11 años viajan con 50% de descuento en hoteles seleccionados.",
    destino: "Plan familiar",
    highlight: "Incluye visita a tortugas gigantes"
  },
  {
    id: "promo-buceo",
    title: "Safari de buceo",
    description: "4 días explorando los mejores puntos de buceo con instructores certificados PADI.",
    destino: "Safari de buceo",
    highlight: "Equipo premium incluido"
  }
];

export async function loadData() {
  if (state.loaded) return state;
  await new Promise((resolve) => setTimeout(resolve, 50));
  state.destinations = DESTINATIONS;
  state.promos = PROMOTIONS;
  state.loaded = true;
  return state;
}

export function getRegions() {
  const regions = new Set();
  state.destinations.forEach((item) => regions.add(item.region));
  return Array.from(regions);
}

export function getFilteredDestinations({ region = "all", query = "" } = {}) {
  const q = query.trim().toLowerCase();
  const normalizedRegion = region && region.toLowerCase();

  const filtered = state.destinations.filter((dest) => {
    const matchRegion =
      !normalizedRegion || normalizedRegion === "all" || dest.region.toLowerCase() === normalizedRegion;
    const matchQuery =
      !q ||
      dest.name.toLowerCase().includes(q) ||
      dest.country.toLowerCase().includes(q) ||
      dest.summary.toLowerCase().includes(q);
    return matchRegion && matchQuery;
  });

  const groups = new Map();
  filtered.forEach((dest) => {
    const key = dest.region;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(dest);
  });

  return Array.from(groups.entries()).map(([label, destinations]) => ({
    label,
    destinations
  }));
}

export function getPromos() {
  return state.promos.slice();
}
