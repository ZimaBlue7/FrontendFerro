import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://stock-0-0-1.onrender.com";

const ProductoForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    stock: "",
    price: "",
    brandId: "",
    categoryIds: [],
  });

  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);

  // Cargar categorías y marcas desde la API
  useEffect(() => {
    fetch(`${BASE_URL}/category/all`)
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setCategorias(data); });

    fetch(`${BASE_URL}/brand/all`)
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setMarcas(data); });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategoriaChange = (e) => {
    setForm({ ...form, categoryIds: [parseInt(e.target.value)] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      id: 0,
      name: form.name,
      description: form.description,
      stock: parseInt(form.stock),
      price: parseFloat(form.price),
      brandId: parseInt(form.brandId),
      categoryIds: form.categoryIds,
    };

    try {
      const response = await fetch(`${BASE_URL}/article/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error();

      setExito(true);
      setTimeout(() => navigate("/productos"), 1500);
    } catch {
      setError("Error al guardar el producto. Verifica los datos e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Registrar Producto</h1>
      <p className="page-subtitle">Completa la información del producto.</p>

      {exito && (
        <p style={{ color: "green", padding: "10px 0" }}>
          ✅ Producto guardado correctamente. Redirigiendo...
        </p>
      )}
      {error && (
        <p style={{ color: "red", padding: "10px 0" }}>{error}</p>
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Nombre del producto *</label>
            <input
              type="text"
              name="name"
              placeholder="Ingrese el nombre"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <input
              type="text"
              name="description"
              placeholder="Ingrese la descripción"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Categoría *</label>
            <select onChange={handleCategoriaChange} required>
              <option value="">Seleccione una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Marca *</label>
            <select
              name="brandId"
              value={form.brandId}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una marca</option>
              {marcas.map((marca) => (
                <option key={marca.id} value={marca.id}>
                  {marca.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Precio *</label>
            <input
              type="number"
              name="price"
              placeholder="Ingrese el precio"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Stock *</label>
            <input
              type="number"
              name="stock"
              placeholder="Ingrese el stock"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              className="edit-btn"
              onClick={() => navigate("/productos")}
            >
              ← Cancelar
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar Producto"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProductoForm;