import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Billiev/)
  })

  test('should display pricing section', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Tarifs')).toBeVisible()
    await expect(page.locator('text=49€')).toBeVisible()
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Fonctionnalités')
    await expect(page.locator('#features')).toBeVisible()
  })
})

