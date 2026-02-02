import { defineConfig } from '@playwright/test';

export default defineConfig({
  // ESTA LÍNEA ES LA QUE FALTA EN TU IMAGEN
  testDir: './tests', 

  use: {
    baseURL: 'http://localhost:3000',
    video: 'on-first-retry',
    headless: false,
  },
  retries: 1,
});