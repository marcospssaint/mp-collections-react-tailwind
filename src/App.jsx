import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'

// Roteamento principal e controle de páginas protegidas

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="">
        <Outlet />
      </main>
      <footer className="p-4 text-center text-gray-500 text-sm">
        &copy; 2025 MP Collections App
      </footer>
    </div>
  )
}
