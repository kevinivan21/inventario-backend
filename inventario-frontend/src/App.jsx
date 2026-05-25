import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import "./App.css";

function App() {
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [login, setLogin] = useState({ usuario: "", contrasena: "" });
  const [errorLogin, setErrorLogin] = useState("");

  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    usuario: "",
    contrasena: "",
    rol: "EMPLEADO",
  });
  const [editandoUsuario, setEditandoUsuario] = useState(false);
const [idUsuarioEditando, setIdUsuarioEditando] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("TODOS");
  const [paginaActual, setPaginaActual] = useState(1);
  const [modoOscuro, setModoOscuro] = useState(false);
  const productosPorPagina = 5;

  const [editando, setEditando] = useState(false);
  const [idEditando, setIdEditando] = useState(null);

  const [producto, setProducto] = useState({
    nombre: "",
    categoria: "",
    precio: "",
    cantidad: "",
    imagen: "",
  });

  const manejarLoginCambio = (e) => {
    setLogin({ ...login, [e.target.name]: e.target.value });
  };

  const iniciarSesion = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://inventario-backend-p270.onrender.com/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login),
      });

      const data = await response.json();

      if (data && data.usuario) {
        setUsuarioLogueado(data);
        setErrorLogin("");
        toast.success("Sesión iniciada correctamente");
      } else {
        setErrorLogin("Usuario o contraseña incorrectos");
      }
    } catch {
      setErrorLogin("Error al conectar con el servidor");
    }
  };

  const cerrarSesion = () => {
    setUsuarioLogueado(null);
    setLogin({ usuario: "", contrasena: "" });
  };

  const cargarProductos = async () => {
    const response = await fetch("https://inventario-backend-p270.onrender.com/api/productos");
    const data = await response.json();
    setProductos(data);
  };

  const cargarMovimientos = async () => {
    const response = await fetch("https://inventario-backend-p270.onrender.com/api/movimientos");
    const data = await response.json();
    setMovimientos(data);
  };

  const cargarUsuarios = async () => {
    const response = await fetch("https://inventario-backend-p270.onrender.com/api/usuarios");
    const data = await response.json();
    setUsuarios(data);
  };

  useEffect(() => {
    cargarProductos();
    cargarMovimientos();
    cargarUsuarios();
  }, []);

  const manejarCambio = (e) => {
    setProducto({ ...producto, [e.target.name]: e.target.value });
  };

  const manejarImagen = (e) => {
    const archivo = e.target.files[0];

    if (archivo) {
      const lector = new FileReader();

      lector.onloadend = () => {
        setProducto({
          ...producto,
          imagen: lector.result,
        });
      };

      lector.readAsDataURL(archivo);
    }
  };

  const guardarProducto = async (e) => {
    e.preventDefault();

    const url = editando
      ? `https://inventario-backend-p270.onrender.com/api/productos/${idEditando}`
      : "https://inventario-backend-p270.onrender.com/api/productos";

    const metodo = editando ? "PUT" : "POST";

    const response = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });

    const data = await response.json();

    if (editando) {
      toast.info("Producto actualizado");

      await fetch("https://inventario-backend-p270.onrender.com/api/movimientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "AJUSTE",
          cantidad: Number(producto.cantidad),
          producto: data,
        }),
      });
    } else {
      toast.success("Producto agregado");

      await fetch("https://inventario-backend-p270.onrender.com/api/movimientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "ENTRADA",
          cantidad: Number(producto.cantidad),
          producto: data,
        }),
      });
    }

    await cargarProductos();
    await cargarMovimientos();

    setProducto({
      nombre: "",
      categoria: "",
      precio: "",
      cantidad: "",
      imagen: "",
    });

    setEditando(false);
    setIdEditando(null);
  };

  const editarProducto = (p) => {
    setProducto({
      nombre: p.nombre,
      categoria: p.categoria,
      precio: p.precio,
      cantidad: p.cantidad,
      imagen: p.imagen,
    });

    setEditando(true);
    setIdEditando(p.id_producto);
  };
  const guardarUsuario = async (e) => {
  e.preventDefault();

  const url = editandoUsuario
    ? `https://inventario-backend-p270.onrender.com/api/usuarios/${idUsuarioEditando}`
    : "https://inventario-backend-p270.onrender.com/api/usuarios";

  const metodo = editandoUsuario ? "PUT" : "POST";

  await fetch(url, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(nuevoUsuario),
  });

  if (editandoUsuario) {
    toast.info("Usuario actualizado");
  } else {
    toast.success("Usuario creado");
  }

  setNuevoUsuario({
    nombre: "",
    usuario: "",
    contrasena: "",
    rol: "EMPLEADO",
  });

  setEditandoUsuario(false);
  setIdUsuarioEditando(null);

  await cargarUsuarios();
};

