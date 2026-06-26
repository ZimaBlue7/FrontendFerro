import { useEffect, useState } from "react";
import { brandsApi } from "../services/api";

const emptyForm = { id: null, name: "", description: "" };

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadProveedores = async () => {
    try {
      setLoading(true);
      setProveedores(await brandsApi.list());
      setError("");
    } catch {
      setError("No se pudieron cargar los proveedores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProveedores();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("El nombre del proveedor es obligatorio.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        id: form.id || 0,
        name: form.name.trim(),
        description: form.description.trim(),
      };
      await (form.id ? brandsApi.update(payload) : brandsApi.create(payload));
      setForm(emptyForm);
      await loadProveedores();
    } catch {
      setError("No se pudo guardar el proveedor.");
    } finally {
      setSaving(false);
    }
  };

  const removeProveedor = async (id) => {
    if (!window.confirm("¿Deseas eliminar este proveedor?")) return;

    try {
      await brandsApi.remove(id);
      await loadProveedores();
    } catch {
      setError("No se pudo eliminar el proveedor.");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Proveedores</h1>
          <p className="page-subtitle">Administra marcas o proveedores asociados al inventario.</p>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="split-layout">
        <div className="form-container compact-form">
          <form onSubmit={handleSubmit}>
            <h2>{form.id ? "Editar proveedor" : "Nuevo proveedor"}</h2>
            <div className="form-group">
              <label>Nombre *</label>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Ej. Ferretería Central"
              />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <input
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Descripción breve"
              />
            </div>
            <div className="form-actions">
              {form.id && (
                <button type="button" className="secondary-button" onClick={() => setForm(emptyForm)}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>

        <div className="table-container">
          {loading ? (
            <p className="state-message">Cargando proveedores...</p>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.map((proveedor) => (
                  <tr key={proveedor.id}>
                    <td>{proveedor.id}</td>
                    <td>{proveedor.name}</td>
                    <td>{proveedor.description || "Sin descripción"}</td>
                    <td>
                      <div className="actions">
                        <button className="edit-btn" onClick={() => setForm(proveedor)}>
                          Editar
                        </button>
                        <button className="delete-btn" onClick={() => removeProveedor(proveedor.id)}>
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
    </div>
  );
};

export default Proveedores;
