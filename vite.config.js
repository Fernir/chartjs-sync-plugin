import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.js',
            name: 'chartjs-sync-tooltips',
            fileName: 'index',
            formats: ['es', 'cjs', 'umd']
        },
    }
});
