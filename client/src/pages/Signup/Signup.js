import { useState } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "../../components/common/forms/input-field";
import Button from "../../components/common/forms/button";

const Signup = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Signing up…");

    try {
      const res = await fetch("/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Signup failed");
      }

      navigate("/");
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <div className="page-form">
      <h2>Sign Up</h2>

      <form onSubmit={handleSubmit}>
        <InputField
          label="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <InputField
          label="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

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

        <Button type="submit">Sign Up</Button>
      </form>

      {status && <p className="status-message">{status}</p>}
    </div>
  );
};

export default Signup;
