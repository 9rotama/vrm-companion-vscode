import type { WebviewApi } from "vscode-webview";
import * as v from "valibot";
import { MessageToVscode, messageToVscodeSchema } from "../models/message";

class VSCodeAPIWrapper {
  private readonly vsCodeApi: WebviewApi<unknown> | undefined;

  constructor() {
    if (typeof acquireVsCodeApi === "function") {
      this.vsCodeApi = acquireVsCodeApi();
    }
  }

  public postMessage(message: MessageToVscode) {
    if (this.vsCodeApi) {
      const msg = v.safeParse(messageToVscodeSchema, message);
      if (!msg.success) {
        console.error("Invalid message format:", msg.issues);
        return;
      }
      this.vsCodeApi.postMessage(msg.output);
    }
  }

  public getState(): unknown | undefined {
    if (this.vsCodeApi) {
      return this.vsCodeApi.getState();
    } else {
      const state = localStorage.getItem("vscodeState");
      return state ? JSON.parse(state) : undefined;
    }
  }

  public setState<T extends unknown | undefined>(newState: T): T {
    if (this.vsCodeApi) {
      return this.vsCodeApi.setState(newState);
    } else {
      localStorage.setItem("vscodeState", JSON.stringify(newState));
      return newState;
    }
  }
}

export const vscode = new VSCodeAPIWrapper();
