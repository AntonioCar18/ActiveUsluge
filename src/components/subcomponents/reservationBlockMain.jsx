const colorMap = {
        green: { text: "text-green-600" },
        orange: { text: "text-orange-300" },
        red: { text: "text-red-600" },
    };

const ReservationBlockMain = ({icon, title, quantity, desc, color = "orange"}) => {

    const Icon = icon;
    const {text} = colorMap[color]

    return (
        <div className="flex flex-col bg-white rounded-2xl p-8 gap-2">
            <div className="flex items-center justify-start gap-2">
                <Icon className={`w-5 h-5 ${text}`} />
                <h2 className="text-slate-400 font-medium text-sm">{title}</h2>
            </div>
            <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-bold">{quantity}</h3>
                <p className="text-xs text-slate-400">{desc}</p>
            </div>
        </div>
    );
};

export default ReservationBlockMain;