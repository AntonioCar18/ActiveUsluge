import { LayoutDashboard, Package, CalendarCheck, Users, LogOut, ArrowBigRight, Tent, Lamp, Euro, Clock, ArrowRight, Speaker, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardCard from "./subcomponents/dashboardCard";
import { useEffect, useState } from "react";
import DashboardEquipment from "./subcomponents/dashboardEquipment";
import Sidebar from "./subcomponents/sidebarMD";
import EquipmentCard from "./subcomponents/equipmentCard";
import AddEquipment from "./subcomponents/addEquipment";
import EditEquipment from "./subcomponents/editEquipment";
import MobileNav from "./subcomponents/mobileNav";

const categoryIcons = {
    "Ozvučenje": Speaker,
    "Šatori": Tent,
    "Rasvjeta": Lamp,
};

const categoryColors = {
    "Ozvučenje": { bg: "bg-[#e5f5fc]", text: "text-[#2f8fc4]" },
    "Šatori": { bg: "bg-[#e3eafb]", text: "text-[#2f3f95]" },
    "Rasvjeta": { bg: "bg-orange-100", text: "text-orange-600" },
};

const statusStyles = {
    "Potvrđeno": "bg-emerald-100 text-emerald-600",
    "Na čekanju": "bg-amber-100 text-amber-600",
    "Otkazano": "bg-red-100 text-red-600",
};

const Equipment = () => {

    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [reservation, setReservation] = useState([]);
    const [equipment, setEquipment] = useState({});
    const [equipmentCategory, setEquipmentCategory] = useState("Sve");
    const [addEquipmentModal, setAddEquipmentModal] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleLogout = async () => {
        await fetch("/api/logout", {
            method: "POST",
            credentials: "include",
        });
        navigate("/login");
    };

    const getUser = async () => {
        const response = await fetch("/api/me", {
            method: "GET",
            credentials: "include",
        })
        if(response.ok){
            const data = await response.json();
            setAdmin(data)
        }
    };

    const getReservation = async () => {
        const response = await fetch("/api/reservations", {
            method: "GET",
            credentials: "include",
        })
        if(response.ok){
            const data = await response.json();
            setReservation(data)
        }
    };

    const getEquipment = async () => {
        const response = await fetch("/api/equipment", {
            method: "GET",
            credentials: "include",
        })
        if(response.ok){
            const data = await response.json();
            setEquipment(data)
        }
    }

    useEffect(() => {
        getUser();
        getReservation();
        getEquipment();
    }, []);

    const buttons = ["Sve", ...(equipment.categories ?? [])];

    const filteredEquipment = equipmentCategory === "Sve"
        ? equipment.equipment
        : equipment.equipment?.filter((e) => e.category === equipmentCategory);

    const deleteEquipment = async (id) => {
        try {
            const response = await fetch (`/api/equipment/${id}`, {
                method: "DELETE",
                credentials: "include"
            })
            if(response.ok){
                getEquipment();
            }
        } catch (error) {
            console.log("Pogreška prilikom brisanja datoteke.")
        }
    };

    const handleEditClick = (id) => {
        const item = equipment.equipment.find((e) => e.id === id)
        setEditingEquipment(item);
        setShowEditModal(true);
    }

    return (
        <div className="w-screen h-screen bg-gray-100 flex">
            <Sidebar active="equipment" onLogout={handleLogout} />
            <div className="flex-1 min-w-0 h-full flex flex-col border-l border-b border-gray-100">
                <div className="bg-white px-4 md:px-8 h-15 flex justify-between items-center shrink-0">
                    <h2 className="font-display font-bold text-lg">Oprema</h2>
                    <div className="flex gap-2 items-center justify-center">
                        <div className="text-white font-bold flex items-center justify-center rounded-full bg-linear-to-r from-[#2f3f95] to-[#74c9f2] w-8 h-8">
                            {admin?.name?.[0] ?? "A"}
                        </div>
                        <p className="font-semibold">{admin?.name}</p>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 md:p-8">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <h2 className="text-xl flex font-bold">Sva oprema</h2>
                                <p className="text-sm text-slate-400">{equipment.quantity} komada u {equipment.categories?.length} kategorije</p>
                            </div>
                            <button onClick={() => setAddEquipmentModal(true)} className="bg-[#1f2a63] text-white px-6 text-sm py-2 rounded-2xl font-semibold cursor-pointer shrink-0">
                                + Nova oprema
                            </button>
                        </div>
                        <div className="flex mt-6 gap-2">
                            {buttons.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setEquipmentCategory(cat)}
                                    className={`px-4 py-2 rounded-2xl cursor-pointer text-sm font-medium ${
                                        equipmentCategory === cat
                                            ? "bg-[#1f2a63] text-white"
                                            : "bg-white border border-gray-200 text-slate-600"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div className="mt-6 gap-4 grid grid-cols-1 md:grid-cols-3 mb-18 md:mb-0">
                            {filteredEquipment?.map((e) => (
                                <EquipmentCard
                                    key={e.id}
                                    title={e.name}
                                    category={e.category}
                                    price={e.price}
                                    availability={e.real_available > 0 ? "Dostupno" : "Nedostupno"}
                                    availableQuantity={e.real_available}
                                    totalQuantity={e.total_quantity}
                                    icon={categoryIcons[e.category] || Speaker}
                                    onDelete={deleteEquipment}
                                    onEdit={handleEditClick}
                                    id={e.id}
                                    onBlockAdded={getEquipment}
                                    blockedCount={e.active_blocks_count}
                                    blockedRanges={e.blocked_ranges}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <MobileNav active="equipment" onLogout={handleLogout} />
                {addEquipmentModal && (
                    <AddEquipment 
                        onClose={() => setAddEquipmentModal(false)}
                        onAdd={() => {
                            setAddEquipmentModal(false);
                            getEquipment();
                        }}
                    />
                )}

                {showEditModal && (
                    <EditEquipment
                        initialData={editingEquipment}
                        onClose={() => setShowEditModal(false)}
                        onAdd={() => {
                            setShowEditModal(false);
                            getEquipment();
                        }}
                    />
                )}
        </div>
    );
}

export default Equipment;