import Navbar from "@/components/Navbar";
import ProductDetail from "@/components/ProductDetail";

export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <>
      <Navbar />
      <ProductDetail id={params.id} />
    </>
  );
}
