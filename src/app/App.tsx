import React, { useState, useEffect, useCallback } from 'react';
import { Container, ToastContainer } from 'react-bootstrap';
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from 'react-joyride';
import Header from './components/Header';
import AppRoutes from './routes/AppRoutes';
import Breadcrumbs from './components/Breadcrumbs';
import { dashboardTourSteps } from './components/AppTour';

/**
 * The root component of the application.
 * It sets up the main layout, including the header, routing container,
 * and manages the application-wide theme and interactive tour.
 */
function App() {
  const [theme, setTheme] = useState('dark');
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);

  const startTour = useCallback((tourSteps: Step[], index: number = 0) => {
    setSteps(tourSteps);
    setStepIndex(index);
    setRunTour(true);
  }, []);

  useEffect(() => {
    // Apply the theme to the root HTML element for global styling
    document.documentElement.setAttribute('data-bs-theme', theme);
    // Add a contrasting background for light mode to make cards stand out
    document.body.classList.toggle('bg-light', theme === 'light');
    
    // Check if the tour has been completed before
    const isFirstVisit = !localStorage.getItem('nexus-tour-completed');
    if (isFirstVisit) {
      // Delay starting the tour to allow the initial page to render
      setTimeout(() => startTour(dashboardTourSteps, 0), 1500);
    }
  }, [theme, startTour]);
  
  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { action, index, status, type } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      setStepIndex(0);
      localStorage.setItem('nexus-tour-completed', 'true');
    } else if (type === EVENTS.STEP_AFTER) {
      const newIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      setStepIndex(newIndex);
    } else if (action === ACTIONS.CLOSE || status === STATUS.PAUSED) {
      setRunTour(false);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        run={runTour}
        stepIndex={stepIndex}
        steps={steps}
        scrollToFirstStep
        showProgress
        showSkipButton
        styles={{
          options: {
            zIndex: 10000,
            arrowColor: 'var(--joyride-arrow-color)',
            backgroundColor: 'var(--joyride-background-color)',
            primaryColor: 'var(--joyride-primary-color)',
            textColor: 'var(--joyride-text-color)',
            overlayColor: 'var(--joyride-overlay-color)',
          },
        }}
      />
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="py-4 flex-grow-1 overflow-auto">
        <Container fluid className="h-100 d-flex flex-column">
          <Breadcrumbs />
          <div className="flex-grow-1" style={{ minHeight: 0 }}>
            <AppRoutes theme={theme} startTour={startTour} />
          </div>
        </Container>
      </main>
      <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 1056 }} />
    </div>
  );
}

export default App;