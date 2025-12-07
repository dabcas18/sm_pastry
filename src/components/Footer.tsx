export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="container mx-auto px-6 py-4 text-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-600">&copy; 2025 Sisters & Mom Pastry Shop</p>
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs text-gray-400">
            <span>Built by <span className="font-semibold text-gray-600">DABCAS Digital Solutions</span></span>
            <span className="hidden sm:inline">•</span>
            <a
              href="mailto:imdenisalimpolos@gmail.com?subject=Website Inquiry"
              className="text-[#82C3A3] hover:underline"
            >
              imdenisalimpolos@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
