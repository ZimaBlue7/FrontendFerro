const Configuracion = () => {
  return (
    <div>
      <h1 className="page-title">Configuración</h1>
      <p className="page-subtitle">
        Ajusta los parámetros del sistema.
      </p>
      <div className="form-container">
        <div className="form-group">
          <label>Nombre de la empresa</label>
          <input type="text" defaultValue="Ferroeléctricos" />
        </div>
        <div className="form-group">
          <label>Correo de contacto</label>
          <input type="email" placeholder="correo@empresa.com" />
        </div>
        <div className="form-group">
          <label>Teléfono</label>
          <input type="tel" placeholder="+57 300 000 0000" />
        </div>
        <button className="primary-button">
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};
export default Configuracion;