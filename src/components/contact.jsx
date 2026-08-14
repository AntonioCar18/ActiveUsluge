const Contact = () => {
    return (
        <div id="kontakt" className="w-full bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="px-8 py-10 md:py-16 flex flex-col md:flex-row gap-4 justify-between bg-linear-to-br from-[#1f2a63] via-[#2f3f95] to-[#74c9f2] rounded-3xl">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-white text-3xl font-bold mb-2">Planirate proslavu?</h2>
                        <p className="text-white/85 font-semibold ">Kontaktirajte nas za personaliziranu ponudu, odgovaramo Vam u 24h.</p>
                    </div>
                    <div className="flex items-center justify-start gap-4 mt-4">
                        <button onClick={() => "tel:+385976791040"} className="bg-white text-gray-800 px-6 py-3 font-bold cursor-pointer rounded-full border border-white">
                            Nazovi nas
                        </button>
                        <button className="bg-white/10 text-white hover:bg-white/20 px-4 py-3 font-bold cursor-pointer rounded-full border border-white">
                            Pošalji upit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;