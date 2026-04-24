export interface HostDetails {
  id?: number;
  username: string;
  email: string;
}

export interface ImageDetails {
  id?: number;
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
  description: string;
  includedFeatures: string;
  host?: HostDetails | null;
  images?: ImageDetails[] | null;
  reviews?: ReviewDetails[] | null;
  reviewCount?: number;
  reviewAverage?: number;
  size?: number;
  isActive?: boolean;
}

export interface PropertyImagePayload {
  id?: number;
  imageUrl: string;
  isMain: boolean;
}

export interface PropertyPayload {
  host?: { id: number };
  name: string;
  address?: string;
  city: string;
  country: string;
  description?: string;
  pricePerNight: number;
  maxGuestnumber: number;
  bedroomNumber: number;
  bathroomNumber: number;
  cleaningOptionPrice?: number;
  type: 'STUDIO' | 'APARTMENT' | 'HOUSE' | 'VILLA';
  size?: number;
  isActive?: boolean;
  images?: PropertyImagePayload[];
  hasHairDryer?: boolean;
  hasWashMachine?: boolean;
  hasDryerMachine?: boolean;
  hasAirConditioner?: boolean;
  hasKitchen?: boolean;
  hasHeater?: boolean;
  hasOven?: boolean;
  hasCoffeeMachine?: boolean;
  hasTV?: boolean;
  hasWifi?: boolean;
  hasGarden?: boolean;
  areAnimalsAllowed?: boolean;
}
