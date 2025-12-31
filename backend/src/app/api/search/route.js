import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ products: [] });
  }


  const url = `https://real-time-amazon-data.p.rapidapi.com/search?query=${query}&page=1&country=US`;

  try {
    const response = await fetch(url, {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
      },
    });

    const data = await response.json();

    // 🔥 Filter only what frontend needs
    const products = data?.data?.products?.map((p) => ({
      asin: p.asin,
      title: p.product_title,
      price: p.product_price,
      image: p.product_photo,
      rating: p.product_star_rating,
      reviews: p.product_num_ratings,
    }));

    return NextResponse.json({ products });

  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
