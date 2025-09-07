import { AUTH_DIR, PIN_FILE } from "@/main-process/constant";
import { AppContext } from "../app-context/AppContext";
import { ISecondAuthService } from "./ISecondAuthService";
import { Argon2Coder } from "@/main-process/utils/Argon2Coder";
import fs from 'fs'
import { IMainLogger } from "@/main-process/cores/IMainLog";
import { MainLogger } from "@/main-process/cores/MainLog";
/**
 * auth using PIN method, using argon2 to hash, store and validate.
 * 
 * Use SHA256-hashed entry password as seed.
 */
export class SecondAuthWithPIN implements ISecondAuthService {

    private _argon2Coder = new Argon2Coder();
    private _appContext = AppContext.getInstance();
    private _logger: IMainLogger | undefined = undefined;
    // private _logger: IMainLogger | undefined = new MainLogger("SecondAuthWithPIN");
    async createSecondAuth(plainSecondAuthInput: string): Promise<SecondAuthResult> {
        const seed = this._appContext.entryKey
        if (!seed) return "entry-auth-failed"

        // FORMAT TO HASH
        const keyToHash = `${seed}:${plainSecondAuthInput}`;

        try {

            // check if already exist
            // Verify if the user already exists
            if (fs.existsSync(PIN_FILE)) {
                this._logger?.error(`2nd auth PIN cred already exists: ${name}`);
                return "auth-method-already-set"; // PIN cred already exists
            }

            // main logic - hash and create cred file
            const hashed = await this._argon2Coder.highSecurityHash(keyToHash);
            fs.mkdirSync(AUTH_DIR, { recursive: true });
            fs.writeFileSync(PIN_FILE, hashed, { encoding: "utf8", flag: "w" });
            return "success"


        } catch {
            return "unknown-error"
        }

    }

    async verifySecondAuth(plainSecondAuthInput: string): Promise<SecondAuthResult> {

        // FORMAT TO VERIFY - SAME AS FORMAT TO HASH
        const keyToVerify = `${this._appContext.entryKey}:${plainSecondAuthInput}`

        // Check if 2nd auth cred file exists
        if (!fs.existsSync(PIN_FILE)) {
            this._logger?.error(`2nd auth cred file does not exist`);
            return "auth-method-not-set"; // cred file does not exist
        }

        // main logic - read stored cred and validate.
        try {
            // read from stored cred
            const storedHash = fs.readFileSync(PIN_FILE, "utf8");
            const result = await this._argon2Coder.highSecurityVerify(keyToVerify, storedHash);
            return result ? "success" : "authentication-failed"

        } catch (e) {
            this._logger?.error((e as Error).message);
            return "unknown-error"
        }



    }

    async isSecondAuthAvailable(): Promise<boolean> {
        // Check if 2nd auth cred file exists
        if (!fs.existsSync(PIN_FILE)) {
            this._logger?.log(`2nd auth cred file does not exist`);
            return false; // cred file does not exist
        }

        return true;
    }
    
    async removeSecondAuth(): Promise<SecondAuthResult> {
        try {
            fs.unlinkSync(PIN_FILE);
            return "success"
        } catch (e) {
            this._logger?.error((e as Error).message)
            return "unknown-error"
        }

    }

}