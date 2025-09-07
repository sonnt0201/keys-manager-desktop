import Database from "better-sqlite3";
import { IKeyRepository } from "./IKeyRepository";
import { globalAppDatabase } from "@/main-process/database/AppDatabase";
// import { IKeyModel } from "./IKeyModel";

const MAX_LIMIT = 1000; // Maximum number of keys to return in a single query

export class SQLiteKeyRepository implements IKeyRepository {
    private db: Database.Database = globalAppDatabase.getConnection();

    constructor() {
       this.createTable();
    }

    /**
     * Returns the total number of keys in the database.
     */
    async countKeys(): Promise<number> {
        const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM keys`);
        const row = stmt.get() as { count: number };
        return Number(row.count) ?? 0;
    }

    async createTable(): Promise<void> {
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS keys (
                id TEXT PRIMARY KEY,
                serviceName TEXT NOT NULL,
                serviceUsername TEXT,
                description TEXT,
                encryptedValue TEXT NOT NULL,
                randomSalt TEXT NOT NULL,
                createdAt INTEGER NOT NULL,
                updatedAt INTEGER NOT NULL
            )
        `).run();
    }

    /**
     * Inserts a new key record. This method does not encrypt the key value.
     * It is expected that the key value is already encrypted in Service Layer before calling this method.
     * @param key 
     */
    async createKey(key: IKeyModel): Promise<void> {
        this.db.prepare(`
            INSERT INTO keys (
                id, serviceName, serviceUsername, description, encryptedValue, randomSalt, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            key.id,
            key.serviceName,
            key.serviceUsername ?? null,
            key.description ?? null,
            key.encryptedValue,
            key.randomSalt,
            key.createdAt,
            key.updatedAt
        );
    }

    async findKeys(options: Partial<IKeyModel>): Promise<IKeyModel[] | null> {
        const keys = Object.keys(options);
        if (keys.length === 0) {
            return null;
        }

        const where = keys.map(k => `${k} = ?`).join(" AND ");
        const stmt = this.db.prepare(`SELECT * FROM keys WHERE ${where} LIMIT ${MAX_LIMIT}`);

        const rows = stmt.all(...Object.values(options));
        return rows.length > 0 ? rows.map(row => this.mapRowToModel(row)) : null;
    }

    async findKeysByCreatedTime(filter: {
        mode: 'latest' | 'oldest';
        limit: number;
        start?: number;
        end?: number;
        options?: Partial<Omit<IKeyModel, 'createdAt'>>;
    }): Promise<IKeyModel[]> {
        const conditions: string[] = [];
        const params: any[] = [];

        if (filter.start) {
            conditions.push("createdAt >= ?");
            params.push(filter.start);
        }
        if (filter.end) {
            conditions.push("createdAt <= ?");
            params.push(filter.end);
        }
        if (filter.options) {
            for (const [k, v] of Object.entries(filter.options)) {
                conditions.push(`${k} = ?`);
                params.push(v);
            }
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const order = filter.mode === "latest" ? "DESC" : "ASC";

        const stmt = this.db.prepare(`
            SELECT * FROM keys
            ${where}
            ORDER BY createdAt ${order}
            LIMIT ?
        `);

        const rows = stmt.all(...params, filter.limit <= MAX_LIMIT ? filter.limit : MAX_LIMIT);
        return rows.map(this.mapRowToModel);
    }

    async findKeysByUpdatedTime(filter: {
        mode: 'latest' | 'oldest';
        limit: number;
        start?: number;
        end?: number;
        options?: Partial<Omit<IKeyModel, 'updatedAt'>>;
    }): Promise<IKeyModel[]> {
        const conditions: string[] = [];
        const params: any[] = [];

        if (filter.start) {
            conditions.push("updatedAt >= ?");
            params.push(filter.start);
        }
        if (filter.end) {
            conditions.push("updatedAt <= ?");
            params.push(filter.end);
        }
        if (filter.options) {
            for (const [k, v] of Object.entries(filter.options)) {
                conditions.push(`${k} = ?`);
                params.push(v);
            }
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const order = filter.mode === "latest" ? "DESC" : "ASC";

        const stmt = this.db.prepare(`
            SELECT * FROM keys
            ${where}
            ORDER BY updatedAt ${order}
            LIMIT ?
        `);

        const rows = stmt.all(...params, filter.limit <= MAX_LIMIT ? filter.limit : MAX_LIMIT);
        return rows.map(this.mapRowToModel);
    }

    async findKeyById(id: string): Promise<IKeyModel | null> {
        const stmt = this.db.prepare(`SELECT * FROM keys WHERE id = ? LIMIT 1`);
        const row = stmt.get(id);
        return row ? this.mapRowToModel(row) : null;
    }

    async findKeysByIds(ids: string[]): Promise<IKeyModel[]> {
        if (ids.length === 0) return [];
        const placeholders = ids.map(() => "?").join(",");
        const stmt = this.db.prepare(`SELECT * FROM keys WHERE id IN (${placeholders})`);
        const rows = stmt.all(...ids);
        return rows.map(this.mapRowToModel);
    }

    async updateKey(id: string, key: Partial<Omit<IKeyModel, 'id'>>): Promise<IKeyModel | null> {
        const keys = Object.keys(key);
        if (keys.length === 0) {
            return this.findKeyById(id);
        }

        const assignments = keys.map(k => `${k} = ?`).join(", ");
        const values = Object.values(key);

        this.db.prepare(`
            UPDATE keys SET ${assignments}, updatedAt = ?
            WHERE id = ?
        `).run(...values, Date.now(), id);

        return this.findKeyById(id);
    }

    async deleteKey(id: string): Promise<void> {
        this.db.prepare(`DELETE FROM keys WHERE id = ?`).run(id);
    }

    /**
     * Converts a database row to an IKeyModel instance.
     * @param row 
     * @returns 
     */
    private mapRowToModel(row: any): IKeyModel {
        return {
            id: row.id,
            serviceName: row.serviceName,
            serviceUsername: row.serviceUsername ?? undefined,
            description: row.description ?? undefined,
            encryptedValue: row.encryptedValue,
            randomSalt: row.randomSalt,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        };
    }
}

