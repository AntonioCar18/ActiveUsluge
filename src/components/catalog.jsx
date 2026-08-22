import { Info, Speaker, Tent, Lamp } from "lucide-react";
import { useState, useEffect } from "react";
import ProductInfo from "./subcomponents/productInfo";
import RentRequest from "./subcomponents/rentRequest";

const categoryIcons = {
    "Ozvučenje": Speaker,
    "Šatori": Tent,
    "Rasvjeta": Lamp,
};

const categoryColors = {
    "Ozvučenje": "bg-[#74c9f2]",
    "Šatori": "bg-[#2f3f95]",
    "Rasvjeta": "bg-orange-300",
};

const Catalog = () => {

    const [equipment, setEquipment] = useState({});
    const [activeCategory, setActiveCategory] = useState("Sve");
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [showProductInfo, setShowProductInfo] = useState(false);
    const [showRentRequest, setShowRentRequest] = useState(false);

    const getEquipment = async () => {
        const response = await fetch("/api/equipment/catalog");
        if (response.ok) {
            const data = await response.json();
            setEquipment(data);
        }
    };

    useEffect(() => {
        getEquipment();
    }, []);

    const categories = ["Sve", ...(equipment.categories ?? [])];

    const filteredEquipment = activeCategory === "Sve"
        ? equipment.equipment ?? []
        : (equipment.equipment ?? []).filter((item) => item.category === activeCategory);

    return (
        <div id="katalog" className="w-full bg-slate-50">
            <div className="flex flex-col max-w-7xl mx-auto px-6 py-20 items-start">
                <div className="flex items-center">
                    <div className="flex flex-col gap-2">
                        <h2 className="font-bold text-3xl">Katalog opreme</h2>
                        <p className="text-slate-500 text-[15px]">Odaberite kategoriju i pronađite točno ono što Vam treba</p>
                    </div>
                </div>

                <div className="flex items-center mt-4 gap-4 flex-wrap">
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
                    {filteredEquipment.map((item) => {
                        const Icon = categoryIcons[item.category] || Speaker;
                        const iconBg = categoryColors[item.category] || "bg-blue-200";
                        return (
                            <div key={item.id} className="flex flex-col w-full h-full">
                                <div className={`${iconBg} rounded-t-2xl p-8 flex items-center justify-center`}>
                                    <Icon className="w-12 h-12 text-white" />
                                </div>
                                <div className="bg-white shadow-md rounded-b-2xl p-5 flex flex-col items-start gap-4 flex-1">
                                    <div className="px-3 py-1 bg-[#e3eafb] rounded-full">
                                        <p className="font-bold tracking-tight text-xs text-[#2f3f95]">{item.category}</p>
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <h3 className="font-bold text-sm">{item.name}</h3>
                                        <p className="text-gray-700 text-xs font-extralight">{item.description}</p>
                                    </div>
                                    <div className="flex items-center justify-between w-full mt-auto">
                                        <div className="flex items-center gap-1">
                                            <strong>{item.price} €</strong>
                                            <p className="text-slate-500 text-xs">/dan</p>
                                        </div>
                                        <div
                                            onClick={() => {
                                                setSelectedEquipment(item);
                                                setShowProductInfo(true);
                                            }}
                                            className="flex rounded-full bg-blue-300 cursor-pointer"
                                        >
                                            <Info className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {showProductInfo && selectedEquipment && (
                <ProductInfo
                    title={selectedEquipment.name}
                    desc={selectedEquipment.description}
                    price={selectedEquipment.price}
                    onClose={() => setShowProductInfo(false)}
                    onRequestRent={() => {
                        setShowProductInfo(false);
                        setShowRentRequest(true);
                    }}
                />
            )}
            {showRentRequest && (
                <RentRequest onClose={() => setShowRentRequest(false)} />
            )}
        </div>
    );
}

export default Catalog; 