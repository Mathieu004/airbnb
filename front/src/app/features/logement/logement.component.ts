import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Property,
  PropertyImagePayload,
  PropertyPayload,
} from '../properties/property.model';
import { PropertyService } from '../properties/propertyService';
import { AuthService } from '../../core/auth.service';

interface AmenityOption {
  label: string;
  field?: SupportedAmenityField;
}

type SupportedAmenityField =
  | 'hasHairDryer'
  | 'hasWashMachine'
  | 'hasDryerMachine'
  | 'hasAirConditioner'
  | 'hasKitchen'
  | 'hasHeater'
  | 'hasOven'
  | 'hasCoffeeMachine'
  | 'hasTV'
  | 'hasWifi'
  | 'hasGarden'
  | 'areAnimalsAllowed';

interface PropertyForm {
  name: string;
  type: PropertyPayload['type'];
  pricePerNight: number | null;
  address: string;
  city: string;
  country: string;
  maxGuestnumber: number | null;
  size: number | null;
  bedroomNumber: number | null;
  bathroomNumber: number | null;
  description: string;
}

@Component({
  selector: 'app-logements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './logement.component.html',
  styleUrl: './logement.component.css',
})
export class LogementsComponent implements OnInit {
  properties: Property[] = [];
  statusUpdatingIds = new Set<number>();
  deletingPropertyIds = new Set<number>();
  isLoading = true;
  errorMessage = '';
  isAddModalOpen = false;
  editingPropertyId: number | null = null;
  isSaving = false;
  saveError = '';
  imageUrlInput = '';
  imageError = '';
  modalClosing = false;
  propertyToDelete: Property | null = null;

  readonly fallbackImage =
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80';

  readonly amenityOptions: AmenityOption[] = [
    { label: 'Wi-Fi', field: 'hasWifi' },
    { label: 'Cuisine', field: 'hasKitchen' },
    { label: 'Four', field: 'hasOven' },
    { label: 'Machine a laver', field: 'hasWashMachine' },
    { label: 'Seche-linge', field: 'hasDryerMachine' },
    { label: 'Climatisation', field: 'hasAirConditioner' },
    { label: 'Chauffage', field: 'hasHeater' },
    { label: 'Cafetiere', field: 'hasCoffeeMachine' },
    { label: 'Television', field: 'hasTV' },
    { label: 'Jardin', field: 'hasGarden' },
    { label: 'Animaux acceptes', field: 'areAnimalsAllowed' },
  ];

  readonly typeOptions: Array<{ label: string; value: PropertyPayload['type'] }> = [
    { label: 'Appartement', value: 'APARTMENT' },
    { label: 'Villa', value: 'VILLA' },
    { label: 'Studio', value: 'STUDIO' },
    { label: 'Maison', value: 'HOUSE' },
  ];

  form: PropertyForm = this.createInitialForm();
  selectedAmenities = new Set<string>();
  images: PropertyImagePayload[] = [];

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  get hasProperties(): boolean {
    return this.properties.length > 0;
  }

  get userId(): number | null {
    return this.authService.getCurrentUserId();
  }

  get propertyCountLabel(): string {
    const count = this.properties.length;
    return `${count} logement${count > 1 ? 's' : ''} gere${count > 1 ? 's' : ''}`;
  }

  get selectedImageCount(): number {
    return this.images.length;
  }

  get isEditMode(): boolean {
    return this.editingPropertyId !== null;
  }

  isPropertyActive(property: Property): boolean {
    return property.isActive ?? true;
  }

  openAddModal(): void {
    this.resetForm();
    this.editingPropertyId = null;
    this.isAddModalOpen = true;
    this.modalClosing = false;
    this.saveError = '';
    this.imageError = '';
  }

