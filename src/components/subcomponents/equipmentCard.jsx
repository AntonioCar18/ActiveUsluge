import { MoreHorizontal, Pencil, Trash, Lock, Pen } from "lucide-react";
import { use, useState } from "react";
import DeleteModal from "./deleteModal";
import { useRef } from "react";
import { useEffect } from "react";
import BlockEquipmentDate from "./blockEquipmentDate";
import ManageBlockedEquipment from "./manageBlockedEquipment";

const EquipmentCard = ({ id, onEdit, availability, title, category, price, availableQuantity, totalQuantity, icon, onDelete, onBlockAdded, blockedCount, blockedRanges }) => {

    const categoryColors = {
        "Ozvučenje": { bg: "bg-[#e5f5fc]", text: "text-[#2f8fc4]" },
        "Šatori": { bg: "bg-[#e3eafb]", text: "text-[#2f3f95]" },
        "Rasvjeta": { bg: "bg-orange-100", text: "text-orange-600" },
    };

    const statusColors = {
        "Dostupno": { bg: "bg-emerald-100", text: "text-emerald-600" },
        "Nedostupno": { bg: "bg-red-100", text: "text-red-600" },
    };

    const Icon = icon || Speaker;
    const { bg, text } = categoryColors[category] || { bg: "bg-slate-100", text: "text-slate-500" };
    const { bg: bgAvailability, text: textAvailability } = statusColors[availability] || { bg: "bg-slate-100", text: "text-slate-500" };
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showBlockMenu, setShowBlockMenu] = useState(false);
    const [showBlockEquipmentDate, setShowBlockEquipmentDate] = useState(false);
    const [showManageBlockedEquipment, setShowManageBlockedEquipment] = useState(false);

    const menuRef = useRef(null);

    useEffect(() => {
        const closeMenu = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setShowBlockMenu(false);
        };
        document.addEventListener("click", closeMenu);
        return () => document.removeEventListener("click", closeMenu);
    }, []);

    return (
        <div className="bg-white rounded-xl p-6 flex flex-col shadow-md gap-4">
            <div className="flex items-start justify-between">
                <div className={`p-3 ${bg} rounded-2xl`}>
                    <Icon className={`w-6 h-6 ${text}`} />
                </div>
                <span className={`px-2.5 py-1 rounded-full ${bgAvailability} ${textAvailability} text-xs font-semibold`}>
                    {availability}
                </span>
            </div>

            <div className="flex flex-col gap-0">
                <h2 className="font-bold text-lg">{title}</h2>
                <p className="text-slate-500 text-xs">{category}</p>
            </div>

            <div className="mt-2 border-t border-gray-100 flex justify-between items-center">
                <div className="flex gap-1 items-center mt-4">
                    <p className="font-bold text-sm">{price} €</p>
                    <p className="text-slate-500 text-xs">/ dan</p>
                </div>
                <p className="text-slate-400 text-xs mt-4">{availableQuantity}/{totalQuantity} dostupno</p>
            </div>

            {blockedCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium -mt-2">
                    <Lock className="w-3 h-3" />
                    {blockedCount} termin{blockedCount > 1 ? "a" : ""} blokirano ({blockedRanges})
                </div>
            )}

            <div className="flex gap-2.5 items-center justify-center">
                <button onClick = {() => onEdit(id)} className="gap-2 flex border border-gray-200 rounded-2xl cursor-pointer w-full h-10 items-center justify-center hover:bg-gray-50 transition">
                    <Pencil className="w-4 h-4 text-slate-400" />
                    <p className="tex
                    text-slate-400 text-sm">Uredi</p>
                </button>
                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex border border-gray-200 rounded-2xl cursor-pointer h-10 w-10 shrink-0 items-center justify-center hover:bg-gray-50 transition">
                    <Trash className="w-4 h-4 text-slate-400" />
                </button>
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowBlockMenu(!showBlockMenu)}
                        className="flex border border-gray-200 rounded-2xl cursor-pointer h-10 w-10 shrink-0 items-center justify-center hover:bg-gray-50 transition"
                    >
                        <MoreHorizontal className="w-4 h-4 text-slate-400"/>
                    </button>
                    {showBlockMenu && (
                        <div className="absolute right-0 top-12 z-10 w-44 bg-white rounded-xl border border-slate-100 shadow-lg py-1.5">
                            <button
                                onClick={() => {
                                    setShowBlockEquipmentDate(true);
                                    setShowBlockMenu(false);
                                }}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                            >
                                <Lock className="w-3.5 h-3.5"/>
                                Blokiraj termin
                            </button>
                            {blockedCount > 0 && (<button
                                onClick={() => {
                                    setShowManageBlockedEquipment(true);
                                    setShowBlockMenu(false);
                                }}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                            >
                                <Pencil className="w-3.5 h-3.5"/>
                                Uredi blokade
                            </button>
                        )}
                        </div>
                    )}
                </div>
            </div>
            {showDeleteModal && (
                <DeleteModal
                    onClose={() => setShowDeleteModal(false)}
                    onDelete={() => onDelete(id)}
                />
            )}

            {showBlockEquipmentDate && (
                <BlockEquipmentDate
                    equipmentId={id}
                    equipmentName={title}
                    availableQuantity={availableQuantity}
                    onClose={() => setShowBlockEquipmentDate(false)}
                    onAdd={() => {
                        setShowBlockEquipmentDate(false);
                        onBlockAdded();
                    }}
                />
            )}

            {showManageBlockedEquipment && (
                <ManageBlockedEquipment
                    equipmentId={id}
                    equipmentName={title}
                    availableQuantity={availableQuantity}
                    onClose={() => setShowManageBlockedEquipment(false)}
                    onUpdate={onBlockAdded}
                />
            )}
        </div>
    );
};

export default EquipmentCard;
