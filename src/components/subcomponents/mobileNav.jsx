import { LayoutDashboard, Package, CalendarCheck, Users, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const navItems = [
    { key: "dashboard", label: "Ploča", icon: LayoutDashboard, path: "/admin" },
    { key: "equipment", label: "Oprema", icon: Package, path: "/equipment" },
    { key: "reservation", label: "Rezervacije", icon: CalendarCheck, path: "/reservation" },
    { key: "clients", label: "Klijenti", icon: Users, path: "/clients" },
];

const MobileNav = ({ active, onLogout }) => {

    const navigate = useNavigate();

    return (
        <nav
            className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-100 flex items-stretch justify-between px-2"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;
                return (
                    <button
                        key={item.key}
                        onClick={() => navigate(item.path)}
                        className={`cursor-pointer flex-1 flex flex-col items-center justify-center gap-1 py-2.5 ${
                            isActive ? "text-[#1f2a63]" : "text-slate-400"
                        }`}
                    >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                );
            })}
            <button onClick={onLogout} className="cursor-pointer flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-slate-400">
                <LogOut className="w-5 h-5" />
                <span className="text-[10px] font-medium">Odjava</span>
            </button>
        </nav>
    );
}

export default MobileNav;