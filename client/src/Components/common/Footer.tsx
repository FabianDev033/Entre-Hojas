import { NavLink, useLocation } from "react-router-dom";
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
  const { pathname } = useLocation();
  const isOrderPage = pathname.startsWith("/orden/");

  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-8 pb-[calc(0.75rem)] transform-gpu will-change-transform">
      <nav
        aria-label="Navegación principal"
        className={`pointer-events-auto mx-auto flex h-15 w-full max-w-160 items-center justify-around rounded-full px-2 ${
          isOrderPage ? "bg-[#fff]" : "bg-bg"
        }`}>
        {items.map(({ label, path, Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            aria-label={label}
            className={({ isActive }) => {
              const active = isActive || (path === "/cart" && isOrderPage);
              return `relative flex h-12 shrink-0 items-center justify-center rounded-full text-black transition-all ${
                active ? "gap-2 bg-primary/45 px-4" : "w-12 hover:bg-black/5"
              }`;
            }}>
            {(navLink) => {
              const isActive =
                navLink.isActive || (path === "/cart" && isOrderPage);
              return (
                <>
                  {path === "/cart" && totalItems > 0 && (
                    <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-dark px-1 text-xs font-medium text-white">
                      {totalItems}
                    </span>
                  )}
                  <Icon className="size-5 shrink-0" />
                  <span
                    className={
                      isActive
                        ? "whitespace-nowrap font-Outfit text-base font-light"
                        : "sr-only"
                    }>
                    {label}
                  </span>
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>
    </footer>
  );
}
