import { Info, Plus, Speaker } from "lucide-react";
import { useState } from "react";
import ProductInfo from "./subcomponents/productInfo";

const Catalog = () => {

    const categories = ["Sve", "Ozvučenje"]
    const [activeCategory, setActiveCategory] = useState("Sve");
    const [showProductInfo, setShowProductInfo] = useState(false);

    return (
        <div id="katalog" className="w-full bg-slate-50">
            <div className="flex flex-col max-w-7xl mx-auto px-6 py-20 items-start">
                <div className="flex items-center">
                    <div className="flex flex-col gap-2">
                        <h2 className="font-bold text-3xl">Katalog opreme</h2>
                        <p className="text-slate-500 text-[15px]">Odaberite kategoriju i pronađite točno ono što Vam treba</p>
                    </div>
                </div>
                <div className="flex items-center mt-4 gap-4">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2 shadow-md rounded-full text-sm font-medium cursor-pointer transition
                            ${
                                activeCategory === cat
                                    ? "bg-[#2f3f95] text-white"
                                    : "bg-white text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 w-full">
                    <div className="flex flex-col w-full p-4">
                        <div className="bg-blue-200 rounded-t-2xl p-8 flex items-center justify-center">
                            <Speaker className="w-12 h-12 text-white" />
                        </div>
                        <div className="bg-white shadow-md rounded-b-2xl p-5 flex flex-col items-start gap-4">
                            <div className="px-3 py-1 bg-[#e3eafb] rounded-full">
                                <p className="font-bold tracking-tight text-xs text-[#2f3f95]">Ozvučenje</p>
                            </div>
                            <div className="flex flex-col items-start">
                                <h3 className="font-bold text-sm">Set JBL Zvučnik + Bežični mikrofoni</h3>
                                <p className="text-gray-700 text-xs font-extralight">Glasni zvučnici za zabave i druženja</p>
                            </div>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-1">
                                    <strong>50 €</strong>
                                    <p className="text-slate-500 text-xs">/dan</p>
                                </div>
                                <div onClick={() => setShowProductInfo(true)} className="flex rounded-full bg-blue-300 cursor-pointer">
                                    <Info className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showProductInfo && (
                <ProductInfo
                    title="Set JBL Zvučnik + Bežični mikrofoni"
                    desc="JBL PartyBox Stage 320 (240W, Bluetooth 5.4, do 18h baterije, IPX4 zaštita od prskanja) u kompletu s 2 bežična mikrofona dometa do 30m i autonomije do 20h — idealno za glazbu, karaoke i najave na proslavi."
                    price={50}
                    onClose={() => setShowProductInfo(false)}
                />
            )}
        </div>
    );
}

export default Catalog;