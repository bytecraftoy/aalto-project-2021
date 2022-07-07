// Adapted from Flyway's Postgre cleaner, Apache2
// https://github.com/flyway/flyway/blob/1fc8cff5356f9a151ea72e6d216a5586d4a03b31/flyway-core/src/main/java/org/flywaydb/core/internal/database/postgresql/PostgreSQLSchema.java

import { ClientBase } from "pg";

let namespace = "public";
let currentuser = "postgres";

export async function doClean(client: ClientBase) {
    for (const statement of await generateDropStatementsForMaterializedViews(client)) {
        await client.query(statement, []);
    }

    for (const statement of await generateDropStatementsForViews(client)) {
        await client.query(statement, []);
    }

    for (const statement of await generateDropStatementsForTables(client)) {
        await client.query(statement, []);
    }

    for (const statement of await generateDropStatementsForBaseTypes(client, true)) {
        await client.query(statement, []);
    }

    for (const statement of await generateDropStatementsForRoutines(client)) {
        await client.query(statement, []);
    }

    for (const statement of await generateDropStatementsForEnums(client)) {
        await client.query(statement, []);
    }

    for (const statement of await generateDropStatementsForDomains(client)) {
        await client.query(statement, []);
    }

    for (const statement of await generateDropStatementsForSequences(client)) {
        await client.query(statement, []);
    }

    for (const statement of await generateDropStatementsForBaseTypes(client, false)) {
        await client.query(statement, []);
    }

    for (const statement of await generateDropStatementsForExtensions(client)) {
        await client.query(statement, []);
    }
}

async function queryForStringList(client: ClientBase, text: string, ...values: unknown[]): Promise<string[]> {
    return (await client.query({ text, values, rowMode: 'array' })).rows.map(row => row[0]);
}

/**
 * Generates the statements for dropping the extensions in this schema.
 *
 * @return The drop statements.
 * @throws SQLException when the clean statements could not be generated.
 */
async function generateDropStatementsForExtensions(client: ClientBase): Promise<string[]> {
    const statements: string[] = [];

    if (await extensionsTableExists(client)) {
        const extensionNames = await queryForStringList(client,
            "SELECT e.extname " +
            "FROM pg_extension e " +
            "LEFT JOIN pg_namespace n ON n.oid = e.extnamespace " +
            "LEFT JOIN pg_roles r ON r.oid = e.extowner " +
            "WHERE n.nspname=$1 AND r.rolname=$2", namespace, currentuser);

        for (const extensionName of extensionNames) {
            // XXX: injection
            statements.push("DROP EXTENSION IF EXISTS " + extensionName + " CASCADE");
        }
    }

    return statements;
}

async function extensionsTableExists(client: ClientBase): Promise<boolean> {
    return !!(await client.query(
        "SELECT EXISTS ( \n" +
        "SELECT 1 \n" +
        "FROM pg_tables \n" +
        "WHERE tablename = 'pg_extension');")).rows[0];
}

/**
 * Generates the statements for dropping the sequences in this schema.
 *
 * @return The drop statements.
 * @throws SQLException when the clean statements could not be generated.
 */
async function generateDropStatementsForSequences(client: ClientBase): Promise<string[]> {
    const statements: string[] = [];
    const sequenceNames = await queryForStringList(client, "SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema=$1", namespace);

    for (const sequenceName of sequenceNames) {
        // XXX: injection
        statements.push("DROP SEQUENCE IF EXISTS " + namespace + "." + sequenceName);
    }

    return statements;
}

/**
 * Generates the statements for dropping the types in this schema.
 *
 * @param recreate Flag indicating whether the types should be recreated. Necessary for type-function chicken and egg problem.
 * @return The drop statements.
 * @throws SQLException when the clean statements could not be generated.
 */
async function generateDropStatementsForBaseTypes(client: ClientBase, recreate: boolean): Promise<string[]> {
    const rows: Record<string, string>[] = (await client.query(
        "select typname, typcategory from pg_catalog.pg_type t "
        + "left join pg_depend dep on dep.objid = t.oid and dep.deptype = 'e' "
        + "where (t.typrelid = 0 OR (SELECT c.relkind = 'c' FROM pg_catalog.pg_class c WHERE c.oid = t.typrelid)) "
        + "and NOT EXISTS(SELECT 1 FROM pg_catalog.pg_type el WHERE el.oid = t.typelem AND el.typarray = t.oid) "
        + "and t.typnamespace in (select oid from pg_catalog.pg_namespace where nspname = $1) "
        + "and dep.objid is null "
        + "and t.typtype != 'd'",
        [namespace])).rows;

    const statements: string[] = [];
    for (const row of rows) {
        statements.push("DROP TYPE IF EXISTS " + namespace + "." + row.typname + " CASCADE");
    }

    if (recreate) {
        for (const row of rows) {
            // Only recreate Pseudo-types (P) and User-defined types (U)
            if (row.typcategory == "P" || row.typcategory == "U") {
                statements.push("CREATE TYPE " + namespace + "." + row.typname);
            }
        }
    }

    return statements;
}

/**
 * Generates the statements for dropping the routines in this schema.
 *
 * @return The drop statements.
 * @throws SQLException when the clean statements could not be generated.
 */
