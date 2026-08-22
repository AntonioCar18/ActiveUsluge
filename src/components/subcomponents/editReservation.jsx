import { X, Pencil } from "lucide-react";
import { useEffect, useState } from "react";

const EditReservation = ({ initialData, onClose, onAdd }) => {

    const [name, setName] = useState(initialData?.client_name ?? "");
    const [oib, setOib] = useState(initialData?.oib ?? "");
    const [selectedEquipment, setSelectedEquipment] = useState([]);
    const [reservationDate, setReservationDate] = useState(initialData?.event_date ?? "");
    const [location, setLocation] = useState(initialData?.location ?? "");
    const [amount, setAmount] = useState(initialData?.amount ?? "");
    const [status, setStatus] = useState(initialData?.status ?? "");
    const [equipmentList, setEquipmentList] = useState([]);
    const [clients, setClients] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [blockedDates, setBlockedDates] = useState([]);
    const [equipmentBlocks, setEquipmentBlocks] = useState([]);
    const [error, setError] = useState("");

    const getMinDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 2);
        return date.toISOString().split("T")[0];
    };

    const minDate = getMinDate();

    const getEquipmentList = async () => {
        const response = await fetch("/api/equipment", {
            method: "GET",
            credentials: "include",
        });
        if (response.ok) {
            const data = await response.json();
            setEquipmentList(data.equipment);
        }
    };

    const getClients = async () => {
        const response = await fetch("/api/clients", {
            method: "GET",
            credentials: "include",
        });
        if (response.ok) {
            const data = await response.json();
            setClients(data.data);
        }
    };

    const getBlockedDates = async () => {
        const response = await fetch("/api/blocked-dates", {
            method: "GET",
            credentials: "include",
        });
        if (response.ok) {
            const data = await response.json();
            setBlockedDates(data.data);
        }
    };

    const getEquipmentBlocksForSelected = async (ids) => {
        if (ids.length === 0) {
            setEquipmentBlocks([]);
            return;
        }
        const results = await Promise.all(
            ids.map((id) =>
                fetch(`/api/blocked-equipment?equipment_id=${id}`, {
                    method: "GET",
                    credentials: "include",
                }).then((res) => (res.ok ? res.json() : { data: [] }))
            )
        );
        const merged = results.flatMap((r) => r.data ?? []);
        setEquipmentBlocks(merged);
    };

    const handleNameChange = (value) => {
        setName(value);
        if (value.length >= 2) {
            const matches = clients.filter((c) =>
                c.full_name.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(matches);
        } else {
            setSuggestions([]);
        }
    };

    const selectClient = (client) => {
        setName(client.full_name);
        setOib(client.oib);
        setSuggestions([]);
    };

    const toggleEquipment = async (id) => {
        const updated = selectedEquipment.includes(id)
            ? selectedEquipment.filter((itemId) => itemId !== id)
            : [...selectedEquipment, id];
        setSelectedEquipment(updated);
        await getEquipmentBlocksForSelected(updated);
    };

    const isDateBlocked = (dateStr) => {
        const globallyBlocked = blockedDates.some((b) => b.date === dateStr);
        const equipmentBlocked = equipmentBlocks.some(
            (b) => dateStr >= b.start_date && dateStr <= b.end_date
        );
        return globallyBlocked || equipmentBlocked;
    };

    const handleDateChange = (value) => {
        setReservationDate(value);
        if (isDateBlocked(value)) {
            setError("Ovaj datum je blokiran za odabranu opremu ili cijeli dan.");
        } else {
            setError("");
        }
    };

    const updateReservation = async () => {
        if (isDateBlocked(reservationDate)) {
            setError("Ovaj datum je blokiran za odabranu opremu ili cijeli dan.");
            return;
        }

        const equipmentNames = equipmentList
            .filter((e) => selectedEquipment.includes(e.id))
            .map((e) => e.name)
            .join(", ");

        const response = await fetch(`/api/reservations/${initialData.id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                client_name: name,
                oib: oib,
                equipment: equipmentNames,
                event_date: reservationDate,
                location: location,
                amount: Number(amount),
                status: status,
            }),
        });
        if (response.ok) {
            onAdd();
        } else {
            const data = await response.json();
            setError(data.detail);
        }
    };

    useEffect(() => {
        getEquipmentList();
        getClients();
        getBlockedDates();
    }, []);

    useEffect(() => {
        if (equipmentList.length > 0 && initialData?.equipment) {
            const names = initialData.equipment.split(",").map((n) => n.trim());
            const ids = equipmentList
                .filter((eq) => names.includes(eq.name))
                .map((eq) => eq.id);
            setSelectedEquipment(ids);
            getEquipmentBlocksForSelected(ids);
        }
    }, [equipmentList]);

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold">Uredi rezervaciju</h2>
                        <p className="text-sm text-slate-500">Ažuriraj podatke o rezervaciji</p>
                    </div>
                    <button onClick={onClose} className="cursor-pointer rounded-full p-1">
                        <X className="w-8 h-8 text-black hover:text-white bg-white hover:bg-blue-300 rounded-full p-2" />
                    </button>
                </div>
                <div className="flex px-6 py-5 w-full justify-between gap-4">
                    <div className="flex flex-col gap-1 w-full relative">
                        <label className="text-sm text-slate-500 font-bold">Ime i prezime</label>
                        <input
                            type="text"
                            placeholder="npr. Ivana Kovač"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                        />
                        {suggestions.length > 0 && (
                            <div className="absolute top-full mt-1 w-full bg-white rounded-xl border border-slate-100 shadow-lg py-1.5 z-10">
                                {suggestions.map((c) => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => selectClient(c)}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                                    >
                                        {c.full_name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm text-slate-500 font-bold">OIB</label>
                        <input
                            type="number"
                            placeholder="XXXXXXXXXXX"
                            value={oib}
                            onChange={(e) => setOib(e.target.value)}
                            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                        />
                    </div>
                </div>
                <div className="flex px-6 w-full pb-5">
                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm text-slate-500 font-bold">Oprema</label>
                        <div className="flex flex-col gap-2 mt-2 max-h-48 overflow-y-auto">
                            {equipmentList?.map((e) => {
                                const isChecked = selectedEquipment.includes(e.id);
                                const isUnavailable = e.real_available <= 0 && !isChecked;
                                return (
                                    <label
                                        key={e.id}
                                        className={`flex items-center gap-2 border rounded-xl px-4 py-2 ${
                                            isUnavailable
                                                ? "border-slate-100 opacity-40 cursor-not-allowed"
                                                : "border-slate-200 cursor-pointer hover:border-[#74c9f2]"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            disabled={isUnavailable}
                                            onChange={() => toggleEquipment(e.id)}
                                            className="accent-[#1f2a63]"
                                        />
                                        <span className="text-sm text-slate-700">
                                            {e.name}{isUnavailable ? " (nedostupno)" : ""}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="flex px-6 w-full pb-5 gap-4">
                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm text-slate-500 font-bold">Datum eventa</label>
                        <input
                            type="date"
                            min={minDate}
                            value={reservationDate}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                        />
                        {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm text-slate-500 font-bold">Lokacija</label>
                        <input
                            type="text"
                            placeholder="Zagreb"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                        />
                    </div>
                </div>
                <div className="flex px-6 w-full pb-5 gap-4 border-b border-slate-100">
                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm text-slate-500 font-bold">Iznos</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                        />
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm text-slate-500 font-bold">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                        >
                            <option value="">Odaberi status</option>
                            <option value="Na čekanju">Na čekanju</option>
                            <option value="Potvrđeno">Potvrđeno</option>
                            <option value="Otkazano">Otkazano</option>
                        </select>
                    </div>
                </div>
                <div className="px-6 flex justify-between items-center pt-5 pb-5 gap-4">
                    <button
                        onClick={onClose}
                        className="cursor-pointer flex-1 py-2.5 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                        Odustani
                    </button>
                    <button
                        onClick={updateReservation}
                        className="cursor-pointer flex-1 py-2.5 rounded-full bg-[#1f2a63] text-white text-sm font-semibold hover:bg-[#161d47] flex items-center justify-center gap-2"
                    >
                        <Pencil className="w-4 h-4" /> Spremi promjene
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditReservation;
