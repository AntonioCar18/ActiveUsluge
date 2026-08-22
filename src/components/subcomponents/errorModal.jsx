import { AlertTriangle } from "lucide-react";

const ErrorModal = ({onClose, error}) => {
    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#efe9e0] shadow-2xl p-8 flex flex-col">
                <div className="flex items-center gap-4 mb-5">
                    <div className="flex shrink-0 bg-red-50 rounded-xl p-2.5">
                        <AlertTriangle className="w-8 h-8 text-red-600 "/>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h2 className="font-display text-xl text-gray-900">Pogreška prilikom akcije</h2>
                        <p className="text-sm text-[#8a8378]">Ovo je obavijest o pogrešci</p>
                    </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-8">Prilikom korištenja aplikacije došlo je do pogreške. Pogreška: {error}</p>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="cursor-pointer bg-[#f5f1ea] text-gray-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#efe9e0] active:scale-97 transition-all duration-200"
                    >
                        Razumijem
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ErrorModal;