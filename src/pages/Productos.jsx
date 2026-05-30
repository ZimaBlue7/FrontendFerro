const productos = [
  {
    id: 1,
    nombre: "Laptop Lenovo",
    categoria: "Tecnología",
    precio: "$3.500.000",
    stock: 10,
  },
  {
    id: 2,
    nombre: "Mouse Gamer",
    categoria: "Accesorios",
    precio: "$120.000",
    stock: 25,
  },
  {
    id: 3,
    nombre: "Monitor Samsung",
    categoria: "Pantallas",
    precio: "$900.000",
    stock: 7,
  },
];

const Productos = () => {
  return (
    <div>

      <div className="page-header">

        <div>
          <h1 className="page-title">
            Productos
          </h1>

          <p className="page-subtitle">
            Gestiona los productos del sistema.
          </p>
        </div>

        <button className="primary-button">
          + Nuevo Producto
        </button>

      </div>

      <div className="table-container">

        <table className="products-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>

            {productos.map((producto) => (
              <tr key={producto.id}>

                <td>{producto.id}</td>

                <td>{producto.nombre}</td>

                <td>{producto.categoria}</td>

                <td>{producto.precio}</td>

                <td>{producto.stock}</td>

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
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default Productos;