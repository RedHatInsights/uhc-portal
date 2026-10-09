// Parses -s Slack draft selection input ("1,2", "all", or empty to skip).

/**
 * @param {string} answer
 * @param {number} count
 * @returns {{ status: 'skip' } | { status: 'ok', indices: number[] } | { status: 'invalid', message: string }}
 */
const parseSlackSelection = (answer, count) => {
  const raw = answer.trim();
  if (!raw) {
    return { status: 'skip' };
  }

  const normalized = raw.toLowerCase();
  if (normalized === 'all') {
    return {
      status: 'ok',
      indices: Array.from({ length: count }, (_, index) => index),
    };
  }

  const indices = [];
  const parts = normalized.split(',');
  for (const part of parts) {
    const token = part.trim();
    if (!/^\d+$/.test(token)) {
      return {
        status: 'invalid',
        message: `Invalid selection "${raw}". Use numbers like "1,2", "all", or Enter to skip.`,
      };
    }

    const n = Number(token);
    if (n < 1 || n > count) {
      return {
        status: 'invalid',
        message: `Selection ${n} is out of range. Choose 1–${count}, "all", or Enter to skip.`,
      };
    }

    if (!indices.includes(n - 1)) {
      indices.push(n - 1);
    }
  }

  return { status: 'ok', indices };
};

export { parseSlackSelection };
