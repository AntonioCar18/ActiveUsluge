const DashboardEquipment = ({title, category, icon, desc}) => {

    const Icon = icon;

    const categoryColors = {
        "Ozvučenje": { bg: "bg-[#e5f5fc]", text: "text-[#2f8fc4]" },
        "Šatori": { bg: "bg-[#e3eafb]", text: "text-[#2f3f95]" },
        "Rasvjeta": { bg: "bg-orange-100", text: "text-orange-600" },
    };

    const { bg, text } = categoryColors[category] || { bg: "bg-slate-100", text: "text-slate-500" };

    return (
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex gap-4 items-center">
                <div className={`p-3 ${bg} rounded-2xl`}>
                    <Icon className={`w-6 h-6 ${text}`} />
                </div>
                <div className="flex flex-col">
                    <h3 className="font-bold text-sm">{title}</h3>
                    <p className="text-slate-500 text-xs font-semibold">{desc}</p>
                </div>
            </div>
        </div>
    );
}

export default DashboardEquipment;