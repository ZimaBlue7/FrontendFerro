import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productsApi } from "../services/api";
import {
  formatCurrency,
  getMinimumStock,
  getProductCategories,
  getProductMeta,
  getProviderName,
  isInactive,
  saveProductMeta,
  syncStockAlerts,
} from "../services/inventory";

const Productos = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [meta, setMeta] = useState(getProductMeta);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const productosEnriquecidos = useMemo(
    () =>
      productos.map((producto) => {
        const minimumStock = getMinimumStock(producto, meta);
        const inactive = isInactive(producto, meta);

        return {
          ...producto,
          minimumStock,
          inactive,
          critical: !inactive && Number(producto.stock || 0) <= minimumStock,
        };
      }),
    [productos, meta]
  );

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const products = await productsApi.list();
      setProductos(products);
      syncStockAlerts(products);
      setError("");
    } catch {
      setError("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

  const toggleInactive = (producto) => {
    const nextMeta = {
      ...meta,
      [producto.id]: {
        ...meta[producto.id],
        inactive: !producto.inactive,
        minimumStock: producto.minimumStock,
      },
    };

    saveProductMeta(nextMeta);
    setMeta(nextMeta);
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  if (loading) return <p className="state-message">Cargando productos...</p>;

  if (error) {
    return (
      <div className="empty-state">
        <p>{error}</p>
        <button onClick={fetchProductos} className="primary-button">
          Reintentar
        </button>
      </div>
    );
  }

  const activos = productosEnriquecidos.filter((producto) => !producto.inactive).length;
  const criticos = productosEnriquecidos.filter((producto) => producto.critical).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Productos</h1>
          <p className="page-subtitle">
            Lista, crea, edita y desactiva productos sin perder trazabilidad visual.
          </p>
        </div>
        <button onClick={() => navigate("/productos/nuevo")} className="primary-button">
          Nuevo producto
        </button>
      </div>

      <div className="summary-row">
        <div className="summary-card">
          <span>Total</span>
          <strong>{productosEnriquecidos.length}</strong>
        </div>
        <div className="summary-card">
          <span>Activos</span>
          <strong>{activos}</strong>
        </div>
        <div className="summary-card warning">
          <span>Stock crítico</span>
          <strong>{criticos}</strong>
        </div>
      </div>

      <div className="table-container">
        {productosEnriquecidos.length === 0 ? (
          <p className="state-message">No hay productos disponibles.</p>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Proveedor</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Mínimo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosEnriquecidos.map((producto) => (
                <tr
                  key={producto.id}
                  className={`${producto.critical ? "critical-row" : ""} ${
                    producto.inactive ? "inactive-row" : ""
                  }`}
                >
                  <td>
                    <strong>{producto.name}</strong>
                    <small>{producto.description || "Sin descripción"}</small>
                  </td>
                  <td>
                    {getProductCategories(producto).length
                      ? getProductCategories(producto).map((category) => category.name).join(", ")
                      : "Sin categoria"}
                  </td>
                  <td>{getProviderName(producto)}</td>
                  <td>{formatCurrency(producto.price)}</td>
                  <td>{producto.stock}</td>
                  <td>{producto.minimumStock}</td>
                  <td>
                    <span
                      className={`status-pill ${
                        producto.inactive ? "muted" : producto.critical ? "danger" : "success"
                      }`}
                    >
                      {producto.inactive ? "Inactivo" : producto.critical ? "Crítico" : "Activo"}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="edit-btn"
                        onClick={() => navigate(`/productos/${producto.id}/editar`)}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => toggleInactive(producto)}
                        className={producto.inactive ? "restore-btn" : "delete-btn"}
                      >
                        {producto.inactive ? "Reactivar" : "Desactivar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Productos;
