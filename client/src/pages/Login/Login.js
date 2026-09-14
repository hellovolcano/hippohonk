import { useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "../../components/common/forms/input-field";
import Button from "../../components/common/forms/button";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Logging in…");

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Login failed");
      }

      navigate("/");
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <div className="page-form">
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit">Login</Button>
      </form>

      {status && <p className="status-message">{status}</p>}

      <p className="form-row">
        Need an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
};

export default Login;
