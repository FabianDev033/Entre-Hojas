import { useLocation } from "react-router-dom";
import { Logo } from "../../assets/images";
import {
  Dashboard,
  Orders,
  Products,
  AddProduct,
  Bag,
  LogOut,
} from "../../assets/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
export default function Menu() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout: endSession } = useAuth();

  const logout = () => {
    endSession()
      .then(() => {
        navigate("/admin/login");
      })
      .catch((error) => {
        console.error("Error during logout:", error);
      });
  };

  const navigateStore = () => {
    navigate("/");
  };

  const menu = [
    {
      name: "Dashboard",
      icon: <Dashboard className="w-7 aspect-square" />,
      path: "/admin",
      navigate: () => {
        navigate("/admin");
      },
    },
    {
      name: "Ordenes",
      icon: <Orders className="w-7 aspect-square" />,
      path: "/admin/ordenes",
      navigate: () => {
        navigate("ordenes");
      },
    },
    {
      name: "Productos",
      icon: <Products className="w-7 aspect-square" />,
      path: "/admin/productos",
      navigate: () => {
        navigate("productos");
      },
    },
    {
      name: "Agregar Producto",
      icon: <AddProduct className="w-7 aspect-square" />,
      path: "/admin/agregarProducto",
      navigate: () => {
        navigate("agregarProducto");
      },
    },
    {
      name: "Compras",
      icon: <Bag className="w-7 aspect-square" />,
      path: "/admin/Compras",
      navigate: () => {
        navigate("Compras");
      },
    },
  ];
  return (
    <aside className="w-60 h-svh bg-bg-dark flex flex-col items-center gap-15">
      <section className="w-11/12 flex flex-col gap-5 mt-3">
        <img
          src={Logo}
          alt=""
          className="w-20 aspect-square cursor-pointer"
          onClick={() => navigateStore()}
        />
        <span className="font-Outfit font-medium text-3xl text-black text-shadow-2xs">
          Entre Hojas
        </span>
      </section>
      <section className="w-full px-1 flex flex-col items-center gap-8 text-black font-Outfit font-normal text-lg">
        {menu.map((item, index) => (
          <div
            key={index}
            className={`flex gap-3 items-center cursor-pointer w-full px-3 py-2 transition-all ease-in-out duration-300 ${pathname === item.path ? "bg-bg-light rounded-md shadow-md text-alt" : null}`}
            onClick={item.navigate}>
            {item.icon}
            <span className="text-black">{item.name}</span>
          </div>
        ))}
      </section>
      <div
        className="w-full mt-auto font-Outfit font-normal text-lg text-black flex gap-3 ml-8 mb-2 cursor-pointer hover:text-alt-dark transition-all ease-in-out duration-200"
        onClick={() => logout()}>
        <LogOut className="w-6 aspect-square " />
        Log out
      </div>
    </aside>
  );
}
