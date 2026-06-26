import { useState } from "react";
import AuthModal from "../components/auth/AuthModal";

const Login = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="login-page">
      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(true)} />
    </div>
  );
};
export default Login;