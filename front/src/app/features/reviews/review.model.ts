export interface ReviewPropertySummary {
  id: number;
  name: string;
  city: string;
  country: string;
}

export interface ReviewerSummary {
  id: number;
  username: string;
  email: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt?: string;
  property: ReviewPropertySummary;
  reviewer: ReviewerSummary;
}

export interface CreateReviewRequest {
  propertyId: number;
  userId: number;
  rating: number;
  comment: string;
}
