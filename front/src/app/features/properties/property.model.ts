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
  host: HostDetails;
  images: ImageDetails[];
  reviews: ReviewDetails[];
}
