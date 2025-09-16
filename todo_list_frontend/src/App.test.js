import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders header and allows adding a todo', () => {
  render(<App />);

  // Header title
  expect(screen.getByText(/Ocean Tasks/i)).toBeInTheDocument();

  // Add a todo
  const input = screen.getByPlaceholderText(/Add a new task/i);
  fireEvent.change(input, { target: { value: 'Test Task' } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

  expect(screen.getByText('Test Task')).toBeInTheDocument();
});
