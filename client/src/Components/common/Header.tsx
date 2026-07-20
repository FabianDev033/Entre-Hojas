import {Search, Arrow, Share} from "../../assets/icons"
import {Logo} from "../../assets/images"
import { useHeader } from "../../contexts/HeaderContext";
import {useNavigate} from "react-router-dom"
export default function Header() {
  const { header } = useHeader();
  const navigate = useNavigate();

  return (
    <div className={`grid grid-cols-3 items-center pt-1 px-2 bg-primary w-screen h-12 ${header.showShadow ? 'shadow-md' : ''} z-10`}>
      {header.showBackButton ? (
        <div className="flex justify-center items-center w-10 h-10 cursor-pointer" onClick={() => navigate(-1)}>
          <Arrow className="w-14 h-14 cursor-pointer z-20" />
        </div>
      ) : (
        <img src={Logo} alt="Logo" className="w-10 h-10 cursor-pointer" onClick={() => navigate('/')} />
      )}

      
        {
          header.showSearch? (
            <div className="justify-self-center flex justify-end items-center w-55 h-8 bg-bg-light rounded-md shadow-md">
              <input
                className="w-45 ml-2 text-[0.625rem] focus:outline-none"
                placeholder={header.placeholder}
              />
              <div className="w-8 h-full bg-bg flex justify-center items-center rounded-r-md">
                <Search className="w-5 h-5" />
              </div>
            </div>
          ):(
            <div className="col-start-3 w-18 h-8 justify-self-center flex justify-between items-center">
              <Search className="w-5 h-5 z-20 cursor-pointer" />
              {
                header.showShare? (
                  <Share className="w-5 h-5 z-20 cursor-pointer"/>
                ): null
              }
            </div>
          )
        }
    </div>
  );
}