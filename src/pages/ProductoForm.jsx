const ProductoForm = () => {
  return (
    <div>

      <h1 className="page-title">
        Registrar Producto
      </h1>

      <p className="page-subtitle">
        Completa la información del producto.
      </p>

      <div className="form-container">

        <div className="form-group">

          <label>
            Nombre del producto *
          </label>

          <input
            type="text"
            placeholder="Ingrese el nombre"
          />

          <span className="required-text">
            Campo obligatorio
          </span>

        </div>

        <div className="form-group">

          <label>
            Categoría *
          </label>

          <input
            type="text"
            placeholder="Ingrese la categoría"
          />

          <span className="required-text">
            Campo obligatorio
          </span>

        </div>

        <div className="form-group">

          <label>
            Precio *
          </label>

          <input
            type="number"
            placeholder="Ingrese el precio"
          />

          <span className="required-text">
            Campo obligatorio
          </span>

        </div>

        <div className="form-group">

          <label>
            Stock *
          </label>

          <input
            type="number"
            placeholder="Ingrese el stock"
          />

          <span className="required-text">
            Campo obligatorio
          </span>

        </div>

        <button className="primary-button">
          Guardar Producto
        </button>

      </div>

    </div>
  );
};

export default ProductoForm;