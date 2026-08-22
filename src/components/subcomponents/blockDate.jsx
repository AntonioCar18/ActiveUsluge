import { ChevronLeft, ChevronRight, MoveLeft, MoveRight, X } from "lucide-react";
import { useState } from "react";
import ErrorModal from "./errorModal";

const dayLabels = ["P", "U", "S", "Č", "P", "S", "N"];
const monthNames = [
    "Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj",
    "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"
];

const BlockDate = ({ onClose, onAdd }) => {

    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const emptyCells = Array.from({ length: offset });
    const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const [selectedDates, setSelectedDates] = useState([])
    const [reason, setReason] = useState("");
    const todayStr = new Date().toISOString().split("T")[0];
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const toDateString = (day) => {
        const mm = String(month + 1).padStart(2, "0");
        const dd = String(day).padStart(2, "0");
        return `${year}-${mm}-${dd}`;
    };

    const toggleDate = (dateStr) => {
        setSelectedDates((prev) =>
            prev.includes(dateStr)
                ? prev.filter((d) => d !== dateStr)
                : [...prev, dateStr]
        );
    };

    const goToPrevMonth = () => {
        if(month === 0){
            setMonth(11)
            setYear((y) => y - 1);
        } else {
            setMonth((m) => m - 1);
        }
    };

    const goToNextMonth = () => {
        if(month === 11){
            setMonth(0)
            setYear((y) => y + 1);
        } else {
            setMonth((m) => m + 1);
        }
    };

    const blockDates = async () => {
        try {
            const response = await fetch("/api/blocked-dates", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dates: selectedDates,
                    reason: reason,
                }),
            });
            if (response.ok) {
                setSelectedDates([]);
                setReason("");
                onClose();
                onAdd();
            } else {
                const data = await response.json();
                setErrorMessage(data.detail ?? "Blokiranje dana nije uspjelo.");
                setShowErrorModal(true);
            }
        } catch (error) {
            console.log("Pogreška prilikom blokiranja dana.");
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold">Datum za blokadu</h2>
                        <p className="text-sm text-slate-500">Odaberi datume koje želiš blokirati</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded-full p-1"
                    >
                        <X className="w-8 h-8 text-black hover:text-white bg-white hover:bg-blue-300 rounded-full p-2" />
                    </button>
                </div>
                <div className="px-6 py-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <button onClick={() => goToPrevMonth()} className="cursor-pointer text-slate-400"><ChevronLeft className="w-4 h-4"/></button>
                        <p className="text-sm font-semibold">{monthNames[month]} {year}.</p>
                        <button onClick={() => goToNextMonth()} className="cursor-pointer text-slate-400"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
                <div className="px-6 grid grid-cols-7 text-center text-xs text-slate-500 mb-2 gap-1">
                    {dayLabels.map((d, i) => (
                        <span key={i} className="mb-2">{d}</span>
                    ))}
                    {emptyCells.map((_, i) => (
                        <span key={`empty-${i}`}></span>
                    ))}
                    {dayCells.map((day) => {
                        const dateStr = toDateString(day);
                        const isSelected = selectedDates.includes(dateStr);
                        const isPast = dateStr < todayStr;
                        return (
                            <span
                                key={day}
                                onClick={() => !isPast && toggleDate(dateStr)}
                                className={`py-2 rounded-full ${
                                    isPast
                                        ? "text-slate-200 cursor-not-allowed"
                                        : isSelected
                                            ? "bg-[#1f2a63] text-white font-semibold cursor-pointer"
                                            : "hover:bg-slate-50 cursor-pointer"
                                }`}
                            >
                                {day}
                            </span>
                        );
                    })}
                </div>
                {selectedDates.length > 0 && (
                    <p className="px-6 text-xs text-slate-400">
                        Odabrano: <span className="font-semibold text-[#1f2a63]">{selectedDates.length} dana</span>
                    </p>
                )}

                <div className="px-6 py-6 flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-600">Razlog (opcionalno)</label>
                    <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="npr. državni praznik, ne radimo"
                        className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#74c9f2]"
                    />
                </div>

                <div className="flex items-center gap-3 px-6 py-5 border-t border-slate-100">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">
                        Odustani
                    </button>
                    <button
                        onClick={blockDates}
                        disabled={selectedDates.length === 0}
                        className="flex-1 py-2.5 rounded-full bg-[#1f2a63] text-white text-sm font-semibold hover:bg-[#161d47] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Blokiraj odabrane dane
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

export default BlockDate;
