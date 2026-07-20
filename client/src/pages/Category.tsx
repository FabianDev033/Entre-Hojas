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
    { name: "Ofertas", amount: 3},
    { name: "Anturio", amount: 1},
    { name: "Calathea", amount: 1},
    { name: "Maranta", amount: 2},
    { name: "Monstera", amount: 2},
    { name: "Philodendro", amount: 0},
    { name: "Potus", amount: 5},
    { name: "Singonio", amount: 5},
    { name: "Todo", amount: 16},
  ]

  const handleNavigate = (name: string) => {
    if (name) {
      navigate(`/categories/${name}`)
    }
  }

  return (
    <main className="bg-bg-light min-h-[calc(100svh-55px)] min-w-screen flex flex-col items-center font-Outfit text-black">
      <div className="w-full flex flex-col gap-6 mt-24 pb-30">
        {categories.map((category, index) => (
          <div
            key={index}
            className="w-full px-2 flex justify-between items-center gap-2 border-b border-black cursor-pointer"
            onClick={() => handleNavigate(category.name)}
          >
            <span className="text-3xl">{category.name}</span>
            {category.amount > 0 && (
              <span className="text-md text-black/80">{category.amount} variedades</span>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
