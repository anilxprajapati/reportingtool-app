import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import AppRoutes from './routes/AppRoutes';

/**
 * The root component of the application.
 * It sets up the main layout, including the header, routing container,
 * and manages the application-wide theme (dark/light).
 */
function App() {
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'

  useEffect(() => {
    // Apply the theme to the root HTML element for global styling
    document.documentElement.setAttribute('data-bs-theme', theme);
    // Add a contrasting background for light mode to make cards stand out
    if (theme === 'light') {
      document.body.classList.add('bg-light');
    } else {
      document.body.classList.remove('bg-light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="py-4 flex-grow-1 overflow-auto">
        <Container fluid className="h-100">
          <AppRoutes theme={theme} />
        </Container>
      </main>
    </div>
  );
}

export default App;