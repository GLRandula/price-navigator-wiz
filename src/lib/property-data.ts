export type CityInfo = { name: string; lat: number; lng: number };

export type DistrictInfo = {
  name: string;
  lat: number;
  lng: number;
  cities: CityInfo[];
};

export const DISTRICTS: DistrictInfo[] = [
  {
    name: "Colombo",
    lat: 6.9271,
    lng: 79.8612,
    cities: [
      { name: "Colombo 03", lat: 6.9061, lng: 79.8515 },
      { name: "Nugegoda", lat: 6.8649, lng: 79.8997 },
      { name: "Kolonnawa", lat: 6.9354, lng: 79.8914 },
      { name: "Dehiwala", lat: 6.8511, lng: 79.8653 },
      { name: "Maharagama", lat: 6.8464, lng: 79.9265 },
      { name: "Homagama", lat: 6.8441, lng: 80.0024 },
      { name: "Piliyandala", lat: 6.8016, lng: 79.9224 },
    ],
  },
  {
    name: "Gampaha",
    lat: 7.0917,
    lng: 79.9999,
    cities: [
      { name: "Gampaha", lat: 7.0917, lng: 79.9999 },
      { name: "Negombo", lat: 7.2083, lng: 79.8358 },
      { name: "Kadawatha", lat: 7.0016, lng: 79.9506 },
      { name: "Ja-Ela", lat: 7.0744, lng: 79.8919 },
      { name: "Wattala", lat: 6.9897, lng: 79.8919 },
    ],
  },
  {
    name: "Kalutara",
    lat: 6.5854,
    lng: 79.9607,
    cities: [
      { name: "Kalutara", lat: 6.5854, lng: 79.9607 },
      { name: "Panadura", lat: 6.7132, lng: 79.9026 },
      { name: "Horana", lat: 6.7159, lng: 80.0629 },
      { name: "Beruwala", lat: 6.4788, lng: 79.9828 },
    ],
  },
  {
    name: "Kandy",
    lat: 7.2906,
    lng: 80.6337,
    cities: [
      { name: "Kandy", lat: 7.2906, lng: 80.6337 },
      { name: "Peradeniya", lat: 7.2599, lng: 80.5977 },
      { name: "Katugastota", lat: 7.3247, lng: 80.6194 },
      { name: "Gampola", lat: 7.1642, lng: 80.5742 },
    ],
  },
  {
    name: "Galle",
    lat: 6.0535,
    lng: 80.221,
    cities: [
      { name: "Galle", lat: 6.0535, lng: 80.221 },
      { name: "Unawatuna", lat: 6.0097, lng: 80.2489 },
      { name: "Hikkaduwa", lat: 6.1395, lng: 80.1063 },
      { name: "Ambalangoda", lat: 6.2354, lng: 80.0539 },
    ],
  },
  {
    name: "Matara",
    lat: 5.9549,
    lng: 80.555,
    cities: [
      { name: "Matara", lat: 5.9549, lng: 80.555 },
      { name: "Weligama", lat: 5.9749, lng: 80.4295 },
      { name: "Dikwella", lat: 5.9667, lng: 80.6939 },
    ],
  },
  {
    name: "Kurunegala",
    lat: 7.4863,
    lng: 80.3623,
    cities: [
      { name: "Kurunegala", lat: 7.4863, lng: 80.3623 },
      { name: "Kuliyapitiya", lat: 7.4704, lng: 80.0409 },
      { name: "Narammala", lat: 7.4333, lng: 80.2 },
    ],
  },
  {
    name: "Jaffna",
    lat: 9.6615,
    lng: 80.0255,
    cities: [
      { name: "Jaffna", lat: 9.6615, lng: 80.0255 },
      { name: "Chavakachcheri", lat: 9.6594, lng: 80.1636 },
      { name: "Nallur", lat: 9.6767, lng: 80.0281 },
    ],
  },
  {
    name: "Anuradhapura",
    lat: 8.3114,
    lng: 80.4037,
    cities: [
      { name: "Anuradhapura", lat: 8.3114, lng: 80.4037 },
      { name: "Kekirawa", lat: 8.0362, lng: 80.5926 },
      { name: "Mihintale", lat: 8.3597, lng: 80.5108 },
    ],
  },
  {
    name: "Nuwara Eliya",
    lat: 6.9497,
    lng: 80.7891,
    cities: [
      { name: "Nuwara Eliya", lat: 6.9497, lng: 80.7891 },
      { name: "Hatton", lat: 6.8921, lng: 80.5956 },
      { name: "Talawakele", lat: 6.9358, lng: 80.6592 },
    ],
  },
];

export const TRANSACTION_TYPES = ["sales", "rent"] as const;

export const PROPERTY_TYPES = ["House", "Apartment", "Land", "Villa", "Commercial"] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];
export type PropertyType = (typeof PROPERTY_TYPES)[number];