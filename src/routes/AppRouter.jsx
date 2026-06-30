import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '../components/auth/PrivateRoute';
import Layout from '../components/dashboard/Layout';
import Login from '../pages/Login';
import Home from '../pages/Home';
import Usuarios from '../pages/Usuarios';
import Reportes from '../pages/Reportes';
import Configuracion from '../pages/Configuracion';
import Productos from '../pages/Productos';
import ProductoForm from '../pages/ProductoForm';
import UsuarioForm from '../pages/UsuarioForm';
import Categorias from '../pages/Categorias';
import Proveedores from '../pages/Proveedores';
import Alertas from '../pages/Alertas';
import Movimientos from '../pages/Movimientos';
import Catalogo from '../pages/Catalogo';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirige / a /login por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Todas las rutas protegidas */}
        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/nuevo" element={<ProductoForm />} />
          <Route path="/productos/:id/editar" element={<ProductoForm />} />
          <Route path="/producto-form" element={<ProductoForm />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/movimientos" element={<Movimientos />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/usuario-form" element={<UsuarioForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
