import { ipcRenderer, contextBridge } from 'electron'
/**
 * 
 * @file CAUTIOUS: This file is executed in the Renderer process.
 */

// --------- Preload scripts loading ---------
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise(resolve => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = (ev) => {
  ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 4999)

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // ================== USER-DEFINED APIs (CAUTIOUS: ALL THOSE CODES ARE PUT ON RENDERER-SIDE) ===================
  removeAllListener: () => { ipcRenderer.removeAllListeners() },
  removeAllListenersOfChannel: (channel: string) => { ipcRenderer.removeAllListeners(channel) },
  echo: (message: string) => ipcRenderer.invoke('echo:echo', message),

  // ==================== ENTRY AUTH APIs =========================
  registerUser: (userCred: IUserCredModel) => ipcRenderer.invoke('entry-auth:register', userCred),
  login: (password: string) => ipcRenderer.invoke('entry-auth:login', password),
  checkUserExists: () => ipcRenderer.invoke('entry-auth:check'),
  authState: () => ipcRenderer.invoke('entry-auth:state'),

  onEntryAuthUpdated: (
    callback: (state: EntryAuthResult) => void
  ) => ipcRenderer.on("entry-auth:state", (_event, value) => callback(value)),


  // ================== SECOND AUTH API ======================
  secondAuth: {
    create: (pin: string): Promise<SecondAuthResult> =>
      ipcRenderer.invoke("second-auth:create", pin),

    verify: (pin: string): Promise<SecondAuthResult> =>
      ipcRenderer.invoke("second-auth:verify", pin),

    isAvailable: (): Promise<boolean> =>
      ipcRenderer.invoke("second-auth:is-available"),

    remove: (): Promise<SecondAuthResult> =>
      ipcRenderer.invoke("second-auth:remove"),
  },

  // ================== KEY CONTROLLER APIs ===================
  key: {
    count: () => ipcRenderer.invoke('key:count'),
    getById: (id: string) => ipcRenderer.invoke('key:getById', id),
    create: (
      params: {
        serviceName: string
        serviceUsername?: string
        description?: string
        rawKeyValue: string
      },
      plainPin: string
    ) => ipcRenderer.invoke('key:create', params, plainPin),
    find: (options: Partial<IKeyModel>) =>
      ipcRenderer.invoke('key:find', options),
    findByCreated: (filter: {
      mode: 'latest' | 'oldest'
      limit: number
      start?: number
      end?: number
      options?: Partial<Omit<IKeyModel, 'createdAt'>>
    }) => ipcRenderer.invoke('key:findByCreated', filter),
    findByUpdated: (filter: {
      mode: 'latest' | 'oldest'
      limit: number
      start?: number
      end?: number
      options?: Partial<Omit<IKeyModel, 'updatedAt'>>
    }) => ipcRenderer.invoke('key:findByUpdated', filter),
    decrypt: (key: IKeyModel, secondTimePassword: string) =>
      ipcRenderer.invoke('key:decrypt', key, secondTimePassword),

    update: (
      keyToUpdate: IKeyModel,
      params: { serviceName?: string; serviceUsername?: string; description?: string; rawKeyValue?: string },
      plainPin?: string
    ): Promise<KeyServiceResult> =>
      ipcRenderer.invoke("key:update", keyToUpdate, params, plainPin),

    delete: (keyId: string): Promise<KeyServiceResult> =>
      ipcRenderer.invoke("key:delete", keyId),
  },


})

// contextBridge.exposeInMainWorld('EntryAuthResult', EntryAuthResult);