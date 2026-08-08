import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import {Home, Category, Cart, Checkout, Order} from "../pages";
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
        element: <PlantDetail/>
      },
      {
        path: "/cart",
        element: <Cart/>
      },
      {
        path: "/checkout",
        element: <Checkout/>
      },
      {
        path: "/orden/:orderId",
        element: <Order/>
      }
    ],
  },
]);


