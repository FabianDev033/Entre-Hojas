import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import {Home, Category} from "../pages";
import { ProductList } from "../Components/categories";

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
        path: "/categories/Ofertas",
        element: <ProductList family="Offers"/>,
      },
      {
        path: "/categories/Anturio",
        element: <ProductList family="Anturio"/>,
      },
      {
        path: "/categories/Calathea",
        element: <ProductList family="Calathea"/>,
      },
      {
        path: "/categories/Maranta",
        element: <ProductList family="Maranta"/>,
      },
      {
        path: "/categories/Monstera",
        element: <ProductList family="Monstera"/>,
      },
      {
        path: "/categories/Philodendro",
        element: <ProductList family="Philodendro"/>,
      },
      {
        path: "/categories/Potus",
        element: <ProductList family="Potus"/>,
      },
      {
        path: "/categories/Singonio",
        element: <ProductList family="Singonio"/>,
      },
      {
        path: "/categories/Todo",
        element: <ProductList family="AllPlants"/>,
      }
    ],
  },
]);


