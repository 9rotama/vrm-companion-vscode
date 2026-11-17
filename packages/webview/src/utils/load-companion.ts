import { err, Result } from "shared";
import type { UnexpectedError } from "../models/companion-load-error";

export function loadCompanion<Model, Animation, E>({
  loadModel,
  loadAnimation,
  showModel,
  animate,
  disposeModel,
  reportError,
}: {
  loadModel: () => Promise<Result<Model, E>>;
  loadAnimation: () => Promise<Result<Animation, E>>;
  showModel: (model: Model) => void;
  animate: (model: Model, animation: Animation) => void;
  disposeModel: (model: Model) => void;
  reportError: (error: E | UnexpectedError) => void;
}) {
  let cancelled = false;
  let model: Model | undefined;
  let hasModel = false;
  const report = (error: E | UnexpectedError) => {
    if (!cancelled) reportError(error);
  };
  const animation = loadAnimation().then(
    (result) => {
      if (!result.ok) report(result.error);
      return result;
    },
    (cause: unknown) => {
      report({ type: "unexpected", cause });
      return err({ type: "unexpected" as const, cause });
    },
  );
  const done = (async () => {
    const loaded = await loadModel();
    if (!loaded.ok) {
      report(loaded.error);
      return;
    }
    const value = loaded.value;
    if (cancelled) {
      disposeModel(value);
      return;
    }
    model = value;
    hasModel = true;
    showModel(value);
    const result = await animation;
    if (!cancelled && result.ok) animate(value, result.value);
  })().catch((cause: unknown) => {
    // Not left to the caller: a throwing callback would otherwise become an unhandled rejection.
    report({ type: "unexpected", cause });
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
