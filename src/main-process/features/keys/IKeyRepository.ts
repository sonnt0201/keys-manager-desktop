/**
 * Repository interface for managing Key entities.
 * Defines CRUD operations and time-based queries.
 */
export interface IKeyRepository {

    /**
     * Creates the underlying table or schema for keys.
     */
    createTable(): Promise<void>;

    /**
     * Inserts a new key record.
     * @param key The key model to insert.
     */
    createKey(key: IKeyModel): Promise<void>;

    /**
     * Finds a single key matching optional filter criteria.
     * @param options Partial fields to filter by.
     * @returns A matching key or null if none found.
     */
    findKeys(options: Partial<IKeyModel>): Promise<IKeyModel[] | null>;

    /**
     * Finds keys ordered by creation time.
     * @param filter.mode Sort order: 'latest' = most recent first, 'oldest' = earliest first.
     * @param filter.limit Maximum number of keys to return.
     * @param filter.start Optional start timestamp (inclusive).
     * @param filter.end Optional end timestamp (inclusive).
     * @param filter.options Additional filters (excluding `createdAt`).
     * @returns List of matching keys.
     */
    findKeysByCreatedTime(filter: {
        mode: 'latest' | 'oldest';
        limit: number;
        start?: number;
        end?: number;
        options?: Partial<Omit<IKeyModel, 'createdAt'>>;
    }): Promise<IKeyModel[]>;

    /**
     * Finds keys ordered by updated time.
     * @param filter.mode Sort order: 'latest' = most recent first, 'oldest' = earliest first.
     * @param filter.limit Maximum number of keys to return.
     * @param filter.start Optional start timestamp (inclusive).
     * @param filter.end Optional end timestamp (inclusive).
     * @param filter.options Additional filters (excluding `updatedAt`).
     * @returns List of matching keys.
     */
    findKeysByUpdatedTime(filter: {
        mode: 'latest' | 'oldest';
        limit: number;
        start?: number;
        end?: number;
        options?: Partial<Omit<IKeyModel, 'updatedAt'>>;
    }): Promise<IKeyModel[]>;

    /**
     * Finds a key by its unique identifier.
     * @param id The key's ID.
     * @returns The matching key or null if not found.
     */
    findKeyById(id: string): Promise<IKeyModel | null>;

    /**
     * Finds multiple keys by their IDs.
     * @param ids Array of key IDs.
     * @returns List of matching keys.
     */
    findKeysByIds(ids: string[]): Promise<IKeyModel[]>;

    /**
     * Updates a key by its ID.
     * @param id The ID of the key to update.
     * @param key Partial fields to update (excluding `id`).
     * @returns The updated key, or null if not found.
     */
    updateKey(id: string, key: Partial<Omit<IKeyModel, 'id'>>): Promise<IKeyModel | null>;

    /**
     * Deletes a key by its ID.
     * @param id The ID of the key to delete.
     */
    deleteKey(id: string): Promise<void>;

    /**
     * counts the total number of keys.
     */
    countKeys(): Promise<number>;
}
