
/**
 * A key (password, API key, etc.) that managed by this app.
 * 
 * This is the core data to manage
 */
declare interface IKeyModel {
    id: string; // Unique identifier for the key
    serviceName: string; // name of the service associated with the key (app, website, etc.)
    serviceUsername?: string; // Username associated with the key and service
    description?: string; // Optional description of the key
    encryptedValue: string; // The actual encrypted key value (e.g., API key, password)
    createdAt: number; // Timestamp when the key was created
    updatedAt: number; // Timestamp when the key was last updated
    randomSalt: string; // base64-encoded random salt used for encryption
}

declare interface IUserInputKey {
    serviceName: string;
    serviceUsername?: string
    description?: string
    rawKeyValue: string
}
