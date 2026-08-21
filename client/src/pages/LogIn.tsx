import { useState, type FormEvent } from "react";
import axios from "axios";
import { User, Lock } from "../assets/icons";
import { Logo } from "../assets/images";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LogIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const credentials = {
      user: formData.get("user") as string,
      password: formData.get("password") as string,
    };

    try {
      setErrorMessage(null);
      await login(credentials);
      navigate("/admin", { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setErrorMessage("Invalid user or password.");
      } else if (axios.isAxiosError(error) && error.response?.status === 400) {
        setErrorMessage("Enter a user and password.");
      } else {
        setErrorMessage("Could not sign in. Please try again.");
      }
    }
  };

  return (
    <main className="flex flex-col items-center h-screen bg-bg-dark">
      <header className="w-full h-15 grid grid-cols-3 items-center fixed top-0 font-Outfit font-medium text-black text-3xl text-shadow-xs">
        <div className="flex justify-self-start items-center gap-5 ml-4">
          <img src={Logo} alt="logo" className="h-10" />
          <span>Entre Hojas</span>
        </div>
        <span className="justify-self-center text-4xl">Administracion</span>
      </header>
      <section className="w-120 aspect-5/4 bg-bg-light my-auto flex justify-center shadow-md border border-black/70 rounded-md">
        <form
          onSubmit={handleSubmit}
          className="w-8/12 flex flex-col items-center gap-10 mt-3">
          <span className="font-Outfit font-medium text-black text-3xl">
            Log In
          </span>
          <div className="flex flex-col gap-3 w-full font-Manrope font-light text-black">
            <label className="relative flex items-center">
              <User className="absolute left-3 h-7 w-7 text-alt-dark" />
              <input
                name="user"
                type="text"
                id="user"
                placeholder="Usuario"
                className="border border-alt-dark/50 rounded-sm focus:outline-none h-13 px-13 w-full shadow-sm placeholder:text-black/60"
              />
            </label>
            <label className="relative flex items-center">
              <Lock className="absolute left-3 h-7 w-7 text-alt-dark" />
              <input
                name="password"
                type="password"
                id="password"
                placeholder="Contraseña"
                className="border border-alt-dark/50 rounded-sm focus:outline-none h-13 px-13 w-full shadow-sm placeholder:text-black/60"
              />
            </label>
          </div>
          {errorMessage && (
            <p className="text-red-700" role="alert">
              {errorMessage}
            </p>
          )}
          <button
            type="submit"
            className="w-10/12 bg-alt-dark text-bg-dark font-Outfit font-extralight text-2xl py-2 rounded-md cursor-pointer shadow-md">
            Ingresar
          </button>
        </form>
      </section>
    </main>
  );
}
