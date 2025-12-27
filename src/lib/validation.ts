// Input validation utilities

interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateScore(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { valid: true }; // Empty is allowed, defaults to 0
  }

  const num = parseFloat(value);
  if (isNaN(num)) {
    return { valid: false, error: 'Score must be a valid number' };
  }

  if (num < -999999 || num > 999999) {
    return { valid: false, error: 'Score must be between -999999 and 999999' };
  }

  return { valid: true };
}

export function validatePrediction(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { valid: true }; // Empty is allowed, defaults to 0
  }

  const num = parseFloat(value);
  if (isNaN(num)) {
    return { valid: false, error: 'Prediction must be a valid number' };
  }

  if (num < -999999 || num > 999999) {
    return { valid: false, error: 'Prediction must be between -999999 and 999999' };
  }

  return { valid: true };
}

export function validatePlayerName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Player name is required' };
  }

  if (name.length > 50) {
    return { valid: false, error: 'Player name must be 50 characters or less' };
  }

  return { valid: true };
}

export function validatePlayerCount(count: number): ValidationResult {
  if (count < 2) {
    return { valid: false, error: 'At least 2 players are required' };
  }

  if (count > 10) {
    return { valid: false, error: 'Maximum 10 players allowed' };
  }

  return { valid: true };
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
