--sql commands here
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE node (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL
);

CREATE TABLE edge (
  source_id INTEGER REFERENCES node(id),
  target_id INTEGER REFERENCES node(id)
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username citext NOT NULL,
  password TEXT NOT NULL,
  email citext NOT NULL,
  UNIQUE (username),
  UNIQUE (email)
);

ALTER TABLE edge
ADD CONSTRAINT PK_edge PRIMARY KEY (source_id, target_id);
