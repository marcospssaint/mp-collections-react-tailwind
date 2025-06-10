import { isFlagTrue } from "../utils/utils";

export function ControlStatusComponent({ data, status }) {
    const owned = isFlagTrue(data?.owned);
    return (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
            <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full shadow-sm ${
                    owned ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                    <span className="text-base">🗂️</span>
                    <span className="font-semibold">Na coleção:</span>
                    <span>{owned? "Sim" : "Não"}</span>
                </div>
            </div>
            {renderStatus({ ...status })}
        </div>
    )
}

function renderStatus({
    emoji,
    condicoes = {
        completo: true,
        pacialmente: false,
    },
    labels = {
        incompleto: "Não lido",
        completo: "Lido",
        pacialmente: "Parcialmente lido",
    }
}) {
    return (
        <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full shadow-sm ${condicoes.completo
                ? "bg-green-50 text-green-700"
                : condicoes.pacialmente
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-red-50 text-red-700"
                }`}>
                <span className="text-base">{emoji}</span>
                <span className="font-semibold">Status:</span>
                <span>
                    {condicoes.completo
                        ? labels.completo
                        : condicoes.pacialmente
                            ? labels.pacialmente
                            : labels.incompleto
                    }
                </span>
            </div>
        </div>
    );
}