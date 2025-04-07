import Image from "next/image";
import Banner from '@/components/Banner';
import ProductCarousel from '@/components/ProductCarousel';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function Home() {
  return (
    <div>
      <Banner />
      <section className="bg-black-50 py-10">
        <ProductCarousel />
      </section>
    </div>
  );
}
