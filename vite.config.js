import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Сборка в один dist/index.html со встроенными JS и CSS:
// так его можно опубликовать артефактом на claude.ai или положить на любой хостинг.
export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    target: 'es2020',
  },
});
