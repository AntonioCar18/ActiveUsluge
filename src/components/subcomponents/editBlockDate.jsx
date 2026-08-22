import { X, Pencil } from "lucide-react";
import { useState } from "react";
import ErrorModal from "./errorModal";

const EditBlockDate = ({ initialData, onClose, onAdd }) => {

    const [date, setDate] = useState(initialData?.date?.split("T")[0] ?? "");
    const [reason, setReason] = useState(initialData?.reason ?? "");
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const updateBlockedDate = async () => {
        const response = await fetch(`/api/blocked-dates/${initialData.id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, reason }),
        });
        if (response.ok) {
            onAdd();
            onClose();
        } else {
            const data = await response.json();
            setErrorMessage(data.detail ?? "Ažuriranje blokiranog dana nije uspjelo.");
            setShowErrorModal(true);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold">Uredi blokirani dan</h2>
                        <p className="text-sm text-slate-500">Promijeni datum ili razlog blokade</p>
                    </div>
                    <button onClick={onClose} className="cursor-pointer rounded-full p-1">
                        <X className="w-8 h-8 text-black hover:text-white bg-white hover:bg-blue-300 rounded-full p-2" />
                    </button>
                </div>
                <div className="px-6 py-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-600">Datum</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#74c9f2]"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-600">Razlog (opcionalno)</label>
                        <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="npr. državni praznik, ne radimo"
                            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#74c9f2]"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-5 border-t border-slate-100">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">
                        Odustani
                    </button>
                    <button
                        onClick={updateBlockedDate}
                        className="flex-1 py-2.5 rounded-full bg-[#1f2a63] text-white text-sm font-semibold hover:bg-[#161d47] cursor-pointer flex items-center justify-center gap-2"
                    >
                        <Pencil className="w-4 h-4" /> Spremi promjene
                    </button>
                </div>
            </div>

            {showErrorModal && (
                <ErrorModal
                    onClose={() => setShowErrorModal(false)}
                    error={errorMessage}
                />
            )}
        </div>
    );
};

export default EditBlockDate;
