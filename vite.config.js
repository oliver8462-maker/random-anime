import { defineConfig } from 'vite'

export default defineConfig({
  base: '/random-anime/',
  test: { environment: 'jsdom' }
})
