import { Observable } from "@/main-process/cores/Observable";
import { Sha256Coder } from "@/main-process/utils/Sha256Coder";

/**
 * Private, do not expose this to IPC
 */
export class AppContext extends Observable<AppEvent> {
    private static _instance: AppContext | null = null;

    private constructor() {
        super();
        // Private constructor to prevent instantiation
    }

    public static getInstance(): AppContext {
        if (AppContext._instance === null) {
            AppContext._instance = new AppContext();
        }
        return AppContext._instance;
    }

    /**
     * Key from  entry auth, to decrypt all the metadata (e.g. user info, app name, etc.), not used to 
     * decrypt the main passwords 
     * 
     * Temporarily exists when app session  
     * 
     * entry auth raw password (received from ipc) --|sha256|--> key
     */
    private _entryKey: string | null = null;

    /**
     *  Entry key (SHA256-hashed entry auth password)
     * @returns entry key, null if not logged in
     */
    public get entryKey(): string | null {
        return this._entryKey;
    }

    /**
     * Call when login successfully
     * @param entryAuthPassword entry auth raw password  
     */
    public updateEntryKey(entryAuthPassword: string): void {
            const sha256Coder = new Sha256Coder();
            this._entryKey = sha256Coder.hashToHex(entryAuthPassword);
            
            this.notify("entry-key-updated");
    }




}

