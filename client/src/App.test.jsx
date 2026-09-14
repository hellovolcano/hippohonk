import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// A minimal smoke test — this project doesn't have a real client test suite
// yet (see CONTRIBUTING.md), this just confirms the app actually mounts
// without throwing, now that it's running under Vite/Vitest instead of
// Create React App's Jest setup.
test('renders the app without crashing', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  expect(screen.getByAltText('Hippohonk')).toBeInTheDocument();
});
