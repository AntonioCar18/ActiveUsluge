import { Calendar, CreditCard, Search, Truck } from "lucide-react";
import ReservationBlock from "./subcomponents/reservationBlock";

const Reservation = () => {

    return (
        <div id="kako-radi" className="w-full bg-white border-y border-slate-100">
            <div className="flex flex-col gap-15 max-w-7xl mx-auto px-6 py-16 items-center justify-center">
               <h2 className="text-3xl text-gray-800 font-bold leading-tight">Kako rezervacija radi?</h2>
                <div className="grid md:grid-cols-4 grid-cols-1 gap-8 text-center">
                    <ReservationBlock 
                        icon={Search}
                        title="1. Odaberite opremu"
                        desc="Pregledajte katalog i odaberite artikle za rezervaciju"
                        bgcol="bg-blue-100"
                        iconColor="text-blue-800"
                    />
                    <ReservationBlock 
                        icon={Calendar}
                        title="2. Odaberite termin"
                        desc="Provjerite dostupnost za datum vašeg eventa"
                        bgcol="bg-green-100"
                        iconColor="text-green-800"
                    />
                    <ReservationBlock 
                        icon={CreditCard}
                        title="3. Rezervirajte i platite"
                        desc="Sigurno plaćanje putem transakcijske uplate"
                        bgcol="bg-orange-100"
                        iconColor="text-orange-800"
                    />
                    <ReservationBlock 
                        icon={Truck}
                        title="4. Dostava i postavljanje"
                        desc="Mi dostavljamo, postavljamo i pokupimo opremu"
                        bgcol="bg-red-100"
                        iconColor="text-red-800"
                    />
                </div>
            </div>
        </div>
    );
}

export default Reservation;