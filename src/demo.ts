import './style.css';
import { LocationPicker } from './lib';

const mapId = 'map-container';
const displayId = 'coords-display';

// Create elements if they don't exist in HTML (or assume HTML has them)
// For clarity, we'll assume index.html has them.

const picker = new LocationPicker({
    targetId: mapId,
    initialLat: 41.0082, // Istanbul
    initialLng: 28.9784,
    zoom: 13,
    onChange: (lat, lng) => {
        const display = document.getElementById(displayId);
        if (display) {
            display.innerText = `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`;
        }
    }
});

// Initial display
const { lat, lng } = picker.getCoordinates();
const display = document.getElementById(displayId);
if (display) {
    display.innerText = `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`;
}
