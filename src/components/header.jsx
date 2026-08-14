import { ShoppingCart } from 'lucide-react'

const Header = () => {
    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6 py-1 flex items-center justify-between">
                <a href="/" className="flex items-center">
                    <img src="/logo.png" alt="Active usluge" className="h-15" />
                </a>

                <nav className="hidden md:flex items-center gap-6 text-sm">
                    <a href="#katalog" className="text-gray-600 hover:text-[#2f3f95] transition">Katalog</a>
                    <a href="#kako-radi" className="text-gray-600 hover:text-[#2f3f95] transition">Kako rezervirati</a>
                    <a href="#kontakt" className="text-gray-600 hover:text-[#2f3f95] transition">Kontakt</a>
                </nav>

                <div className="flex items-center gap-4">
                    <button className="hidden items-center gap-2 text-sm text-gray-600 hover:text-[#2f3f95] cursor-pointer transition">
                        <ShoppingCart className="w-4 h-4" />
                        <span>Košarica (0)</span>
                    </button>
                    <a href="tel:+385976791040" className="px-6 py-2 bg-[#2f3f95] hover:bg-[#1f2a63] rounded-2xl text-white font-semibold cursor-pointer text-sm transition">
                        Kontaktiraj nas
                    </a>
                </div>
            </div>
        </header>
    );
}

export default Header