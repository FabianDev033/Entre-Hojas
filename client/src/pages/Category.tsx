import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useHeader } from '../contexts/HeaderContext'

export default function Category() {
  const { configureHeader } = useHeader()
  const navigate = useNavigate()

  React.useEffect(() => {
    configureHeader({
      placeholder: "Buscar Entre Hojas",
      showBackButton: true,
      showShadow: true,
    })
  }, [])

  const categories = [
    { name: "Ofertas", amount: 0 },
    { name: "Singonio", amount: 5, path: "/categories/Singonio" },
    { name: "Potus", amount: 5, path: "/categories/Potus" },
    { name: "Monstera", amount: 2 },
    { name: "Todo", amount: 12 },
  ]

  const handleCategories = (path?: string) => {
    if (path) {
      navigate(path)
    }
  }

  return (
    <main className="bg-bg-light h-[calc(100svh-3rem)] min-w-screen flex flex-col items-center font-Outfit text-black">
      <div className="w-full flex flex-col gap-6 mt-24">
        {categories.map((category, index) => (
          <div
            key={index}
            className="w-full px-2 flex justify-between items-center gap-2 border-b border-black cursor-pointer"
            onClick={() => handleCategories(category.path)}
          >
            <span className="text-3xl">{category.name}</span>
            {category.amount > 0 && category.name !== "Todo" && (
              <span className="text-md text-black/80">{category.amount} variedades</span>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