  openEditModal(property: Property, event?: Event): void {
    event?.stopPropagation();
    this.editingPropertyId = property.id;
    this.form = {
      name: property.name ?? '',
      type: this.mapPropertyType(property.propertyType),
      pricePerNight: property.pricePerNight ?? null,
      address: property.address ?? '',
      city: property.city ?? '',
      country: property.country ?? 'France',
      maxGuestnumber: property.maxGuests ?? null,
      size: property.size ?? null,
      bedroomNumber: property.bedrooms ?? null,
      bathroomNumber: property.bathrooms ?? null,
      description: property.description ?? '',
    };
    this.selectedAmenities = new Set(this.extractAmenities(property.includedFeatures));
    this.images = (property.images ?? []).map((image, index) => ({
      imageUrl: image.imageUrl,
      isMain: index === 0 ? true : image.isMain,
    }));
    this.imageUrlInput = '';
    this.imageError = '';
    this.saveError = '';
    this.isAddModalOpen = true;
    this.modalClosing = false;
  }

  closeAddModal(): void {
    this.modalClosing = true;
    setTimeout(() => {
      this.isAddModalOpen = false;
      this.modalClosing = false;
      this.resetForm();
    }, 180);
  }

  trackByPropertyId(_: number, property: Property): number {
    return property.id;
  }

  viewProperty(property: Property): void {
    this.router.navigate(['/property/edit', property.id], {
      state: { property },
    });
  }

  getMainImage(property: Property): string {
    if (property.images?.length) {
      const mainImage = property.images.find((image) => image.isMain);
      return (mainImage ?? property.images[0]).imageUrl;
    }
    return this.fallbackImage;
  }

  getLocation(property: Property): string {
    return [property.city, property.country].filter(Boolean).join(', ');
  }

  getDisplayType(property: Property): string {
    switch ((property.propertyType ?? '').toLowerCase()) {
      case 'apartment':
        return 'Appartement';
      case 'villa':
        return 'Villa';
      case 'studio':
        return 'Studio';
      case 'house':
        return 'Maison';
      default:
        return 'Logement';
    }
  }

  getAmenityPreview(property: Property): string[] {
    if (!property.includedFeatures) {
      return [];
    }

    return property.includedFeatures
      .split(',')
      .map((feature) => feature.trim())
      .filter(Boolean)
      .map((feature) => this.translateAmenity(feature))
      .slice(0, 4);
  }

  getExtraAmenityCount(property: Property): number {
    if (!property.includedFeatures) {
      return 0;
    }

    return Math.max(
      property.includedFeatures
        .split(',')
        .map((feature) => feature.trim())
        .filter(Boolean).length - 3,
      0,
    );
  }

  isStatusUpdating(propertyId: number): boolean {
    return this.statusUpdatingIds.has(propertyId);
  }

  isDeleting(propertyId: number): boolean {
    return this.deletingPropertyIds.has(propertyId);
  }

  toggleStatus(property: Property): void {
    if (this.isStatusUpdating(property.id)) {
      return;
    }

    const nextStatus = !this.isPropertyActive(property);
    const previousStatus = property.isActive;
    property.isActive = nextStatus;
    this.statusUpdatingIds.add(property.id);

    this.propertyService.updateStatus(property.id, nextStatus).subscribe({
      next: (updated) => {
        property.isActive = updated.isActive ?? nextStatus;
        this.statusUpdatingIds.delete(property.id);
      },
      error: () => {
        property.isActive = previousStatus;
        this.statusUpdatingIds.delete(property.id);
      },
    });
  }

  deleteProperty(property: Property, event?: Event): void {
    event?.stopPropagation();

    if (this.isDeleting(property.id)) {
      return;
    }

    this.propertyToDelete = property;
  }

  closeDeleteModal(): void {
    if (this.propertyToDelete && this.isDeleting(this.propertyToDelete.id)) {
      return;
    }

    this.propertyToDelete = null;
  }

