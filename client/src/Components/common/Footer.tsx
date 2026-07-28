import { NavLink } from "react-router-dom";
import {Home, Category, Cart, Info} from "../../assets/icons"
import { useCart } from "../../contexts/CartContext";
const items = [
    {
      label: "Inicio",
      path: "/",
      icon: Home,
    },
    {
      label: "Categorías",
      path: "/categories",
      icon: Category,
    },
    {
      label: "Carrito",
      path: "/cart",
      icon: Cart,
    },
    {
      label: "Nosotros",
      path: "/about",
      icon: Info,
    },
  ];

export default function Footer() {
  const { totalItems } = useCart();

  return (
    <footer className="bg-bg h-15 w-full fixed z-20 inset-x-0 bottom-0 border-t border-t-black/70">
        <div className="flex flex-row justify-around items-center h-full">
            {items.map(({ label, path, icon: Icon }) => (
                <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                    `flex flex-col items-center justify-center relative ${
                        isActive ? "text-alt" : "text-black"
                    }`
                    }
                >
                  {path === "/cart" && totalItems > 0 && (
                    <div className="absolute -top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-2xl bg-primary px-1 text-xs text-black">
                      {totalItems}
                    </div>
                  )}
                    <Icon className="size-5" />
                    <span className="text-md font-Outfit">{label}</span>
                </NavLink>
            ))}
        </div>
    </footer>
  )
}
