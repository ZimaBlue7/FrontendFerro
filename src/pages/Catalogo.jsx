import { useEffect, useMemo, useState } from "react";
import { categoriesApi, productsApi } from "../services/api";
import {
  addToCart,
  createPreSale,
  formatCurrency,
  getCart,
  getProductCategories,
  isInactive,
  removeCartItem,
  updateCartItem,
} from "../services/inventory";

const filtersKey = "ferroelectricos_catalog_filters";

const initialCustomer = { name: "", phone: "", email: "" };

const Catalogo = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState(getCart);
  const [customer, setCustomer] = useState(initialCustomer);
  const [filters, setFilters] = useState(() => ({
    query: "",
    categoryId: "",
    minPrice: "",
    maxPrice: "",
    availableOnly: false,
    ...JSON.parse(sessionStorage.getItem(filtersKey) || "{}"),
  }));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoading(true);
        const [productList, categoryList] = await Promise.all([
          productsApi.list(),
          categoriesApi.list(),
        ]);
        setProducts(productList);
        setCategories(categoryList);
      } catch {
        setError("No se pudo cargar el catálogo.");
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, []);

  useEffect(() => {
    sessionStorage.setItem(filtersKey, JSON.stringify(filters));
  }, [filters]);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        if (isInactive(product)) return false;
        if (filters.query && !product.name.toLowerCase().includes(filters.query.toLowerCase())) {
          return false;
        }
        if (
          filters.categoryId &&
          !getProductCategories(product).some(
            (category) => String(category.id) === String(filters.categoryId)
          )
        ) {
          return false;
        }
        if (filters.minPrice && Number(product.price || 0) < Number(filters.minPrice)) return false;
        if (filters.maxPrice && Number(product.price || 0) > Number(filters.maxPrice)) return false;
        if (filters.availableOnly && Number(product.stock || 0) <= 0) return false;
        return true;
      }),
    [filters, products]
  );

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const submitPreSale = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!cart.length) {
      setError("Agrega al menos un producto al carrito.");
      return;
    }

    if (!customer.name.trim() || !customer.phone.trim() || !customer.email.trim()) {
      setError("Completa nombre, teléfono y correo.");
      return;
    }

    const preSale = await createPreSale(customer, cart);
    setCart([]);
    setCustomer(initialCustomer);
    setSuccess(
      preSale.synced
        ? `Solicitud ${preSale.id} generada y enviada a Render.`
        : `Solicitud ${preSale.id} guardada localmente. Render no confirmó el registro.`
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Catálogo</h1>
          <p className="page-subtitle">
            Consulta productos disponibles y envía una solicitud de preventa.
          </p>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <div className="catalog-layout">
        <section>
          <div className="catalog-filters">
            <input
              className="search-input"
              placeholder="Buscar por nombre"
              value={filters.query}
              onChange={(event) => setFilters({ ...filters, query: event.target.value })}
            />
            <select
              className="select-input"
              value={filters.categoryId}
              onChange={(event) => setFilters({ ...filters, categoryId: event.target.value })}
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              className="search-input"
              type="number"
              min="0"
              placeholder="Precio mínimo"
              value={filters.minPrice}
              onChange={(event) => setFilters({ ...filters, minPrice: event.target.value })}
            />
            <input
              className="search-input"
              type="number"
              min="0"
              placeholder="Precio máximo"
              value={filters.maxPrice}
              onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value })}
            />
            <label className="check-control">
              <input
                type="checkbox"
                checked={filters.availableOnly}
                onChange={(event) =>
                  setFilters({ ...filters, availableOnly: event.target.checked })
                }
              />
              En stock
            </label>
          </div>

          {loading ? (
            <p className="state-message">Cargando catálogo...</p>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => {
                const exhausted = Number(product.stock || 0) <= 0;
                return (
                  <article className="product-card" key={product.id}>
                    <div>
                      <h3>{product.name}</h3>
                      <p>{product.description || "Producto ferretero disponible en tienda."}</p>
                    </div>
                    <strong>{formatCurrency(product.price)}</strong>
                    <span className={`status-pill ${exhausted ? "danger" : "success"}`}>
                      {exhausted ? "Agotado" : `${product.stock} disponibles`}
                    </span>
                    <button
                      className="primary-button"
                      disabled={exhausted}
                      onClick={() => setCart(addToCart(product))}
                    >
                      Agregar
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="cart-panel">
          <h2>Carrito de preventa</h2>
          {cart.length === 0 ? (
            <p className="state-message">No hay productos agregados.</p>
          ) : (
            <div className="cart-list">
              {cart.map((item) => (
                <div className="cart-item" key={item.productId}>
                  <div>
                    <strong>{item.name}</strong>
                    <small>{formatCurrency(item.price)}</small>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.quantity}
                    onChange={(event) => setCart(updateCartItem(item.productId, event.target.value))}
                  />
                  <button className="delete-btn" onClick={() => setCart(removeCartItem(item.productId))}>
                    Quitar
                  </button>
                </div>
              ))}
              <strong className="cart-total">Total: {formatCurrency(cartTotal)}</strong>
            </div>
          )}

          <form className="cart-form" onSubmit={submitPreSale}>
            <input
              placeholder="Nombre"
              value={customer.name}
              onChange={(event) => setCustomer({ ...customer, name: event.target.value })}
            />
            <input
              placeholder="Teléfono"
              value={customer.phone}
              onChange={(event) => setCustomer({ ...customer, phone: event.target.value })}
            />
            <input
              type="email"
              placeholder="Correo"
              value={customer.email}
              onChange={(event) => setCustomer({ ...customer, email: event.target.value })}
            />
            <button className="primary-button">Confirmar preventa</button>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default Catalogo;
