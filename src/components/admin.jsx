import { LayoutDashboard, Package, CalendarCheck, Users, LogOut, ArrowBigRight, Tent, Lamp, Euro, Clock, ArrowRight, Speaker, MoreHorizontal, Pencil, Trash, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

import DashboardCard from "./subcomponents/dashboardCard";
import DashboardEquipment from "./subcomponents/dashboardEquipment";
import Sidebar from "./subcomponents/sidebarMD";
import MobileNav from "./subcomponents/mobileNav";
import AddReservation from "./subcomponents/addReservation";
import EditReservation from "./subcomponents/editReservation";
import DeleteModal from "./subcomponents/deleteModal";

const categoryIcons = {
    "Ozvučenje": Speaker,
    "Šatori": Tent,
    "Rasvjeta": Lamp,
};

const statusStyles = {
    "Potvrđeno": "bg-emerald-100 text-emerald-600",
    "Na čekanju": "bg-amber-100 text-amber-600",
    "Otkazano": "bg-red-100 text-red-600",
};

const Admin = () => {
    const navigate = useNavigate();

    // State management
    const [admin, setAdmin] = useState(null);
    const [reservation, setReservation] = useState([]);
    const [equipment, setEquipment] = useState({});

    // Counts & Stats
    const [pendingCount, setPendingCount] = useState(0);
    const [confirmedCount, setConfirmedCount] = useState(0);
    const [cancelledCount, setCancelledCount] = useState(0);
    const [revenue, setRevenue] = useState(0);

    // Menu & Modals state
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const [openMenuId, setOpenMenuId] = useState(null);
    const [editingReservation, setEditingReservation] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteReservationId, setDeleteReservationId] = useState(null);
    const [addReservationModal, setAddReservationModal] = useState(false);

    const menuRef = useRef(null);

    // API Handlers
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
        });
        if (response.ok) {
            const data = await response.json();
            setAdmin(data);
        }
    };

    const getReservation = async () => {
        const response = await fetch("/api/reservations", {
            method: "GET",
            credentials: "include",
        });
        if (response.ok) {
            const data = await response.json();
            setReservation(Array.isArray(data) ? data : data.data ?? []);
            setPendingCount(data.pending ?? 0);
            setConfirmedCount(data.confirmed ?? 0);
            setCancelledCount(data.cancelled ?? 0);
            setRevenue(data.revenue ?? 0);
        }
    };

    const getEquipment = async () => {
        const response = await fetch("/api/equipment", {
            method: "GET",
            credentials: "include",
        });
        if (response.ok) {
            const data = await response.json();
            setEquipment(data);
        }
    };

    const handleDeleteReservation = async (id) => {
        const response = await fetch(`/api/reservations/${id}`, {
            method: "DELETE",
            credentials: "include",
        });
        if (response.ok) {
            setShowDeleteModal(false);
            getReservation();
        }
    };

    // UI Handlers
    const handleMenuToggle = (id, event) => {
        if (openMenuId === id) {
            setOpenMenuId(null);
            return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        setMenuPosition({
            top: rect.bottom + window.scrollY,
            left: rect.right - 160 + window.scrollX
        });
        setOpenMenuId(id);
    };

    const handleEditClick = (id) => {
        const item = reservation.find((r) => r.id === id);
        setEditingReservation(item);
        setShowEditModal(true);
        setOpenMenuId(null);
    };

    const handleGenerateContract = async (id, clientName) => {
        setOpenMenuId(null);
        const response = await fetch(`/api/reservations/${id}/contract`, {
            method: "GET",
            credentials: "include",
        });
        if (!response.ok) {
            alert("Greška pri generiranju ugovora");
            return;
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Ugovor_${clientName.replace(/\s+/g, "_")}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Effects
    useEffect(() => {
        getUser();
        getReservation();
        getEquipment();
    }, []);

    useEffect(() => {
        const closeMenu = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("click", closeMenu);
        return () => document.removeEventListener("click", closeMenu);
    }, []);

    return (
        <div className="w-screen h-screen bg-gray-100 flex">
             <Sidebar active="dashboard" onLogout={handleLogout} />

             <div className="flex-1 min-w-0 h-full flex flex-col border-l border-b border-gray-100">
                 <div className="bg-white px-4 md:px-8 h-15 flex justify-between items-center shrink-0">
                    <h2 className="font-display font-bold text-lg">Nadzorna ploča</h2>
                    <div className="flex gap-2 items-center justify-center">
                        <div className="text-white font-bold flex items-center justify-center rounded-full bg-linear-to-r from-[#2f3f95] to-[#74c9f2] w-8 h-8">
                            {admin?.name?.[0] ?? "A"}
                        </div>
                        <p className="font-semibold">{admin?.name}</p>
                    </div>
                </div>

                <main className="flex-1 overflow-y-auto">

                    <div className="p-4 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
                            <DashboardCard
                                title="Aktivne rezervacije"
                                icon={CalendarCheck}
                                desc={confirmedCount}
                                color="blue"
                                desc2="u Vašem sučelju 'Rezervacije'"
                            />
                            <DashboardCard
                                title="Prihodi ovog mjeseca [€]"
                                icon={Euro}
                                desc={revenue}
                                color="green"
                                desc2="prema potvrđenim rezervacijama"
                            />
                            <DashboardCard
                                title="Komadi opreme"
                                icon={Package}
                                desc={equipment.quantity ?? 0}
                                color="brown"
                                desc2="u svim kategorijama"
                            />
                            <DashboardCard
                                title="Na čekanju"
                                icon={Clock}
                                desc={pendingCount}
                                color="amber"
                                desc2="zahtjeva na čekanju"
                            />
                        </div>
                    </div>

                    <div className="px-4 md:px-8">
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between px-6 py-4 border-b border-gray-100">
                                <h2 className="font-bold text-lg">Nedavne rezervacije</h2>
                                <button
                                    onClick={() => setAddReservationModal(true)}
                                    className="bg-[#1f2a63] text-white px-4 text-sm py-2 rounded-2xl font-semibold cursor-pointer shrink-0"
                                >
                                    + Nova rezervacija
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-160">
                                    <thead>
                                        <tr className="text-left text-slate-400 border-b border-gray-100">
                                            <th className="px-6 py-3 font-medium">Klijent</th>
                                            <th className="px-6 py-3 font-medium">Oprema</th>
                                            <th className="px-6 py-3 font-medium">Datum eventa</th>
                                            <th className="px-6 py-3 font-medium">Iznos</th>
                                            <th className="px-6 py-3 font-medium">Status</th>
                                            <th className="px-6 py-3 font-medium text-right">Akcije</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {reservation?.slice(0, 6).map((r) => (
                                            <tr key={r.id} className="hover:bg-slate-50/60">
                                                <td className="px-6 py-4 font-medium">{r.client_name}</td>
                                                <td className="px-6 py-4 text-slate-500">{r.equipment}</td>
                                                <td className="px-6 py-4 text-slate-500">
                                                    {new Date(r.event_date).toLocaleDateString("hr-HR")}
                                                </td>
                                                <td className="px-6 py-4 font-medium">{r.amount} €</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[r.status]}`}>
                                                        {r.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleMenuToggle(r.id, e); }}
                                                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                                    >
                                                        <MoreHorizontal className="w-4 h-4 inline-block" />
                                                    </button>

                                                    {openMenuId === r.id && createPortal(
                                                        <div
                                                            ref={menuRef}
                                                            style={{ position: "absolute", top: menuPosition.top, left: menuPosition.left }}
                                                            className="z-50 w-40 bg-white rounded-xl border border-slate-100 shadow-lg py-1.5 text-left"
                                                        >
                                                            <button
                                                                onClick={() => handleEditClick(r.id)}
                                                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" /> Uredi
                                                            </button>
                                                            <button
                                                                onClick={() => handleGenerateContract(r.id, r.client_name)}
                                                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" /> Ugovor
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setDeleteReservationId(r.id);
                                                                    setShowDeleteModal(true);
                                                                    setOpenMenuId(null);
                                                                }}
                                                                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 cursor-pointer"
                                                            >
                                                                <Trash className="w-3.5 h-3.5" /> Obriši
                                                            </button>
                                                        </div>,
                                                        document.body
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 md:px-8 pt-8 pb-8">
                        <div className="bg-white rounded-2xl">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between p-6">
                                <h2 className="font-bold text-lg">Stanje opreme</h2>
                                <button
                                    onClick={() => navigate("/equipment")}
                                    className="cursor-pointer shrink-0 flex gap-2 items-center font-extrabold text-[#1f2a63]"
                                >
                                    <span className="text-sm">Upravljaj svojom opremom</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="gap-4 pl-6 pt-4 pb-4 pr-6 border-t border-gray-100 overflow-x-auto grid grid-cols-1 md:grid-cols-3">
                                {equipment.equipment?.map((e) => (
                                    <DashboardEquipment
                                        key={e.id}
                                        title={e.name}
                                        category={e.category}
                                        desc={`${e.available_quantity}/${e.total_quantity} dostupno`}
                                        icon={categoryIcons[e.category] || Package}
                                        blockedRanges={e.blocked_ranges}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                </main>
            </div>

            {addReservationModal && (
                <AddReservation
                    onClose={() => setAddReservationModal(false)}
                    onAdd={() => {
                        setAddReservationModal(false);
                        getReservation();
                    }}
                />
            )}

            {showEditModal && (
                <EditReservation
                    initialData={editingReservation}
                    onClose={() => setShowEditModal(false)}
                    onAdd={() => {
                        setShowEditModal(false);
                        getReservation();
                    }}
                />
            )}

            {showDeleteModal && (
                <DeleteModal
                    onClose={() => setShowDeleteModal(false)}
                    onDelete={() => handleDeleteReservation(deleteReservationId)}
                />
            )}

            <MobileNav active="dashboard" onLogout={handleLogout} />
        </div>
    );
};

export default Admin;
