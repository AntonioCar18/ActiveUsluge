const ReservationBlock = ({icon, title, desc, iconColor, bgcol }) => {

    const Icon = icon;

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className={`${bgcol} p-4 rounded-2xl mx-auto`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div className="flex flex-col items-center">
                <h3 className="text-[16px] font-bold tracking-tight">{title}</h3>
                <p className="text-sm text-slate-500 mt-1 text-center">{desc}</p>
            </div>
        </div>
    );
}

export default ReservationBlock;