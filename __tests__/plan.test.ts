import { getPlanWeek, getNextPlanWeek } from '@/lib/plan';

describe('plan helpers', () => {
  beforeAll(() => {
    // Set a fixed start date for consistent test results
    process.env.PLAN_START_DATE = '2024-01-01';
  });

  it('calculates the correct week of the year', () => {
    // Jan 1 2024 is a Monday, so it should be week 1
    const date1 = new Date('2024-01-01T12:00:00Z');
    expect(getPlanWeek(date1)).toBe(1);

    // Jan 8 2024 is a Monday, so it should be week 2
    const date2 = new Date('2024-01-08T12:00:00Z');
    expect(getPlanWeek(date2)).toBe(2);

    // A date in the middle of the year
    const date3 = new Date('2024-07-15T12:00:00Z'); // Monday, week 29
    expect(getPlanWeek(date3)).toBe(29);
  });

  it('calculates the correct next week', () => {
    const date = new Date('2024-01-01T12:00:00Z'); // Week 1
    const currentWeek = getPlanWeek(date);
    const nextWeek = getNextPlanWeek(date);
    expect(nextWeek).toBe(currentWeek + 1);
  });
});
