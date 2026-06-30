import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("ferroelectricos_session");
    navigate("/login");
  };

  const links = [
    { name: "Inicio", path: "/home" },
    { name: "Productos", path: "/productos" },
    { name: "Categorias", path: "/categorias" },
    { name: "Proveedores", path: "/proveedores" },
    { name: "Alertas", path: "/alertas" },
    { name: "Movimientos", path: "/movimientos" },
    { name: "Catalogo", path: "/catalogo" },
    { name: "Usuarios", path: "/usuarios" },
    { name: "Reportes", path: "/reportes" },
    { name: "Configuracion", path: "/configuracion" },
  ];

  return (
    <nav className="navbar">
      <div className="logo">Ferroelectricos</div>

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

      <button onClick={handleLogout} className="secondary-button">
        Salir
      </button>
    </nav>
  );
};

export default Navbar;
