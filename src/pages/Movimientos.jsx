import { useEffect, useMemo, useState } from "react";
import { productsApi } from "../services/api";
import { getMovements, registerStockMovement } from "../services/inventory";

const initialForm = {
  productId: "",
  quantity: "",
  type: "Entrada",
  reason: "",
};

const Movimientos = () => {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState(getMovements);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedProduct = useMemo(
    () => products.find((product) => String(product.id) === String(form.productId)),
    [form.productId, products]
  );

  const loadProducts = async () => {
    try {
      setLoading(true);
      setProducts(await productsApi.list());
      setError("");
    } catch {
      setError("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const quantity = Number(form.quantity);

    if (!selectedProduct) {
      setError("Selecciona un producto.");
      return;
    }

    if (!quantity || quantity <= 0) {
      setError("La cantidad debe ser mayor a cero.");
      return;
    }

    if (!form.reason.trim()) {
      setError("Ingresa el motivo del movimiento.");
      return;
    }

    if (form.type === "Salida" && quantity > Number(selectedProduct.stock || 0)) {
      setError("No se pueden registrar salidas superiores al stock disponible.");
      return;
    }

    try {
      setSaving(true);
      await registerStockMovement({
        product: selectedProduct,
        quantity,
        type: form.type,
        reason: form.reason,
      });
      setForm(initialForm);
      setMovements(getMovements());
      await loadProducts();
    } catch {
      setError("No se pudo registrar el movimiento.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Movimientos de inventario</h1>
          <p className="page-subtitle">
            Registra entradas y salidas manuales con historial inmutable.
          </p>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="split-layout">
        <div className="form-container compact-form">
          <form onSubmit={handleSubmit}>
            <h2>Nuevo movimiento</h2>
            <div className="form-group">
              <label>Producto *</label>
              <select
                className="select-input"
                value={form.productId}
                onChange={(event) => setForm({ ...form, productId: event.target.value })}
              >
                <option value="">Seleccione un producto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - stock {product.stock}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tipo *</label>
              <select
                className="select-input"
                value={form.type}
                onChange={(event) => setForm({ ...form, type: event.target.value })}
              >
                <option>Entrada</option>
                <option>Salida</option>
              </select>
            </div>

            <div className="form-group">
              <label>Cantidad *</label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.quantity}
                onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Motivo *</label>
              <input
                value={form.reason}
                onChange={(event) => setForm({ ...form, reason: event.target.value })}
                placeholder="Compra a proveedor, ajuste físico..."
              />
            </div>

            <div className="form-actions">
              <button className="primary-button" disabled={saving || loading}>
                {saving ? "Registrando..." : "Registrar movimiento"}
              </button>
            </div>
          </form>
        </div>

        <div className="table-container">
          {loading ? (
            <p className="state-message">Cargando inventario...</p>
          ) : movements.length === 0 ? (
            <p className="state-message">Aún no hay movimientos registrados.</p>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Antes</th>
                  <th>Ahora</th>
                  <th>Motivo</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={`${movement.id}-${movement.createdAt}`}>
                    <td>{new Date(movement.createdAt).toLocaleString("es-CO")}</td>
                    <td>{movement.productName}</td>
                    <td>{movement.type}</td>
                    <td>{movement.quantity}</td>
                    <td>{movement.stockBefore}</td>
                    <td>{movement.stockAfter}</td>
                    <td>{movement.reason}</td>
                    <td>{movement.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Movimientos;
