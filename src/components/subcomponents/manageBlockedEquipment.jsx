import { X, Pencil, Trash, Check } from "lucide-react";
import { useEffect, useState } from "react";

const ManageBlockedEquipment = ({ equipmentId, equipmentName, availableQuantity, onClose, onUpdate }) => {

    const [blocks, setBlocks] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const today = new Date().toISOString().split("T")[0];

    const getBlocks = async () => {
        const response = await fetch(`/api/blocked-equipment?equipment_id=${equipmentId}`, {
            method: "GET",
            credentials: "include",
        });
        if (response.ok) {
            const data = await response.json();
            setBlocks(data.data ?? []);
        }
    };

    const startEditing = (block) => {
        setEditingId(block.id);
        setStartDate(block.start_date);
        setEndDate(block.end_date);
        setQuantity(block.quantity);
        setReason(block.reason ?? "");
        setError("");
    };

    const cancelEditing = () => {
        setEditingId(null);
        setError("");
    };

    const saveBlock = async (id) => {
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

        const response = await fetch(`/api/blocked-equipment/${id}`, {
            method: "PUT",
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
            setEditingId(null);
            setError("");
            getBlocks();
            onUpdate();
        } else {
            const data = await response.json();
            setError(data.detail ?? "Ažuriranje blokade nije uspjelo.");
        }
    };

    const deleteBlock = async (id) => {
        const response = await fetch(`/api/blocked-equipment/${id}`, {
            method: "DELETE",
            credentials: "include",
        });
        if (response.ok) {
            getBlocks();
            onUpdate();
        }
    };

    useEffect(() => {
        getBlocks();
    }, []);

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold">Uredi blokade</h2>
                        <p className="text-sm text-slate-500">{equipmentName}</p>
                    </div>
                    <button onClick={onClose} className="cursor-pointer rounded-full p-1">
                        <X className="w-8 h-8 text-black hover:text-white bg-white hover:bg-blue-300 rounded-full p-2" />
                    </button>
                </div>

                <div className="px-6 py-5 flex flex-col gap-3">
                    {blocks.length === 0 && (
                        <p className="text-sm text-slate-400">Nema aktivnih blokada za ovu opremu.</p>
                    )}

                    {blocks.map((b) => (
                        <div key={b.id} className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                            {editingId === b.id ? (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col">
                                            <label className="text-xs text-slate-500 font-bold">Datum od</label>
                                            <input
                                                type="date"
                                                min={today}
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-1.5 mt-1 focus:outline-none focus:ring-2 focus:ring-slate-100"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="text-xs text-slate-500 font-bold">Datum do</label>
                                            <input
                                                type="date"
                                                min={startDate}
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-1.5 mt-1 focus:outline-none focus:ring-2 focus:ring-slate-100"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-xs text-slate-500 font-bold">Broj komada</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={availableQuantity}
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-1.5 mt-1 focus:outline-none focus:ring-2 focus:ring-slate-100"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-xs text-slate-500 font-bold">Razlog (opcionalno)</label>
                                        <input
                                            type="text"
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-1.5 mt-1 focus:outline-none focus:ring-2 focus:ring-slate-100"
                                        />
                                    </div>
                                    {error && <p className="text-xs text-rose-500">{error}</p>}
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={cancelEditing}
                                            className="text-sm text-slate-500 font-semibold px-4 py-2 rounded-xl hover:bg-slate-50 cursor-pointer"
                                        >
                                            Odustani
                                        </button>
                                        <button
                                            onClick={() => saveBlock(b.id)}
                                            className="flex items-center gap-1.5 text-sm bg-[#1f2a63] text-white font-semibold px-4 py-2 rounded-xl hover:bg-[#161d47] cursor-pointer"
                                        >
                                            <Check className="w-3.5 h-3.5" /> Spremi
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <p className="text-sm font-medium text-slate-700">
                                            {new Date(b.start_date).toLocaleDateString("hr-HR")} – {new Date(b.end_date).toLocaleDateString("hr-HR")}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {b.quantity} kom{b.reason ? ` — ${b.reason}` : ""}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => startEditing(b)}
                                            className="flex border border-gray-200 rounded-xl cursor-pointer h-9 w-9 items-center justify-center hover:bg-gray-50 p-2"
                                        >
                                            <Pencil className="w-5 h-5 text-slate-400" />
                                        </button>
                                        <button
                                            onClick={() => deleteBlock(b.id)}
                                            className="flex border border-gray-200 rounded-xl cursor-pointer h-9 w-9 items-center justify-center hover:bg-gray-50 p-2"
                                        >
                                            <Trash className="w-5 h-5 text-slate-400" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManageBlockedEquipment;
