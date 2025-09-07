import type { IpcMainEvent, IpcMainInvokeEvent } from "electron";

/** Optional marker interface if you want to constrain your controllers. */
export interface IIPCControllerV2 {}

/** Type helpers for method signatures (first param is the event). */
export type IpcHandleFn<Args extends any[] = any[], R = any> =
  (event: IpcMainInvokeEvent, ...args: Args) => R | Promise<R>;

export type IpcOnFn<Args extends any[] = any[]> =
  (event: IpcMainEvent, ...args: Args) => void | Promise<void>;

export type ControllerCtor<T = any> = new (...args: any[]) => T;
