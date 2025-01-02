import { useState } from 'react';
import QuizTable from './QuizTable';
import Home from './Home';
import PdfManagementPage from './PdfManage';

function App() {
  const [activePage, setActivePage] = useState('home'); // Manage active page state

  const renderPage = () => {
    switch (activePage) {
      case 'quizTable':
        return <QuizTable />;
      case 'pdfManagement':
        return <PdfManagementPage />;
      case 'home':
      default:
        return <Home />;
    }
  };

  return (
    <div style={{ marginTop: 40 }}>
      <div style={{ marginBottom: 20, display: 'flex', gap: '10px' }}>
        <button onClick={() => setActivePage('home')}>Home</button>
        <button onClick={() => setActivePage('quizTable')}>Quiz Table</button>
        <button onClick={() => setActivePage('pdfManagement')}>PDF Management</button>
      </div>
      {renderPage()}
    </div>
  );
}

export default App;
