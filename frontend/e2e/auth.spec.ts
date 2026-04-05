import { test, expect } from '@playwright/test'

// Configure serial mode for auth tests to share state
test.describe('Authentication', () => {
  test.describe.configure({ mode: 'serial' })
  // Generate unique email for this test file run
  const testEmail = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`
  const testPassword = 'testpass123'
  const testName = 'Test User'

  test('can register a new user', async ({ page }) => {
    await page.goto('/register')

    // Fill registration form
    await page.fill('input#name', testName)
    await page.fill('input#email', testEmail)
    await page.fill('input#password', testPassword)

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to generate page
    await expect(page).toHaveURL('/generate', { timeout: 10000 })

    // Should show user in nav
    await expect(page.locator('.nav-right')).toContainText(testName)
  })

  test('can logout', async ({ page }) => {
    // First login
    await page.goto('/login')
    await page.fill('input#email', testEmail)
    await page.fill('input#password', testPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/generate', { timeout: 10000 })

    // Click logout button
    await page.click('.nav-right button:has-text("Logout")')

    // Should redirect to home
    await expect(page).toHaveURL('/')

    // Nav should show login link
    await expect(page.locator('.nav-right')).toContainText('Login')
  })

  test('can login with existing user', async ({ page }) => {
    await page.goto('/login')

    // Fill login form
    await page.fill('input#email', testEmail)
    await page.fill('input#password', testPassword)

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to generate page
    await expect(page).toHaveURL('/generate', { timeout: 10000 })

    // Should show user in nav
    await expect(page.locator('.nav-right')).toContainText(testName)
  })

  test('session persists across page reload', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input#email', testEmail)
    await page.fill('input#password', testPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/generate', { timeout: 10000 })

    // Reload page
    await page.reload()

    // Wait for auth to initialize
    await page.waitForTimeout(500)

    // Should still be logged in
    await expect(page.locator('.nav-right')).toContainText(testName)
  })

  test('protected route redirects to login', async ({ page }) => {
    // Clear cookies to ensure logged out state
    await page.context().clearCookies()

    // Try to access protected route without auth
    await page.goto('/account')

    // Should redirect to login with return URL
    await expect(page).toHaveURL(/\/login\?redirect=/)
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill with wrong password
    await page.fill('input#email', testEmail)
    await page.fill('input#password', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('.auth-error')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('.auth-error')).toContainText('Invalid email or password')
  })

  test('validates password length on register', async ({ page }) => {
    await page.goto('/register')

    // Fill with valid email first
    await page.fill('input#email', 'newuser@example.com')

    // Try short password
    await page.fill('input#password', 'short')

    // Error message should appear
    await expect(page.locator('.field-error')).toBeVisible()
    await expect(page.locator('.field-error')).toContainText('at least 8 characters')

    // Submit button should be disabled
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
  })
})

// Separate test for duplicate email to avoid race condition
test('shows error for duplicate email registration', async ({ page }) => {
  // Create a unique user first
  const uniqueEmail = `dup-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`

  await page.goto('/register')
  await page.fill('input#email', uniqueEmail)
  await page.fill('input#password', 'testpass123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/generate', { timeout: 10000 })

  // Logout
  await page.click('.nav-right button:has-text("Logout")')
  await expect(page).toHaveURL('/')

  // Try to register again with same email
  await page.goto('/register')
  await page.fill('input#email', uniqueEmail)
  await page.fill('input#password', 'testpass123')
  await page.click('button[type="submit"]')

  // Should show error message
  await expect(page.locator('.auth-error')).toBeVisible({ timeout: 5000 })
  await expect(page.locator('.auth-error')).toContainText('Email already registered')
})
