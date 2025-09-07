import { IKeyService } from "./IKeyService";
import { IKeyRepository } from "./IKeyRepository";

import { SecondTimePINService, PINResult } from "./SecondTimePINService";

import { Sha256Coder } from "@/main-process/utils/Sha256Coder";
import { Base64Coder } from "@/main-process/utils/Base64Coder";
import { AppContext } from "../app-context/AppContext";
import { ISecondAuthService } from "../second-auth/ISecondAuthService";
import bcrypt from "bcrypt"
import { AESCrypto } from "@/main-process/utils/AESCrypto";
import { v4 as uuidv4 } from 'uuid'
import { IMainLogger } from "@/main-process/cores/IMainLog";
import { MainLogger } from "@/main-process/cores/MainLog";

const LIMIT_KEYS_TO_READ = 50;

export class KeyService implements IKeyService {

    /// dependencies
    private _repo: IKeyRepository;
    private _secondAuthService: ISecondAuthService;

    private _appContext: AppContext = AppContext.getInstance();
    private _sha256Coder: Sha256Coder = new Sha256Coder();
    private _aesCrypto: AESCrypto = new AESCrypto();
    private _base64Coder: Base64Coder = new Base64Coder();
    private _logger: IMainLogger | null = null;
    // private _logger: IMainLogger | null = new MainLogger("KeyService");

    constructor(repo: IKeyRepository,
        secondAuthService: ISecondAuthService,

    ) {
        this._repo = repo;
        this._secondAuthService = secondAuthService

    }



    /// methods
    async countKeys(): Promise<number> {
        if (!this._appContext.entryKey) return -1
        return await this._repo.countKeys();
    }

    async retrieveKeyById(id: string): Promise<IKeyModel | null> {
        return await this._repo.findKeyById(id);
    }

    /**
     * @todo complete the method: handle encryption output - iv, tag and data, save it to database
     * @param params 
     * @param plainPin 
     * @returns 
     */
    async createKey(params: { serviceName: string; serviceUsername?: string; description?: string; rawKeyValue: string }, plainPin: string): Promise<KeyServiceResult> {


        // auth both step first
        if (!this._appContext.entryKey) return "entry-auth-failed";
        if (!this._secondAuthService.verifySecondAuth(plainPin)) return "second-auth-failed"

        try {
            // # do aes encrypt
            // ## create derived key first
            // ### create ikm & salt first
            const hashedEntryAuthKey = this._appContext.entryKey; // already hashed
            const hashedSecondAuthKey = this._sha256Coder.hashToHex(plainPin);


            const ikm = this._sha256Coder.hmacSha256Hex(
                Buffer.from(hashedEntryAuthKey, "utf8"),
                Buffer.from(hashedSecondAuthKey, "utf8")
            ); // ikm - input key material - combination of entry auth key and second auth key (pin)


            //  - gen an random salt
            const randomSalt = bcrypt.genSaltSync(10); // should store it in database row later

            // - and define info for this key
            const info = "KeyService:hkdf-key-for-aes-crypto"


            // ### now we have salt, ikm & key info, let cook the derived key
            const derivedKey = this._sha256Coder.hkdfSha256(
                Buffer.from(ikm),
                Buffer.from(randomSalt),
                Buffer.from(info),
                32
            ) // done making derived key for aes encryption

            // ## we cook the key successfully, now use it to encrypt user's key value (user data)
            const {
                iv,
                tag,
                data
            } = this._aesCrypto.aesGcmEncrypt(
                Buffer.from(derivedKey),
                Buffer.from(params.rawKeyValue)
            )

            // NOTE: THIS IS THE FORMAT OF OUTPUT STRING (BASE64)
            const encryptedValue: string = `v1.gcm.${this._base64Coder.encodeFromBuffer(iv)}.${this._base64Coder.encodeFromBuffer(tag)}.${this._base64Coder.encodeFromBuffer(data)}`

            // # store to database
            // ## construct key object
            const keyToSave: IKeyModel = {
                id: uuidv4(),
                serviceName: params.serviceName,
                serviceUsername: params.serviceUsername,
                encryptedValue: encryptedValue,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                randomSalt: randomSalt
            }

            // - just write
            this._repo.createKey(keyToSave);
            return "success"
        }
        catch (e) {

            this._logger?.error((e as Error).message)
            return "unknown-error"
        }

    }

