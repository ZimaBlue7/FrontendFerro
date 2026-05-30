const Reportes = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reportes</h1>
          <p className="page-subtitle">
            Visualiza estadísticas e informes del sistema.
          </p>
        </div>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Ventas del mes</h3>
          <span>$12.450.000</span>
        </div>
        <div className="dashboard-card">
          <h3>Productos vendidos</h3>
          <span>134</span>
        </div>
        <div className="dashboard-card">
          <h3>Stock crítico</h3>
          <span>8 productos</span>
        </div>
        <div className="dashboard-card">
          <h3>Usuarios activos</h3>
          <span>12</span>
        </div>
      </div>
    </div>
  );
};
export default Reportes;