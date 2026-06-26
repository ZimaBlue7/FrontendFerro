import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { brandsApi, categoriesApi, productsApi, storage } from "../services/api";

const META_KEY = "ferroelectricos_product_meta";

const initialForm = {
  name: "",
  description: "",
  stock: "",
  minimumStock: "5",
  price: "",
  brandId: "",
  categoryIds: [],
};

const getProductMeta = () => storage.get(META_KEY, {});

const saveProductMeta = (meta) => storage.set(META_KEY, meta);

const ProductoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const pageTitle = isEditing ? "Editar producto" : "Registrar producto";

  const selectedCategory = useMemo(() => form.categoryIds[0] || "", [form.categoryIds]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [categories, brands, products] = await Promise.all([
          categoriesApi.list(),
          brandsApi.list(),
          isEditing ? productsApi.list() : Promise.resolve([]),
        ]);
        setCategorias(categories);
        setMarcas(brands);

        if (isEditing) {
          const product = products.find((item) => String(item.id) === String(id));
          const meta = getProductMeta();

          if (!product) {
            setError("No se encontró el producto para editar.");
            return;
          }

          setForm({
            name: product.name || "",
            description: product.description || "",
            stock: String(product.stock ?? ""),
            minimumStock: String(
              product.minimumStock ??
                product.minStock ??
                product.stockMinimo ??
                meta[product.id]?.minimumStock ??
                5
            ),
            price: String(product.price ?? ""),
            brandId: String(product.brand?.id || ""),
            categoryIds: product.categories?.map((category) => category.id) || [],
          });
        }
      } catch {
        setError("No se pudieron cargar los datos del formulario.");
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [id, isEditing]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleCategoriaChange = (event) => {
    const value = event.target.value ? [Number(event.target.value)] : [];
    setForm((current) => ({ ...current, categoryIds: value }));
    setFieldErrors((current) => ({ ...current, categoryIds: "" }));
  };

  const validate = () => {
    const errors = {};
    const price = Number(form.price);
    const stock = Number(form.stock);
    const minimumStock = Number(form.minimumStock);

    if (!form.name.trim()) errors.name = "El nombre es obligatorio.";
    if (!form.brandId) errors.brandId = "Selecciona un proveedor.";
    if (!form.categoryIds.length) errors.categoryIds = "Selecciona una categoría.";
    if (form.price === "" || Number.isNaN(price)) errors.price = "Ingresa un precio válido.";
    if (price < 0) errors.price = "El precio no puede ser negativo.";
    if (form.stock === "" || Number.isNaN(stock)) errors.stock = "Ingresa un stock válido.";
    if (stock < 0) errors.stock = "El stock no puede ser negativo.";
    if (form.minimumStock === "" || Number.isNaN(minimumStock)) {
      errors.minimumStock = "Ingresa un stock mínimo válido.";
    }
    if (minimumStock < 0) errors.minimumStock = "El stock mínimo no puede ser negativo.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const persistLocalMeta = (productId) => {
    if (!productId) return;
    const meta = getProductMeta();
    saveProductMeta({
      ...meta,
      [productId]: {
        ...meta[productId],
        minimumStock: Number(form.minimumStock),
      },
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);

    const payload = {
      id: isEditing ? Number(id) : 0,
      name: form.name.trim(),
      description: form.description.trim(),
      stock: Number(form.stock),
      price: Number(form.price),
      brandId: Number(form.brandId),
      categoryIds: form.categoryIds.map(Number),
    };

    try {
      const response = isEditing
        ? await productsApi.update(payload)
        : await productsApi.create(payload);

      persistLocalMeta(response?.id || payload.id);
      navigate("/productos");
    } catch {
      setError("Error al guardar el producto. Verifica los datos e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <p className="state-message">Cargando formulario...</p>;

  return (
    <div>
      <h1 className="page-title">{pageTitle}</h1>
      <p className="page-subtitle">
        Completa la información operativa del producto y su umbral de stock mínimo.
      </p>

      {error && <p className="error-message">{error}</p>}

      <div className="form-container wide-form">
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group span-2">
            <label>Nombre del producto *</label>
            <input
              type="text"
              name="name"
              placeholder="Ej. Taladro percutor"
              value={form.name}
              onChange={handleChange}
            />
            {fieldErrors.name && <small className="field-error">{fieldErrors.name}</small>}
          </div>

          <div className="form-group span-2">
            <label>Descripción</label>
            <input
              type="text"
              name="description"
              placeholder="Características principales"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Categoría *</label>
            <select className="select-input" value={selectedCategory} onChange={handleCategoriaChange}>
              <option value="">Seleccione una categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.name}
                </option>
              ))}
            </select>
            {fieldErrors.categoryIds && (
              <small className="field-error">{fieldErrors.categoryIds}</small>
            )}
          </div>

          <div className="form-group">
            <label>Proveedor *</label>
            <select
              className="select-input"
              name="brandId"
              value={form.brandId}
              onChange={handleChange}
            >
              <option value="">Seleccione un proveedor</option>
              {marcas.map((marca) => (
                <option key={marca.id} value={marca.id}>
                  {marca.name}
                </option>
              ))}
            </select>
            {fieldErrors.brandId && <small className="field-error">{fieldErrors.brandId}</small>}
          </div>

          <div className="form-group">
            <label>Precio *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              name="price"
              placeholder="0"
              value={form.price}
              onChange={handleChange}
            />
            {fieldErrors.price && <small className="field-error">{fieldErrors.price}</small>}
          </div>

          <div className="form-group">
            <label>Stock *</label>
            <input
              type="number"
              min="0"
              step="1"
              name="stock"
              placeholder="0"
              value={form.stock}
              onChange={handleChange}
            />
            {fieldErrors.stock && <small className="field-error">{fieldErrors.stock}</small>}
          </div>

          <div className="form-group">
            <label>Stock mínimo *</label>
            <input
              type="number"
              min="0"
              step="1"
              name="minimumStock"
              placeholder="5"
              value={form.minimumStock}
              onChange={handleChange}
            />
            {fieldErrors.minimumStock && (
              <small className="field-error">{fieldErrors.minimumStock}</small>
            )}
          </div>

          <div className="form-actions span-2">
            <button type="button" className="secondary-button" onClick={() => navigate("/productos")}>
              Cancelar
            </button>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Guardar producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductoForm;
