import {
  LayoutDashboard,
  Package,
  CalendarCheck,
  Users,
  LogOut,
  ArrowBigRight,
  Tent,
  Lamp,
  Euro,
  Clock,
  ArrowRight,
  Speaker,
  MoreHorizontal,
  Pencil,
  Trash,
  CircleCheck,
  CircleX,
  Construction,
  X,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import DashboardCard from "./subcomponents/dashboardCard";
import DashboardEquipment from "./subcomponents/dashboardEquipment";
import Sidebar from "./subcomponents/sidebarMD";
import EquipmentCard from "./subcomponents/equipmentCard";
import AddEquipment from "./subcomponents/addEquipment";
import EditEquipment from "./subcomponents/editEquipment";
import MobileNav from "./subcomponents/mobileNav";
import ReservationBlockMain from "./subcomponents/reservationBlockMain";
import BlockDateAdd from "./subcomponents/blockDateAdd";
import BlockDate from "./subcomponents/blockDate";
import EditBlockDate from "./subcomponents/editBlockDate";
import AddReservation from "./subcomponents/addReservation";
import EditReservation from "./subcomponents/editReservation";
import DeleteModal from "./subcomponents/deleteModal";

const statusStyles = {
  Potvrđeno: "bg-emerald-100 text-emerald-600",
  "Na čekanju": "bg-amber-100 text-amber-600",
  Otkazano: "bg-red-100 text-red-600",
};

const ReservationAdmin = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [reservation, setReservation] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [blockDateModal, setBlockDateModal] = useState(false);
  const [editBlockDateModal, setEditBlockDateModal] = useState(false);
  const [editingBlockDate, setEditingBlockDate] = useState(null);
  const [reservationStatus, setReservationStatus] = useState("Sve");
  const [addReservationModal, setAddReservationModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [editingReservation, setEditingReservation] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReservationId, setDeleteReservationId] = useState(null);
  const menuRef = useRef(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);

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
      }
  };

  const statusButtons = ["Sve", "Na čekanju", "Potvrđeno", "Otkazano"];

  const filteredReservation =
    reservationStatus === "Sve"
      ? reservation ?? []
      : reservation.filter((r) => r.status === reservationStatus);

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

  const getBlockedDate = async () => {
    const response = await fetch("/api/blocked-dates", {
      method: "GET",
      credentials: "include",
    });
    if (response.ok) {
      const data = await response.json();
      setBlockedDates(data);
    }
  };

  const handleDeleteBlockedDate = async (id) => {
    const response = await fetch(`/api/blocked-dates/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (response.ok) {
      getBlockedDate();
    }
  };

  const handleMenuToggle = (id, event) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.right - 160 + window.scrollX });
    setOpenMenuId(id);
  };

  const handleEditClick = (id) => {
    const item = reservation.find((r) => r.id === id);
    setEditingReservation(item);
    setShowEditModal(true);
    setOpenMenuId(null);
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
    a.download = `Ugovor_${clientName.replace(/\s+/g, "_")}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    getUser();
    getReservation();
    getBlockedDate();
  }, []);

  useEffect(() => {
    const closeMenu = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  return (
    <div className="w-screen h-screen bg-gray-100 flex">
      <Sidebar active="reservation" onLogout={handleLogout} />
      <div className="flex-1 min-w-0 h-full flex flex-col border-l border-b border-gray-100">
        <div className="bg-white px-4 md:px-8 h-15 flex justify-between items-center shrink-0">
          <h2 className="font-display font-bold text-lg">Rezervacije</h2>
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
                <h2 className="text-xl flex font-bold">Sve rezervacije</h2>
                <p className="text-sm text-slate-400">
                  {reservation?.length ?? 0} rezervacija ukupno
                </p>
              </div>
              <button onClick={() => setAddReservationModal(true)} className="bg-[#1f2a63] text-white px-6 text-sm py-2 rounded-2xl font-semibold cursor-pointer shrink-0">
                + Dodaj rezervaciju
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ReservationBlockMain icon={Clock} title="Na čekanju" quantity={pendingCount} desc="čekaju tvoju ručnu potvrdu" color="orange" />
              <ReservationBlockMain icon={CircleCheck} title="Potvrđeno" quantity={confirmedCount} desc="aktivnih rezervacija" color="green" />
              <ReservationBlockMain icon={CircleX} title="Otkazano" quantity={cancelledCount} desc="u zadnjih 30 dana" color="red" />
            </div>

            <div className="flex">
              <div className="bg-white p-8 rounded-2xl w-full flex-col flex gap-4">
                <div className="flex justify-between">
                  <div className="flex gap-2 items-center justify-center">
                    <Construction className="w-4 h-4 text-slate-500" />
                    <h3 className="text-sm font-semibold">Blokirani datumi</h3>
                  </div>
                  <button
                    onClick={() => setBlockDateModal(true)}
                    className="text-[#1f2a63] text-sm font-bold cursor-pointer"
                  >
                    + Blokiraj dane
                  </button>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  {blockedDates.data?.map((b) => (
                    <BlockDateAdd
                      key={b.id}
                      date={b.date}
                      reason={b.reason}
                      onDelete={() => handleDeleteBlockedDate(b.id)}
                      onEdit={() => {
                        setEditingBlockDate(b);
                        setEditBlockDateModal(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {statusButtons.map((status) => (
                <button
                  key={status}
                  onClick={() => setReservationStatus(status)}
                  className={`px-4 py-2 rounded-2xl cursor-pointer text-sm font-medium ${
                    reservationStatus === status
                      ? "bg-[#1f2a63] text-white"
                      : "bg-white border border-gray-200 text-slate-600"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-160 bg-white rounded-2xl">
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
                  {filteredReservation?.slice(0, 6).map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60">
                      <td className="px-6 py-4 font-medium">{r.client_name}</td>
                      <td className="px-6 py-4 text-slate-500">{r.equipment}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(r.event_date).toLocaleDateString("hr-HR")}
                      </td>
                      <td className="px-6 py-4 font-medium">{r.amount} €</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[r.status]}`}
                        >
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

      {blockDateModal && (
        <BlockDate
          onClose={() => setBlockDateModal(false)}
          onAdd={getBlockedDate}
        />
      )}

      {editBlockDateModal && (
        <EditBlockDate
          initialData={editingBlockDate}
          onClose={() => setEditBlockDateModal(false)}
          onAdd={getBlockedDate}
        />
      )}

      <MobileNav active="reservation" onLogout={handleLogout} />
    </div>
  );
};

export default ReservationAdmin;
