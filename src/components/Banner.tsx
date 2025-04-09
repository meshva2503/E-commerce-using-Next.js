import Image from 'next/image';

export default function Banner() {
  return (
    <div className="relative w-full h-[500px]">
      {/* <Image 
        src="/bg-1.jpeg" 
        alt="Banner Image" 
        width={1920} 
        height={500} 
        unoptimized={true}  
      /> */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-black bg-white">
        <h1 className="text-4xl md:text-6xl font-bold">Welcome to Our Website</h1>
        <p className="mt-4 text-lg md:text-xl">Explore our amazing features and services</p>
        <a href="/about" className="mt-6 px-6 py-3 bg-[#006A71] text-white rounded-lg hover:bg-[#48A6A7]">
          Learn More
        </a>
      </div>
    </div>
  );
}
