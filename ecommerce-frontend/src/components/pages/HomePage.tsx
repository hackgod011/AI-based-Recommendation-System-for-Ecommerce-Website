import Section from "@/components/sections/Section";
import HorizontalScroller from "@/components/carousels/HorizontalScroller";
import ProductCard from "@/components/carousels/ProductCard";
import Grid from "@/components/grids/Grid";
import GridCard from "@/components/grids/GridCard";
import FeaturedGrid from "@/components/grids/FeaturedGrid";
import HeroCarousel from "@/components/carousels/HeroCarousel";
import Footer from "@/components/footer/Footer";

import { recommendedProducts } from "@/data/recommendations";
import { furnitureCategories } from "@/data/categories";
import { heroSlides } from "@/data/heroSlides";
import { electronicsFeature } from "@/data/featured";

import { useState, useEffect } from "react";
import { ProductCardSkeleton, GridCardSkeleton } from "@/components/ui/LoadingSkeleton";

export default function HomePage() {
  const [loading, setLoading] = useState(true);

  // Simulate data loading
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel slides={heroSlides} autoPlayInterval={5000} />

      {/* Main Content with gray background */}
      <div className="bg-gradient-to-b from-[#e3e6e6] to-[#f3f4f4] min-h-screen">
        
        {/* Main Content Container */}
        <div className="max-w-[1500px] mx-auto px-4 pt-6">
          
          {/* Pattern B: Horizontal Scroll - Recommendations */}
          <Section title="Recommended for you" backgroundColor="white">
            <HorizontalScroller>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              ) : (
                recommendedProducts.map((item) => (
                  <ProductCard
                    key={item.id}
                    image={item.image}
                    title={item.title}
                    price={item.price}
                    onClick={() => console.log('Product clicked:', item.id)}
                  />
                ))
              )}
            </HorizontalScroller>
          </Section>


          {/* Pattern A: Grid Layout - Furniture */}
          <Section 
            title="Up to 60% off | Furniture" 
            actionText="See more"
            onActionClick={() => console.log('See more furniture')}
            backgroundColor="white"
          >
            <Grid columns={4}>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <GridCardSkeleton key={i} />
                ))
              ) : (
                furnitureCategories.map((item, index) => (
                  <GridCard
                    key={index}
                    image={item.image}
                    title={item.title}
                    onClick={() => console.log('Category clicked:', item.title)}
                  />
                ))
              )}
            </Grid>
          </Section>


          {/* Pattern C: Featured + Side Items - Electronics */}
          <Section 
            title="Electronics & Gadgets" 
            actionText="Explore all"
            onActionClick={() => console.log('Explore electronics')}
            backgroundColor="white"
          >
            {loading ? (
              <Grid columns={4}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <GridCardSkeleton key={i} />
                ))}
              </Grid>
            ) : (
              <FeaturedGrid 
                featuredItem={electronicsFeature.featuredItem}
                sideItems={electronicsFeature.sideItems}
              />
            )}
          </Section>

          {/* Add more sections here as needed */}      
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}