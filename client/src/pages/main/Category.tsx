import { useNavigate } from 'react-router-dom'

export default function Category() {
  const navigate = useNavigate()

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
    <main className="bg-bg-light min-h-[calc(100svh-64px)] w-full flex flex-col items-center font-Outfit text-black">
      <div className="w-full max-w-3xl flex flex-col gap-4 mt-8 sm:mt-12 px-4 pb-24">
        {categories.map((category, index) => (
          <div
            key={index}
            className="w-full min-h-14 py-3 flex justify-between items-center gap-3 border-b border-black/30 cursor-pointer"
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
