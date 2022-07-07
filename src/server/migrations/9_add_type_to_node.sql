CREATE TABLE node_type (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES project(id),
  label TEXT,
  color TEXT
);

ALTER TABLE node
ADD node_type INTEGER REFERENCES node_type(id) DEFAULT NULL;
