const colorMap = {
        blue: { bg: "bg-[#e3eafb]", text: "text-[#1f2a63]" },
        green: { bg: "bg-emerald-100", text: "text-emerald-600" },
        amber: { bg: "bg-amber-100", text: "text-amber-600" },
        brown: { bg: "bg-stone-100", text: "text-stone-700" },
    };

const DashboardCard = ({title, icon, desc, color= "blue", desc2}) => {

    const Icon = icon;
    const { bg, text } = colorMap[color];
    

    return (
        <div className="bg-white rounded-2xl shadow-md flex flex-1 flex-col p-6">
            <div className="flex items-center justify-between">
                <h3 className="text-slate-500 text-sm">{title}</h3>
                <div className={`p-2 rounded-xl ${bg}`}>
                    <Icon className={`${text} w-4 h-4`} />
                </div>
            </div>
            <h3 className="font-extrabold text-2xl mt-4">{desc}</h3>
            <p className="mt-4 text-xs text-slate-400">{desc2}</p>
        </div>
    );
}

export default DashboardCard;