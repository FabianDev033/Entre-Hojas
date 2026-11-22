import { NavLink } from "react-router-dom";
import { Home, Category, Cart, Info } from "../../assets/icons";
import { useCart } from "../../contexts/CartContext";

const items = [
  { label: "Inicio", path: "/", Icon: Home },
  { label: "Catálogo", path: "/categories", Icon: Category },
  { label: "Carrito", path: "/cart", Icon: Cart },
  { label: "Nosotros", path: "/about", Icon: Info },
];

export default function Footer() {
  const { totalItems } = useCart();

  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-8 pb-[calc(0.75rem)] transform-gpu will-change-transform">
      <nav
        aria-label="Navegación principal"
        className="pointer-events-auto mx-auto flex h-15 w-full max-w-160 items-center justify-around rounded-full bg-[#E3D8C9] px-2">
        {items.map(({ label, path, Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            aria-label={label}
            className={({ isActive }) =>
              `relative flex h-12 shrink-0 items-center justify-center rounded-full text-black transition-all ${
                isActive ? "gap-2 bg-alt/45 px-4" : "w-12 hover:bg-black/5"
              }`
            }>
            {(navLink) => (
              <>
                {path === "/cart" && totalItems > 0 && (
                  <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-alt px-1 text-xs font-medium text-white">
                    {totalItems}
                  </span>
                )}
                <Icon className="size-5 shrink-0" />
                <span
                  className={
                    navLink.isActive
                      ? "whitespace-nowrap font-Outfit text-base font-light"
                      : "sr-only"
                  }>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </footer>
  );
}
