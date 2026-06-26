import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, storage } from "../../services/api";
import styles from "../../styles/LoginForm.module.css";

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const session = await authApi.login({ email, password });
      storage.set("ferroelectricos_session", {
        token: session?.token || session?.accessToken || null,
        user: session?.user || session?.username || email,
      });
      navigate("/");
    } catch {
      setError(
        "No se pudo iniciar sesión. El backend actual no expone un endpoint de autenticación en Swagger o las credenciales no son válidas."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Iniciar sesión</h1>
      <p>Acceso administrativo de Ferroeléctricos</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          Correo electrónico
          <input
            type="email"
            placeholder="admin@ferroelectricos.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Validando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
