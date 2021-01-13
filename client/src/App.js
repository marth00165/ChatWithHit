import React from 'react';
import { Container } from 'react-bootstrap';
import './App.scss';
import Register from './pages/Register';

function App() {
  return (
    <Container className="py-5">
      <Register />
    </Container>
  );
}

export default App;
