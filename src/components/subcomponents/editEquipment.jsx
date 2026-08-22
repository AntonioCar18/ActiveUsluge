import { X } from "lucide-react";
import { useState } from "react";
import MissingFields from "./missingFields";

const EditEquipment = ({onClose, onAdd, initialData}) => {

    const [equipmentName, setEquipmentName] = useState(initialData?.name ?? "");
    const [equipmentCategory, setEquipmentCategory] = useState(initialData?.category ?? "");
    const [equipmentPrice, setEquipmentPrice] = useState(initialData?.price ?? "");
    const [totalEquipment, setTotalEquipment] = useState(initialData?.total_quantity ?? "");
    const [availableEquipment, setAvailableEquipment] = useState(initialData?.available_quantity ?? "");
    const [noteEquipment, setNoteEquipment] = useState(initialData?.description ?? "");
    const [missingFields, setMissingFields] = useState(false);
    const [quantityError, setQuantityError] = useState(false);

    const editEquipment = async () => {

        if(!equipmentName || !equipmentCategory || equipmentPrice === "" || totalEquipment === "" || availableEquipment === ""){
            setMissingFields(true);
            return ;
        }

        if(Number(availableEquipment) > Number(totalEquipment)){
            setQuantityError(true);
            return;
        }

        try {
            const response = await fetch (`/api/equipment/${initialData.id}`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: equipmentName,
                    category: equipmentCategory,
                    price: Number(equipmentPrice),
                    total_quantity: Number(totalEquipment),
                    available_quantity: Number(availableEquipment),
                    description: noteEquipment,
                }),
            });
            if(response.ok){
                setEquipmentName("");
                setEquipmentCategory("");
                setEquipmentPrice("");
                setTotalEquipment("");
                setAvailableEquipment("");
                setNoteEquipment("");
                onAdd();
            }
        } catch (error){
            console.log("Pogreška prilikom dodavanja opreme.")
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold">Uredi opremu</h2>
                        <p className="text-sm text-slate-500">Uredi podatke o komadu opreme</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded-full p-1"
                    >
                        <X className="w-8 h-8 text-black hover:text-white bg-white hover:bg-blue-300 rounded-full p-2" />
                    </button>
                </div>
                <div className="px-6 py-5 flex flex-col">
                    <label className="text-sm text-slate-500 font-bold">Naziv opreme</label>
                    <input
                        value={equipmentName}
                        onChange = {(e) => setEquipmentName(e.target.value)}
                        required
                        className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                        placeholder="Unesite naziv opreme"
                    />
                </div>
                <div className="px-6 mb-5 flex flex-col">
                    <label className="text-sm text-slate-500 font-bold">Kategorija</label>
                    <select
                        value={equipmentCategory}
                        onChange = {(e) => setEquipmentCategory(e.target.value)}
                        required
                        className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100 appearance-none"
                        placeholder="Odaberite kategoriju"
                    >
                        <option value="">Sve</option>
                        <option value="Ozvučenje">Ozvučenje</option>
                        <option value="Ostalo">Ostalo</option>
                    </select>
                </div>
                <div className="grid grid-cols-3 gap-4 px-6 mb-5">
                    <div className="flex flex-col">
                        <label className="text-sm text-slate-500 font-bold">Cijena/dan (€)</label>
                        <input
                            value={equipmentPrice}
                            onChange = {(e) => setEquipmentPrice(e.target.value)}
                            required
                            type="number"
                            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            placeholder=""
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm text-slate-500 font-bold">Ukupno kom.</label>
                        <input
                            value={totalEquipment}
                            onChange = {(e) => setTotalEquipment(e.target.value)}
                            required
                            type="number"
                            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            placeholder=""
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm text-slate-500 font-bold">Dostupno</label>
                        <input
                            value={availableEquipment}
                            onChange = {(e) => setAvailableEquipment(e.target.value)}
                            required
                            type="number"
                            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            placeholder=""
                        />
                    </div>
                </div>
                <div className="px-6 mb-5 flex flex-col">
                    <label className="text-sm text-slate-500 font-bold">Kratki opis (opcionalno)</label>
                    <textarea
                        value={noteEquipment}
                        onChange = {(e) => setNoteEquipment(e.target.value)}
                        type="text"
                        rows={4}
                        className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                        placeholder="Unesite kratki opis o opremi"
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
                        onClick={() => editEquipment()}
                        className="p-2 bg-[#1f2a63] text-sm hover:bg-[#343f76] rounded-2xl text-white font-bold px-4 py-3 cursor-pointer"
                    >
                        Spremi promjene
                    </button>
                </div>
            </div>
            {quantityError && (
                <MissingFields onCancel={() => setQuantityError(false)} desc="Dostupna količina opreme ne može biti veća od ukupne. Molimo Vas da ispravite svoju pogrešku."/>
            )}

            {missingFields && (
                <MissingFields
                    onCancel={() => setMissingFields(false)}
                    desc="Niste popunili sva polja prilikom uređivanja opreme, molimo Vas da provjerite."
                />
            )}
        </div>
    );
}

export default EditEquipment;
