const Database = require('better-sqlite3');

const dbPath = process.env.DB_PATH || '/data/todos.db';
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0
  )
`);

const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;



// GET /todos - show all todos
app.get('/todos', (req, res) => {
  const todos = db.prepare('SELECT * FROM todos').all();
  res.json(todos);
});

// POST /todos - add a new todo
app.post('/todos', (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const result = db.prepare('INSERT INTO todos (title) VALUES (?)').run(title);
  const newTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newTodo);
});

// GET /todos/:id - show one todo
app.get('/todos/:id', (req, res) => {
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  res.json(todo);
});

// PUT /todos/:id - update a todo
app.put('/todos/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  const title = req.body.title ?? existing.title;
  const completed = req.body.completed !== undefined ? (req.body.completed ? 1 : 0) : existing.completed;
  db.prepare('UPDATE todos SET title = ?, completed = ? WHERE id = ?').run(title, completed, req.params.id);
  const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /todos/:id - delete a todo
app.delete('/todos/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  db.prepare('DELETE FROM todos WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

// health check - useful later for Docker
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Todo API running on port ${PORT}`);
});


