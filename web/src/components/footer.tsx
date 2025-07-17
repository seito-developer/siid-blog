import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-[#214a4a] text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Links Section */}
          <div className="flex gap-5 sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6">
            <Link href="https://bug-fix.org/siid" className="text-white hover:text-[#289B8F] transition-colors duration-200 font-medium underline">
              SiiD 公式
            </Link>
            <Link href="https://bug-fix.org" className="text-white hover:text-[#289B8F] transition-colors duration-200 font-medium underline">
              運営会社BugFix
            </Link>
          </div>

          {/* Copyright Section */}
          <div className="text-sm text-gray-300">&copy; 2025 SiiD Blog. All rights reserved.</div>
        </div>
      </div>
    </footer>
  )
}
