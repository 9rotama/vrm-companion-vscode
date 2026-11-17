import {
  describeValidationError,
  ok,
  Result,
  validate,
  ValidationError,
} from "shared";
import { State, stateSchema } from "../models/state";
import { StorageError, vscode } from "./vscode";

export type StateLoadError = StorageError | ValidationError;

export function loadState(): Result<NonNullable<State>, StateLoadError> {
  const stored = vscode.getState();
  if (!stored.ok) return stored;
  const parsed = validate(stateSchema, stored.value);
  if (!parsed.ok) return parsed;
  return ok(parsed.value ?? {});
}

export function loadStateOrDefault(): NonNullable<State> {
  const state = loadState();
  if (state.ok) return state.value;
  switch (state.error.type) {
    case "corruptedStorage":
      console.warn("Failed to read state:", state.error.cause);
      break;
    case "invalidSchema":
      console.warn(
        "Failed to parse state:",
        describeValidationError(state.error),
      );
      break;
  }
  return {};
}
