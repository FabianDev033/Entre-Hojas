import { Search, Arrow, Share } from "../../assets/icons";
import { Logo } from "../../assets/images";
import { useLocation, useNavigate } from "react-router-dom";
import ProductSearch from "./ProductSearch";

type HeaderConfig = {
  showBackButton: boolean;
  showShadow: boolean;
  showSearch: boolean;
  showSearchIcon: boolean;
  showShare: boolean;
  title?: "Carrito" | "Finaliza tu orden" | "Entre Hojas";
};

const defaultHeader: HeaderConfig = {
  showBackButton: false,
  showShadow: false,
  showSearch: true,
  showSearchIcon: false,
  showShare: false,
};

function getHeaderConfig(pathname: string): HeaderConfig | null {
  if (pathname.startsWith("/detalle/")) return null;

  if (pathname === "/checkout") {
    return {
      showBackButton: true,
      showShadow: true,
      showSearch: false,
      showSearchIcon: false,
      showShare: false,
      title: "Finaliza tu orden",
    };
  }

  if (pathname === "/cart") {
    return {
      showBackButton: true,
      showShadow: false,
      showSearch: false,
      showSearchIcon: false,
      showShare: false,
      title: "Carrito",
    };
  }

  if (pathname === "/categories" || pathname.startsWith("/categories/")) {
    return { ...defaultHeader, showBackButton: true, showShadow: true };
  }

  if (pathname.startsWith("/orden/")) {
    return {
      showBackButton: true,
      showShadow: false,
      showSearch: false,
      showSearchIcon: false,
      showShare: false,
      title: "Entre Hojas",
    };
  }

  if (pathname === "/about") {
    return null;
  }
  return defaultHeader;
}

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const header = getHeaderConfig(pathname);

  if (!header) return null;

  const isCheckout = header.title === "Finaliza tu orden";
  const isOrder = header.title === "Entre Hojas";
  const handleHomeNavigate = () => {
    navigate(pathname === "/" ? "/admin" : "/");
  };

  return (
    <div
      className={`
        ${isCheckout ? "flex items-center" : "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center"}
        px-3 py-2 sm:px-6 w-full min-h-12 pt-2
        ${header.showShadow ? "shadow-md border-b border-black/30" : ""}
        ${pathname === "/" ? "bg-transparent" : isOrder ? "bg-bg-order" : "bg-primary"}
        relative z-20
      `}>
      {header.showBackButton ? (
        <button
          type="button"
          aria-label="Volver"
          className={`
            flex h-10 items-center gap-4 rounded-full
            ${isCheckout ? "w-full" : ""}
            ${isOrder ? "w-full px-3 py-2 justify-center bg-[#fff]" : ""}
          `}
          onClick={() => navigate(-1)}>
          <Arrow className="size-4" />

          {header.title === "Carrito" && (
            <div className="font-Outfit font-normal text-black text-lg">
              Carrito
            </div>
          )}

          {isCheckout && (
            <div className="font-Outfit font-normal text-black text-lg">
              Finaliza tu orden
            </div>
          )}
        </button>
      ) : (
        <img
          src={Logo}
          alt="Logo"
          className="w-12 h-12 cursor-pointer"
          onClick={() => handleHomeNavigate()}
        />
      )}

      {!isCheckout && header.showSearch && (
        <div className="absolute left-1/2 top-1/2 w-[50%] max-w-2xl -translate-x-1/2 -translate-y-1/2">
          <ProductSearch expanded />
        </div>
      )}

      {!isCheckout && header.showSearchIcon && (
        <div className="col-start-3 w-18 h-8 justify-self-center flex justify-between items-center ">
          <Search className="w-5 h-5 cursor-pointer" />

          {header.showShare && <Share className="w-5 h-5 cursor-pointer" />}
        </div>
      )}

      {isOrder && (
        <h1 className="absolute left-1/2 -translate-x-1/2 font-Outfit text-xl font-semibold text-primary-darkest sm:text-2xl">
          Entre Hojas
        </h1>
      )}
    </div>
  );
}