const editarUsuario = (u) => {
  if (
    u.usuario === "admin" &&
    usuarioLogueado.usuario !== "admin"
  ) {
    toast.warning("Solo el administrador principal puede editar este perfil");
    return;
  }

  setNuevoUsuario({
    nombre: u.nombre,
    usuario: u.usuario,
    contrasena: u.contrasena,
    rol: u.rol,
  });

  setEditandoUsuario(true);
  setIdUsuarioEditando(u.id_usuario);
};

  const eliminarUsuario = async (id) => {
  const usuarioEncontrado = usuarios.find((u) => u.id_usuario === id);

  if (usuarioEncontrado && usuarioEncontrado.usuario === "admin") {
    toast.warning("No puedes eliminar el usuario administrador principal");
    return;
  }

  const confirmar = window.confirm("¿Eliminar usuario?");

  if (!confirmar) return;

  await fetch(`https://inventario-backend-p270.onrender.com/api/usuarios/${id}`, {
    method: "DELETE",
  });

  toast.error("Usuario eliminado");

  await cargarUsuarios();
};

  const generarPDF = () => {
    const doc = new jsPDF();

    doc.text("Reporte de Inventario", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["ID", "Nombre", "Categoría", "Precio", "Cantidad"]],
      body: productos.map((p) => [
        p.id_producto,
        p.nombre,
        p.categoria,
        p.precio,
        p.cantidad,
      ]),
    });

    doc.save("inventario.pdf");
    toast.success("PDF generado");
  };
  const generarPDFMovimientos = () => {
  const doc = new jsPDF();

  doc.text("Reporte de Movimientos", 14, 20);

  autoTable(doc, {
    startY: 30,

    head: [["ID", "Tipo", "Producto", "Cantidad", "Fecha"]],

    body: movimientos.map((m) => [
      m.id_movimiento,
      m.tipo,
      m.producto ? m.producto.nombre : "Sin producto",
      m.cantidad,
      new Date(m.fecha).toLocaleString("es-MX"),
    ]),
  });

  doc.save("movimientos.pdf");

  toast.success("PDF de movimientos generado");
};

  const generarExcel = () => {
    const datos = productos.map((p) => ({
      ID: p.id_producto,
      Nombre: p.nombre,
      Categoria: p.categoria,
      Precio: p.precio,
      Cantidad: p.cantidad,
    }));

    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(libro, hoja, "Inventario");

    const excelBuffer = XLSX.write(libro, {
      bookType: "xlsx",
      type: "array",
    });

    const archivo = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(archivo, "inventario.xlsx");
    toast.success("Excel generado");
  };

  const totalProductos = productos.length;

  const productosStockBajo = productos.filter(
    (p) => Number(p.cantidad) <= 5
  ).length;

  const valorInventario = productos.reduce(
    (total, p) => total + Number(p.precio) * Number(p.cantidad),
    0
  );

  const productosFiltrados = productos.filter((p) => {
    const coincideBusqueda =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.categoria.toLowerCase().includes(busqueda.toLowerCase());

    const coincideCategoria =
      filtroCategoria === "TODOS" || p.categoria === filtroCategoria;

    return coincideBusqueda && coincideCategoria;
  });

  const categorias = [
    "TODOS",
    ...new Set(productos.map((p) => p.categoria)),
  ];

  const indiceUltimo = paginaActual * productosPorPagina;
  const indicePrimero = indiceUltimo - productosPorPagina;

  const productosPaginados = productosFiltrados.slice(
    indicePrimero,
    indiceUltimo
  );

  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

  const datosCategorias = Object.values(
    productos.reduce((acc, producto) => {
      if (!acc[producto.categoria]) {
        acc[producto.categoria] = {
          categoria: producto.categoria,
          cantidad: 0,
        };
      }

      acc[producto.categoria].cantidad += 1;
      return acc;
    }, {})
  );

  const datosValor = productos.map((p) => ({
    nombre: p.nombre,
    valor: Number(p.precio) * Number(p.cantidad),
  }));

  const colores = ["#2563eb", "#16a34a", "#dc2626", "#9333ea", "#ea580c"];

  if (!usuarioLogueado) {
    return (
      <div className="login-contenedor">
        <form className="login-card" onSubmit={iniciarSesion}>
          <h1>Inicio de Sesión</h1>

          <input
            type="text"
            name="usuario"
            placeholder="Usuario"
            value={login.usuario}
            onChange={manejarLoginCambio}
          />

          <input
            type="password"
            name="contrasena"
            placeholder="Contraseña"
            value={login.contrasena}
            onChange={manejarLoginCambio}
          />

          <button type="submit">Ingresar</button>

          {errorLogin && <p className="error-login">{errorLogin}</p>}
        </form>

        <ToastContainer />
      </div>
    );
  }

  return (
    <div className={modoOscuro ? "contenedor oscuro" : "contenedor"}>
      <div className="barra-superior">
        <h1>Sistema de Control de Inventario</h1>

        <button onClick={() => setModoOscuro(!modoOscuro)}>
          {modoOscuro ? "☀️ Modo claro" : "🌙 Modo oscuro"}
        </button>

        <button onClick={cerrarSesion}>Cerrar sesión</button>
      </div>

      <p className="usuario-activo">
        Usuario activo: <strong>{usuarioLogueado.nombre}</strong> | Rol:{" "}
        <strong>{usuarioLogueado.rol}</strong>
      </p>

      <div className="dashboard">
        <div className="card-dashboard">
          <h3>Total de productos</h3>
          <p>{totalProductos}</p>
        </div>

        <div className="card-dashboard">
          <h3>Stock bajo</h3>
          <p>{productosStockBajo}</p>
        </div>

        <div className="card-dashboard">
          <h3>Valor del inventario</h3>
          <p>${valorInventario.toLocaleString()}</p>
        </div>

        <div className="card-dashboard">
          <h3>Rol activo</h3>
          <p>{usuarioLogueado.rol}</p>
        </div>
      </div>

      <div className="panel">
          <form className="formulario" onSubmit={guardarProducto}>
            <h2>{editando ? "Editar Producto" : "Nuevo Producto"}</h2>

            <input
              type="text"
              name="nombre"
              placeholder="Nombre del producto"
              value={producto.nombre}
              onChange={manejarCambio}
              required
            />

            <input
              type="text"
              name="categoria"
              placeholder="Categoría"
              value={producto.categoria}
              onChange={manejarCambio}
              required
            />

            <input
              type="number"
              name="precio"
              placeholder="Precio"
              value={producto.precio}
              onChange={manejarCambio}
              required
            />

            <input
              type="number"
              name="cantidad"
              placeholder="Cantidad"
              value={producto.cantidad}
              onChange={manejarCambio}
              required
            />

            <input type="file" accept="image/*" onChange={manejarImagen} />

            <button type="submit">
              {editando ? "Guardar Cambios" : "Agregar Producto"}
            </button>
          </form>
        

        <div className="tabla-contenedor">
          <h2>Inventario Actual</h2>

          <button className="btn-pdf" onClick={generarPDF}>
            Exportar PDF
          </button>

          <button className="btn-excel" onClick={generarExcel}>
            Exportar Excel
          </button>

          <input
            className="buscador"
            type="text"
            placeholder="Buscar producto o categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <select
            className="filtro-categoria"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            {categorias.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Cantidad</th>
                {usuarioLogueado.rol === "ADMIN" && <th>Acción</th>}
              </tr>
            </thead>

            <tbody>
              {productosPaginados.map((p) => (
                <tr
                  key={p.id_producto}
                  className={Number(p.cantidad) <= 5 ? "stock-bajo" : ""}
                >
                  <td>{p.id_producto}</td>

                  <td>
                    {p.imagen ? (
                      <div className="contenedor-imagen">
                        <img
                          src={p.imagen}
                          alt={p.nombre}
                          className="imagen-producto"
                        />

                        <div className="preview-imagen">
                          <img
                            src={p.imagen}
                            alt={p.nombre}
                            className="imagen-preview-grande"
                          />
                        </div>
                      </div>
                    ) : (
                      "Sin imagen"
                    )}
                  </td>

                  <td>{p.nombre}</td>
                  <td>{p.categoria}</td>
                  <td>$ {p.precio}</td>

                  <td>
                    {p.cantidad}
                    {Number(p.cantidad) <= 5 && (
                      <span className="alerta-stock"> Stock bajo</span>
                    )}
                  </td>

                  {usuarioLogueado.rol === "ADMIN" && (
                    <td>
  <button
    className="btn-editar"
    onClick={() => editarProducto(p)}
  >
    Editar
  </button>

  <button
    className="btn-eliminar"
    onClick={() => eliminarProducto(p.id_producto)}
  >
    Eliminar
  </button>
</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="paginacion">
            <button
              onClick={() => setPaginaActual(paginaActual - 1)}
              disabled={paginaActual === 1}
            >
              Anterior
            </button>

            <span>
              Página {paginaActual} de {totalPaginas}
            </span>

            <button
              onClick={() => setPaginaActual(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente
            </button>
          </div>
        </div>

        <div className="tabla-contenedor historial">
          <h2>Historial de Movimientos</h2>
          <button className="btn-pdf" onClick={generarPDFMovimientos}>
  Exportar Movimientos PDF
</button>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Fecha</th>
              </tr>
            </thead>

            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id_movimiento}>
                  <td>{m.id_movimiento}</td>

                  <td>
                    <span
                      className={
                        m.tipo === "ENTRADA"
                          ? "entrada"
                          : m.tipo === "SALIDA"
                          ? "salida"
                          : "ajuste"
                      }
                    >
                      {m.tipo}
                    </span>
                  </td>

                  <td>{m.producto ? m.producto.nombre : "Sin producto"}</td>
                  <td>{m.cantidad}</td>
                  <td>{new Date(m.fecha).toLocaleString("es-MX")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {usuarioLogueado.rol === "ADMIN" && (
          <div className="tabla-contenedor usuarios-panel">
            <h2>Panel de Usuarios</h2>

            <form className="form-usuario" onSubmit={guardarUsuario}>
              <input
                type="text"
                placeholder="Nombre"
                value={nuevoUsuario.nombre}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })
                }
                required
              />

              <input
                type="text"
                placeholder="Usuario"
                value={nuevoUsuario.usuario}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, usuario: e.target.value })
                }
                required
              />

              <input
                type="password"
                placeholder="Contraseña"
                value={nuevoUsuario.contrasena}
                onChange={(e) =>
                  setNuevoUsuario({
                    ...nuevoUsuario,
                    contrasena: e.target.value,
                  })
                }
                required
              />

              <select
                value={nuevoUsuario.rol}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })
                }
              >
                <option value="ADMIN">ADMIN</option>
                <option value="EMPLEADO">EMPLEADO</option>
              </select>

              <button type="submit">
  {editandoUsuario ? "Guardar Cambios" : "Crear Usuario"}
</button>
            </form>

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id_usuario}>
                    <td>{u.id_usuario}</td>
                    <td>{u.nombre}</td>
                    <td>{u.usuario}</td>
                    <td>{u.rol}</td>
                    <td>
  <button
    className="btn-editar"
    onClick={() => editarUsuario(u)}
  >
    Editar
  </button>

  <button
    className="btn-eliminar"
    onClick={() => eliminarUsuario(u.id_usuario)}
  >
    Eliminar
  </button>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="graficas">
          <div className="grafica-card">
            <h2>Productos por Categoría</h2>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosCategorias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grafica-card">
            <h2>Valor del Inventario</h2>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosValor}
                  dataKey="valor"
                  nameKey="nombre"
                  innerRadius={60}
                  outerRadius={100}
                  label
                >
                  {datosValor.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colores[index % colores.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <ToastContainer />
      </div>
    </div>
  );
}

export default App;