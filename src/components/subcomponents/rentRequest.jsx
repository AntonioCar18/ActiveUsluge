import { X, Check } from "lucide-react";
import { useState } from "react";

const RentRequest = ({ onClose }) => {

    const equipment = [
        { id: 1, name: "JBL PartyBox Stage 320 + bežični mikrofoni", price: 50 },
    ];

    const [step, setStep] = useState(1);
    const [selected, setSelected] = useState([]);
    const [warning, setWarning] = useState(false);

    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [oib, setOib] = useState("");
    const [location, setLocation] = useState("");

    const toggleItem = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
        );
    };

    const goToStep2 = () => {
        if (selected.length === 0) {
            setWarning(true);
            setTimeout(() => {
                setWarning(false);
            }, 3000);
            return;
        }
        setStep(2);
    };

    const handleSubmit = () => {
        setStep(3);
        setTimeout(() => {
            setStep(1);
            setSelected([]);
            setName("");
            setOib("");
            setDate("");
            setLocation("");
            onClose();
        }, 3000);
    };

    const today = new Date().toISOString().split('T')[0]

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Izvršite rezervaciju</h2>
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded-full p-1"
                    >
                        <X className="w-8 h-8 text-black hover:text-white bg-white hover:bg-blue-300 rounded-full p-2" />
                    </button>
                </div>

                {step === 1 && (
                    <>
                        <p className="text-sm mt-1 text-slate-500">Odaberite opremu koju želite iznajmiti tako da pritisnete u prazni kvadratić i označite ga kvačicom.</p>

                        <div className="flex flex-col gap-2 mt-4">
                            {equipment.map((item) => {
                                const isChecked = selected.includes(item.id);
                                return (
                                    <label
                                        key={item.id}
                                        className="flex items-center justify-between gap-3 border border-slate-200 rounded-xl px-4 py-3 cursor-pointer hover:border-[#74c9f2] transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleItem(item.id)}
                                                className="hidden"
                                            />
                                            <div
                                                className={`w-5 h-5 flex items-center justify-center rounded-md border transition ${
                                                    isChecked
                                                        ? "bg-[#2f3f95] border-[#2f3f95]"
                                                        : "bg-white border-slate-300"
                                                }`}
                                            >
                                                {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">{item.name}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-xs text-slate-500 font-bold">{item.price}€</span>
                                            <span className="text-xs text-slate-500">/dan</span>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>

                        <div className="mt-4 mb-2 flex items-center">
                            {warning && (
                                <p className="text-xs text-slate-500 p-2">Niste odabrali niti jednu od ponuđenih stavki. Molimo Vas da odaberete nešto prije sljedećeg koraka.</p>
                            )}
                            <button
                                onClick={goToStep2}
                                className="ml-auto shrink-0 text-sm bg-[#2f3f95] rounded-full px-4 py-3 cursor-pointer font-semibold text-white"
                            >
                                Sljedeći korak
                            </button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <p className="text-sm mt-1 text-slate-500">Unesite podatke potrebne za rezervaciju.</p>

                        <div className="flex flex-col gap-3 mt-4">
                            <div className="flex flex-col">
                                <label className="text-sm text-slate-500 font-bold">Ime i prezime</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full text-sm border border-slate-200 rounded-2xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                                    placeholder="Marko Horvat"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm text-slate-500 font-bold">OIB</label>
                                <input
                                    value={oib}
                                    type="number"
                                    onChange={(e) => setOib(e.target.value)}
                                    className="w-full text-sm border border-slate-200 rounded-2xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                                    placeholder="XXXXXXXXXXX"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm text-slate-500 font-bold">Datum eventa</label>
                                <input
                                    type="date"
                                    min={today}
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full text-sm border border-slate-200 rounded-2xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm text-slate-500 font-bold">Lokacija</label>
                                <input
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full text-sm border border-slate-200 rounded-2xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                                    placeholder="Zagreb, Ilica 1"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <button
                                onClick={() => setStep(1)}
                                className="text-sm text-slate-500 font-semibold cursor-pointer"
                            >
                                Natrag
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="text-sm bg-[#2f3f95] rounded-full px-4 py-3 cursor-pointer font-semibold text-white"
                            >
                                Pošalji zahtjev
                            </button>
                        </div>
                    </>
                )}

                {step === 3 && (
                    <div className="mt-6 flex flex-col items-center justify-center text-center gap-3 py-4">
                        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-800">
                            <Check className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-semibold text-gray-800">Zahtjev je poslan!</h3>
                            <p className="text-sm text-gray-500">Vaš zahtjev za rezervaciju je poslan, javit ćemo Vam se u najkraćem roku.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RentRequest;