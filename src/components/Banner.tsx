import Image from 'next/image';

export default function Banner() {
  return (
    <div className="relative w-full h-[500px]">
      {/* <Image 
        src="/banner1.jpg" 
        alt="Banner Image" 
        width={1920} 
        height={500} 
        unoptimized={true}  
      /> */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white bg-black bg-opacity-50">
        <h1 className="text-4xl md:text-6xl font-bold">Welcome to Our Website</h1>
        <p className="mt-4 text-lg md:text-xl">Explore our amazing features and services</p>
        <a href="/about" className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Learn More
        </a>
      </div>
    </div>
  );
}