  confirmDeleteProperty(): void {
    if (!this.propertyToDelete || this.isDeleting(this.propertyToDelete.id)) {
      return;
    }

    const property = this.propertyToDelete;
    this.deletingPropertyIds.add(property.id);
    this.propertyService.delete(property.id).subscribe({
      next: () => {
        this.properties = this.properties.filter((current) => current.id !== property.id);
        this.deletingPropertyIds.delete(property.id);
        this.propertyToDelete = null;
      },
      error: () => {
        this.errorMessage = 'Impossible de supprimer ce logement pour le moment.';
        this.deletingPropertyIds.delete(property.id);
      },
    });
  }

  toggleAmenity(label: string, checked: boolean): void {
    if (checked) {
      this.selectedAmenities.add(label);
      return;
    }

    this.selectedAmenities.delete(label);
  }

  addImageUrl(): void {
    const value = this.imageUrlInput.trim();

    if (!value) {
      return;
    }

    if (this.images.length >= 8) {
      this.imageError = 'Vous pouvez ajouter jusqu a 8 photos maximum.';
      return;
    }

    this.images.push({ imageUrl: value, isMain: this.images.length === 0 });
    this.imageUrlInput = '';
    this.imageError = '';
  }

  removeImage(index: number): void {
    this.images.splice(index, 1);
    this.images = this.images.map((image, imageIndex) => ({
      ...image,
      isMain: imageIndex === 0,
    }));
  }

  async onFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    if (!files.length) {
      return;
    }

