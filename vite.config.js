import { defineConfig } from 'vite';

export default defineConfig({
    base: '/changjie/',
    root: 'src', // new root directory, every path in this project is based on src
    publicDir: '../public', // sets the public directory
    build: {
        outDir: '../dist',
        emptyOutDir: true, // empties the dist/ directory before outputting the new build files
    },
});
