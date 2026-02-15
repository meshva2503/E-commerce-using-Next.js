export default function Footer() {
    return (
      <footer className="bg-gray-900 text-white py-6 text-center">
        <p className="text-lg">© {new Date().getFullYear()} MyWebsite. All Rights Reserved.</p>
        <div className="mt-4 space-x-4">
          <a href="/" className="hover:text-gray-400">Home</a>
          <a href="/about" className="hover:text-gray-400">About Us</a>
          <a href="/contact" className="hover:text-gray-400">Contact</a>
        </div>
      </footer>
    );
  }
  