import { test, expect } from '@playwright/test';

test.describe('Moya Lab Web App Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Print browser logs to node console
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.error('BROWSER ERROR:', err));
    // Navigate to the local server
    await page.goto('/');
  });

  test('should load landing page and display logo, headers and trust badges', async ({ page }) => {
    // Check page title or logo
    const logoText = page.locator('.logo-text');
    await expect(logoText).toContainText(/Moya Lab/i);

    // Verify language selector is present
    const selector = page.locator('.language-selector');
    await expect(selector).toBeVisible();

    // Verify the hero title is present
    const heroTitle = page.locator('.hero-title');
    await expect(heroTitle).toBeVisible();

    // Verify demo button is visible
    const demoBtn = page.locator('.hero-demo-btn');
    await expect(demoBtn).toBeVisible();
  });

  test('should toggle language translations correctly', async ({ page }) => {
    const selector = page.locator('.language-selector');
    
    // Switch to English
    await selector.selectOption('en');
    await expect(page.locator('.hero-title')).toContainText(/Edit your video/i);

    // Switch to Russian
    await selector.selectOption('ru');
    await expect(page.locator('.hero-title')).toContainText(/Обработай видео/i);

    // Switch to Japanese
    await selector.selectOption('ja');
    await expect(page.locator('.hero-title')).toContainText(/動画を加工する/i);
  });

  test('should update SEO metadata and language tags on language switch', async ({ page }) => {
    const selector = page.locator('.language-selector');

    // Switch to Japanese explicitly to test Japanese defaults
    await selector.selectOption('ja');
    await expect(page).toHaveTitle(/モヤラボ - Moya Lab - 肖像権/i);
    let htmlLang = await page.evaluate(() => document.documentElement.lang);
    expect(htmlLang).toBe('ja');
    let metaDesc = await page.evaluate(() => document.querySelector('meta[name="description"]').getAttribute('content'));
    expect(metaDesc).toContain('ブラウザだけで完結する');

    // Switch to English
    await selector.selectOption('en');
    await expect(page).toHaveTitle(/Moya Lab - Moya Lab - Privacy/i);
    htmlLang = await page.evaluate(() => document.documentElement.lang);
    expect(htmlLang).toBe('en');
    metaDesc = await page.evaluate(() => document.querySelector('meta[name="description"]').getAttribute('content'));
    expect(metaDesc).toContain('client-side video processing');

    // Switch to Russian
    await selector.selectOption('ru');
    await expect(page).toHaveTitle(/Moya Lab - Moya Lab - Медиа/i);
    htmlLang = await page.evaluate(() => document.documentElement.lang);
    expect(htmlLang).toBe('ru');
    metaDesc = await page.evaluate(() => document.querySelector('meta[name="description"]').getAttribute('content'));
    expect(metaDesc).toContain('Безопасный клиентский инструмент');
  });

  test('should load demo video and navigate through workspace tabs', async ({ page }) => {
    // Click on the Try Demo button
    const demoBtn = page.locator('.hero-demo-btn');
    await demoBtn.click();

    // The editor workspace should open, and header should shrink
    const header = page.locator('.app-header');
    await expect(header).toHaveClass(/app-header--editor/);

    // The file name should be shown next to the logo
    await expect(page.locator('.header-logo-container')).toContainText('demo_blazes_sample.mp4');

    // Sidebar navigation tabs should be visible
    const shieldTab = page.locator('.shield-tab');
    const danmakuTab = page.locator('.danmaku-tab');
    const squeezerTab = page.locator('.squeezer-tab');

    await expect(shieldTab).toBeVisible();
    await expect(danmakuTab).toBeVisible();
    await expect(squeezerTab).toBeVisible();

    // By default, shield tab is active. Verify its content/hint
    await expect(page.locator('.panel-title')).toContainText(/モザイクシールド|Mosaic Shield/i);
    await expect(page.locator('.step-hint')).toBeVisible();

    // Click Danmaku tab
    await danmakuTab.click();
    await expect(page.locator('.panel-title')).toContainText(/弾幕オーバーレイ|Danmaku Overlay/i);
    
    // Click Squeezer tab
    await squeezerTab.click();
    await expect(page.locator('.panel-title')).toContainText(/ターゲットサイズ圧縮|Target Size Compressor/i);
    await expect(page.locator('.target-size-value')).toBeVisible();
  });
});
