export function isProductAvailable(product: { habilitado: boolean; stock: number }): boolean {
  return product.habilitado && product.stock > 0;
}
