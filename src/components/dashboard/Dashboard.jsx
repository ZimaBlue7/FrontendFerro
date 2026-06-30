import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { productsApi } from "../../services/api";
import {
  formatCurrency,
  getAlerts,
  getBackendSales,
  getMinimumStock,
  getPreSales,
  isInactive,
  syncStockAlerts,
} from "../../services/inventory";

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState(getAlerts);
  const [preSales, setPreSales] = useState(getPreSales);
  const [backendSales, setBackendSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [productList, saleList] = await Promise.all([productsApi.list(), getBackendSales()]);
        setProducts(productList);
        setAlerts(syncStockAlerts(productList));
        setPreSales(getPreSales());
        setBackendSales(saleList);
        setError("");
      } catch {
        setError("No se pudo cargar el tablero con datos del backend.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const metrics = useMemo(() => {
    const activeProducts = products.filter((product) => !isInactive(product));
    const exhausted = activeProducts.filter((product) => Number(product.stock || 0) === 0);
    const lowStock = activeProducts
      .filter((product) => Number(product.stock || 0) <= getMinimumStock(product))
      .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0));

    const soldMap = backendSales.reduce((acc, sale) => {
      const product = products.find((item) => String(item.id) === String(sale.idArticle));
      const name = sale.name || product?.name || `Producto ${sale.idArticle}`;

      acc[sale.idArticle] = {
        name,
        quantity: (acc[sale.idArticle]?.quantity || 0) + Number(sale.amount || 0),
        amount: (acc[sale.idArticle]?.amount || 0) + Number(sale.unitPrice || 0) * Number(sale.amount || 0),
      };

      return acc;
    }, {});

    preSales
      .filter((preSale) => !preSale.synced)
      .forEach((preSale) => {
        preSale.items.forEach((item) => {
          soldMap[item.productId] = {
            name: item.name,
            quantity: (soldMap[item.productId]?.quantity || 0) + Number(item.quantity || 0),
            amount:
              (soldMap[item.productId]?.amount || 0) +
              Number(item.price || 0) * Number(item.quantity || 0),
          };
        });
      });

    return {
      total: products.length,
      active: activeProducts.length,
      exhausted: exhausted.length,
      lowStock,
      activeAlerts: alerts.filter((alert) => alert.status !== "Resuelta").length,
      topProducts: Object.values(soldMap)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10),
    };
  }, [alerts, backendSales, preSales, products]);

  if (loading) return <p className="state-message">Cargando dashboard...</p>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Tablero de gestión de ventas, preventas y stock bajo.
          </p>
        </div>
        <Link className="primary-button button-link" to="/productos">
          Ver productos
        </Link>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="summary-row dashboard-summary">
        <div className="summary-card">
          <span>Productos totales</span>
          <strong>{metrics.total}</strong>
        </div>
        <div className="summary-card">
          <span>Activos</span>
          <strong>{metrics.active}</strong>
        </div>
        <div className="summary-card warning">
          <span>Agotados</span>
          <strong>{metrics.exhausted}</strong>
        </div>
        <div className="summary-card warning">
          <span>Alertas activas</span>
          <strong>{metrics.activeAlerts}</strong>
        </div>
      </div>

      <div className="dashboard-panels">
        <section className="table-container dashboard-panel">
          <div className="panel-heading">
            <h2>Top 10 preventas</h2>
          </div>
          {metrics.topProducts.length === 0 ? (
            <p className="state-message">Aún no hay solicitudes de preventa.</p>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Solicitudes</th>
                  <th>Valor estimado</th>
                </tr>
              </thead>
              <tbody>
                {metrics.topProducts.map((product) => (
                  <tr key={product.name}>
                    <td>{product.name}</td>
                    <td>{product.quantity}</td>
                    <td>{formatCurrency(product.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="table-container dashboard-panel">
          <div className="panel-heading">
            <h2>Stock bajo</h2>
            <Link className="secondary-button small-button" to="/productos">
              Ir a productos
            </Link>
          </div>
          {metrics.lowStock.length === 0 ? (
            <p className="state-message">No hay productos por debajo del mínimo.</p>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock</th>
                  <th>Mínimo</th>
                  <th>Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {metrics.lowStock.slice(0, 10).map((product) => {
                  const minimum = getMinimumStock(product);
                  return (
                    <tr key={product.id} className="critical-row">
                      <td>{product.name}</td>
                      <td>{product.stock}</td>
                      <td>{minimum}</td>
                      <td>{Number(product.stock || 0) - minimum}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
