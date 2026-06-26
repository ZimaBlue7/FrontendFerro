import { useEffect, useState } from "react";
import { categoriesApi } from "../services/api";

const emptyForm = { id: null, name: "", description: "" };

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadCategorias = async () => {
    try {
      setLoading(true);
      setCategorias(await categoriesApi.list());
      setError("");
    } catch {
      setError("No se pudieron cargar las categorías.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategorias();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("El nombre de la categoría es obligatorio.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        id: form.id || 0,
        name: form.name.trim(),
        description: form.description.trim(),
      };
      await (form.id ? categoriesApi.update(payload) : categoriesApi.create(payload));
      setForm(emptyForm);
      await loadCategorias();
    } catch {
      setError("No se pudo guardar la categoría.");
    } finally {
      setSaving(false);
    }
  };

  const removeCategoria = async (id) => {
    if (!window.confirm("¿Deseas eliminar esta categoría?")) return;

    try {
      await categoriesApi.remove(id);
      await loadCategorias();
    } catch {
      setError("No se pudo eliminar la categoría.");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categorías</h1>
          <p className="page-subtitle">Administra las familias usadas para clasificar productos.</p>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="split-layout">
        <div className="form-container compact-form">
          <form onSubmit={handleSubmit}>
            <h2>{form.id ? "Editar categoría" : "Nueva categoría"}</h2>
            <div className="form-group">
              <label>Nombre *</label>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Ej. Herramientas"
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
            <p className="state-message">Cargando categorías...</p>
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
                {categorias.map((categoria) => (
                  <tr key={categoria.id}>
                    <td>{categoria.id}</td>
                    <td>{categoria.name}</td>
                    <td>{categoria.description || "Sin descripción"}</td>
                    <td>
                      <div className="actions">
                        <button className="edit-btn" onClick={() => setForm(categoria)}>
                          Editar
                        </button>
                        <button className="delete-btn" onClick={() => removeCategoria(categoria.id)}>
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

export default Categorias;
