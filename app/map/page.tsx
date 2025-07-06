import Header from "@/components/header";
import WaterBackground from "@/components/water-background";
import MapClientWrapper from "./client-wrapper";

// Force static generation for this page
export const forceStatic = "force-static";
export const revalidate = 3600; // Revalidate every hour

export default function MapPage() {
  return (
    <>
      <WaterBackground />
      <Header />
      <div className="page-container">
        <div className="container mx-auto px-4 pt-24 pb-8">
          <h1 className="text-5xl font-bold mb-6 text-black">find hai.</h1>
          <p className="text-xl mb-8 text-black text-center">
            Discover licensed dispensaries in New York State where hai. tested
            test products are available.
          </p>

          <MapClientWrapper />
        </div>
      </div>
    </>
  );
}