    const availableSlots = 8 - this.images.length;
    const filesToAdd = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
      this.imageError = 'Maximum 8 photos par logement.';
    } else {
      this.imageError = '';
    }

    for (const file of filesToAdd) {
      if (file.size > 5 * 1024 * 1024) {
        this.imageError = 'Chaque image doit faire 5 Mo maximum.';
        continue;
      }

      const imageUrl = await this.readFileAsDataUrl(file);
      this.images.push({
        imageUrl,
        isMain: this.images.length === 0,
      });
    }

    input.value = '';
  }

  submit(): void {
    if (this.isSaving || !this.userId) {
      return;
    }

    this.saveError = '';
    this.imageError = '';

    if (!this.validateForm()) {
      return;
    }

    this.isSaving = true;

    const payload = this.buildPayload();
    const request$ = this.isEditMode
      ? this.propertyService.update(this.editingPropertyId!, payload)
      : this.propertyService.createForHost(payload);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.closeAddModal();
        this.loadProperties();
      },
      error: () => {
        this.isSaving = false;
        this.saveError =
          this.isEditMode
            ? 'Impossible de modifier le logement pour le moment. Veuillez reessayer.'
            : 'Impossible d ajouter le logement pour le moment. Veuillez reessayer.';
      },
    });
  }

  private loadProperties(): void {
    if (!this.userId) {
      this.isLoading = false;
      this.errorMessage = 'Utilisateur introuvable.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.propertyService.getForHost(this.userId).subscribe({
      next: (properties) => {
        this.properties = properties;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage =
          'Impossible de charger vos logements pour le moment.';
        this.isLoading = false;
      },
    });
  }

  private buildPayload(): PropertyPayload {
    const currentProperty = this.properties.find(
      (property) => property.id === this.editingPropertyId,
    );
    const supportedAmenities = this.mapAmenityFlags(
      Array.from(this.selectedAmenities),
    );

    return {
      host: { id: this.userId! },
      name: this.form.name.trim(),
      address: this.form.address.trim(),
      city: this.form.city.trim(),
      country: this.form.country.trim() || 'France',
      description: this.form.description.trim(),
      pricePerNight: this.form.pricePerNight ?? 0,
      maxGuestnumber: this.form.maxGuestnumber ?? 1,
      bedroomNumber: this.form.bedroomNumber ?? 0,
      bathroomNumber: this.form.bathroomNumber ?? 0,
      cleaningOptionPrice: 0,
      type: this.form.type,
      size: this.form.size ?? 0,
      isActive: currentProperty?.isActive ?? true,
      images: this.images,
      ...supportedAmenities,
    };
  }

  private validateForm(): boolean {
    if (!this.form.name.trim()) {
      this.saveError = 'Le nom du logement est obligatoire.';
      return false;
    }

    if (!this.form.city.trim()) {
      this.saveError = 'La ville est obligatoire.';
      return false;
    }

    if (!this.form.country.trim()) {
      this.saveError = 'Le pays est obligatoire.';
      return false;
    }

    if (this.form.pricePerNight == null || this.form.pricePerNight <= 0) {
      this.saveError = 'Le prix par nuit doit etre superieur a 0.';
      return false;
    }

    if (this.form.maxGuestnumber == null || this.form.maxGuestnumber < 1) {
      this.saveError = 'La capacite doit etre au moins de 1 voyageur.';
      return false;
    }

    if (this.form.bedroomNumber == null || this.form.bedroomNumber < 0) {
      this.saveError = 'Le nombre de chambres ne peut pas etre negatif.';
      return false;
    }

    if (this.form.bathroomNumber == null || this.form.bathroomNumber < 0) {
      this.saveError = 'Le nombre de salles de bain ne peut pas etre negatif.';
      return false;
    }

    if (this.form.size == null || this.form.size <= 0) {
      this.saveError = 'La surface doit etre superieure a 0.';
      return false;
    }

    if (!this.images.length) {
      this.imageError = 'Ajoutez au moins une photo pour ce logement.';
      this.saveError = this.imageError;
      return false;
    }

    return true;
  }

  private resetForm(): void {
    this.editingPropertyId = null;
    this.form = this.createInitialForm();
    this.selectedAmenities.clear();
    this.images = [];
    this.imageUrlInput = '';
    this.imageError = '';
    this.saveError = '';
  }

  private createInitialForm(): PropertyForm {
    return {
      name: '',
      type: 'APARTMENT',
      pricePerNight: null,
      address: '',
      city: '',
      country: 'France',
      maxGuestnumber: null,
      size: null,
      bedroomNumber: null,
      bathroomNumber: null,
      description: '',
    };
  }

  private translateAmenity(value: string): string {
    switch (value.toLowerCase()) {
      case 'wifi':
        return 'Wi-Fi';
      case 'kitchen':
        return 'Cuisine';
      case 'oven':
        return 'Four';
      case 'wash machine':
        return 'Machine a laver';
      case 'dryer machine':
        return 'Seche-linge';
      case 'air conditioner':
        return 'Climatisation';
      case 'heater':
        return 'Chauffage';
      case 'coffee machine':
        return 'Cafetiere';
      case 'tv':
        return 'Television';
      case 'garden':
        return 'Jardin';
      case 'animals allowed':
        return 'Animaux acceptes';
      case 'hair dryer':
        return 'Seche-cheveux';
      default:
        return value;
    }
  }

  private extractAmenities(value?: string | null): string[] {
    if (!value) {
      return [];
    }

    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => this.translateAmenity(item));
  }

  private mapPropertyType(value?: string | null): PropertyPayload['type'] {
    switch ((value ?? '').toLowerCase()) {
      case 'villa':
        return 'VILLA';
      case 'studio':
        return 'STUDIO';
      case 'house':
        return 'HOUSE';
      case 'apartment':
      default:
        return 'APARTMENT';
    }
  }

  private mapAmenityFlags(amenities: string[]): Pick<PropertyPayload, SupportedAmenityField> {
    return this.amenityOptions.reduce(
      (accumulator, option) => {
        if (option.field) {
          accumulator[option.field] = amenities.includes(option.label);
        }
        return accumulator;
      },
      {
        hasHairDryer: false,
        hasWashMachine: false,
        hasDryerMachine: false,
        hasAirConditioner: false,
        hasKitchen: false,
        hasHeater: false,
        hasOven: false,
        hasCoffeeMachine: false,
        hasTV: false,
        hasWifi: false,
        hasGarden: false,
        areAnimalsAllowed: false,
      } as Pick<PropertyPayload, SupportedAmenityField>,
    );
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}
