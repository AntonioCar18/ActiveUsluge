import { X, Sparkles } from "lucide-react";

const ProductInfo = ({ title, desc, price, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="bg-linear-to-br from-[#1f2a63] via-[#2f3f95] to-[#74c9f2] px-8 pt-8 pb-10 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                        <Sparkles className="w-3.5 h-3.5" /> Detalji opreme
                    </span>
                    <h2 className="text-2xl font-extrabold text-white leading-snug pr-4">{title}</h2>
                </div>

                <div className="p-8 pt-6">
                    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>

                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-extrabold text-[#2f3f95]">{price} €</span>
                            <span className="text-slate-400 text-sm">/dan</span>
                        </div>
                    </div>

                    <button className="w-full mt-6 py-3 rounded-full bg-[#2f3f95] hover:bg-[#1f2a63] text-white font-semibold cursor-pointer transition">
                        Zatraži ponudu
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductInfo