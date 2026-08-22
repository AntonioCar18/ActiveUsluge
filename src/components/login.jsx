import { Lock, EyeOff, Eye } from "lucide-react";
import { useState } from "react";
import MissingFields from "./subcomponents/missingFields";
import { useNavigate } from "react-router-dom";

const Login = () => {

    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showMissingFields, setShowMissingFields] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async () => {
        if(!emailAddress || !password){
            setShowMissingFields(true);
            return;
        }
        try {
            const response = await fetch ("/api/login", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include',
                body: JSON.stringify({email: emailAddress, password})
            })
         if(response.ok){
            navigate("/admin")
         }
         else {
            console.log("Unijeli ste krivu adresu ili lozinku.")
         }
        } catch (error) {
            console.log("Dogodila se pogreška prilikom prijave")
        }
    };

    const year = new Date().getFullYear();

    return (
        <div className="flex flex-col">
            <div className="flex flex-col w-screen h-screen bg-linear-to-br from-[#1f2a63] via-[#2f3f95] to-[#74c9f2] items-center justify-center">
                <div className="flex flex-col gap-4 max-w-md w-full p-8 md:p-0">
                    <div className="flex flex-col p-8 bg-white rounded-3xl items-center justify-center">
                        <div className="p-3 bg-[#e3eafb] w-fit rounded-xl mx-auto mb-4">
                            <Lock className="w-6 h-6 text-[#1f2a63]" />
                        </div>
                        <h2 className="font-display text-xl font-bold text-slate-900 text-center">Admin prijava</h2>
                        <p className="text-sm text-slate-500 text-center mt-1">Prijava za pristup administratorskom sučelju</p>
                        <div className="flex flex-col gap-2 mt-4 w-full">
                            <label className="text-slate-500 font-semibold">E-mail</label>
                            <input
                                type="text"
                                className="rounded-3xl border border-gray-200 px-4 py-4 text-sm"
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                                placeholder="Vaša adresa E-pošte"
                            />
                        </div>
                        <div className="flex flex-col gap-2 mt-4 w-full">
                            <label className="text-slate-500 font-semibold">Lozinka</label>
                            <div className="flex items-center relative">
                                <input
                                    type={showPassword ? 'text':'password'}
                                    className="rounded-3xl border border-gray-200 px-4 py-4 text-sm w-full"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Unesite Vašu lozinku"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="cursor-pointer absolute right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600 transition"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="flex mt-8 w-full items-center justify-center">
                            <button
                                onClick={handleLogin}
                                className="bg-[#2f3f95] text-white w-full rounded-3xl px-4 py-3 cursor-pointer"
                            >
                                Prijavi se
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <p className="text-xs text-white/50">© {year} Active usluge</p>
                </div>
            </div>
            {showMissingFields && (
                <MissingFields 
                    onCancel={() => setShowMissingFields(false)}
                    desc="Molim popunite oba polja. Prilikom prijave potrebno je popuniti oba polja kako bi se ista mogla izvršiti."
                />
            )}
        </div>
    );
}

export default Login;