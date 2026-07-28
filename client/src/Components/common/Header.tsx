import { Search, Arrow, Share } from "../../assets/icons";
import { Logo } from "../../assets/images";
import { useHeader } from "../../contexts/HeaderContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { header } = useHeader();
  const navigate = useNavigate();

  const isCheckout = header.showCheckoutTitle;

  return (
    <div
      className={`
        ${header.showHeader ? "" : "hidden"}
        ${
          isCheckout
            ? "flex items-center"
            : "grid grid-cols-3 items-center"
        }
        pt-1 px-2 bg-primary w-screen h-12
        ${header.showShadow ? "shadow-md border-b border-black/30" : ""}
        z-10
      `}
    >
      {header.showBackButton ? (
        <div
          className={`
            flex items-center gap-4 pl-2 h-10 cursor-pointer
            ${isCheckout ? "w-full" : ""}
          `}
          onClick={() => navigate(-1)}
        >
          <Arrow className="w-4 h-4" />

          {header.showCartTitle && (
            <div className="font-Outfit font-normal text-black text-lg">
              Carrito
            </div>
          )}

          {header.showCheckoutTitle && (
            <div className="font-Outfit font-normal text-black text-lg">
              Finaliza tu orden
            </div>
          )}
        </div>
      ) : (
        <img
          src={Logo}
          alt="Logo"
          className="w-10 h-10 cursor-pointer"
          onClick={() => navigate("/")}
        />
      )}

      {!isCheckout && header.showSearch && (
        <div className="justify-self-center flex justify-end items-center w-55 h-8 bg-bg-light rounded-md shadow-md">
          <input
            className="w-45 ml-2 text-[0.625rem] focus:outline-none"
            placeholder={header.placeholder}
          />
          <div className="w-8 h-full bg-bg flex justify-center items-center rounded-r-md">
            <Search className="w-5 h-5" />
          </div>
        </div>
      )}

      {!isCheckout && header.showSearchIcon && (
        <div className="col-start-3 w-18 h-8 justify-self-center flex justify-between items-center">
          <Search className="w-5 h-5 cursor-pointer" />

          {header.showShare && (
            <Share className="w-5 h-5 cursor-pointer" />
          )}
        </div>
      )}
    </div>
  );
}