async function generateDropStatementsForRoutines(client: ClientBase): Promise<string[]> {
    const rows: any[] = (await client.query(
        // Search for all functions
        "SELECT proname, oidvectortypes(proargtypes) AS args, pg_proc.prokind AS prokind "
        + "FROM pg_proc INNER JOIN pg_namespace ns ON (pg_proc.pronamespace = ns.oid) "
        // that don't depend on an extension
        + "LEFT JOIN pg_depend dep ON dep.objid = pg_proc.oid AND dep.deptype = 'e' "
        + "WHERE ns.nspname = $1 AND dep.objid IS NULL",
        [namespace]
    )).rows;

    const statements: string[] = [];
    for (const row of rows) {
        let type = "FUNCTION";
        if (row.prokind == 'a') {
            type = "AGGREGATE";
        } else if (row.prokind == 'p') {
            type = "PROCEDURE";
        }
        statements.push("DROP " + type + " IF EXISTS " + namespace + "." + row.proname + "(" + row.args + ") CASCADE");
    }
    return statements;
}

/**
 * Generates the statements for dropping the enums in this schema.
 *
 * @return The drop statements.
 * @throws SQLException when the clean statements could not be generated.
 */
async function generateDropStatementsForEnums(client: ClientBase): Promise<string[]> {
    const enumNames = await queryForStringList(client, "SELECT t.typname FROM pg_catalog.pg_type t INNER JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = $1 and t.typtype = 'e'", namespace);

    const statements: string[] = [];
    for (const enumName of enumNames) {
        statements.push("DROP TYPE " + namespace + "." + enumName);
    }

    return statements;
}

/**
 * Generates the statements for dropping the domains in this schema.
 *
 * @return The drop statements.
 * @throws SQLException when the clean statements could not be generated.
 */
async function generateDropStatementsForDomains(client: ClientBase): Promise<string[]> {
    const domainNames = await queryForStringList(client,
        "SELECT t.typname as domain_name\n" +
        "FROM pg_catalog.pg_type t\n" +
        "       LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace\n" +
        "       LEFT JOIN pg_depend dep ON dep.objid = t.oid AND dep.deptype = 'e'\n" +
        "WHERE t.typtype = 'd'\n" +
        "  AND n.nspname = $1\n" +
        "  AND dep.objid IS NULL"
        , namespace);

    const statements: string[] = [];
    for (const domainName of domainNames) {
        statements.push("DROP DOMAIN " + namespace + "." + domainName);
    }

    return statements;
}

/**
 * Generates the statements for dropping the materialized views in this schema.
 *
 * @return The drop statements.
 * @throws SQLException when the clean statements could not be generated.
 */
async function generateDropStatementsForMaterializedViews(client: ClientBase): Promise<string[]> {
    const viewNames = await queryForStringList(client,
        "SELECT relname FROM pg_catalog.pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace"
        + " WHERE c.relkind = 'm' AND n.nspname = $1", namespace);

    const statements: string[] = [];
    for (const domainName of viewNames) {
        statements.push("DROP MATERIALIZED VIEW IF EXISTS " + namespace + "." + domainName + " CASCADE");
    }

    return statements;
}

/**
 * Generates the statements for dropping the views in this schema.
 *
 * @return The drop statements.
 * @throws SQLException when the clean statements could not be generated.
 */
async function generateDropStatementsForViews(client: ClientBase): Promise<string[]> {
    const viewNames = await queryForStringList(client,
        // Search for all views
        "SELECT relname FROM pg_catalog.pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace" +
        // that don't depend on an extension
        " LEFT JOIN pg_depend dep ON dep.objid = c.oid AND dep.deptype = 'e'" +
        " WHERE c.relkind = 'v' AND  n.nspname = $1 AND dep.objid IS NULL",
        namespace);
    const statements: string[] = [];
    for (const domainName of viewNames) {
        statements.push("DROP VIEW IF EXISTS " + namespace + "." + domainName + " CASCADE");
    }

    return statements;
}

async function generateDropStatementsForTables(client: ClientBase): Promise<string[]> {
    const tableNames = await queryForStringList(client,
        //Search for all the table names
        "SELECT t.table_name FROM information_schema.tables t" +
        // that don't depend on an extension
        " LEFT JOIN pg_depend dep ON dep.objid = (quote_ident(t.table_schema)||'.'||quote_ident(t.table_name))::regclass::oid AND dep.deptype = 'e'" +
        // in this schema
        " WHERE table_schema=$1" +
        //that are real tables (as opposed to views)
        " AND table_type='BASE TABLE'" +
        // with no extension depending on them
        " AND dep.objid IS NULL" +
        // and are not child tables (= do not inherit from another table).
        " AND NOT (SELECT EXISTS (SELECT inhrelid FROM pg_catalog.pg_inherits" +
        " WHERE inhrelid = (quote_ident(t.table_schema)||'.'||quote_ident(t.table_name))::regclass::oid))",
        namespace
    );
    //Views and child tables are excluded as they are dropped with the parent table when using cascade.

    const tables = [];
    for (const tableName of tableNames) {
        tables.push("DROP TABLE IF EXISTS " + tableName + " CASCADE");
    }
    return tables;
}
