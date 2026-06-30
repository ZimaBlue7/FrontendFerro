import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { productsApi } from "../services/api";
import { changeAlertStatus, getAlerts, syncStockAlerts } from "../services/inventory";

const statuses = ["Todas", "Activa", "Leida", "En proceso", "Resuelta"];

const normalizeStatus = (status) => (status === "Leída" ? "Leida" : status);

const Alertas = () => {
  const [alerts, setAlerts] = useState(getAlerts);
  const [status, setStatus] = useState("Todas");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setLoading(true);
        const products = await productsApi.list();
        setAlerts(syncStockAlerts(products));
        setError("");
      } catch {
        setAlerts(getAlerts());
        setError("No se pudo consultar el inventario. Se muestran las alertas guardadas.");
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, []);

  const filteredAlerts = useMemo(
    () =>
      alerts.filter((alert) => {
        const matchesStatus =
          status === "Todas" || normalizeStatus(alert.status) === normalizeStatus(status);
        const matchesQuery = alert.productName.toLowerCase().includes(query.toLowerCase());
        return matchesStatus && matchesQuery;
      }),
    [alerts, query, status]
  );

  const updateStatus = (alertId, nextStatus) => {
    setAlerts(changeAlertStatus(alertId, nextStatus));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Alertas de stock</h1>
          <p className="page-subtitle">
            Revisa productos bajo el mínimo y marca el avance de cada alerta.
          </p>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="toolbar">
        <input
          className="search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar producto"
        />
        <select className="select-input compact-select" value={status} onChange={(event) => setStatus(event.target.value)}>
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="table-container">
        {loading ? (
          <p className="state-message">Cargando alertas...</p>
        ) : filteredAlerts.length === 0 ? (
          <p className="state-message">No hay alertas para los filtros seleccionados.</p>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Stock</th>
                <th>Mínimo</th>
                <th>Proveedor</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className={alert.status === "Resuelta" ? "inactive-row" : "critical-row"}>
                  <td>
                    <strong>{alert.productName}</strong>
                    <small>{alert.reason}</small>
                  </td>
                  <td>{alert.stockCurrent}</td>
                  <td>{alert.minimumStock}</td>
                  <td>{alert.provider}</td>
                  <td>
                    <span className={`status-pill ${alert.status === "Resuelta" ? "success" : "danger"}`}>
                      {alert.status}
                    </span>
                  </td>
                  <td>{new Date(alert.createdAt).toLocaleString("es-CO")}</td>
                  <td>
                    <div className="actions">
                      <button className="edit-btn" onClick={() => updateStatus(alert.id, "Leida")}>
                        Leida
                      </button>
                      <button className="edit-btn" onClick={() => updateStatus(alert.id, "En proceso")}>
                        En proceso
                      </button>
                      <button className="restore-btn" onClick={() => updateStatus(alert.id, "Resuelta")}>
                        Resolver
                      </button>
                      <Link className="secondary-button small-button" to={`/productos/${alert.productId}/editar`}>
                        Producto
                      </Link>
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

export default Alertas;
