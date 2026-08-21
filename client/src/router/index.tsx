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
  AddStock,
} from "../pages";
import { ProductList, PlantDetail } from "../Components/mainLayout";

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
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "login",
        element: <LogIn />,
      },
      {
        path: "ordenes",
        element: <Orders />,
      },
      {
        path: "productos",
        element: <Products />,
      },
      {
        path: "agregarProducto",
        element: <AddProd />,
      },
      {
        path: "actualizarStock",
        element: <AddStock />,
      },
    ],
  },
]);
