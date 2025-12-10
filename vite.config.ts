import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/lib/index.ts'),
            name: 'OsmLocationPicker',
            fileName: 'osm-location-picker',
        },
        rollupOptions: {
            // Make sure to externalize deps that shouldn't be bundled
            // into your library
            external: ['leaflet'],
            output: {
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    leaflet: 'L',
                },
            },
        },
    },
    plugins: [dts({ include: ['src/lib'] })],
});
