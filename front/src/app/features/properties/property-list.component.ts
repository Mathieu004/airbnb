import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-list.component.html',
  styleUrls: ['./property-list.component.css']
})
export class PropertyListComponent {

  searchTerm: string = '';
  activeFilter: string = 'Tous';

  properties = [
    {
      name: 'Appartement Haussmannien',
      type: 'Appartement',
      location: 'Paris, France',
      rating: 5.0,
      beds: 2, baths: 1, guests: 4, surface: 75,
      amenities: ['Wi-Fi', 'Cuisine', 'Machine à laver'],
      price: 185,
      image: '/logement-paris.jpg'
    },
    {
      name: 'Villa Méditerranée',
      type: 'Villa',
      location: 'Nice, France',
      rating: 4.0,
      beds: 4, baths: 3, guests: 8, surface: 200,
      amenities: ['Wi-Fi', 'Piscine', 'Cuisine'],
      price: 320,
      image: '/logement-nice.jpg'
    }
  ];

  get filteredProperties() {
    return this.properties.filter(p => {
      const matchType = this.activeFilter === 'Tous' || p.type === this.activeFilter;
      const matchSearch = p.name.toLowerCase().includes(this.searchTerm.toLowerCase())
                       || p.location.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
  }
}