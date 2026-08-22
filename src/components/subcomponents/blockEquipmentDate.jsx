import { X } from "lucide-react";
import { useState } from "react";


const BlockEquipmentDate = ({ equipmentId, equipmentName, availableQuantity, onClose, onAdd }) => {

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const today = new Date().toISOString().split("T")[0];

    const addBlock = async () => {
        
        if (Number(quantity) <= 0) {
            setError("Broj komada mora biti veći od 0.");
            return;
        }
        if (new Date(endDate) < new Date(startDate)) {
            setError("Datum do mora biti nakon datuma od.");
            return;
        }
        if (Number(quantity) > availableQuantity) {
            setError(`Nema toliko dostupno — maksimalno ${availableQuantity}.`);
            return;
        }

        try {
            const response = await fetch("/api/blocked-equipment", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    equipment_id: equipmentId,
                    start_date: startDate,
                    end_date: endDate,
                    quantity: Number(quantity),
                    reason: reason,
                }),
            });
            if (response.ok) {
                setStartDate("");
                setEndDate("");
                setQuantity("");
                setReason("");
                setError("");
                onAdd();
            }
        } catch (error) {
            console.log("Pogreška prilikom blokiranja termina.")
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold">Blokiraj termin</h2>
                        <p className="text-sm text-slate-500">{equipmentName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded-full p-1"
                    >
                        <X className="w-8 h-8 text-black hover:text-white bg-white hover:bg-blue-300 rounded-full p-2" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 px-6 py-5">
                    <div className="flex flex-col">
                        <label className="text-sm text-slate-500 font-bold">Datum od</label>
                        <input
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                            type="date"
                            min={today}
                            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm text-slate-500 font-bold">Datum do</label>
                        <input
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                            min={startDate}
                            disabled={!startDate}
                            type="date"
                            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                        />
                    </div>
                </div>

                <div className="px-6 mb-5 flex flex-col">
                    <label className="text-sm text-slate-500 font-bold">Broj komada za blokirati</label>
                    <input
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                        type="number"
                        min="1"
                        max={availableQuantity}
                        className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                        placeholder="npr. 1"
                    />
                    {error && <p className="text-xs text-rose-500 mt-2">{error}</p>}
                </div>

                <div className="px-6 mb-5 flex flex-col">
                    <label className="text-sm text-slate-500 font-bold">Razlog (opcionalno)</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                        placeholder="npr. na servisu, privatno posuđeno..."
                    />
                </div>

                <div className="flex justify-end gap-2 mb-5 mt-2 px-6">
                    <button
                        onClick={onClose}
                        className="p-2 border text-sm border-gray-200 rounded-2xl text-slate-500 font-bold px-8 py-3 cursor-pointer hover:bg-gray-50"
                    >
                        Odustani
                    </button>
                    <button
                        onClick={() => addBlock()}
                        className="p-2 bg-[#1f2a63] text-sm hover:bg-[#343f76] rounded-2xl text-white font-bold px-4 py-3 cursor-pointer"
                    >
                        + Blokiraj termin
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BlockEquipmentDate;