import { Dices, Dot, Fan, Speaker, Tv } from "lucide-react";
import Hero1 from "./subcomponents/hero-1";
import Hero2 from "./subcomponents/hero-2";
import RentRequest from "./subcomponents/rentRequest";
import { useState } from "react";

const Hero = () => {

    const [showRentRequest, setShowRentRequest] = useState(false);

    return (
        <div className="w-full bg-linear-to-br from-[#1f2a63] via-[#2f3f95] to-[#74c9f2]">
            <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
                <div className="flex flex-col gap-4 items-start justify-start">
                    <div className="text-xs text-white font-semibold flex gap-2 bg-white/30 rounded-full px-4 py-1.5 items-center">
                        <p>🎉 Rođendani</p>
                        <Dot className="w-4 h-4" />
                        <p>Korporativni eventi</p>
                        <Dot className="w-4 h-4" />
                        <p>Roštilji</p>
                    </div>
                    <div className="flex flex-col gap-6">
                        <h1 className="text-5xl font-extrabold text-white leading-tight">Sva oprema za Vašu proslavu na jednom mjestu</h1>
                        <p className="text-white/85 text-[16px] font-semibold max-w-md">Zvučnici, mikrofoni, ledomati i projektori, rezervirajte online u par klikova i mi dostavljamo, postavljamo i pokupimo.</p>
                    </div>
                    <div className="flex items-center justify-start gap-4 mt-4">
                        <a href="#katalog"className="bg-white text-gray-800 px-4 py-3 font-bold cursor-pointer rounded-full border border-white">
                            Pogledaj katalog
                        </a>
                        <button onClick={() => setShowRentRequest(true)} className="bg-white/10 text-white hover:bg-white/20 px-4 py-3 font-bold cursor-pointer rounded-full border border-white">
                            Zatraži ponudu
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 bg-white/10 rounded-2xl">
                    <Hero1 
                        icon={Speaker}
                        title="Ozvučenje"
                        desc="Već od 50€/dan" 
                        icon_col="text-blue-700"   
                    />
                    <Hero2 
                        icon={Tv}
                        title="Projektorska platna"
                        desc="Trenutačno nije dostupno"
                        icon_col="text-green-700"    
                    />
                    <Hero1 
                        icon={Dices}
                        title="Ledomati"
                        desc="Trenutačno nije dostupno"
                        icon_col="text-red-700"
                    />
                    <Hero2 
                        icon={Fan}
                        title="Ventilatori"
                        desc="Trenutačno nije dostupno"
                        icon_col="text-yellow-800"    
                    />
                </div>
            </div>
            {showRentRequest && (
                <RentRequest onClose={() => setShowRentRequest(false)}/>
            )}
        </div>
    );
}

export default Hero;