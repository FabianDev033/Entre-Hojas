import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import {Home, Category} from "../pages";
import { ProductList } from "../Components/mainLayout";

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
    ],
  },
]);


