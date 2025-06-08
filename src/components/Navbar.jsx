import { useState } from 'react';
import {
  BookOpenIcon, FilmIcon, TvIcon, HomeIcon,
  Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const menuItems = [
  { name: 'Home', path: '/home', icon: HomeIcon },
  { name: 'Movies', path: '/movies', icon: FilmIcon },
  { name: 'Series', path: '/series', icon: TvIcon },
  { name: 'Books', path: '/books', icon: BookOpenIcon },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md p-4 flex flex-wrap justify-between items-center">
      <div className="flex items-center justify-between w-full md:w-auto">
        <Link to="/home" className="text-xl font-bold">MP Collections</Link>
        <button
          className="md:hidden text-gray-700"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      <div className={`w-full md:flex md:w-auto md:items-center ${open ? 'block' : 'hidden'}`}>
        <div className="flex flex-col md:flex-row md:space-x-6 mt-4 md:mt-0 items-start md:items-center">
          {menuItems.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={name}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 ${
                  isActive ? 'font-semibold text-blue-600' : ''
                }`
              }
              onClick={() => setOpen(false)}
            >
              <Icon className="h-5 w-5" />
              {name}
            </NavLink>
          ))}

          {/* Botão Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 mt-2 md:mt-0 text-red-600 hover:text-white hover:bg-red-600 rounded-md transition"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
