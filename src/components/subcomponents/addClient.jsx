import { X } from "lucide-react";
import { useState } from "react";
import MissingFields from "./missingFields";

const AddClient = ({onClose, onAdd}) => {

    const [name, setName] = useState("");
    const [clientOIB, setClientOIB] = useState("");
    const [emailAddress, setEmailAddress] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [error, setError] = useState("");
    const [missingFields, setMissingFields] = useState(false)

    const AddClient = async () => {

        if(!name || !clientOIB || !emailAddress || !phoneNumber || !address){
            setMissingFields(true);
        }

        try {
            const response = await fetch ("/api/clients", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name: name,
                    oib: clientOIB,
                    email: emailAddress,
                    phone: phoneNumber,
                    address: address,
                }),
            });
            if(response.ok){
                setName("");
                setClientOIB("");
                setEmailAddress("");
                setPhoneNumber("");
                setAddress("");
                onAdd();
            }
        } catch (error){
            console.log("Pogreška prilikom dodavanja klijenta.")
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold">Dodaj klijenta</h2>
                        <p className="text-sm text-slate-500">Popuni podatke o novom klijentu</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded-full p-1"
                    >
                        <X className="w-8 h-8 text-black hover:text-white bg-white hover:bg-blue-300 rounded-full p-2" />
                    </button>
                </div>
                <div className="px-6 py-5 flex flex-col">
                    <label className="text-sm text-slate-500 font-bold">Ime i prezime klijenta</label>
                    <input
                        value={name}
                        onChange = {(e) => setName(e.target.value)}
                        required
                        className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                        placeholder="Unesite naziv opreme"
                    />
                </div>
                <div className="px-6 mb-5 flex flex-col">
                    <label className="text-sm text-slate-500 font-bold">OIB klijenta</label>
                    <input
                        value={clientOIB}
                        onChange = {(e) => setClientOIB(e.target.value)}
                        required
                        type="number"
                        className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                        placeholder="Unesite OIB klijenta"
                    />
                    {error && <p className="text-xs text-rose-500">{error}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4 px-6 mb-5">
                    <div className="flex flex-col">
                        <label className="text-sm text-slate-500 font-bold">E-pošta</label>
                        <input
                            value={emailAddress}
                            onChange = {(e) => setEmailAddress(e.target.value)}
                            required
                            type="text"
                            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            placeholder="Unesite svoju adresu E-pošte"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm text-slate-500 font-bold">Broj telefona</label>
                        <input
                            value={phoneNumber}
                            onChange = {(e) => setPhoneNumber(e.target.value)}
                            required
                            type="text"
                            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            placeholder="Unesite broj mobitela"
                        />
                    </div>
                </div>
                <div className="px-6 mb-5 flex flex-col">
                    <label className="text-sm text-slate-500 font-bold">Adresa</label>
                    <input
                        value={address}
                        onChange = {(e) => setAddress(e.target.value)}
                        type="text"
                        className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                        placeholder="Unesite adresu klijenta"
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
                        onClick={() => AddClient()}
                        className="p-2 bg-[#1f2a63] text-sm hover:bg-[#343f76] rounded-2xl text-white font-bold px-4 py-3 cursor-pointer"
                    >
                        + Dodaj klijenta
                    </button>
                </div>
            </div>
            {missingFields && (
                <MissingFields 
                    onCancel={() => setMissingFields(false)}
                    desc="Niste popunili sva polja prilikom dodavanja korisnika, molimo Vas da provjerite."
                />
            )}
        </div>
    );
}

export default AddClient;