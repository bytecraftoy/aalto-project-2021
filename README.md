# Project

## How to run

### Development mode

Front-end:

```bash
# Go inside the directory
cd src/client

# Install dependencies (No need after first time)
npm install

# Start development server
npm run start
```

Documentation:

```bash
# Go inside the directory
cd src/docs

# Install dependencies (No need after first time)
npm install

# Start development server
npm start
```

Back-end:

```bash
# Go inside the directory
cd src/server

# Install dependencies (No need after first time)
npm install

# Start development server
npm run dev
```

Postgres:

```bash
# IF you need to reset db, do this first
docker-compose down

# Go inside the directory
docker-compose up -d
```

Cypress:

```bash

# Start Cypress
npm run cypress:open
```

Prettier:

```bash
# In the root directory
npm run prettier:write
```
