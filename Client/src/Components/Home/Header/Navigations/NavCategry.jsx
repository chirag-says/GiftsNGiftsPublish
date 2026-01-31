import React from 'react';
import { NavLink } from 'react-router-dom';

const NavCategory = () => {
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop by Occasion', path: '/shop-by-occasion' },
    { name: 'Shop by State', path: '/stop-by-state' },
    { name: 'Collections', path: '/collection' },
    { name: 'Artisans', path: '/artician' },
    { name: 'Corporate Gifting', path: '/bulk-quote' },
  ];

  return (
    <nav className="hidden lg:flex justify-center border-t border-gray-100 bg-white/80 py-3">
      <ul className="flex items-center pl-6 gap-14">
        {navLinks.map(({ name, path }) => (
          <li key={name}>
            <NavLink
              to={path}
              className={({ isActive }) => `
                relative text-[14px] font-bold   transition-colors duration-300 group
                ${isActive ? 'text-[#0F3D2E]' : 'text-gray-400 hover:text-[#C5A059]'}
              `}
            >
              {name}
              {/* Minimalist Thread: A very thin, elegant line that expands from center */}
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-[#C5A059] transition-all duration-300 group-hover:w-full group-[.active]:w-full" />
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default NavCategory;