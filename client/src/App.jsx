import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import NewExpense from './pages/NewExpense';
import Expenses from './pages/Expenses';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Nav />
        <main>
          <Routes>
            <Route path="/" element={<NewExpense />} />
            <Route path="/edit/:id" element={<NewExpense />} />
            <Route path="/expenses" element={<Expenses />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
