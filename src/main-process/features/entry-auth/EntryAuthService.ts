import { IMainLogger } from "@/main-process/cores/IMainLog";
import { IEntryAuthService } from "./IEntryAuthService";
import fs from 'fs';

import { MainLogger } from "@/main-process/cores/MainLog";
import crypto from 'crypto';
import { userInfo } from "os";
import { Sha256Coder } from "@/main-process/utils/Sha256Coder";
import { Base64Coder } from "@/main-process/utils/Base64Coder";
import { Argon2Coder } from "@/main-process/utils/Argon2Coder";
// import { IUserCredModel } from "./IUserCredModel";
import { AppContext } from "../app-context/AppContext";
import { AUTH_DIR, USER_INFO_PATH } from "@/main-process/constant";
import { Observable } from "@/main-process/cores/Observable";

// const AUTH_DIR = `./.auth`;
// const USER_INFO_PATH = AUTH_DIR + `/user-cred.txt`;



export class EntryAuthService
    extends Observable<
        EntryAuthResult
    > implements IEntryAuthService {

    private static _instance: EntryAuthService | null = null;

    private _currentAuthState: EntryAuthResult = "unknown-error" 

    set currentAuthState(value: EntryAuthResult) {
        if (value !== this._currentAuthState) {
            this._currentAuthState = value;
            this._logger.log("Entry Auth State changed to: ",this._currentAuthState)
            this.notify(this._currentAuthState);
        }
    }

    get currentAuthState(): EntryAuthResult {
        return this._currentAuthState
    }

    private constructor() {
        super();
        this.checkCurrentAuthState();
    }



    // private _authState: EntryAuthResult | null = null;

    public static getInstance(): EntryAuthService {
        if (EntryAuthService._instance === null) {
            EntryAuthService._instance = new EntryAuthService();
        }
        return EntryAuthService._instance;
    }

    async checkCurrentAuthState(): Promise<EntryAuthResult> {

        if (await this.checkUserExists() === null) { 
            this.currentAuthState = "user-not-found"
            return "user-not-found";
         }

        // If user cred file exists, check if the user is logged in
        const appContext = AppContext.getInstance();
        if (appContext.entryKey) {
            this.currentAuthState = "logged-in"
            return "logged-in"; // User is logged in
        }

        this.currentAuthState = "not-logged-in"
        return "not-logged-in"; // User is not logged in
    }

    /**
     * 
     * @returns {@link IUserCredModel} if user cred file exists and is valid, 
     * @returns null if user cred file does not exist or is invalid
     */
    async checkUserExists(): Promise<IUserCredModel | null> {

        let ret: IUserCredModel | null = null;
        // Verify if the user already exists
        // Check if user info file exists
        if (!fs.existsSync(USER_INFO_PATH)) {
            this._logger.error(`User info file does not exist`);
            this.currentAuthState = "user-not-found"
            return ret; // User does not exist
        }

        // Read user info from file
        try {
            const data = fs.readFileSync(USER_INFO_PATH, 'utf-8');
            const base64Coder = new Base64Coder();
            const userInfo: IUserCredModel = JSON.parse(base64Coder.defaultDecode(data));
            this._logger.log(`User info found for: ${userInfo.name}`);

            // dont send password back
            ret = {
                name: userInfo.name,
                username: userInfo.username || "none",
                password: "" // Clear the password for security
            };
            return ret; // Return the user info if it exists
        } catch (err) {
            this._logger.error('Error reading user info:', err);
            return ret; // Return empty user info if there was an error
        }


    }

    private _logger: IMainLogger = new MainLogger("EntryAuthService");



    async register(name: string, username: string, password: string): Promise<EntryAuthResult> {

        const argon2Coder = new Argon2Coder();
        const base64Coder = new Base64Coder();
        // design for single user app
        // create new dir to save cred
        try {
            fs.mkdirSync(AUTH_DIR, { recursive: true });
            this._logger.log(`Directory created for user: ${name}`);
        } catch (err) {
            this._logger.error('Error creating directory:', err);
            return "error-create-auth-dir";
        }

        // save user info to file
        const userInfo: IUserCredModel = {
            name: name, // Encode name to Base64
            username: username, // Encode username to Base64
            password: await argon2Coder.defaultHash(password)// In a real application, ensure to hash the password before saving
        };



        // Verify if the user already exists
        if (fs.existsSync(USER_INFO_PATH)) {
            this._logger.error(`User already exists: ${name}`);
            return "user-already-exists"; // User already exists
        }

        // create new file for user cred
        try {

            fs.writeFileSync(USER_INFO_PATH,

                base64Coder.defaultEncode(JSON.stringify(userInfo))
                // JSON.stringify(userInfo)
            );

            this._logger.log(`User info saved for: ${name}`);
        } catch (err) {

            this._logger.error('Error writing user info:', err);
            return "unknown-error";

        }

        if (this.currentAuthState !== "logged-in") this.currentAuthState = "not-logged-in"
        return "success"; // Registration successful

    }


    /**
     *
     *
     * @returns 
     */
    async login(password: string): Promise<EntryAuthResult> {

        const base64Coder = new Base64Coder();
        const argon2Coder = new Argon2Coder();


        // Check if user info file exists
        if (!fs.existsSync(USER_INFO_PATH)) {
            this._logger.error(`User info file does not exist`);
            return "user-not-found"; // User does not exist
        }

        // Read user info from file
        let userInfo: IUserCredModel;
        try {
            const data = fs.readFileSync(USER_INFO_PATH, 'utf-8');
            // userInfo = JSON.parse(data);
            userInfo = JSON.parse(base64Coder.defaultDecode(data));
        } catch (err) {
            this._logger.error('Error reading user info:', err);
            return "unknown-error"; // Error reading user info
        }

        // Verify password
        this._logger.log(`Verifying password for user: ${userInfo.name}`, {
            receivedPlainText: password,
            storedHashedPassword: userInfo.password
        });
        const verified: boolean = await argon2Coder.defaultVerify(password, userInfo.password)


        if (!verified) {
            this._logger.error(`Password verification failed`);
            return "password-verification-failed";
        }

        // If password is correct, update entry key in AppContext
        const appContext = AppContext.getInstance();
        appContext.updateEntryKey(password);

        this.currentAuthState = "logged-in"
        return "success" // Login successful
    }


    async logout(): Promise<void> {
        AppContext.getInstance().updateEntryKey(""); // Clear the entry key
        this.currentAuthState = "not-logged-in"
        this._logger.log(`User logged out successfully`);
    }

}