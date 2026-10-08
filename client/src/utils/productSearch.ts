const normalize = (value: string) =>
  value.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("es");

export function filterPlants<T extends { name: string; family?: string | null }>(
  plants: T[],
  query: string,
): T[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return plants.filter((plant) => {
    const name = normalize(`${plant.family ?? ""} ${plant.name}`);
    return words.every((word) => name.includes(word));
  });
}
