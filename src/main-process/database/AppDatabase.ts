import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import path from 'node:path';
import type { IDatabaseConfig } from './IDatabaseConfig'; 
import { databaseConfig } from './databaseConfig';
import { IMainLogger } from '../cores/IMainLog';
import { MainLogger } from '../cores/MainLog';
import { __dirname } from '../cores/path';
class AppDatabase {
  private db: DatabaseType;
  private static instance: AppDatabase | null = null;

  private logger: IMainLogger = new MainLogger("AppDatabase");

  private constructor(config: IDatabaseConfig) {
    const dbPath = path.isAbsolute(config.database.path)
      ? config.database.path
      : path.join(__dirname, config.database.path);

    this.db = new Database(dbPath, {
      verbose: config.database.options.verbose ? console.log : undefined
    });

    const { options } = config.database;

    if (options.journalMode) {
      this.db.pragma(`journal_mode = ${options.journalMode}`);
    }

    if (options.foreignKeys !== undefined) {
      this.db.pragma(`foreign_keys = ${options.foreignKeys ? 'ON' : 'OFF'}`);
    }

  
    this.logger.log(`Database connected at ${dbPath}`);
    this.logger.log(`- Journal Mode: ${this.db.pragma('journal_mode', { simple: true })}`);
    this.logger.log(`- Foreign Keys: ${this.db.pragma('foreign_keys', { simple: true }) === 1 ? 'ON' : 'OFF'}`);
    this.logger.log(`- User Version: ${this.db.pragma('user_version', { simple: true })}`);

    process.on('exit', () => this.db.close());
    process.on('SIGHUP', () => process.exit(128 + 1));
    process.on('SIGINT', () => process.exit(128 + 2));
    process.on('SIGTERM', () => process.exit(128 + 15));
  }

  public static getInstance(config: IDatabaseConfig): AppDatabase {
    if (!AppDatabase.instance) {
      AppDatabase.instance = new AppDatabase(config);
    }
    return AppDatabase.instance;
  }

  public getConnection(): DatabaseType {
    return this.db;
  }
}

/**
 * App database instance for global use.
 * This instance is created with the configuration defined in  {@link databaseConfig}.
 */
export const globalAppDatabase = AppDatabase.getInstance(databaseConfig);