import { test, expect } from '@playwright/test';

test.describe('Koekyan monitor experience', () => {
  test('landing page renders KPI and navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '声キャン！プラットフォーム' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'モニターダッシュボードを見る' })).toBeVisible();
  });

  test('dashboard shows mock data fallback when Supabase is absent', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('公開中のアンケート')).toBeVisible();
    await expect(page.getByText('友達紹介', { exact: false })).toBeVisible();
  });

  test('admin console renders CMS widgets', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByText('お知らせ作成')).toBeVisible();
    await expect(page.getByRole('button', { name: 'FAQを追加' })).toBeVisible();
  });
});
