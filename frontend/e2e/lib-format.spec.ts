import { test, expect } from '@playwright/test';
import {
  formatCurrency,
  formatPercent,
  formatDuration,
  formatScore,
  formatDate,
  formatLakhsCrores,
  formatTimeIST,
} from '../src/lib/format';
import { getStatusMeta, getSubrogationMeta } from '../src/lib/status';

test.describe('Indian Format Utilities Unit Tests', () => {
  test('formatCurrency formats Indian Rupees (₹) accurately', () => {
    expect(formatCurrency(850)).toContain('850.00');
    expect(formatCurrency(850)).toContain('₹');
    expect(formatCurrency(1350.5)).toContain('1,350.50');
    expect(formatCurrency(100000)).toContain('1,00,000.00');
    expect(formatCurrency(0)).toContain('0.00');
    expect(formatCurrency(null as any)).toContain('0.00');
  });

  test('formatLakhsCrores formats big Indian numbers in words', () => {
    expect(formatLakhsCrores(250000)).toBe('₹2.5 lakh');
    expect(formatLakhsCrores(10000000)).toBe('₹1 crore');
    expect(formatLakhsCrores(850)).toContain('₹850.00');
  });

  test('formatDate formats as DD/MM/YYYY', () => {
    expect(formatDate('2026-11-24')).toBe('24/11/2026');
    expect(formatDate('2026-01-05')).toBe('05/01/2026');
  });

  test('formatPercent formats fractions and decimals', () => {
    expect(formatPercent(42.5)).toBe('42.5%');
    expect(formatPercent(100)).toBe('100.0%');
  });

  test('formatDuration formats milliseconds into readable seconds or ms', () => {
    expect(formatDuration(450)).toBe('450ms');
    expect(formatDuration(1200)).toBe('1.2s');
  });

  test('formatScore formats fraud score fractions', () => {
    expect(formatScore(12)).toBe('12/100');
    expect(formatScore(72.4)).toBe('72/100');
  });
});

test.describe('Status Utilities Unit Tests', () => {
  test('getStatusMeta returns proper label, icon, and categories', () => {
    const stp = getStatusMeta('APPROVED_STP');
    expect(stp.label).toBe('Auto-approved');
    expect(stp.category).toBe('approved');
    expect(stp.icon).toBe('check-circle');

    const hitl = getStatusMeta('PENDING_HITL');
    expect(hitl.label).toBe('Needs review');
    expect(hitl.category).toBe('review');
    expect(hitl.icon).toBe('alert-circle');

    const denied = getStatusMeta('RESOLVED_DENY');
    expect(denied.label).toBe('Denied');
    expect(denied.category).toBe('denied');

    const siu = getStatusMeta('RESOLVED_REFER_SIU');
    expect(siu.label).toBe('Sent to SIU');
    expect(siu.category).toBe('siu');
  });

  test('getSubrogationMeta categorizes likelihood properly', () => {
    expect(getSubrogationMeta('HIGH').category).toBe('subro');
    expect(getSubrogationMeta('MEDIUM').category).toBe('review');
    expect(getSubrogationMeta('LOW').category).toBe('processing');
  });
});
