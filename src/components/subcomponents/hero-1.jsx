const Hero1 = ({icon, title, desc, icon_col}) => {

    const Icon = icon;

    return (
        <div className="rounded-2xl bg-white/90 text-slate-800 p-4 h-40 flex flex-col justify-between">
            <Icon className={`w-8 h-8 ${icon_col}`} />
            <div className="flex flex-col">
                <h4 className="font-semibold">{title}</h4>
                <p className="text-xs text-slate-500">{desc}</p>
            </div>
        </div>
    );
}

export default Hero1;