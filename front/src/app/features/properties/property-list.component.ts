import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PropertyService } from './propertyService';
import { Property } from './property.model';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './property-list.component.html',
  styleUrl: './property-list.component.css'
})
export class PropertyListComponent implements OnInit {
  properties: Property[] = [];

  constructor(private propertyService: PropertyService) {}

  ngOnInit() {
    this.propertyService.getAll().subscribe(data => this.properties = data);
  }
}
