import { X } from "lucide-react";
import { useState } from "react";

const SendEmail = ({ onClose }) => {   

    const [name, setName] = useState("");
    const [emailAddress, setEmailAddress] = useState("");
    const [note, setNote] = useState("");
    const [status, setStatus] = useState(false);

    const sendEmail = async (e) => {
        try {
            const response = await fetch ("https://formspree.io/f/mjybegay", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({name, email: emailAddress, message:note})
                });
            if(response.ok){
                setStatus(true);
                setTimeout(() => {
                    setName("");
                    setEmailAddress("");
                    setNote("");
                    setStatus(false);
                    onClose();
                }, 3000);
            }
            } catch {
                console.log("Pogreška prilikom slanja maila.")
            }
        };

    return (
        <div className="fixed bg-black/40 z-50 inset-0 flex justify-center items-center px-4">
            <div className="bg-white p-8 rounded-2xl flex flex-col max-w-md w-full">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Pošalji nam upit</h2>
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded-full p-1"
                    >
                        <X className="w-8 h-8 text-black hover:text-white bg-white hover:bg-blue-300 rounded-full p-2" />
                    </button>
                </div>
                <p className="mt-1 text-xs text-slate-500">Ako Vam je potrebno više informacija vezano za našu ponudu, slobodno nam se javite putem niže navedenog kontaktnog obrasca.</p>
                <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-col flex-1 mt-4 w-full">
                        <label className="text-xs text-slate-500 font-bold">Ime i prezime *</label>
                        <input
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-2xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            placeholder="Marko Horvat"
                        />
                    </div>
                    <div className="flex flex-col flex-1  w-full">
                        <label className="text-xs text-slate-500 font-bold">Adresa E-pošte *</label>
                        <input
                            required
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-2xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            placeholder="marko.horvat@domena.com"
                        />
                    </div>
                </div>
                <div className="flex flex-col flex-1 mt-4">
                    <label className="text-xs text-slate-500 font-bold">Vaša poruka</label>
                    <textarea
                        value={note}
                        rows={4}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-2xl px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-100 min-"
                        placeholder="Unesite svoju poruku"
                    />
                </div>
                <div className="mt-5 flex items-center">
                    {status === true && (
                        <p className="text-xs text-slate-500">Vaš upit uspješno je poslan, javit ćemo Vam se u najkraćem roku.</p>
                    )}
                    <button
                        onClick={sendEmail}
                        className="ml-auto px-6 py-2 bg-[#2f3f95] hover:bg-[#1f2a63] rounded-2xl text-white font-semibold cursor-pointer text-sm transition"
                    >
                    Pošalji
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SendEmail;