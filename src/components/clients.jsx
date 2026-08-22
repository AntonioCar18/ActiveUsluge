import { LayoutDashboard, Package, CalendarCheck, Users, UserPlus, LogOut, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { use, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Sidebar from "./subcomponents/sidebarMD";
import MobileNav from "./subcomponents/mobileNav";
import DashboardCard from "./subcomponents/dashboardCard";
import DeleteModal from "./subcomponents/deleteModal";
import { useRef } from "react";
import AddClient from "./subcomponents/addClient";
import EditClient from "./subcomponents/editClient";

const Clients = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [clients, setClients] = useState({});
    const [addClientModal, setAddClientModal] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteClientId, setDeleteClientId] = useState("")
    const [editingClient, setEditingClient] = useState(null);
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
        });
        if (response.ok) {
            const data = await response.json();
            setAdmin(data);
        }
    };

    const getClients = async () => {
        const response = await fetch("/api/clients", {
            method: "GET",
            credentials: "include",
        });
        if (response.ok) {
            const data = await response.json();
            setClients(data);
        }
    };

    useEffect(() => {
        getUser();
        getClients();
    }, []);

    const handleMenuToggle = (id, event) => {
        if (openMenuId === id) {
            setOpenMenuId(null);
            return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.right - 160 + window.scrollX });
        setOpenMenuId(id);
    };

    const handleDeleteClient = async (id) => {
        const response = await fetch(`/api/clients/${id}`, {
            method: "DELETE",
            credentials: "include",
        });
        if (response.ok) {
            setOpenMenuId(null);
            setShowDeleteModal(false);
            getClients();
        }
    };

    const handleEditClick = (id) => {
        const item = clients.data.find((c) => c.id === id);
        setEditingClient(item);
        setShowEditModal(true);
    };

    const menuRef = useRef(null);

    useEffect(() => {
        const closeMenu = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
        };
        document.addEventListener("click", closeMenu);
        return () => document.removeEventListener("click", closeMenu);
    }, []);

    return (
        <div className="w-screen h-screen bg-gray-100 flex">
            <Sidebar active="clients" onLogout={handleLogout} />
            <div className="flex-1 min-w-0 h-full flex flex-col border-l border-b border-gray-100">
                <div className="bg-white px-4 md:px-8 h-15 flex justify-between items-center shrink-0">
                    <h2 className="font-display font-bold text-lg">Klijenti</h2>
                    <div className="flex gap-2 items-center justify-center">
                        <div className="text-white font-bold flex items-center justify-center rounded-full bg-linear-to-r from-[#2f3f95] to-[#74c9f2] w-8 h-8">
                            {admin?.name?.[0] ?? "A"}
                        </div>
                        <p className="font-semibold">{admin?.name}</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 md:p-8 flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <h2 className="text-xl flex font-bold">Svi klijenti</h2>
                                <p className="text-sm text-slate-400">{clients?.quantity ?? 0} klijenata ukupno</p>
                            </div>
                            <button onClick={() => setAddClientModal(true)} className="bg-[#1f2a63] text-white px-6 text-sm py-2 rounded-2xl font-semibold cursor-pointer shrink-0">
                                + Novi klijent
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DashboardCard
                                title="Ukupno klijenata"
                                icon={Users}
                                desc={clients?.quantity ?? 0}
                                color="blue"
                                desc2="registriranih u sustavu"
                            />
                            <DashboardCard
                                title="Novih ovaj mjesec"
                                icon={UserPlus}
                                desc={clients?.new_this_month ?? 0}
                                color="green"
                                desc2="dodano u zadnjih 30 dana"
                            />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-225 bg-white rounded-xl shadow-xs table-fixed">
                                <thead>
                                    <tr className="text-left text-slate-400 border-b border-gray-100">
                                        <th className="px-4 py-3 font-medium w-[20%]">Ime i prezime</th>
                                        <th className="px-4 py-3 font-medium w-[22%]">Adresa</th>
                                        <th className="px-4 py-3 font-medium w-[14%]">OIB</th>
                                        <th className="px-4 py-3 font-medium w-[22%]">Adresa E-pošte</th>
                                        <th className="px-4 py-3 font-medium w-[14%]">Broj mobitela</th>
                                        <th className="px-4 py-3 font-medium text-right w-[8%]">Akcije</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.data?.map((c) => (
                                        <tr key={c.id} className="hover:bg-slate-50/60">
                                            <td className="px-4 py-4 font-medium truncate">{c.full_name}</td>
                                            <td className="px-4 py-4 text-slate-500 truncate">{c.address}</td>
                                            <td className="px-4 py-4 text-slate-500 truncate">{c.oib}</td>
                                            <td className="px-4 py-4 text-slate-500 truncate">{c.email}</td>
                                            <td className="px-4 py-4 text-slate-500 truncate">{c.phone}</td>
                                            <td className="px-4 py-4 text-right">
                                                <button onClick={(e) => { e.stopPropagation(); handleMenuToggle(c.id, e); }} className="cursor-pointer">
                                                    <MoreHorizontal className="w-4 h-4 inline-block text-slate-500" />
                                                </button>
                                                {openMenuId === c.id && createPortal(
                                                    <div
                                                        ref={menuRef}
                                                        style={{ position: "absolute", top: menuPosition.top, left: menuPosition.left }}
                                                        className="z-50 w-40 bg-white rounded-xl border border-slate-100 shadow-lg py-1.5 text-left"
                                                    >
                                                        <button
                                                            onClick={() => {
                                                                handleEditClick(c.id);
                                                                setOpenMenuId(null);
                                                            }}
                                                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" /> Uredi
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setDeleteClientId(c.id);
                                                                setShowDeleteModal(true);
                                                                setOpenMenuId(false);
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
            </div>
            {showDeleteModal && (
                <DeleteModal 
                    onClose={() => setShowDeleteModal(false)}
                    onDelete={() => handleDeleteClient(deleteClientId)}
                />
            )}
            <MobileNav active="clients" onLogout={handleLogout} />
            {addClientModal && (
                <AddClient
                    onClose={() => setAddClientModal(false)}
                    onAdd={() => {
                        setAddClientModal(false);
                        getClients();
                    }}
                />
            )}

            {showEditModal && (
                <EditClient
                    initialData={editingClient}
                    onClose={() => setShowEditModal(false)}
                    onAdd={() => {
                        setShowEditModal(false);
                        getClients();
                    }}
                />
            )}
        </div>
    );
};

export default Clients;