import { defineConfig } from 'vite';

export default defineConfig({
    base: '/changjie/',
    root: 'src',
    publicDir: '../public',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
    },
});
