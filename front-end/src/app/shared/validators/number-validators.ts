export interface ValidationResult {
  valid: boolean;
  error: string;
}

export function validarcampos(a: number, b: number): ValidationResult {
  if (isNaN(a)) {
    return { valid: false, error: 'Escribe el primer número' };
  }

  if (isNaN(b)) {
    return { valid: false, error: 'Escribe el segundo número' };
  }

  if (a > 1000000 || b > 1000000) {
    return { valid: false, error: 'Número muy grande (máx 1,000,000)' };
  }

  return { valid: true, error: '' };
}