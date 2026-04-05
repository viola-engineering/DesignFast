import { test, expect } from '@playwright/test'

test.describe('Generate Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/generate')
    // Wait for page to fully load
    await page.waitForSelector('.generator-sidebar')
  })

  test('displays generator form', async ({ page }) => {
    // Check form sections are visible
    await expect(page.locator('.generator-sidebar')).toBeVisible()
    await expect(page.locator('.gen-textarea')).toBeVisible()
    await expect(page.locator('.model-toggle')).toBeVisible()
  })

  test('form has all required sections', async ({ page }) => {
    // Section 1: Prompt
    await expect(page.locator('text=Describe your project')).toBeVisible()
    await expect(page.locator('.gen-textarea')).toBeVisible()

    // Section 2: AI model
    await expect(page.locator('text=AI model')).toBeVisible()
    await expect(page.locator('button:has-text("Claude")')).toBeVisible()
    await expect(page.locator('button:has-text("Gemini")')).toBeVisible()

    // Section 3: Output mode
    await expect(page.locator('text=Output mode')).toBeVisible()
    await expect(page.locator('text=Single page')).toBeVisible()
    await expect(page.locator('text=Multi-page webapp')).toBeVisible()

    // Section 4: Versions
    await expect(page.locator('text=How many versions')).toBeVisible()

    // Section 5: Design style
    await expect(page.locator('text=Design style')).toBeVisible()
    await expect(page.locator('text=Let AI pick')).toBeVisible()
  })

  test('prompt textarea has character counter', async ({ page }) => {
    const textarea = page.locator('.gen-textarea')

    // Wait for character counter to be visible
    await expect(page.locator('.gen-char-count')).toBeVisible()

    // Initially shows 0
    await expect(page.locator('.gen-char-count')).toContainText('0 / 600')

    // Type some text
    await textarea.fill('A landing page for a coffee shop')

    // Counter should update (32 characters)
    await expect(page.locator('.gen-char-count')).toContainText('32 / 600')
  })

  test('model toggle switches between Claude and Gemini', async ({ page }) => {
    const claudeBtn = page.locator('.model-btn:has-text("Claude")')
    const geminiBtn = page.locator('.model-btn:has-text("Gemini")')

    // Claude should be active by default
    await expect(claudeBtn).toHaveClass(/active/)
    await expect(geminiBtn).not.toHaveClass(/active/)

    // Click Gemini
    await geminiBtn.click()
    await expect(geminiBtn).toHaveClass(/active/)
    await expect(claudeBtn).not.toHaveClass(/active/)

    // Click Claude again
    await claudeBtn.click()
    await expect(claudeBtn).toHaveClass(/active/)
  })

  test('mode selection works', async ({ page }) => {
    const landingOption = page.locator('.mode-option:has-text("Single page")')
    const webappOption = page.locator('.mode-option:has-text("Multi-page")')

    // Landing should be selected by default
    await expect(landingOption).toHaveClass(/selected/)

    // Click webapp option
    await webappOption.click()
    await expect(webappOption).toHaveClass(/selected/)
    await expect(landingOption).not.toHaveClass(/selected/)
  })

  test('version count selection works', async ({ page }) => {
    const versionBtns = page.locator('.version-btn')

    // 1 should be selected by default
    await expect(versionBtns.nth(0)).toHaveClass(/active/)

    // Click 3
    await versionBtns.nth(2).click()
    await expect(versionBtns.nth(2)).toHaveClass(/active/)
    await expect(versionBtns.nth(0)).not.toHaveClass(/active/)
  })

  test('AI pick toggle works', async ({ page }) => {
    const aiPickBtn = page.locator('.gen-ai-pick-btn')

    // Should not be active initially
    await expect(aiPickBtn).not.toHaveClass(/active/)

    // Click to enable
    await aiPickBtn.click()
    await expect(aiPickBtn).toHaveClass(/active/)

    // Click again to disable
    await aiPickBtn.click()
    await expect(aiPickBtn).not.toHaveClass(/active/)
  })

  test('style selection works and deselects AI pick', async ({ page }) => {
    const aiPickBtn = page.locator('.gen-ai-pick-btn')
    const styleCard = page.locator('.gen-style-card').first()

    // Enable AI pick first
    await aiPickBtn.click()
    await expect(aiPickBtn).toHaveClass(/active/)

    // Select a style
    await styleCard.click()
    await expect(styleCard).toHaveClass(/selected/)

    // AI pick should be deselected
    await expect(aiPickBtn).not.toHaveClass(/active/)
  })

  test('generate button is disabled without prompt', async ({ page }) => {
    const generateBtn = page.locator('.btn-generate')

    // Should be disabled without prompt
    await expect(generateBtn).toBeDisabled()

    // Fill prompt
    await page.fill('.gen-textarea', 'A landing page')

    // Still disabled without style selection
    await expect(generateBtn).toBeDisabled()

    // Select AI pick
    await page.click('.gen-ai-pick-btn')

    // Should be enabled now
    await expect(generateBtn).not.toBeDisabled()
  })

  test('shows empty state with example prompts', async ({ page }) => {
    // Check output panel shows empty state
    await expect(page.locator('.empty-state')).toBeVisible()
    await expect(page.locator('.empty-title')).toContainText('Ready to generate')

    // Example prompts should be visible
    await expect(page.locator('.example-prompt')).toHaveCount(4)
  })

  test('browse all styles link navigates to styles page', async ({ page }) => {
    await page.click('a:has-text("Browse all 30 styles")')
    await expect(page).toHaveURL('/styles')
  })

  test('preselected style from query param is selected', async ({ page }) => {
    await page.goto('/generate?style=minimalist')

    // Wait for sidebar to load
    await page.waitForSelector('.generator-sidebar')

    // The minimalist style card should be selected (if it's in the quick selection grid)
    // Note: minimalist is in the styleOptions array
    const selectedCard = page.locator('.gen-style-card.selected')
    await expect(selectedCard).toBeVisible()
  })
})
