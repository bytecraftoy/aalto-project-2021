CREATE TABLE users__node (
    users_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    node_id INTEGER REFERENCES node(id) ON DELETE CASCADE,
    PRIMARY KEY (users_id, node_id)
);
