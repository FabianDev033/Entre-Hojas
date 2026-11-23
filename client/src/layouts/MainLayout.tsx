import { Outlet, useLocation } from "react-router-dom";
import { Footer, Header, LeafGradientBackground } from "../Components/common";
import { ScrollToTop } from "../Components/mainLayout";
export default function MainLayout() {
  const location = useLocation();
  const isCartPage = location.pathname === "/cart";
  const isCheckoutPage = location.pathname === "/checkout";

  return (
    <>
    <div className="relative isolate flex min-h-svh flex-col bg-bg-light">
      <ScrollToTop/>
      {location.pathname === "/" && (
        <LeafGradientBackground className="absolute inset-x-0 top-0 z-0 h-80" />
      )}
      <Header/>

      <main className="relative z-10 flex-1">
        <Outlet />
      </main>
      {!isCartPage && !isCheckoutPage && <Footer />}
    </div>
    </>
  );
}
