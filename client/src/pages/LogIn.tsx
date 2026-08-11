import { User, Lock } from "../assets/icons";
import {Logo} from "../assets/images";

export default function LogIn() {
  return (
    <main className='flex flex-col items-center h-screen bg-bg-dark'>
        <header className="w-full h-15 grid grid-cols-3 items-center fixed top-0 font-Outfit font-medium text-black text-3xl text-shadow-xs">
            <div className="flex justify-self-start items-center gap-5 ml-4">
                <img src={Logo} alt="logo" className="h-10"/>
                <span>Entre Hojas</span>
            </div>
            <span className="justify-self-center text-4xl">Administracion</span>
        </header>
        <section className="w-120 aspect-5/4 bg-bg-light my-auto flex justify-center shadow-md border border-black/70 rounded-md">
            <div className="w-8/12 flex flex-col items-center gap-10 mt-3">
                <span className="font-Outfit font-medium text-black text-3xl">Log In</span>
                <form action="" className="flex flex-col gap-3 w-full font-Manrope font-light text-black">
                    <label className='relative flex items-center'>
                        <User className='absolute left-3 h-7 w-7 text-alt-dark'/>
                        <input name='nombre' type="text" id='nombre' placeholder='Usuario' className='border border-alt-dark/50 rounded-sm focus:outline-none h-13 px-13 w-full shadow-sm placeholder:text-black/60'/>
                    </label>
                    <label className='relative flex items-center'>
                        <Lock className='absolute left-3 h-7 w-7 text-alt-dark'/>
                        <input name='nombre' type="password" id='nombre' placeholder='Contraseña' className='border border-alt-dark/50 rounded-sm focus:outline-none h-13 px-13 w-full shadow-sm placeholder:text-black/60'/>
                    </label>
                </form>
                <button className="w-10/12 bg-alt-dark text-bg-dark font-Outfit font-extralight text-2xl py-2 rounded-md cursor-pointer shadow-md">Ingresar</button> 
            </div>
            
        </section>
    </main>
  )
}
