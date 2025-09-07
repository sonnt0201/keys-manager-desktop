import { MetadataStore } from "./metadata";
import type { IpcHandleFn, IpcOnFn } from "./types";

/** Class decorator */
export function IPCController(opts?: { scope?: "singleton" | "transient"; prefix?: string }) {
  const scope = opts?.scope ?? "singleton";
  const prefix = opts?.prefix;
  return function (ctor: Function) {
    MetadataStore.registerController(ctor as any);
    MetadataStore.setControllerMeta(ctor as any, { scope, prefix });
  };
}

/** Method decorator: ipcMain.handle(channel) */
export function Handle(channel: string) {
  return function <
    T extends object,
    K extends keyof T & string
  >(target: T, propertyKey: K, _desc: TypedPropertyDescriptor<IpcHandleFn>) {
    MetadataStore.pushHandlerMeta(target, propertyKey, channel);
  };
}

/** Method decorator: ipcMain.on(channel) */
export function On(channel: string) {
  return function <
    T extends object,
    K extends keyof T & string
  >(target: T, propertyKey: K, _desc: TypedPropertyDescriptor<IpcOnFn>) {
    MetadataStore.pushListenerMeta(target, propertyKey, channel);
  };
}
