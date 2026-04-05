import { test, expect } from '@playwright/test'

test.describe('Styles Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/styles')
  })

  test('displays page header', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('30 curated styles')
  })

  test('displays all 30 styles', async ({ page }) => {
    // Count style cards - using correct class name
    const styleCards = page.locator('.style-card-full')
    await expect(styleCards).toHaveCount(30)
  })

  test('filter tabs work correctly', async ({ page }) => {
    // Click on "Minimal" filter
    await page.click('.filter-tab:has-text("Minimal")')

    // Should show fewer cards
    const minimalCards = page.locator('.style-card-full')
    const count = await minimalCards.count()
    expect(count).toBeLessThan(30)
    expect(count).toBeGreaterThan(0)

    // Click "All" to reset
    await page.click('.filter-tab:has-text("All")')
    await expect(page.locator('.style-card-full')).toHaveCount(30)
  })

  test('filter tabs highlight active filter', async ({ page }) => {
    // "All" should be active by default
    await expect(page.locator('.filter-tab:has-text("All")')).toHaveClass(/active/)

    // Click Bold filter
    await page.click('.filter-tab:has-text("Bold")')

    // Bold should be active
    await expect(page.locator('.filter-tab:has-text("Bold")')).toHaveClass(/active/)

    // All should not be active
    await expect(page.locator('.filter-tab:has-text("All")')).not.toHaveClass(/active/)
  })

  test('style cards display style information', async ({ page }) => {
    // Check first style card has required elements
    const firstCard = page.locator('.style-card-full').first()

    // Should have a name - using correct class name
    await expect(firstCard.locator('.style-card-name')).toBeVisible()

    // Should have a description
    await expect(firstCard.locator('.style-card-desc')).toBeVisible()
  })

  test('clicking "Use this style" navigates to generate with style param', async ({ page }) => {
    // Hover over the first style card to make button visible
    const firstCard = page.locator('.style-card-full').first()
    await firstCard.hover()

    // Click the "Use this style" button - using correct class name
    await firstCard.locator('.style-use-btn').click()

    // Should navigate to generate with style query param
    await expect(page).toHaveURL(/\/generate\?style=/)
  })

  test('all category filters show correct styles', async ({ page }) => {
    const categories = ['Minimal', 'Bold', 'Editorial', 'Dark', 'Luxury', 'Technical', 'Retro']

    for (const category of categories) {
      await page.click(`.filter-tab:has-text("${category}")`)

      // Should have at least one card
      const cardCount = await page.locator('.style-card-full').count()
      expect(cardCount).toBeGreaterThan(0)
    }
  })

  test('style cards show tags', async ({ page }) => {
    // Check first style card has tags
    const firstCard = page.locator('.style-card-full').first()
    await expect(firstCard.locator('.style-tag')).toHaveCount(3)
  })
})
