import { X, Check } from "lucide-react";
import { useEffect, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { hr } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

const RentRequest = ({ onClose }) => {

    registerLocale("hr", hr);

    const [equipmentList, setEquipmentList] = useState([]);
    const [blockedDates, setBlockedDates] = useState([]);
    const [equipmentBlocks, setEquipmentBlocks] = useState([]);

    const [step, setStep] = useState(1);
    const [selected, setSelected] = useState([]);
    const [warning, setWarning] = useState(false);

    const [name, setName] = useState("");
    const [date, setDate] = useState(null);
    const [oib, setOib] = useState("");
    const [location, setLocation] = useState("");
    const [dateError, setDateError] = useState("");
    const [submitError, setSubmitError] = useState("");

    const getEquipmentList = async () => {
        const response = await fetch("/api/equipment/catalog");
        if (response.ok) {
            const data = await response.json();
            setEquipmentList(data.equipment ?? []);
        }
    };

    const getBlockedDates = async () => {
        const response = await fetch("/api/public/blocked-dates");
        if (response.ok) {
            const data = await response.json();
            setBlockedDates(data.data ?? []);
        }
    };

    const getEquipmentBlocksForSelected = async () => {
        const results = await Promise.all(
            selected.map((id) =>
                fetch(`/api/public/blocked-equipment?equipment_id=${id}`).then((res) =>
                    res.ok ? res.json() : { data: [] }
                )
            )
        );
        const merged = results.flatMap((r) => r.data ?? []);
        setEquipmentBlocks(merged);
    };

    const toDateString = (d) => {
        if (!d) return "";
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    };

    const isDateBlocked = (d) => {
        const dateStr = toDateString(d);
        if (!dateStr) return false;
        const globallyBlocked = blockedDates.some((b) => b.date === dateStr);
        const equipmentBlocked = equipmentBlocks.some(
            (b) => dateStr >= b.start_date && dateStr <= b.end_date
        );
        return globallyBlocked || equipmentBlocked;
    };

    const getMinDate = () => {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        return d;
    };

    const totalPrice = equipmentList
        .filter((e) => selected.includes(e.id))
        .reduce((sum, e) => sum + Number(e.price), 0);

    const toggleItem = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
        );
    };

    const goToStep2 = async () => {
        if (selected.length === 0) {
            setWarning(true);
            setTimeout(() => {
                setWarning(false);
            }, 3000);
            return;
        }
        await getEquipmentBlocksForSelected();
        setStep(2);
    };

    const handleDateChange = (d) => {
        setDate(d);
        if (isDateBlocked(d)) {
            setDateError("Ovaj datum je zauzet za odabranu opremu ili cijeli dan. Odaberite drugi datum.");
        } else {
            setDateError("");
        }
    };

    const handleSubmit = async () => {
        if (isDateBlocked(date)) {
            setDateError("Ovaj datum je zauzet za odabranu opremu ili cijeli dan. Odaberite drugi datum.");
            return;
        }

        const equipmentNames = equipmentList
            .filter((e) => selected.includes(e.id))
            .map((e) => e.name)
            .join(", ");

        try {
            const response = await fetch("/api/public/reservations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    client_name: name,
                    oib: oib,
                    equipment: equipmentNames,
                    equipment_ids: selected,
                    event_date: toDateString(date),
                    location: location,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                setSubmitError(data.detail ?? "Slanje zahtjeva nije uspjelo.");
                return;
            }

            setSubmitError("");
            setStep(3);
            setTimeout(() => {
                setStep(1);
                setSelected([]);
                setName("");
                setOib("");
                setDate(null);
                setLocation("");
                onClose();
            }, 3000);
        } catch (err) {
            setSubmitError("Slanje zahtjeva nije uspjelo. Pokušajte ponovno.");
        }
    };

    useEffect(() => {
        getEquipmentList();
        getBlockedDates();
    }, []);

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
                            {equipmentList.map((item) => {
                                const isChecked = selected.includes(item.id);
                                const isUnavailable = item.real_available <= 0;
                                return (
                                    <label
                                        key={item.id}
                                        className={`flex items-center justify-between gap-3 border rounded-xl px-4 py-3 transition ${
                                            isUnavailable
                                                ? "border-slate-100 opacity-40 cursor-not-allowed"
                                                : "border-slate-200 cursor-pointer hover:border-[#74c9f2]"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                disabled={isUnavailable}
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
                                            <span className="text-sm font-medium text-slate-700">
                                                {item.name}{isUnavailable ? " (nedostupno)" : ""}
                                            </span>
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
                                <DatePicker
                                    selected={date}
                                    locale="hr"
                                    onChange={handleDateChange}
                                    minDate={getMinDate()}
                                    dateFormat="dd.MM.yyyy"
                                    placeholderText="Odaberite datum"
                                    className="w-full text-sm border border-slate-200 rounded-2xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                                />
                                {dateError && <p className="text-xs text-rose-500 mt-1">{dateError}</p>}
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

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                            <span className="text-sm text-slate-500">Ukupna cijena (bez poštarine)</span>
                            <span className="text-sm font-bold text-[#2f3f95]">{totalPrice}€</span>
                        </div>

                        {submitError && <p className="text-xs text-rose-500 mt-3">{submitError}</p>}

                        <div className="mt-6 flex items-center justify-between">
                            <button
                                onClick={() => setStep(1)}
                                className="text-sm text-slate-500 font-semibold cursor-pointer"
                            >
                                Natrag
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!name || !oib || !date || !location || !!dateError}
                                className="text-sm bg-[#2f3f95] rounded-full px-4 py-3 cursor-pointer font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
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
