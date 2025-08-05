export function Footer() {
  return (
    <footer className="w-full py-6 text-center border-t bg-gray-50 dark:bg-gray-900 text-muted-foreground">
      <div className="container mx-auto px-4 md:px-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} SMAN 1 Berbek. Semua Hak Dilindungi.
        </p>
        <div className="mt-2 text-xs">
          <a href="#" className="hover:underline mx-2 text-gray-600 dark:text-gray-300">
            Kebijakan Privasi
          </a>{" "}
          |
          <a href="#" className="hover:underline mx-2 text-gray-600 dark:text-gray-300">
            Syarat & Ketentuan
          </a>
        </div>
      </div>
    </footer>
  );
}