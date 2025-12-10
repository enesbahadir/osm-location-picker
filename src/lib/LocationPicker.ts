import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface LocationPickerOptions {
  targetId: string;
  initialLat?: number;
  initialLng?: number;
  zoom?: number;
  enableOverlay?: boolean;
  overlayStyle?: Partial<CSSStyleDeclaration>;
  onChange?: (lat: number, lng: number) => void;
}

export class LocationPicker {
  private map: L.Map;
  private marker: L.Marker;
  private overlay?: HTMLElement;
  private onChange?: (lat: number, lng: number) => void;

  constructor(options: LocationPickerOptions) {
    const {
      targetId,
      initialLat = 51.505,
      initialLng = -0.09,
      zoom = 13,
      enableOverlay = true,
      overlayStyle,
      onChange
    } = options;

    this.onChange = onChange;

    const element = document.getElementById(targetId);
    if (!element) {
      throw new Error(`Element with id "${targetId}" not found`);
    }

    // Ensure relative positioning for overlay absolute positioning
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }

    // Initialize map
    this.map = L.map(targetId).setView([initialLat, initialLng], zoom);

    // Add OSM tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Add draggable marker
    this.marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(this.map);

    // Initialize overlay
    if (enableOverlay) {
      this.createOverlay(element, initialLat, initialLng, overlayStyle);
    }

    // Event listeners
    this.setupEventListeners();
  }

  private createOverlay(
    container: HTMLElement,
    lat: number,
    lng: number,
    customStyle?: Partial<CSSStyleDeclaration>
  ): void {
    this.overlay = document.createElement('div');
    this.overlay.className = 'osm-location-picker-overlay';

    // Default styles
    const defaultStyle: Partial<CSSStyleDeclaration> = {
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: '8px 12px',
      borderRadius: '4px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      zIndex: '1000', // Above map controls
      fontFamily: 'sans-serif',
      fontSize: '14px',
      pointerEvents: 'none', // Allow clicking map through overlay if needed
    };

    // Apply default styles
    Object.assign(this.overlay.style, defaultStyle);

    // Apply custom styles
    if (customStyle) {
      Object.assign(this.overlay.style, customStyle);
    }

    this.updateOverlayContent(lat, lng);
    container.appendChild(this.overlay);
  }

  private updateOverlayContent(lat: number, lng: number): void {
    if (this.overlay) {
      this.overlay.textContent = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    }
  }

  private setupEventListeners(): void {
    // Update on click
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.updatePosition(e.latlng.lat, e.latlng.lng);
    });

    // Update on drag (instantaneous)
    this.marker.on('drag', (e: L.LeafletEvent) => {
      const marker = e.target as L.Marker;
      const position = marker.getLatLng();
      this.updatePosition(position.lat, position.lng, false);
    });

    // Update on drag end
    this.marker.on('dragend', () => {
      const position = this.marker.getLatLng();
      this.updatePosition(position.lat, position.lng);
    });
  }

  private updatePosition(lat: number, lng: number, triggerCallback = true): void {
    this.marker.setLatLng([lat, lng]);
    this.updateOverlayContent(lat, lng);

    if (triggerCallback && this.onChange) {
      this.onChange(lat, lng);
    }
    // Trigger onChange during drag as well if instantaneous is required for variables
    if (!triggerCallback && this.onChange) {
      this.onChange(lat, lng);
    }
  }

  public getCoordinates(): { lat: number; lng: number } {
    const { lat, lng } = this.marker.getLatLng();
    return { lat, lng };
  }

  public destroy(): void {
    this.map.remove();
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}
