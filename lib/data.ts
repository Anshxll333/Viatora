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
    visited: true,
    dateVisited: 'January 18, 2026',
    visitedAt: '2026-01-18',
    tripDays: 3,
    description:
      'The Pink City, known for Amber Fort, Hawa Mahal and royal heritage.',
    photos: [],
    memory:
      'Watching the sunrise over Amber Fort. The pink sandstone glowed warm in the morning desert breeze as temple bells rang in the distance.',
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
      'The City of Lakes, famous for Lake Pichola and its romantic palaces.',
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
      'The Blue City, dominated by the magnificent Mehrangarh Fort.',
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
      'The Golden City rising from the Thar Desert, centered around its historic fort.',
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
      'A spiritual desert town surrounding the sacred Pushkar Lake.',
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
      'Rajasthan’s hill station, known for Nakki Lake, viewpoints and Dilwara Temples.',
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
    visited: true,
    dateVisited: 'October 12, 2025',
    visitedAt: '2025-10-12',
    tripDays: 4,
    description:
      'Spiritual river town, yoga, rafting and gateway to the Himalayas.',
    photos: [],
    memory:
      'Sitting by the Triveni Ghat as evening prayers echoed across the Ganges. The water reflected thousands of floating diyas while the mountain air turned crisp.',
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
      'A Himalayan hill station known for mountain views and colonial charm.',
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
      'Sacred Ghat city where the Ganges descends to the plains.',
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
      'A dramatic Himalayan pilgrimage destination surrounded by towering mountains.',
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
      'A Himalayan ski destination with panoramic mountain views.',
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
      'A Himalayan national park famous for alpine flowers and mountain trekking.',
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

