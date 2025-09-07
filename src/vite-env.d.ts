/// <reference types="vite/client" />

interface Window {
  ipcRenderer: {
    // --------- Electron built-ins ---------
    on: (...args: Parameters<typeof import('electron').ipcRenderer.on>) => void
    off: (...args: Parameters<typeof import('electron').ipcRenderer.off>) => void
    send: (...args: Parameters<typeof import('electron').ipcRenderer.send>) => void
    invoke: (
      ...args: Parameters<typeof import('electron').ipcRenderer.invoke>
    ) => Promise<any>

    // --------- User-defined short methods ---------
    removeAllListener: () => void
    removeAllListenersOfChannel: (channel: string) => void
    echo: (message: string) => Promise<string>

    // --------- Entry Auth Service ---------
    registerUser: (userCred: IUserCredModel) => Promise<EntryAuthResult>

    /**
     * @param password
     * @returns "success" | "user-not-found" | "password-verification-failed"
     */
    login: (password: string) => Promise<EntryAuthResult>

    logout: () => void
    /**
     * Check if a user already exists.
     * @returns null if user does not exist, otherwise {@link IUserCredModel}
     */
    checkUserExists: () => Promise<IUserCredModel | null>

    /**
     * @returns {@link EntryAuthResult} indicating current authentication state.
     * Possible values: "user-not-found" | "logged-in" | "not-logged-in"
     */
    authState: () => Promise<EntryAuthResult>

    /**
     * listen changes on entry auth state
     * @param callback 
     * @returns 
     */
    onEntryAuthUpdated: (
      callback: (state: EntryAuthResult) => void
    ) => void
    // =============== SECOND AUTH =============
    secondAuth: {
      create(pin: string): Promise<SecondAuthResult>;
      verify(pin: string): Promise<SecondAuthResult>;
      isAvailable(): Promise<boolean>;
      remove(): Promise<SecondAuthResult>;
    }

    // --------- Key Service ---------
    key: {
      count: () => Promise<number>
      getById: (id: string) => Promise<IKeyModel | null>
      create: (
        params: {
          serviceName: string
          serviceUsername?: string
          description?: string
          rawKeyValue: string
        },
        plainPin: string
      ) => Promise<KeyServiceResult>
      find: (options: Partial<IKeyModel>) => Promise<IKeyModel[] | null>
      findByCreated: (filter: {
        mode: 'latest' | 'oldest'
        limit: number
        start?: number
        end?: number
        options?: Partial<Omit<IKeyModel, 'createdAt'>>
      }) => Promise<IKeyModel[]>
      findByUpdated: (filter: {
        mode: 'latest' | 'oldest'
        limit: number
        start?: number
        end?: number
        options?: Partial<Omit<IKeyModel, 'updatedAt'>>
      }) => Promise<IKeyModel[]>
      decrypt: (
        key: IKeyModel,
        secondTimePassword: string
      ) => Promise<{
        result: KeyServiceResult
        decryptedData?: string
      }>

      update(
        keyToUpdate: IKeyModel,
        params: { serviceName?: string; serviceUsername?: string; description?: string; rawKeyValue?: string },
        plainPin?: string
      ): Promise<KeyServiceResult>;

      delete(keyId: string): Promise<KeyServiceResult>;
    }
  }
}
