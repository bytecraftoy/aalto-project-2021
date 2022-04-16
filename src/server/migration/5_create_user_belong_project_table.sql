CREATE TABLE users__project (
  users_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES project(id) ON DELETE CASCADE
);

ALTER TABLE users__project
ADD CONSTRAINT PK_users__project PRIMARY KEY (users_id, project_id);