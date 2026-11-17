export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
export declare function ok<T>(value: T): Result<T, never>;
