import { X, Pencil } from "lucide-react";

const BlockDateAdd = ({ date, reason, onDelete, onEdit }) => {

    const dateTransformed = new Date(date).toLocaleDateString('hr-HR')

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium w-fit">
            <p>{dateTransformed} {reason && ` - ${reason}`}</p>
            <button onClick={onEdit} className="cursor-pointer">
                <Pencil className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button onClick={onDelete} className="cursor-pointer">
                <X className="w-4 h-4 text-slate-500" />
            </button>
        </div>
    );
};

export default BlockDateAdd;
