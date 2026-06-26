import { NavLink } from "react-router-dom";

const Navbar = () => {
  const links = [
    { name: "Inicio", path: "/" },
    { name: "Productos", path: "/productos" },
    { name: "Categorías", path: "/categorias" },
    { name: "Proveedores", path: "/proveedores" },
    { name: "Usuarios", path: "/usuarios" },
    { name: "Reportes", path: "/reportes" },
    { name: "Configuración", path: "/configuracion" },
  ];

  return (
    <nav className="navbar">
      <div className="logo">Ferroeléctricos</div>

      <div className="nav-links">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => (isActive ? "active-link" : "link")}
          >
            {link.name}
          </NavLink>
        ))}
      </div>

      <NavLink to="/login" className="secondary-button">
        Salir
      </NavLink>
    </nav>
  );
};

export default Navbar;
