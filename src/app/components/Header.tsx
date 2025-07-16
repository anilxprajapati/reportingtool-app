import React from 'react';
import { Navbar, Container, Nav, Form, Stack } from 'react-bootstrap';
import { GoRepo } from 'react-icons/go';
import { BsMoonStarsFill, BsSunFill } from 'react-icons/bs';

interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
}

/**
 * Renders the main navigation bar for the application.
 * Includes the app title, theme toggle, and user information.
 */
const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <Navbar bg={theme} variant={theme} expand="lg" className="border-bottom shadow-sm">
      <Container fluid>
        <Navbar.Brand href="/dashboard" className="fw-bold">
          <GoRepo className="me-2 mb-1" />
          Nexus BI Reporting Tool
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Stack direction="horizontal" gap={3} className="align-items-center">
              <Form.Check
                type="switch"
                id="theme-switch"
                label={theme === 'dark' ? <BsMoonStarsFill title="Dark Mode" /> : <BsSunFill title="Light Mode" />}
                checked={theme === 'dark'}
                onChange={toggleTheme}
                title="Toggle Dark/Light Mode"
              />
              <Navbar.Text>
                Signed in as: <a href="#login">oidc-client-s</a>
              </Navbar.Text>
            </Stack>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;