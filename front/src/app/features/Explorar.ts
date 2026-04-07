import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PropertyService } from './properties/propertyService';
import { Property } from './properties/property.model';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-explorar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './Explorar.html',
  styleUrl: './Explorar.css'
})
export class ExplorarComponent implements OnInit {
  properties: Property[] = [];
  isLoading = false;
  errorMessage = '';
  searchTerm = '';
  globalSearchTerm = '';
  activeFilter = 'Tous';
  filters = ['Tous', 'Appartement', 'Villa', 'Studio', 'Maison'];
  currentUser = '';
  private readonly fallbackImage = 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80';

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser() ?? 'Invite';
    this.loadProperties();
  }

  get filteredProperties(): Property[] {
    const term = this.searchTerm.trim().toLowerCase();
    const globalTerm = this.globalSearchTerm.trim().toLowerCase();
    const activeFilter = this.activeFilter.toLowerCase();
    return this.properties.filter(property => {
      const haystack = `${property.name} ${property.city} ${property.country}`.toLowerCase();
      const matchesLocal = !term || haystack.includes(term);
      const matchesGlobal = !globalTerm || haystack.includes(globalTerm);
      const type = this.getTypeLabel(property).toLowerCase();
      const matchesFilter = activeFilter === 'tous'
        || type === activeFilter
        || property.description?.toLowerCase().includes(activeFilter);
      return matchesLocal && matchesGlobal && matchesFilter;
    });
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
  }

  getInitials(name: string): string {
    if (!name) {
      return 'GU';
    }
    return name
      .split(' ')
      .filter(Boolean)
      .map(word => word[0]?.toUpperCase() ?? '')
      .slice(0, 2)
      .join('');
  }

  getMainImage(property: Property): string {
    if (property.images && property.images.length) {
      const main = property.images.find(img => img.isMain);
      return (main ?? property.images[0]).imageUrl;
    }
    return this.fallbackImage;
  }

  getAverageRating(property: Property): string {
    if (!property.reviews || property.reviews.length === 0) {
      return 'Nouveau';
    }
    const total = property.reviews.reduce((sum, review) => sum + (review.rating ?? 0), 0);
    const avg = total / property.reviews.length;
    return `${avg.toFixed(1)} / 5`;
  }

  refresh(): void {
    this.loadProperties();
  }

  private loadProperties(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.propertyService.getAll().subscribe({
      next: data => {
        this.properties = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les logements. Veuillez reessayer.';
        this.isLoading = false;
      }
    });
  }

  getTypeLabel(property: Property): string {
    const value = property.propertyType ?? '';
    if (!value) return 'logement';
    switch (value.toLowerCase()) {
      case 'apartment':
        return 'appartement';
      case 'house':
        return 'maison';
      case 'studio':
        return 'studio';
      case 'villa':
        return 'villa';
      default:
        return value.toLowerCase();
    }
  }

  getDisplayType(property: Property): string {
    return this.capitalize(this.getTypeLabel(property));
  }

  private capitalize(value: string): string {
    if (!value) {
      return '';
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
