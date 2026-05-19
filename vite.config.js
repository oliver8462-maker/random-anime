import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/random-anime/',
  test: { environment: 'jsdom' }
})
