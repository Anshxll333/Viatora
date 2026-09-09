export type Destination = {
  id: string
  city: string
  state?: string
  country: string
  countryCode: string
  stamp: string
  /** Tailwind / OKLCH color tint for accent elements */
  tint: string
  visited: boolean
  dateVisited?: string
  /** ISO date for chronological sorting */
  visitedAt?: string
  tripDays?: number
  description: string
  photos: string[]
  memory?: string
}

export const destinations: Destination[] = [
  // RAJASTHAN, INDIA
  {
    id: 'jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    countryCode: 'IN',
    stamp: '/stamps/Rajasthan/Jaipur.png',
    tint: 'oklch(0.62 0.15 30)',
    visited: false,
    description:
      '🌸 Pink streets, royal arches & golden evenings.',
    photos: [],
  },
  {
    id: 'udaipur',
    city: 'Udaipur',
    state: 'Rajasthan',
    country: 'India',
    countryCode: 'IN',
    stamp: '/stamps/Rajasthan/Udaipur.png',
    tint: 'oklch(0.6 0.12 230)',
    visited: false,
    description:
      '🕊️ Lakeside mornings, quiet palaces & sunset reflections.',
    photos: [],
  },
  {
    id: 'jodhpur',
    city: 'Jodhpur',
    state: 'Rajasthan',
    country: 'India',
    countryCode: 'IN',
    stamp: '/stamps/Rajasthan/Jodhpur.png',
    tint: 'oklch(0.55 0.12 240)',
    visited: false,
    description:
      '💙 Blue lanes, ancient walls & desert skies.',
    photos: [],
  },
  {
    id: 'jaisalmer',
    city: 'Jaisalmer',
    state: 'Rajasthan',
    country: 'India',
    countryCode: 'IN',
    stamp: '/stamps/Rajasthan/Jaisalmer.png',
    tint: 'oklch(0.65 0.14 70)',
    visited: false,
    description:
      '🏜️ Golden dunes, warm winds & nights under the stars.',
    photos: [],
  },
  {
    id: 'pushkar',
    city: 'Pushkar',
    state: 'Rajasthan',
    country: 'India',
    countryCode: 'IN',
    stamp: '/stamps/Rajasthan/Pushkar.png',
    tint: 'oklch(0.6 0.1 50)',
    visited: false,
    description:
      '🌼 Temple bells, colourful streets & the energy of the mela.',
    photos: [],
  },
  {
    id: 'mount-abu',
    city: 'Mount Abu',
    state: 'Rajasthan',
    country: 'India',
    countryCode: 'IN',
    stamp: '/stamps/Rajasthan/MountAbu.png',
    tint: 'oklch(0.58 0.09 160)',
    visited: false,
    description:
      '🌲 Cool mountain air, quiet roads & sunsets above the hills.',
    photos: [],
  },

  // UTTARAKHAND, INDIA
  {
    id: 'rishikesh',
    city: 'Rishikesh',
    state: 'Uttarakhand',
    country: 'India',
    countryCode: 'IN',
    stamp: '/stamps/Uttarakhand/Rishikesh.png',
    tint: 'oklch(0.6 0.12 180)',
    visited: false,
    description:
      '🌊 River mornings, mountain air & peaceful chaos.',
    photos: [],
  },
  {
    id: 'mussoorie',
    city: 'Mussoorie',
    state: 'Uttarakhand',
    country: 'India',
    countryCode: 'IN',
    stamp: '/stamps/Uttarakhand/Mussoorie.png',
    tint: 'oklch(0.55 0.1 140)',
    visited: false,
    description:
      '⛰️ Misty roads, old cafés & clouds drifting through the hills.',
    photos: [],
  },
  {
    id: 'haridwar',
    city: 'Haridwar',
    state: 'Uttarakhand',
    country: 'India',
    countryCode: 'IN',
    stamp: '/stamps/Uttarakhand/Haridwar.png',
    tint: 'oklch(0.58 0.11 200)',
    visited: false,
    description:
      '🪔 River lights, temple bells & evenings by the Ganga.',
    photos: [],
  },
  {
    id: 'kedarnath',
    city: 'Kedarnath',
    state: 'Uttarakhand',
    country: 'India',
    countryCode: 'IN',
    stamp: '/stamps/Uttarakhand/Kedarnath.png',
    tint: 'oklch(0.52 0.09 30)',
    visited: false,
    description:
      '🏔️ Sacred mountains, cold air & a journey I\'ll never forget.',
    photos: [],
  },
  {
    id: 'auli',
    city: 'Auli',
    state: 'Uttarakhand',
    country: 'India',
    countryCode: 'IN',
    stamp: '/stamps/Uttarakhand/Auli.png',
    tint: 'oklch(0.62 0.13 60)',
    visited: false,
    description:
      '❄️ Snowy slopes, wide skies & mountains in every direction.',
    photos: [],
  },
  {
    id: 'valley-of-flowers',
    city: 'Valley of Flowers',
    state: 'Uttarakhand',
    country: 'India',
    countryCode: 'IN',
    stamp: '/stamps/Uttarakhand/Flowers.png',
    tint: 'oklch(0.65 0.14 120)',
    visited: false,
    description:
      '🌺 Endless colour, wildflowers & a valley that feels unreal.',
    photos: [],
  },
]

export function getDestination(id: string) {
  return destinations.find((d) => d.id === id)
}

export function getDestinationsByCountry(country: string) {
  return destinations.filter((d) => d.country.toLowerCase() === country.toLowerCase())
}

export function getDestinationsByState(state: string) {
  return destinations.filter((d) => d.state?.toLowerCase() === state.toLowerCase())
}

export const indiaDestinations = destinations.filter((d) => d.country === 'India')

const indiaStateMeta: Record<string, { description: string; artwork?: string }> = {
  Rajasthan: {
    description: 'Forts, deserts & royal cities',
    artwork: '/stamps/States/Rajasthan.png',
  },
  Uttarakhand: {
    description: 'Himalayas, rivers & mountain journeys',
    artwork: '/stamps/States/Uttarakhand.png',
  },
}

export const indiaStates = Array.from(new Set(indiaDestinations.map((d) => d.state).filter(Boolean))).map(
  (name) => {
    const destinations = indiaDestinations.filter((destination) => destination.state === name)
    return {
      name: name!,
      slug: name!.toLowerCase().replace(/\s+/g, '-'),
      description: indiaStateMeta[name!]?.description ?? 'Explore destinations',
      artwork: indiaStateMeta[name!]?.artwork,
      destinations,
      collected: destinations.filter((destination) => destination.visited).length,
    }
  },
)

export const uttarakhandDestinations = destinations.filter((d) => d.state === 'Uttarakhand')
export const rajasthanDestinations = destinations.filter((d) => d.state === 'Rajasthan')

export const visitedDestinations = destinations.filter((d) => d.visited)

export const journalEntries = [...visitedDestinations].sort((a, b) =>
  (b.visitedAt ?? '').localeCompare(a.visitedAt ?? ''),
)

export const passportStats = {
  countries: new Set(visitedDestinations.map((d) => d.country)).size,
  states: new Set(visitedDestinations.map((d) => d.state).filter(Boolean)).size,
  cities: visitedDestinations.length,
  stamps: visitedDestinations.length,
  memories: visitedDestinations.filter((d) => d.memory && d.memory.length > 0).length,
  travelDays: visitedDestinations.reduce((sum, d) => sum + (d.tripDays ?? 0), 0),
}

