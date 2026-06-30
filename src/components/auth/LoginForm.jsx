import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import styles from '../../styles/LoginForm.module.css';

const LoginForm = () => {
  const navigate = useNavigate();

  const handleGoogleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    localStorage.setItem(
      'ferroelectricos_session',
      JSON.stringify({
        token: credentialResponse.credential,
        user: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
      }),
    );
    navigate('/home');
  };

  const handleGoogleError = () => {
    alert('No se pudo iniciar sesión con Google.');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Ferroeléctricos Olaya</h1>
        {/* <p className={styles.subtitle}>Panel </p> */}
        <div className={styles.divider} />
        <p className={styles.hint}>Inicia sesión para continuar</p>
        <div className={styles.googleWrapper}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_blue"
            size="large"
            shape="rectangular"
            locale="es"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
