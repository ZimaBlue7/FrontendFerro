import styles from "../../styles/Dashboard.module.css";
const Dashboard = () => {
  return (
    <div>

      <h1 className="page-title">
        Dashboard
      </h1>

      <p className="page-subtitle">
        Bienvenido al sistema de inventario Ferroeléctricos.
      </p>

      <div className={styles["dashboard-grid"]}>

        <div className={styles["dashboard-card"]}>
          <h3>Total Productos</h3>
          <span>245</span>
        </div>

        <div className={styles["dashboard-card"]}>
          <h3>Usuarios</h3>
          <span>12</span>
        </div>

        <div className={styles["dashboard-card"]}>
          <h3>Ventas</h3>
          <span>85</span>
        </div>

        <div className={styles["dashboard-card"]}>
          <h3>Stock Bajo</h3>
          <span>8</span>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;