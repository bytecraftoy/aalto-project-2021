---
name: internal documentation
---

# Internal Documentation

This page has information useful for running, building and developing the program.

## General

This program is a three-tier webapp developed and ran with React, Typescript, Node, Express and PostgreSQL.

The following programs will need to be installed:

-   Node.js (v16.13.2 or later)
-   npm (8.1.2 or later)

The following programs be beneficial for development:

-   Docker (20.10.12 or later)

## Development Build

Npm packages will need to be installed/updated in every folder npm scripts are ran in with the following command:

    npm install

### Database

If no database information is provided in [environment variables](#environment-variables), default values for credentials are used. To conveniently launch a databse with those credentials in a docker container, run the following command at project root:

    docker-compose up -d

To use another database, see [environment variables](#environment-variables).

### Server

To lauch the server, run the following command at `src/server/`:

    npm run dev

This will lauch the server at the port designated in [environment variables](#environment-variables), or 8050 if not defined. Nodemon will automatically restart the server when it detects file changes.

**NOTE** For the server to function, a [database](#database) connection is required.

### Client

To launch the client, run the following command at `src/client/`:

    npm start

This will launch the client server at port 3000, and open a browser window with the application. The client server will automatically restart on file changes, but a manual refresh in browser may be required.

**NOTE** For the client to function properly, the [server](#server) has to be running.

### Documentation Portal

To launch the documentation portal, run the following command at `src/docs/`:

    npm start

Like with the client, this will launch the documentation server at port 3000, and open a browser window with the documentation pages.

## Production build

To get an efficient production build of the program, run the following at project root:

    npm build

This will place a production build in `build/`. The server is transcompiled to javascript, and the client and documentation pages are compiled and served as static files.

The production build can be launched with the following command:

    npm start

## Environment variables

| Variable    | Default       | Description                                                 |
| ----------- | ------------- | ----------------------------------------------------------- |
| PORT        | `8050`        | Server port                                                 |
| NODE_ENV    |               | Node environment: `'test'`, `'development'`, `'production'` |
| PG_HOSTNAME | `'localhost'` | Database hostname                                           |
| PG_PORT     | `5432`        | Database port                                               |
| PG_USER     | `'postgres'`  | Database user                                               |
| PG_DATABASE | `'postgres'`  | Database name                                               |
| PG_PASSWORD | `'example'`   | Database password                                           |
| SECRET      | `'secret'`    | Used for encrypring the json webtoken                       |

## Automated testing

### Unit Tests

To run the automated unit tests for client and server, run the following command at `src/client/` or `src/server/`, respectively:

    npm run test

The tests are located at `src/client/src/tests/` and `src/server/tests`.

### Integration Tests

To run the automated integration tests, open the [client](#client) and [server](#server), and run the following command at project root:

    npm run cypress

The tests are located at `/cypress/integration`.

## Develpment

### Making Database Changes

This project uses database migrations that can be found at `src/server/migrations/`.

To make changes to the database, a new migration SQL file will need to be added to the migrations folder with an incremental number prefix in the file name (e.g. If the file with the highest prefix in the folder is `6_create_user_assign_tables.sql`, the next file would need to be named something like `7_FILENAME.sql`).

**NOTE** Once a migration has been run, it cannot be modified without nuking the database. Therefore, if changes to the database structure are needed, a new file will need to always be created.

### Changing Backend Functionality

Most backend functionality is at `src/server/route/routes/`, `src/server/middlewares/` and `src/server/helper/`. `src/server/` also contains `dbConfig.ts`, which defines the database object used elsewhere in the server, and `index.ts`, which actually launches the server.

To add new API endpoints, create or modify a file in `src/server/routes/route`. If a new file is created, its router will need to be imported and exported at `src/server/route/index.ts`. If a new path is created, it will need to be added to `src/server/route/path.ts`.

Unit tests are at `src/server/tests/`.

### Changing Frontend Functionality

Frontend services are at `src/client/src/services`, and React components at `src/client/src/components`. `src/client/src` contains the main app file `App.tsx`, as well as CSS files.

When making requests to the server, use the `axiosWrapper` funcion from `src/client/src/services/axiosWrapper`. This will wrap the axios promises to show a toast notification to the user instead of throwing an exception. Example:

    import axios from 'axios';
    import { axiosWrapper } from './axiosWrapper';

    const getStuff = async (): Promise<StuffType | undefined> => {
        return (await axiosWrapper(axios.get<StuffType>('/url/for/stuff')));
    };
