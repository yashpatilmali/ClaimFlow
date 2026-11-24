/**
 * Plain formatting utilities for Indian currency (₹), Indian number system (lakhs/crores),
 * dates in DD/MM/YYYY, and IST times.
 */

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0.00';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format large Indian amounts into lakhs or crores when appropriate.
 * Example: 250000 -> ₹2.5 lakh, 10000000 -> ₹1 crore.
 */
export function formatLakhsCrores(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  const abs = Math.abs(amount);
  if (abs >= 10000000) {
    const cr = amount / 10000000;
    const s = cr.toFixed(2).replace(/\.00$/, '').replace(/(\.[1-9])0$/, '$1');
    return `₹${s} crore`;
  }
  if (abs >= 100000) {
    const lk = amount / 100000;
    const s = lk.toFixed(2).replace(/\.00$/, '').replace(/(\.[1-9])0$/, '$1');
    return `₹${s} lakh`;
  }
  return formatCurrency(amount);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat('en-IN').format(value);
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%';
  }
  return `${value.toFixed(1)}%`;
}

export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || isNaN(ms)) {
    return '0s';
  }
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Dates formatted as DD/MM/YYYY
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // If it's already YYYY-MM-DD, parse parts directly to prevent timezone shift
      const parts = dateString.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateString;
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

/**
 * Format timestamp in Indian Standard Time (IST)
 */
export function formatTimeIST(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const timeStr = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
    return `${timeStr} IST`;
  } catch {
    return dateString;
  }
}

export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined || isNaN(score)) return '0/100';
  return `${Math.round(score)}/100`;
}

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}
