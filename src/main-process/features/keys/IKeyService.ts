
/**
 * Seed: argon2-hashed password
 * 
 * Salt: store in corresponding Key row of database.
 * 
 */



export interface IKeyService {


    // 2nd pin related methods


    countKeys(): Promise<number>;


    /// private methods
    retrieveKeyById(id: string): Promise<IKeyModel | null>;

    // retrieveUltimateSalt(contextSalt: string, storedRandomSalt: string): string; // retrive a salt for encryption, Ultimate =  Context Salt + Random Salt 

    // _getSeed(): string | null; // actually get current password hash save in app context

    // _encryptKey(keyValue: string, seed: string, salt: string): string;

    // _decryptKey(encryptedValue: string, seed: string, salt: string): string;

    /// public methods

    /**
     * Create a single key record
     * @param params 
     * @param plainPin 
     */
    createKey(params: {
        serviceName: string;
        serviceUsername?: string;
        description?: string;
        rawKeyValue: string;

    },
        plainPin: string // context salt = HMAC_SHA256(key = hashedEntryPassword, data = hashedSecondPIN)
    ): Promise<KeyServiceResult>;

    findEncryptedKeys(options: Partial<IKeyModel>): Promise<IKeyModel[] | null>;

    findEncryptedKeysByCreatedTime(filter: {
        mode: 'latest' | 'oldest';
        limit: number;
        start?: number;
        end?: number;
        options?: Partial<Omit<IKeyModel, 'createdAt'>>;
    }): Promise<IKeyModel[]>;

    findEncryptedKeysByUpdatedTime(filter: {
        mode: 'latest' | 'oldest';
        limit: number;
        start?: number;
        end?: number;
        options?: Partial<Omit<IKeyModel, 'updatedAt'>>;
    }): Promise<IKeyModel[]>;

    /**
     * Abstract method to decrypt a key by its unique identifier.
     * @param id id of the key object to decrypt.
     * @return The decrypted key value or null if not found.
     */
    decryptKeyValue(key: IKeyModel, secondTimePassword: string): Promise<{
        result: KeyServiceResult,
        decryptedData?: string 
    }>;

     updateKey(keyToUpdate: IKeyModel, params: { serviceName?: string; serviceUsername?: string; description?: string; rawKeyValue?: string }, plainPin?: string): Promise<KeyServiceResult> 

      deleteKey(keyId:  string): Promise<KeyServiceResult>

}