import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { InquiryPage } from './pages/InquiryPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <header className="border-b border-slate-800">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <h1 className="text-xl font-semibold tracking-tight">AISalesAgent</h1>
            <nav className="space-x-4 text-sm font-medium">
              <NavLink to="/" className={({ isActive }) => (isActive ? 'text-cyan-300' : 'text-slate-400')}>Lead Form</NavLink>
              <NavLink to="/admin" className={({ isActive }) => (isActive ? 'text-cyan-300' : 'text-slate-400')}>Admin</NavLink>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-10">
          <Routes>
            <Route path="/" element={<InquiryPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
