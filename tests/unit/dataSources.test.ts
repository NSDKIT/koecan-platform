import { describe, expect, it, beforeEach, afterAll } from 'vitest';
import { fetchAdminDashboardData, fetchMonitorDashboardData } from '@/lib/services/dataSources';

describe('dataSources fallback', () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  });

  it('returns mock monitor dashboard data when Supabase is not configured', async () => {
    const data = await fetchMonitorDashboardData();
    expect(data.profile.name).toBeTruthy();
    expect(data.surveys.length).toBeGreaterThan(0);
  });

  it('returns mock admin dashboard data when Supabase is not configured', async () => {
    const data = await fetchAdminDashboardData();
    expect(data.announcements.length).toBeGreaterThan(0);
    expect(data.faqItems.length).toBeGreaterThan(0);
  });
});
