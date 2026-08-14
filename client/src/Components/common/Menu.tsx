import { useLocation } from "react-router-dom";
import { Logo } from "../../assets/images";
import {
  Dashboard,
  Orders,
  Products,
  AddProduct,
  AddStock,
} from "../../assets/icons";
import { useNavigate } from "react-router-dom";
export default function Menu() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname === "/admin/login") return null;

  return (
    <aside className="w-80 absolute left-0 h-svh bg-bg-dark flex flex-col items-center gap-15">
      <section className="w-11/12 flex flex-col gap-5 mt-3">
        <img src={Logo} alt="" className="w-20 aspect-square" />
        <span className="font-Outfit font-medium text-4xl text-black text-shadow-2xs">
          Entre Hojas
        </span>
      </section>
      <section className="w-full px-1 flex flex-col items-center gap-10 text-black font-Outfit font-normal text-xl">
        <div
          className={`flex gap-3 items-center cursor-pointer w-full px-3 py-2 transition-all ease-in-out duration-500 ${pathname === "/admin" ? "bg-bg-light rounded-md shadow-md text-alt" : null}`}
          onClick={() => {
            navigate("/admin");
          }}>
          <Dashboard className="w-8 aspect-square" />
          <span className="text-black">Dashboard</span>
        </div>
        <div
          className={`flex gap-3 items-center cursor-pointer w-full px-3 py-2 transition-all ease-in-out duration-500 ${pathname === "/admin/ordenes" ? "bg-bg-light rounded-md shadow-md text-alt" : null}`}
          onClick={() => {
            navigate("ordenes");
          }}>
          <Orders className="w-8 aspect-square" />
          <span className="text-black">Ordenes</span>
        </div>
        <div
          className={`flex gap-3 items-center cursor-pointer w-full px-3 py-2 transition-all ease-in-out duration-500 ${pathname === "/admin/productos" ? "bg-bg-light rounded-md shadow-md text-alt" : null}`}
          onClick={() => {
            navigate("productos");
          }}>
          <Products className="w-8 aspect-square" />
          <span className="text-black">Productos</span>
        </div>
        <div
          className={`flex gap-3 items-center cursor-pointer w-full px-3 py-2 transition-all ease-in-out duration-500 ${pathname === "/admin/agregarProducto" ? "bg-bg-light rounded-md shadow-md text-alt" : null}`}
          onClick={() => {
            navigate("agregarProducto");
          }}>
          <AddProduct className="w-8 aspect-square" />
          <span className="text-black">Agregar Producto</span>
        </div>
        <div
          className={`flex gap-3 items-center cursor-pointer w-full px-3 py-2 transition-all ease-in-out duration-500 ${pathname === "/admin/actualizarStock" ? "bg-bg-light rounded-md shadow-md text-alt" : null}`}
          onClick={() => {
            navigate("actualizarStock");
          }}>
          <AddStock className="w-8 aspect-square" />
          <span className="text-black">Actualizar Stock</span>
        </div>
      </section>
    </aside>
  );
}
