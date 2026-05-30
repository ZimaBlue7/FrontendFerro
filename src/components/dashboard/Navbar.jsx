import { NavLink } from "react-router-dom";

const Navbar = () => {

  const links = [
    { name: "Inicio", path: "/" },
    { name: "Usuarios", path: "/usuarios" },
    { name: "Productos", path: "/productos" },
    { name: "Configuración", path: "/configuracion" },
    { name: "Reportes", path: "/reportes" },
    { name: "Login", path: "/login" },
  ];

  return (
    <nav className="navbar">

      <div className="logo">
        Ferroeléctricos
      </div>

      <div className="nav-links">

        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              isActive ? "active-link" : "link"
            }
          >
            {link.name}
          </NavLink>
        ))}

      </div>

    </nav>
  );
};

export default Navbar;