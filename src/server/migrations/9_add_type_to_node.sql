CREATE TABLE node_type (
  id SERIAL,
  project_id INTEGER REFERENCES project(id),
  label TEXT,
  color TEXT,
  PRIMARY KEY (id, project_id)
);

ALTER TABLE node
ADD node_type INTEGER DEFAULT NULL;
ALTER TABLE node
ADD FOREIGN KEY (node_type, project_id) REFERENCES node_type (id, project_id);
