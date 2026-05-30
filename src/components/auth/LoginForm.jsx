import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/LoginForm.module.css";

// Función para generar CAPTCHA aleatorio
const generarCaptcha = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

const LoginForm = () => {
  const navigate = useNavigate();
  const [captcha] = useState(generarCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (captchaInput.toUpperCase() !== captcha) {
      setError("CAPTCHA incorrecto");
      return;
    }
    // Aquí irá la llamada al backend
    navigate("/");
  };

  return (
    <div className={styles.container}>
      <h1>Iniciar Sesión</h1>
      <p>Bienvenido a Ferroeléctricos</p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className={styles.captcha}>{captcha}</div>
        <input
          type="text"
          placeholder="Ingrese el CAPTCHA"
          value={captchaInput}
          onChange={(e) => setCaptchaInput(e.target.value)}
          required
        />
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
};
export default LoginForm;