const UsuarioForm = () => {
  return (
    <div>

      <h1 className="page-title">
        Registro de Usuario
      </h1>

      <p className="page-subtitle">
        Complete los campos requeridos para registrar un usuario.
      </p>

      <div className="form-container">

        <div className="form-group">

          <label>
            Nombre completo *
          </label>

          <input
            type="text"
            placeholder="Ingrese el nombre completo"
          />

          <span className="required-text">
            Campo obligatorio
          </span>

        </div>

        <div className="form-group">

          <label>
            Correo electrónico *
          </label>

          <input
            type="email"
            placeholder="Ingrese el correo"
          />

          <span className="required-text">
            Campo obligatorio
          </span>

        </div>

        <div className="form-group">

          <label>
            Contraseña *
          </label>

          <input
            type="password"
            placeholder="Ingrese la contraseña"
          />

          <span className="required-text">
            Campo obligatorio
          </span>

        </div>

        <div className="form-group">

          <label>
            Rol *
          </label>

          <select className="select-input">
            <option>Seleccione un rol</option>
            <option>Administrador</option>
            <option>Empleado</option>
            <option>Cliente</option>
          </select>

          <span className="required-text">
            Campo obligatorio
          </span>

        </div>

        {/* CAPTCHA */}

        <div className="captcha-box">

          <div className="captcha-code">
            F3R8O9
          </div>

          <input
            type="text"
            placeholder="Ingrese el código CAPTCHA"
          />

        </div>

        <button className="primary-button">
          Guardar Usuario
        </button>

      </div>

    </div>
  );
};

export default UsuarioForm;