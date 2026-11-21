export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function fromPromise<T, E>(
  promise: PromiseLike<T>,
  mapError: (cause: unknown) => E,
): Promise<Result<T, E>> {
  return Promise.resolve(promise).then(ok, (cause: unknown) =>
    err(mapError(cause)),
  );
}