    async findEncryptedKeys(options: Partial<IKeyModel>): Promise<IKeyModel[] | null> {

        if (!this._appContext.entryKey) return null

        const optionKeys = Object.keys(options);
        if (optionKeys.length === 0) {
            this._logger?.error("Find Encrypted Keys Method: must have at least one filter option.")
            return null;
        }

        return this._repo.findKeys(options);


    }

    async findEncryptedKeysByCreatedTime(filter:
        {
            mode: "latest" | "oldest";
            limit: number;
            start?: number;
            end?: number;
            options?: Partial<Omit<IKeyModel, "createdAt">>;
        }
    ): Promise<IKeyModel[]> {

        if (!this._appContext.entryKey) return [];

        if (filter.limit > LIMIT_KEYS_TO_READ) {
            this._logger?.warn(`Number of keys to read exceeds the limitation, the limitation is ${LIMIT_KEYS_TO_READ}`)
        }


        const validFilter = {
            ...filter,
            limit: (filter.limit <= LIMIT_KEYS_TO_READ) ? filter.limit : LIMIT_KEYS_TO_READ
        }

        return this._repo.findKeysByCreatedTime(validFilter)
    }

   async findEncryptedKeysByUpdatedTime(filter: { mode: "latest" | "oldest"; limit: number; start?: number; end?: number; options?: Partial<Omit<IKeyModel, "updatedAt">>; }): Promise<IKeyModel[]> {
        
        if (!this._appContext.entryKey) return []
        
        if (filter.limit > LIMIT_KEYS_TO_READ) {
            this._logger?.warn(`Number of keys to read exceeds the limitation, the limitation is ${LIMIT_KEYS_TO_READ}`)
        }


        const validFilter = {
            ...filter,
            limit: (filter.limit <= LIMIT_KEYS_TO_READ) ? filter.limit : LIMIT_KEYS_TO_READ
        }

        return this._repo.findKeysByUpdatedTime(validFilter)
    }

    // todo: complete this function
    async decryptKeyValue(key: IKeyModel, secondTimePassword: string): Promise<{ result: KeyServiceResult; decryptedData?: string }> {

        // # auth first (both step)

        if (!this._appContext.entryKey) return ({ result: "entry-auth-failed" });
        if (!this._secondAuthService.verifySecondAuth(secondTimePassword)) return ({ result: "second-auth-failed" })

        // # auth ok, now try to decrypt 
        const encryptedValue = key.encryptedValue
        /// FORMAT: `v1.gcm.${this._base64Coder.encodeFromBuffer(iv)}.${this._base64Coder.encodeFromBuffer(tag)}.${this._base64Coder.encodeFromBuffer(data)}`

        // separate to parts
        const chunks = encryptedValue.split('.');

        // guard
        if (chunks.length !== 5 || chunks[0] !== "v1" || chunks[1] !== "gcm") {
            this._logger?.error("Invalid ciphertext format")
            const result: KeyServiceResult = "decryption-failed"
            return ({
                result
            })
        }


        // get iv, tag and data
        const iv = this._base64Coder.decodeToBuffer(chunks[2]),
            tag = this._base64Coder.decodeToBuffer(chunks[3]),
            data = this._base64Coder.decodeToBuffer(chunks[4])

        // ## reproduce key
        // ### create derived key first
        // #### create ikm & salt first
        const hashedEntryAuthKey = this._appContext.entryKey; // already hashed
        const hashedSecondAuthKey = this._sha256Coder.hashToHex(secondTimePassword);


        try {
            const ikm = this._sha256Coder.hmacSha256Hex(
                Buffer.from(hashedEntryAuthKey, "utf8"),
                Buffer.from(hashedSecondAuthKey, "utf8")
            ); // ikm - input key material - combination of entry auth key and second auth key (pin)


            //  use available random salt
            const randomSalt = key.randomSalt; // should store it in database row later

            // - and define info for this key
            const info = "KeyService:hkdf-key-for-aes-crypto"


            // ### now we have salt, ikm & key info, let cook the derived key
            const derivedKey = this._sha256Coder.hkdfSha256(
                Buffer.from(ikm),
                Buffer.from(randomSalt),
                Buffer.from(info),
                32
            ) // done making derived key for aes encryption

            // it's decrypting time !!!
            const decrypted = this._aesCrypto.aesGcmDecrypt(
                Buffer.from(derivedKey),
                iv,
                tag,
                data
            )

            const decryptedString = decrypted.toString("utf8");

            return ({
                result: "success",
                decryptedData: decryptedString
            })

        } catch (e) {
            this._logger?.error((e as Error).message);
            return ({
                result: "unknown-error"

            })
        }


    }

