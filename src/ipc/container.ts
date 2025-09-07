import { ipcMain, IpcMain } from "electron";
import { MetadataStore } from "./metadata";
import type { ControllerCtor, IpcHandleFn, IpcOnFn } from "./types";
import { IMainLogger } from "@/main-process/cores/IMainLog";
import { MainLogger } from "@/main-process/cores/MainLog";

type Construct<T> = new (...args: any[]) => T;

export type ContainerOptions = {
  /** optional controller namespace prefix applied if not set per controller */
  defaultPrefix?: string;
  /** dependency factory per controller ctor */
  factory?: <T>(ctor: Construct<T>) => T;
  /** throw error on duplicate channel */
  strictChannels?: boolean;
  /** wrap every call with try/catch and log */
  onError?: (err: unknown, ctx: { channel: string; method: string | symbol }) => void;
};

export class IPCContainer {
  private singletons = new Map<ControllerCtor, any>();
  private bound = new Set<string>();
  private disposed = false;
  private logger: IMainLogger | undefined = new MainLogger("IPCContainer");
  constructor(private opts: ContainerOptions = {}) {}

  /** Instantiate (singleton or transient) */
  private resolve<T>(ctor: Construct<T>, scope: "singleton" | "transient"): T {
    if (scope === "singleton") {
      if (!this.singletons.has(ctor)) {
        const instance = this.opts.factory ? this.opts.factory(ctor) : new ctor();
        this.singletons.set(ctor, instance);
      }
      return this.singletons.get(ctor)!;
    }
    return this.opts.factory ? this.opts.factory(ctor) : new ctor();
  }

  /** Apply optional prefix to a channel */
  private qualify(channel: string, prefix?: string) {
    const p = prefix ?? this.opts.defaultPrefix;
    return p ? `${p}:${channel}` : channel;
  }

  /** Bind everything discovered via decorators */
  bindAll(ipc: IpcMain = ipcMain) {
    if (this.disposed) throw new Error("IPCContainer has been disposed");

    for (const ctor of MetadataStore.getAllControllers()) {
      const meta = MetadataStore.getControllerMeta(ctor) ?? { scope: "singleton" as const };
      const instance = this.resolve(ctor, meta.scope);

      // handlers
      for (const h of MetadataStore.getHandlers(ctor)) {
        const channel = this.qualify(h.channel, meta.prefix);
        this.ensureNotDuplicate(channel, "handle");
        const method = (instance as any)[h.methodName] as IpcHandleFn;

        ipc.handle(channel, async (event, ...args) => {
          try {
            return await method.call(instance, event, ...args);
          } catch (err) {
            this.opts.onError?.(err, { channel, method: h.methodName });
            throw err;
          }
        });

        this.logger?.log(`Bind IPC handler on channel \"${channel}\"`)

        this.bound.add(`handle:${channel}`);
      }

      // listeners
      for (const l of MetadataStore.getListeners(ctor)) {
        const channel = this.qualify(l.channel, meta.prefix);
        this.ensureNotDuplicate(channel, "on");
        const method = (instance as any)[l.methodName] as IpcOnFn;

        // keep reference for potential unbind if you add that later
        ipc.on(channel, async (event, ...args) => {
          try {
            await method.call(instance, event, ...args);
          } catch (err) {
            this.opts.onError?.(err, { channel, method: l.methodName });
          }
        });

         this.logger?.log(`Bind IPC listener on channel \"${channel}\"`)


        this.bound.add(`on:${channel}`);
      }
    }
  }

  /** (Optional) crude duplicate detection */
  private ensureNotDuplicate(channel: string, kind: "handle" | "on") {
    if (!this.opts.strictChannels) return;
    const key = `${kind}:${channel}`;
    if (this.bound.has(key)) {
      throw new Error(`Duplicate ipcMain.${kind} binding for channel "${channel}"`);
    }
  }

  /** Dispose singletons (if they need cleanup) */
  dispose() {
    this.singletons.clear();
    this.bound.clear();
    this.disposed = true;
  }
}
