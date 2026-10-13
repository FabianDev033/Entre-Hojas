import ProductForm from "../../Components/admin/ProductForm";

export default function AddProd() {
  return (
    <main className="h-svh overflow-y-auto overscroll-y-contain bg-bg-dark px-6 py-5 text-black font-Manrope">
      <div className="mx-auto w-full max-w-6xl">
        <ProductForm />
      </div>
    </main>
  );
}