    async updateKey(keyToUpdate: IKeyModel, params: { serviceName: string; serviceUsername?: string; description?: string; rawKeyValue?: string }, plainPin?: string): Promise<KeyServiceResult> {

         if (!this._appContext.entryKey) return "entry-auth-failed";

        let newKey: IKeyModel = {
            ...keyToUpdate,
            serviceName: params.serviceName || keyToUpdate.serviceName,
            serviceUsername: params.serviceUsername || keyToUpdate.serviceUsername,
            description: params.description || keyToUpdate.description
        }

        /// if key's value does not changes, means that actually dont need pin, and just do quick update
        if (!params.rawKeyValue) {
            this._repo.updateKey(keyToUpdate.id, newKey);
            return "success"
        }

        /// if update key's value, must operate like {@link createKey}
        // auth both step first
       
        if (!plainPin || !this._secondAuthService.verifySecondAuth(plainPin)) return "second-auth-failed"

        try {
            // # do aes encrypt
            // ## create derived key first
            // ### create ikm & salt first
            const hashedEntryAuthKey = this._appContext.entryKey; // already hashed
            const hashedSecondAuthKey = this._sha256Coder.hashToHex(plainPin);


            const ikm = this._sha256Coder.hmacSha256Hex(
                Buffer.from(hashedEntryAuthKey, "utf8"),
                Buffer.from(hashedSecondAuthKey, "utf8")
            ); // ikm - input key material - combination of entry auth key and second auth key (pin)


            //  - gen an random salt
            const randomSalt = bcrypt.genSaltSync(10); // should store it in database row later

            // - and define info for this key
            const info = "KeyService:hkdf-key-for-aes-crypto"


            // ### now we have salt, ikm & key info, let cook the derived key
            const derivedKey = this._sha256Coder.hkdfSha256(
                Buffer.from(ikm),
                Buffer.from(randomSalt),
                Buffer.from(info),
                32
            ) // done making derived key for aes encryption

            // ## we cook the key successfully, now use it to encrypt user's key value (user data)
            const {
                iv,
                tag,
                data
            } = this._aesCrypto.aesGcmEncrypt(
                Buffer.from(derivedKey),
                Buffer.from(params.rawKeyValue)
            )

            // NOTE: THIS IS THE FORMAT OF OUTPUT STRING (BASE64)
            const encryptedValue: string = `v1.gcm.${this._base64Coder.encodeFromBuffer(iv)}.${this._base64Coder.encodeFromBuffer(tag)}.${this._base64Coder.encodeFromBuffer(data)}`

            newKey = {
                ...newKey,
                encryptedValue: encryptedValue,
                randomSalt: randomSalt,
                updatedAt: Date.now()
            }

            this._repo.updateKey(keyToUpdate.id, newKey)
            return "success"
        } catch (e) {
            this._logger?.log("Error when update key object", (e as Error).message)
            return "unknown-error"
        }

    }

    async deleteKey(keyId:  string): Promise<KeyServiceResult> {
        // entry auth first
        if (!this._appContext.entryKey) return "entry-auth-failed";
        try {
             this._repo.deleteKey(keyId);
             return "success"
        } catch(e) {
            this._logger?.error("Error deleting key object", (e as Error).message)
            return "unknown-error"
        }

       
    }

}
