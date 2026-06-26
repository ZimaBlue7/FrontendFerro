import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/dashboard/Layout";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Usuarios from "../pages/Usuarios";
import Reportes from "../pages/Reportes";
import Configuracion from "../pages/Configuracion";
import Productos from "../pages/Productos";
import ProductoForm from "../pages/ProductoForm";
import UsuarioForm from "../pages/UsuarioForm";
import Categorias from "../pages/Categorias";
import Proveedores from "../pages/Proveedores";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/nuevo" element={<ProductoForm />} />
          <Route path="/productos/:id/editar" element={<ProductoForm />} />
          <Route path="/producto-form" element={<ProductoForm />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/usuario-form" element={<UsuarioForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
