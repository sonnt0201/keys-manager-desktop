
import { Handle, IPCController } from "@/ipc/decorators";
import { IMainLogger } from "@/main-process/cores/IMainLog";
import { MainLogger } from "@/main-process/cores/MainLog";
import { EntryAuthService } from "./EntryAuthService";
import { IEntryAuthService } from "./IEntryAuthService";
import { IObserver } from "@/main-process/cores/IObserver";
import { mainWin } from "@/main-process";

@IPCController({ prefix: "entry-auth" })
class EntryAuthController implements IObserver<EntryAuthResult>{

    _logger: IMainLogger | undefined = undefined
    // = new MainLogger("EntryAuthStateController");

    private _entryAuthService: IEntryAuthService = EntryAuthService.getInstance();

    constructor() {
        this._entryAuthService.subcribe(this)
    }

    update(data: EntryAuthResult): void {
        mainWin?.webContents.send("entry-auth:state", data);
    }

    @Handle("state")
    async state(event: any, message: null = null): Promise<EntryAuthResult> {
        this._logger?.log("Checking current auth state");
        return await this._entryAuthService.checkCurrentAuthState();
    }

    @Handle("register")
    async register(event: any, message: IUserCredModel): Promise<EntryAuthResult> {
        return await this._entryAuthService.register(message.name, message.username, message.password);
    }

    @Handle("login")
    async login(event: any, password: string): Promise<EntryAuthResult> {
         return await this._entryAuthService.login(password);
    }

    @Handle("check")
    async check (event: any, message: null = null) : Promise <IUserCredModel | null> {
        this._logger?.log( "Checking if user exists...");
        return await this._entryAuthService.checkUserExists();
    }

    @Handle("logout")
    async logout (event: any): Promise<void> {
        return await this._entryAuthService.logout()
    }

}