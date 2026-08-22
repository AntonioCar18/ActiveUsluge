import { LayoutDashboard, Package, CalendarCheck, Users, LogOut, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const navItems = [
    { key: "dashboard", label: "Nadzorna ploča", icon: LayoutDashboard, path: "/admin" },
    { key: "equipment", label: "Oprema", icon: Package, path: "/equipment" },
    { key: "reservation", label: "Rezervacije", icon: CalendarCheck, path: "/reservation" },
    { key: "clients", label: "Klijenti", icon: Users, path: "/clients" },
];

const Sidebar = ({ active, onLogout }) => {

    const navigate = useNavigate();

    return (
        <aside className="hidden md:flex w-64 shrink-0 bg-white border-r border-gray-100 flex-col">
            <a href="/admin" className="flex items-center justify-center border-b border-gray-100 py-5">
                <img src="/logo.png" alt="Active usluge" className="h-12 w-fit" />
            </a>

            <nav className="flex-1 px-3 py-6 space-y-1 text-sm">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.key;
                    return (
                        <div
                            key={item.key}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium cursor-pointer ${
                                isActive
                                    ? "bg-[#1f2a63] text-white"
                                    : "text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            <p>{item.label}</p>
                        </div>
                    );
                })}
                <div
                    onClick={onLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium cursor-pointer text-red-500 hover:bg-red-50"
                >
                    <LogOut className="w-4 h-4" />
                    <p>Odjava</p>
                </div>
            </nav>

            <div className="p-4 border-t border-gray-100">
                <a
                    href="/" target="__blank__"
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#2f3f95] cursor-pointer"
                >
                    <ExternalLink className="w-4 h-4" />
                    <p>Posjeti stranicu</p>
                </a>
            </div>
        </aside>
    );
}

export default Sidebar;