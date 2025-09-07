import "reflect-metadata";
import type { ControllerCtor } from "./types";

const NS = "app/ipc"; // metadata namespace

export const META = {
  controller: Symbol.for(`${NS}:controller`),
  handlers: Symbol.for(`${NS}:handlers`),
  listeners: Symbol.for(`${NS}:listeners`),
};

export type HandlerMeta = {
  kind: "handle";
  channel: string;
  methodName: string | symbol;
};

export type ListenerMeta = {
  kind: "on";
  channel: string;
  methodName: string | symbol;
};

export type ControllerMeta = {
  scope: "singleton" | "transient";
  prefix?: string;
};

export class MetadataStore {
  private static controllerRegistry = new Set<ControllerCtor>();

  static registerController(ctor: ControllerCtor) {
    this.controllerRegistry.add(ctor);
  }

  static getAllControllers(): ControllerCtor[] {
    return Array.from(this.controllerRegistry);
  }

  static setControllerMeta(ctor: ControllerCtor, meta: ControllerMeta) {
    Reflect.defineMetadata(META.controller, meta, ctor);
  }

  static getControllerMeta(ctor: ControllerCtor): ControllerMeta | undefined {
    return Reflect.getMetadata(META.controller, ctor);
  }

  static pushHandlerMeta(
    target: object,
    methodName: string | symbol,
    channel: string
  ) {
    const ctor = target.constructor as ControllerCtor;
    const list: HandlerMeta[] =
      Reflect.getMetadata(META.handlers, ctor) ?? [];
    list.push({ kind: "handle", channel, methodName });
    Reflect.defineMetadata(META.handlers, list, ctor);
  }

  static pushListenerMeta(
    target: object,
    methodName: string | symbol,
    channel: string
  ) {
    const ctor = target.constructor as ControllerCtor;
    const list: ListenerMeta[] =
      Reflect.getMetadata(META.listeners, ctor) ?? [];
    list.push({ kind: "on", channel, methodName });
    Reflect.defineMetadata(META.listeners, list, ctor);
  }

  static getHandlers(ctor: ControllerCtor): HandlerMeta[] {
    return Reflect.getMetadata(META.handlers, ctor) ?? [];
  }

  static getListeners(ctor: ControllerCtor): ListenerMeta[] {
    return Reflect.getMetadata(META.listeners, ctor) ?? [];
  }
}
