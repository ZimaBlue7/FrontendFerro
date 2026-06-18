import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL =
  import.meta.env.VITE_API_URL;

const Productos = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/article/all`);
      const data = await response.json();
      const productosData = Array.isArray(data) ? data : data.content || [];
      setProductos(productosData);
      setError(null);
    } catch {
      setError('No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?'))
      return;
    try {
      const response = await fetch(`${BASE_URL}/article/?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error();
      setProductos(productos.filter((p) => p.id !== id));
      alert('Producto eliminado exitosamente');
    } catch {
      alert('No se pudo eliminar el producto.');
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  if (loading) return <p style={{ padding: '40px' }}>Cargando productos...</p>;

  if (error)
    return (
      <div style={{ padding: '40px' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={fetchProductos} className="primary-button">
          Reintentar
        </button>
      </div>
    );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Productos</h1>
          <p className="page-subtitle">Gestiona los productos del sistema.</p>
        </div>
        <button
          onClick={() => navigate('/producto-form')}
          className="primary-button"
        >
          + Nuevo Producto
        </button>
      </div>

      <div className="table-container">
        {productos.length === 0 ? (
          <p style={{ padding: '20px' }}>No hay productos disponibles</p>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.id}</td>
                  <td>{producto.name}</td>
                  <td>
                    {producto.categories?.length > 0
                      ? producto.categories.map((c) => c.name).join(', ')
                      : 'Sin categoría'}
                  </td>
                  <td>${producto.price}</td>
                  <td>{producto.stock}</td>
                  <td>
                    <div className="actions">
                      <button className="edit-btn">Editar</button>
                      <button
                        onClick={() => eliminarProducto(producto.id)}
                        className="delete-btn"
                      >
                        Eliminar
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
