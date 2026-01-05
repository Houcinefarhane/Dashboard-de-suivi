// Setup file for Vitest tests
import { beforeAll, afterAll } from 'vitest'

beforeAll(() => {
  // Setup before all tests
  process.env.NODE_ENV = 'test'
})

afterAll(() => {
  // Cleanup after all tests
})

