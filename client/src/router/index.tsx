import { createBrowserRouter } from "react-router-dom";

import { MainLayout, AdminLayout } from "../layouts";
import {
  Home,
  Category,
  Cart,
  About,
  Checkout,
  Order,
  LogIn,
  Dashboard,
  Orders,
  Products,
  AddProd,
  Shoppings,
} from "../pages";
import { ProductList, PlantDetail } from "../Components/mainLayout";
import { ProductsProvider } from "../contexts/ProductsContext";
import EditProduct from "../pages/admin/EditProduct";
import PurchaseEditor from "../pages/admin/PurchaseEditor";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/categories",
        element: <Category />,
      },
      {
        path: "/categories/:family",
        element: <ProductList />,
      },
      {
        path: "/detalle/:id",
        element: <PlantDetail />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/checkout",
        element: <Checkout />,
      },
      {
        path: "/orden/:orderId",
        element: <Order />,
      },
    ],
  },
  {
    path: "/admin/login",
    element: <LogIn />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "ordenes",
        element: <Orders />,
      },
      {
        path: "productos",
        element: <ProductsProvider><Products /></ProductsProvider>,
      },
      {
        path: "productos/:id/editar",
        element: <EditProduct />,
      },
      {
        path: "agregarProducto",
        element: <AddProd />,
      },
      {
        path: "Compras",
        element: <Shoppings />,
      },
      {
        path: "Compras/nueva",
        element: <PurchaseEditor />,
      },
      {
        path: "Compras/:id/editar",
        element: <PurchaseEditor />,
      },
    ],
  },
]);
