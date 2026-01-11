/**
 * Numeric filter utilities for parsing and applying filter expressions
 */

export interface NumericFilterValue {
  operator: '>' | '<' | '>=' | '<=' | '=' | '<>';
  value: number;
}

/**
 * Parse a filter expression string into operator and value
 * Supports: >80, <70, >=75, <=60, =50, <>50 (not equal)
 */
export function parseFilterExpression(expression: string): NumericFilterValue | null {
  const trimmed = expression.trim();
  if (!trimmed) return null;

  // Match operators: <>, >=, <=, >, <, =
  const match = trimmed.match(/^(<>|>=|<=|>|<|=)?\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;

  const [, op, numStr] = match;
  const value = parseFloat(numStr);
  if (isNaN(value)) return null;

  // Default to = if no operator specified
  const operator = (op || '=') as NumericFilterValue['operator'];

  return { operator, value };
}

/**
 * Format a filter value back to expression string
 */
export function formatFilterExpression(filter: NumericFilterValue | null): string {
  if (!filter) return '';
  // Don't show = prefix for equality
  if (filter.operator === '=') return String(filter.value);
  return `${filter.operator}${filter.value}`;
}

/**
 * Check if a numeric value passes a filter
 */
export function passesFilter(value: number | null | undefined, filter: NumericFilterValue | null): boolean {
  if (!filter) return true;
  if (value === null || value === undefined) return false;

  switch (filter.operator) {
    case '>':
      return value > filter.value;
    case '<':
      return value < filter.value;
    case '>=':
      return value >= filter.value;
    case '<=':
      return value <= filter.value;
    case '=':
      return value === filter.value;
    case '<>':
      return value !== filter.value;
    default:
      return true;
  }
}
