export interface HostDetails {
  username: string;
  email: string;
}

export interface ImageDetails {
  imageUrl: string;
  isMain: boolean;
}

export interface ReviewDetails {
  username: string;
  rating: number;
  comment: string;
}

export interface Property {
  id: number;
  propertyType?: string | null;
  name: string;
  address: string;
  city: string;
  country: string;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  size?: number | null;
  isActive?: boolean | null;
  description: string;
  includedFeatures: string;
  host?: HostDetails | null;
  images?: ImageDetails[] | null;
  reviews?: ReviewDetails[] | null;
  reviewCount?: number;
  reviewAverage?: number;
}

export interface PropertyImagePayload {
  imageUrl: string;
  isMain: boolean;
}

export interface PropertyPayload {
  host: { id: number };
  name: string;
  address: string;
  city: string;
  country: string;
  description: string;
  pricePerNight: number;
  maxGuestnumber: number;
  bedroomNumber: number;
  bathroomNumber: number;
  hasHairDryer: boolean;
  hasWashMachine: boolean;
  hasDryerMachine: boolean;
  hasAirConditioner: boolean;
  hasKitchen: boolean;
  hasHeater: boolean;
  hasOven: boolean;
  hasCoffeeMachine: boolean;
  hasTV: boolean;
  hasWifi: boolean;
  hasGarden: boolean;
  areAnimalsAllowed: boolean;
  cleaningOptionPrice: number;
  type: 'STUDIO' | 'APARTMENT' | 'HOUSE' | 'VILLA';
  size: number;
  isActive: boolean;
  images: PropertyImagePayload[];
}
