import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Ocean Professional Todo App
 * - Single-page layout with header, input+add, and vertically scrolling list
 * - Users can add, remove, and manage tasks (complete, filter, clear completed)
 * - All functionality is client-side only; no backend
 */

// Helpers
const STORAGE_KEY = 'ocean_pro_todos_v1';
const THEME_KEY = 'ocean_pro_theme_v1';

// Types
/**
 * @typedef {Object} Todo
 * @property {string} id
 * @property {string} text
 * @property {boolean} completed
 * @property {number} createdAt
 */

// PUBLIC_INTERFACE
function App() {
  /** Theme handling */
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  /** Todos State */
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  /** Derived data */
  const filtered = useMemo(() => {
    if (filter === 'active') return todos.filter(t => !t.completed);
    if (filter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }, [todos, filter]);

  const remaining = useMemo(() => todos.filter(t => !t.completed).length, [todos]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  // PUBLIC_INTERFACE
  const addTodo = () => {
    const text = newTodo.trim();
    if (!text) return;
    const todo = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos(prev => [todo, ...prev]);
    setNewTodo('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addTodo();
  };

  // PUBLIC_INTERFACE
  const removeTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  // PUBLIC_INTERFACE
  const toggleComplete = (id) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // PUBLIC_INTERFACE
  const clearCompleted = () => {
    setTodos(prev => prev.filter(t => !t.completed));
  };

  // PUBLIC_INTERFACE
  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  // PUBLIC_INTERFACE
  const saveEditing = (id) => {
    const text = editingText.trim();
    if (!text) {
      removeTodo(id);
    } else {
      setTodos(prev => prev.map(t => (t.id === id ? { ...t, text } : t)));
    }
    setEditingId(null);
    setEditingText('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  return (
    <div className="App ocean-app">
      <header className="ocean-header">
        <div className="ocean-header-top">
          <h1 className="ocean-title">
            <span className="ocean-title-accent">●</span> Ocean Tasks
          </h1>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>

        <p className="ocean-subtitle">
          Stay on course with a clean, modern todo manager.
        </p>

        <div className="ocean-input-row">
          <input
            className="ocean-input"
            type="text"
            placeholder="Add a new task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="New task"
          />
          <button
            className="ocean-btn ocean-btn-primary"
            onClick={addTodo}
            aria-label="Add task"
          >
            Add
          </button>
        </div>

        <div className="ocean-toolbar">
          <div className="ocean-filters" role="tablist" aria-label="Filter tasks">
            <button
              className={`ocean-chip ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
              role="tab"
              aria-selected={filter === 'all'}
            >
              All
            </button>
            <button
              className={`ocean-chip ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
              role="tab"
              aria-selected={filter === 'active'}
            >
              Active
            </button>
            <button
              className={`ocean-chip ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
              role="tab"
              aria-selected={filter === 'completed'}
            >
              Completed
            </button>
          </div>

          <div className="ocean-stats">
            <span className="ocean-remaining">
              {remaining} remaining
            </span>
            <button
              className="ocean-btn ocean-btn-amber ghost"
              onClick={clearCompleted}
              disabled={todos.length === remaining}
              title="Clear completed tasks"
            >
              Clear completed
            </button>
          </div>
        </div>
      </header>

      <main className="ocean-main">
        <section className="ocean-list" aria-live="polite">
          {filtered.length === 0 ? (
            <div className="ocean-empty">
              <div className="ocean-empty-badge">No tasks</div>
              <p className="ocean-empty-text">
                Add a task above to get started.
              </p>
            </div>
          ) : (
            <ul className="ocean-todos">
              {filtered.map((todo) => (
                <li key={todo.id} className={`ocean-todo ${todo.completed ? 'done' : ''}`}>
                  <label className="ocean-checkbox">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleComplete(todo.id)}
                      aria-label={`Mark "${todo.text}" ${todo.completed ? 'incomplete' : 'complete'}`}
                    />
                    <span className="ocean-checkbox-box" aria-hidden="true" />
                  </label>

                  {editingId === todo.id ? (
                    <input
                      className="ocean-input ocean-edit-input"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onBlur={() => saveEditing(todo.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEditing(todo.id);
                        if (e.key === 'Escape') cancelEditing();
                      }}
                      autoFocus
                    />
                  ) : (
                    <span
                      className="ocean-todo-text"
                      onDoubleClick={() => startEditing(todo)}
                      title="Double-click to edit"
                    >
                      {todo.text}
                    </span>
                  )}

                  <div className="ocean-actions">
                    {editingId === todo.id ? (
                      <button
                        className="ocean-btn ocean-btn-primary small"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => saveEditing(todo.id)}
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        className="ocean-btn ocean-btn-amber small ghost"
                        onClick={() => startEditing(todo)}
                        title="Edit"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      className="ocean-btn ocean-btn-danger small ghost"
                      onClick={() => removeTodo(todo.id)}
                      aria-label={`Delete ${todo.text}`}
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="ocean-footer">
        <span className="ocean-brand">Ocean Professional</span>
      </footer>
    </div>
  );
}

export default App;
