export interface SafeStorage { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
export function browserStorage(): SafeStorage | undefined { try { return localStorage; } catch { return undefined; } }
export function readRecord(storage: SafeStorage | undefined, key: string): unknown { try { return JSON.parse(storage?.getItem(key) ?? 'null'); } catch { return null; } }
export function writeRecord(storage: SafeStorage | undefined, key: string, value: unknown): void { try { storage?.setItem(key, JSON.stringify(value)); } catch { /* Storage is optional, including file URLs and private browsing. */ } }
