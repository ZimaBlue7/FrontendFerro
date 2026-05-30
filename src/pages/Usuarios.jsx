const Usuarios = () => {
  return (
    <div>

      <div className="page-header">

        <div>
          <h1 className="page-title">
            Gestión de Usuarios
          </h1>

          <p className="page-subtitle">
            Administra los usuarios del sistema Ferroeléctricos.
          </p>
        </div>

        <button className="primary-button">
          + Nuevo Usuario
        </button>

      </div>

      <div className="table-container">

        <table className="products-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td>1</td>
              <td>Obeimar Olaya</td>
              <td>admin@ferroelectricos.com</td>
              <td>Administrador</td>
              <td>Activo</td>

              <td>
                <div className="actions">

                  <button className="edit-btn">
                    Editar
                  </button>

                  <button className="delete-btn">
                    Eliminar
                  </button>

                </div>
              </td>
            </tr>

            <tr>
              <td>2</td>
              <td>Juan Pérez</td>
              <td>ventas@ferroelectricos.com</td>
              <td>Empleado</td>
              <td>Activo</td>

              <td>
                <div className="actions">

                  <button className="edit-btn">
                    Editar
                  </button>

                  <button className="delete-btn">
                    Eliminar
                  </button>

                </div>
              </td>
            </tr>

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default Usuarios;