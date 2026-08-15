const Footer = () => {
    const year = new Date().getFullYear();
    return(
        <footer className="border-t border-slate-100 bg-white">
            <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <p className="text-gray-600">© {year} Active usluge. Sva prava pridržana.</p>
                <p className="text-gray-600">Izradio: <a href="https://4solutions.hr"><strong>Informatički obrt 4Solutions</strong></a></p>
                <nav className="gap-4 flex">
                <a href="#" className="text-gray-600 hover:text-[#2f3f95] transition">Uvjeti najma</a>
                <a href="#" className="text-gray-600 hover:text-[#2f3f95] transition">Politika privatnosti</a>
                <a href="#kontakt" className="text-gray-600 hover:text-[#2f3f95] transition">Kontakt</a>
                </nav>
            </div>
        </footer>
    );
}

export default Footer;