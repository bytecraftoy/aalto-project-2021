CREATE TABLE tag (
  id SERIAL,
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  PRIMARY KEY (id, project_id)
);

CREATE TABLE tagged_nodes (
  node_id INTEGER REFERENCES node(id) ON DELETE CASCADE,
  tag_id INTEGER,
  project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  PRIMARY KEY (node_id, tag_id, project_id),
  FOREIGN KEY (tag_id, project_id) REFERENCES tag(id, project_id) ON DELETE CASCADE

);
