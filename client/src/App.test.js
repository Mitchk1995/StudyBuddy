import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders Study Buddy header', () => {
  render(<App />);
  const headerElement = screen.getByRole('heading', { name: /Study Buddy/i, level: 1 });
  expect(headerElement).toBeInTheDocument();
});