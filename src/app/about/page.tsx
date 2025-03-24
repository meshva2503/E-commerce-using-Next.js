export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      <section className="relative w-full h-[400px] bg-gray-900 text-white flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold">About Us</h1>
        <p className="text-lg mt-3 max-w-2xl">
          Learn more about our story, values, and the team behind our success.
        </p>
      </section>

      <section className="mt-12 text-center">
        <h2 className="text-3xl font-semibold">Who We Are</h2>
        <p className="mt-4 text-lg text-gray-600">
          We are a dedicated team passionate about providing the best solutions to our clients. Our company believes in innovation, teamwork, and customer satisfaction.
        </p>
      </section>

      <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-gray-100 rounded-lg text-center shadow-md">
          <h3 className="text-2xl font-bold text-black">Our Mission</h3>
          <p className="mt-3 text-gray-700">
            To empower businesses with cutting-edge technology, delivering high-quality products and services that drive success.
          </p>
        </div>
        <div className="p-6 bg-gray-100 rounded-lg text-center shadow-md">
          <h3 className="text-2xl font-bold text-black">Our Vision</h3>
          <p className="mt-3 text-gray-700">
            To be the leading force in innovation, creating sustainable and impactful solutions for a better future.
          </p>
        </div>
      </section>

      <section className="mt-12 text-center">
        <h2 className="text-3xl font-semibold">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">

          <div className="p-4 bg-white shadow-lg rounded-lg">
            <img src="/team1.jpeg" alt="John Doe" className="w-32 h-32 mx-auto rounded-full object-cover" />
            <h3 className="text-xl font-semibold mt-4 text-black">John Doe</h3>
            <p className="text-gray-500">CEO & Founder</p>
          </div>

          <div className="p-4 bg-white shadow-lg rounded-lg">
            <img src="/team2.jpeg" alt="Jane Smith" className="w-32 h-32 mx-auto rounded-full object-cover" />
            <h3 className="text-xl font-semibold mt-4 text-black">Jane Smith</h3>
            <p className="text-gray-500">CTO</p>
          </div>

          <div className="p-4 bg-white shadow-lg rounded-lg">
            <img src="/team1.jpeg" alt="Mike Johnson" className="w-32 h-32 mx-auto rounded-full object-cover" />
            <h3 className="text-xl font-semibold mt-4 text-black">Mike Johnson</h3>
            <p className="text-gray-500">Head of Marketing</p>
          </div>
        </div>
      </section>


      <section className="mt-12 bg-gray-900 text-white text-center py-6">
        <h3 className="text-2xl font-bold">Get In Touch</h3>
        <p className="mt-3">Have questions? Contact us at <a href="mailto:contact@company.com" className="underline">contact@company.com</a></p>
      </section>
    </div>
  );
}
