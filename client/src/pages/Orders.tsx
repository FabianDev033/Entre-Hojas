import React from "react";
import { Search } from "../assets/icons";

export default function Orders() {
  return (
    <main className="h-svh w-full bg-bg-dark flex flex-col gap-5 items-center">
      <div className="justify-self-center flex justify-end items-center py-2 px-4 bg-bg-light rounded-sm shadow-md mt-3 mr-60 border border-alt-dark">
        <input
          className="text-sm font-Manrope focus:outline-none"
          placeholder="Buscar ordenes"
        />
        <div className="w-11/12 h-full bg-transparent flex justify-center items-center rounded-r-md">
          <Search className="w-6 h-6 text-black" />
        </div>
      </div>

      <section className="grid grid-cols-4 grid-rows-2 gap-3 w-full h-full font-Outfit text-lg text-black">
        <div className="row-span-2 flex flex-col items-center ">
          <span className="text-3xl">En proceso</span>
        </div>
        <div
          className="row-span-2 flex flex-col items-center relative after:content-[''] 
            after:absolute
            after:h-11/12
            after:border-l 
            after:border-black
            after:-left-2">
          <span className="text-3xl">Listo para envio</span>
        </div>
        <div
          className="row-span-2 flex flex-col items-center relative after:content-[''] 
            after:absolute
            after:h-11/12
            after:border-l 
            after:border-black
            after:-left-2
            before:absolute
            before:h-11/12
            before:border-l 
            before:border-black
            before:-right-2">
          <span className="text-3xl">Enviado</span>
        </div>
        <div
          className=" flex flex-col items-center  relative after:content-[''] 
            after:absolute 
            after:w-11/12
            after:border-t 
            after:border-black
            after:-bottom-2
            ">
          <span className="text-3xl">Confirmado</span>
        </div>
        <div className="col-start-4 row-start-2 flex flex-col items-center ">
          <span className="text-3xl">Cancelado</span>
        </div>
      </section>
    </main>
  );
}
