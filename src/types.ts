export interface Location {
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  address: string;
  location: Location;
  openingHours?: string;
  phone?: string;
  verified?: boolean;
  featured?: boolean;
  imageUrl?: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
}
