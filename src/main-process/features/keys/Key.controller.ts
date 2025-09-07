import { IPCController, Handle } from "@/ipc/decorators";
// import { Electron.IpcMainInvokeEvent } from "electron";
import { type IKeyService } from "./IKeyService";
import { KeyService } from "./KeyService";
import { SQLiteKeyRepository } from "./SQLiteKeyRepository";
import { SecondAuthWithPIN } from "../second-auth/SecondAuthWithPin";
// import { SecondTimePINService } from "./SecondTimePINService";

@IPCController({ scope: "singleton", prefix: "key" })
export class KeyController {

  private keyService: IKeyService = new KeyService(
    new SQLiteKeyRepository(),
    new SecondAuthWithPIN()
  );

  constructor() { }

  /**
   * Count total number of keys
   */
  @Handle("count")
  async countKeys(event: Electron.IpcMainInvokeEvent): Promise<number> {
    return this.keyService.countKeys();
  }

  /**
   * Retrieve a single key by ID (encrypted form)
   */
  @Handle("getById")
  async retrieveKeyById(event: Electron.IpcMainInvokeEvent, id: string): Promise<IKeyModel | null> {
    return this.keyService.retrieveKeyById(id);
  }

  /**
   * Create a new key record
   */
  @Handle("create")
  async createKey(
    event: Electron.IpcMainInvokeEvent,
    params: {
      serviceName: string;
      serviceUsername?: string;
      description?: string;
      rawKeyValue: string;
    },
    plainPin: string
  ): Promise<KeyServiceResult> {

    return this.keyService.createKey(params, plainPin);
  }

  /**
   * Find encrypted keys matching filters
   */
  @Handle("find")
  async findEncryptedKeys(
    event: Electron.IpcMainInvokeEvent,
    options: Partial<IKeyModel>
  ): Promise<IKeyModel[] | null> {
    return this.keyService.findEncryptedKeys(options);
  }

  /**
   * Find keys by createdAt time
   */
  @Handle("findByCreated")
  async findEncryptedKeysByCreatedTime(
    event: Electron.IpcMainInvokeEvent,
    filter: {
      mode: "latest" | "oldest";
      limit: number;
      start?: number;
      end?: number;
      options?: Partial<Omit<IKeyModel, "createdAt">>;
    }
  ): Promise<IKeyModel[]> {
    return this.keyService.findEncryptedKeysByCreatedTime(filter);
  }

  /**
   * Find keys by updatedAt time
   */
  @Handle("findByUpdated")
  async findEncryptedKeysByUpdatedTime(
    event: Electron.IpcMainInvokeEvent,
    filter: {
      mode: "latest" | "oldest";
      limit: number;
      start?: number;
      end?: number;
      options?: Partial<Omit<IKeyModel, "updatedAt">>;
    }
  ): Promise<IKeyModel[]> {
    return this.keyService.findEncryptedKeysByUpdatedTime(filter);
  }

  /**
   * Decrypt a key value by ID
   */
  @Handle("decrypt")
  async decryptKeyValue(
    event: Electron.IpcMainInvokeEvent,
    key: IKeyModel,
    secondTimePassword: string
  ): Promise<{ result: KeyServiceResult; decryptedData?: string }> {
    return this.keyService.decryptKeyValue(key, secondTimePassword);
  }

  @Handle("update")
  async updateKey(event: any, keyToUpdate: IKeyModel, params: { serviceName?: string; serviceUsername?: string; description?: string; rawKeyValue?: string }, plainPin?: string): Promise<KeyServiceResult> {
    return this.keyService.updateKey(keyToUpdate, params, plainPin)
  }

  @Handle("delete")
  async deleteKey(event: any, keyId: string): Promise<KeyServiceResult> {
    return this.keyService.deleteKey(keyId);
  }


}
