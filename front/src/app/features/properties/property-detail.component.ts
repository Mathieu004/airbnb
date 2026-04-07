import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PropertyService } from './propertyService';
import { Property } from './property.model';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.css'
})
export class PropertyDetailComponent implements OnInit {
  property?: Property;
  isLoading = true;
  errorMessage = '';
  amenities: string[] = [];
  private readonly fallbackImage = 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80';

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMessage = 'Logement introuvable.';
      this.isLoading = false;
      return;
    }
    this.propertyService.getById(id).subscribe({
      next: data => {
        this.property = data;
        this.amenities = this.buildAmenities(data.includedFeatures);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger le logement.';
        this.isLoading = false;
      }
    });
  }

  get mainImage(): string {
    if (this.property?.images && this.property.images.length) {
      const main = this.property.images.find(image => image.isMain);
      return (main ?? this.property.images[0]).imageUrl;
    }
    return this.fallbackImage;
  }

  get ratingLabel(): string {
    const reviews = this.property?.reviews ?? [];
    if (!reviews.length) {
      return 'Nouveau';
    }
    const total = reviews.reduce((sum, review) => sum + (review.rating ?? 0), 0);
    const average = total / reviews.length;
    return `${average.toFixed(1)} (${reviews.length} avis)`;
  }

  getGuestOptions(): number[] {
    const count = this.property?.maxGuests ?? 1;
    return Array.from({ length: Math.max(count, 1) }, (_, index) => index + 1);
  }

  private buildAmenities(value?: string | null): string[] {
    if (!value) {
      return [];
    }
    return value.split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }
}
