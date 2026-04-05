import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('all main pages are reachable from nav', async ({ page }) => {
    await page.goto('/')

    // Click Generate link
    await page.click('.nav-center a:has-text("Generate")')
    await expect(page).toHaveURL('/generate')

    // Click Styles link
    await page.click('.nav-center a:has-text("Styles")')
    await expect(page).toHaveURL('/styles')

    // Click Pricing link
    await page.click('.nav-center a:has-text("Pricing")')
    await expect(page).toHaveURL('/pricing')

    // Click logo to go home
    await page.click('.nav-wordmark')
    await expect(page).toHaveURL('/')
  })

  test('nav highlights current page', async ({ page }) => {
    // Check Generate page
    await page.goto('/generate')
    await expect(page.locator('.nav-center a:has-text("Generate")')).toHaveClass(/active/)

    // Check Styles page
    await page.goto('/styles')
    await expect(page.locator('.nav-center a:has-text("Styles")')).toHaveClass(/active/)

    // Check Pricing page
    await page.goto('/pricing')
    await expect(page.locator('.nav-center a:has-text("Pricing")')).toHaveClass(/active/)
  })

  test('nav shows login/signup when logged out', async ({ page }) => {
    await page.goto('/')

    // Should show Login link
    await expect(page.locator('.nav-right a:has-text("Login")')).toBeVisible()

    // Should show Start free button
    await expect(page.locator('.nav-right a:has-text("Start free")')).toBeVisible()
  })

  test('mobile menu works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Desktop nav should be hidden
    await expect(page.locator('.nav-center')).not.toBeVisible()

    // Hamburger should be visible
    await expect(page.locator('.nav-hamburger')).toBeVisible()

    // Click hamburger to open menu
    await page.click('.nav-hamburger')

    // Mobile menu should be visible
    await expect(page.locator('.nav-mobile-menu')).toBeVisible()

    // Click a link
    await page.click('.nav-mobile-link:has-text("Styles")')

    // Should navigate and close menu
    await expect(page).toHaveURL('/styles')
    await expect(page.locator('.nav-mobile-menu')).not.toBeVisible()
  })

  test('footer links work', async ({ page }) => {
    await page.goto('/')

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Check footer is visible
    await expect(page.locator('footer')).toBeVisible()
  })

  test('direct URL access works', async ({ page }) => {
    // Test direct access to various routes
    await page.goto('/styles')
    await expect(page.locator('h1')).toContainText('30 curated styles')

    await page.goto('/pricing')
    await expect(page.locator('h1')).toContainText('Start for free')

    await page.goto('/generate')
    await expect(page.locator('.generate-page')).toBeVisible()
  })
})
