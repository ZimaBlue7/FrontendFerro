import styles from "../../styles/AuthModal.module.css";

import LoginForm from "./LoginForm";

const AuthModal = ({ isOpen, onClose }) => {

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>

      <div className={styles.modal}>

        <button
          className={styles.closeButton}
          onClick={onClose}
        >
          ✕
        </button>

        <LoginForm />

      </div>

    </div>
  );
};

export default AuthModal;