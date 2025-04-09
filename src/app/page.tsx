import Image from "next/image";
import Banner from '@/components/Banner';
import ProductCarousel from '@/components/ProductCarousel';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function Home() {
  return (
    <div  className="bg-white">
      <Banner />
      <section className="bg-[#F2EFE7] py-10 mb-10">
        <ProductCarousel />
      </section>
    </div>
  );
}
