/**
 * Validates if a string is a safe SQL identifier (table name, column name).
 * Prevents SQL injection via dynamic object names.
 * Allows alphanumeric characters and underscores only.
 */
export function isValidIdentifier(name: string): boolean {
    if (!name) return false;
    // Allow a-z, A-Z, 0-9, and underscore. 
    // This is restrictive but safe for internal schema names.
    return /^[a-zA-Z0-9_]+$/.test(name);
}
