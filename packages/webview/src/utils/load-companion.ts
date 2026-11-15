export function loadCompanion<Model, Animation>({
  loadModel,
  loadAnimation,
  showModel,
  animate,
  disposeModel,
  reportError,
}: {
  loadModel: () => Promise<Model>;
  loadAnimation: () => Promise<Animation>;
  showModel: (model: Model) => void;
  animate: (model: Model, animation: Animation) => void;
  disposeModel: (model: Model) => void;
  reportError: (error: unknown) => void;
}) {
  let cancelled = false;
  let model: Model | undefined;
  let hasModel = false;
  const animation = loadAnimation().then(
    (value) => ({ ok: true as const, value }),
    (error: unknown) => {
      if (!cancelled) reportError(error);
      return { ok: false as const };
    },
  );
  const done = (async () => {
    const value = await loadModel();
    if (cancelled) {
      disposeModel(value);
      return;
    }
    model = value;
    hasModel = true;
    showModel(value);
    const result = await animation;
    if (!cancelled && result.ok) animate(value, result.value);
  })().catch((error: unknown) => {
    if (!cancelled) reportError(error);
  });
  return {
    done,
    cancel() {
      if (cancelled) return;
      cancelled = true;
      if (hasModel) disposeModel(model as Model);
    },
  };
}
