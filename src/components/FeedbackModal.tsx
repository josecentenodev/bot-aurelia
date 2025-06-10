import { useState } from "react";
import { Message } from "../types";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: Message;
    isPositive: boolean;
}
export default function FeedbackModal({ isOpen, onClose, message, isPositive }: FeedbackModalProps) {
    const [feedback, setFeedback] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!feedback.trim()) return;

        setSending(true);
        setError(null);
        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ MsgId: message.id, content: feedback, isPositive }),
            });

            if (!res.ok) throw new Error("Error al enviar feedback");
            setSent(true);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Error desconocido";
            setError(msg);
        } finally {
            setSending(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                {sent ? (
                    <div className="flex flex-col items-center gap-4">
                        <h2 className="text-center text-xl font-semibold">
                            ¡Gracias por tu feedback! 🎉
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                            autoFocus
                        >
                            Cerrar
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Tu feedback</h2>
                            {isPositive ? <img src='/thumb-up-svgrepo-com.svg' height={19} width={19} /> : <img src='/thumb-down-svgrepo-com.svg' height={19} width={19} />}
                        </div>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={4}
                            required
                            className="w-full resize-none rounded-xl border p-3 focus:border-indigo-500 focus:outline-none"
                            placeholder="¿Qué mejorarías?"
                        ></textarea>
                        {error && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl border px-4 py-2 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={sending}
                                className="rounded-xl bg-[#7806F1] px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {sending ? "Enviando…" : "Enviar"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
