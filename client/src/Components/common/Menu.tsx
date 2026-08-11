import {useLocation} from "react-router-dom";

export default function Menu() {
  const { pathname } = useLocation();

  return (
    <>
      {pathname === "/admin" ? (
        null
      ) : (
        <div>menu</div>
      )}
    </>
  )
}
