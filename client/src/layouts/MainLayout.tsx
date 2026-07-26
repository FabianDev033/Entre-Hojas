import { Outlet } from "react-router-dom";
import {Header, Footer} from "../Components/common";
import { ScrollToTop } from "../Components/mainLayout";
export default function MainLayout() {
  return (
    <>
    <div className="flex min-h-svh flex-col">
      <ScrollToTop/>
      <Header/>

      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
    </>
  );
}