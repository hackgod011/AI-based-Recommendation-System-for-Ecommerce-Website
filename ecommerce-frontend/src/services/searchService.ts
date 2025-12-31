export async function searchProducts(query: string) {
  const response = await fetch(
    `/api/search?q=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}
