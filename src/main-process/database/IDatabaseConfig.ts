export interface IDatabaseConfig {
  version: string;
  description: string;
  database: {
    // name: string;
    path: string;
    options: {
      verbose: boolean;
      foreignKeys: boolean;
      journalMode: 'DELETE' | 'TRUNCATE' | 'PERSIST' | 'MEMORY' | 'WAL' | 'OFF';
    };
  };
//   tables: TableConfig[];
}

// interface TableConfig {
//   name: string;
//   columns: ColumnConfig[];
// }

// interface ColumnConfig {
//   name: string;
//   type: 'TEXT' | 'INTEGER' | 'REAL' | 'BLOB' | 'NUMERIC';
//   primaryKey?: boolean;
//   autoIncrement?: boolean;
//   notNull?: boolean;
//   unique?: boolean;
//   foreignKey?: ForeignKeyConfig;
// }

// interface ForeignKeyConfig {
//   references: {
//     table: string;
//     column: string;
//   };
//   onUpdate?: 'CASCADE' | 'SET NULL' | 'SET DEFAULT' | 'RESTRICT' | 'NO ACTION';
//   onDelete?: 'CASCADE' | 'SET NULL' | 'SET DEFAULT' | 'RESTRICT' | 'NO ACTION';
// }
