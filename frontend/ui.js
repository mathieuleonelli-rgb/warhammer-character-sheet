import {useEffect, useState} from 'react';

export function Card({title, actions, children, className = ''}) {
    return (
        <section className={`rounded-md border border-[var(--line)] bg-[var(--card)] ${className}`}>
            {(title || actions) && (
                <header className="flex items-center justify-between gap-2 border-b border-[var(--line)] px-3 py-1.5">
                    <h2 className="font-sheet text-[15px] font-bold uppercase tracking-wide text-[var(--accent)]">{title}</h2>
                    {actions && <div className="flex items-center gap-1">{actions}</div>}
                </header>
            )}
            <div className="p-3">{children}</div>
        </section>
    );
}

const VARIANTS = {
    primary: 'bg-[var(--accent)] text-[var(--card)] border-[var(--accent)] hover:opacity-90',
    ghost: 'bg-transparent text-[var(--ink)] border-[var(--line)] hover:bg-[var(--accent-soft)]',
    danger: 'bg-transparent text-[var(--accent)] border-transparent hover:bg-[var(--accent-soft)]',
};

export function Btn({onClick, disabled, title, variant = 'ghost', small, type = 'button', children, className = ''}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`inline-flex items-center justify-center gap-1 rounded border font-medium transition-colors
                disabled:pointer-events-none disabled:opacity-40
                ${small ? 'h-6 min-w-6 px-1.5 text-xs' : 'h-8 px-3 text-sm'} ${VARIANTS[variant]} ${className}`}
        >
            {children}
        </button>
    );
}

export function Stepper({value, onDec, onInc, disabled, decTitle, incTitle, children}) {
    return (
        <span className="inline-flex items-center gap-1">
            <Btn small onClick={onDec} disabled={disabled || !onDec} title={decTitle}>
                −
            </Btn>
            <span className="tabular min-w-[2.5rem] text-center font-semibold">{children ?? value}</span>
            <Btn small onClick={onInc} disabled={disabled || !onInc} title={incTitle}>
                +
            </Btn>
        </span>
    );
}

export function Stat({label, value, sub, big}) {
    return (
        <div className="flex flex-col items-center rounded border border-[var(--line)] px-2 py-1 text-center">
            <span className="text-[11px] uppercase tracking-wide text-[var(--muted)]">{label}</span>
            <span className={`tabular font-sheet font-bold ${big ? 'text-2xl' : 'text-lg'}`}>{value}</span>
            {sub && <span className="text-[11px] text-[var(--muted)]">{sub}</span>}
        </div>
    );
}

// A record label: clickable when the record can be opened, plain text otherwise.
export function RecordLink({label, onOpen, className = ''}) {
    if (!onOpen) return <span className={className}>{label}</span>;
    return (
        <button
            type="button"
            onClick={e => {
                e.stopPropagation();
                onOpen();
            }}
            className={`text-left hover:text-[var(--accent)] hover:underline ${className}`}
            title="Ouvrir la fiche"
        >
            {label}
        </button>
    );
}

export function Pills({items, openFor}) {
    if (!items.length) return <span className="text-[var(--muted)]">—</span>;
    return (
        <span className="inline-flex flex-wrap gap-1">
            {items.map(l => {
                const onOpen = openFor?.(l.id);
                const cls = 'rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-medium';
                return onOpen ? (
                    <button key={l.id} type="button" onClick={onOpen} className={`${cls} hover:underline`}>
                        {l.name}
                    </button>
                ) : (
                    <span key={l.id} className={cls}>
                        {l.name}
                    </span>
                );
            })}
        </span>
    );
}

// Click-to-edit text. Saves on blur or Enter (Cmd/Ctrl+Enter for multiline).
export function InlineText({value, onSave, multiline, placeholder = '—', disabled, className = ''}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    useEffect(() => {
        if (!editing) setDraft(value);
    }, [value, editing]);

    if (disabled || !onSave) {
        return <span className={`whitespace-pre-wrap ${className}`}>{value || <span className="text-[var(--muted)]">{placeholder}</span>}</span>;
    }
    if (!editing) {
        return (
            <button
                type="button"
                onClick={() => setEditing(true)}
                className={`w-full rounded px-0.5 text-left whitespace-pre-wrap hover:bg-[var(--accent-soft)] ${className}`}
                title="Modifier"
            >
                {value || <span className="text-[var(--muted)]">{placeholder}</span>}
            </button>
        );
    }
    const commit = () => {
        setEditing(false);
        if (draft !== value) onSave(draft);
    };
    const props = {
        autoFocus: true,
        value: draft,
        onChange: e => setDraft(e.target.value),
        onBlur: commit,
        onKeyDown: e => {
            if (e.key === 'Escape') {
                setDraft(value);
                setEditing(false);
            } else if (e.key === 'Enter' && (!multiline || e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                commit();
            }
        },
        className: `w-full rounded border border-[var(--accent)] bg-[var(--card)] px-1 text-[var(--ink)] outline-none ${className}`,
    };
    return multiline ? <textarea rows={3} {...props} /> : <input {...props} />;
}

export function InlineNumber({value, onSave, disabled, className = ''}) {
    return (
        <InlineText
            value={value === null || value === undefined ? '' : String(value)}
            onSave={onSave && (v => onSave(v.trim() === '' ? null : Number(v)))}
            disabled={disabled}
            placeholder="0"
            className={`tabular text-center ${className}`}
        />
    );
}

export function Modal({title, onClose, children, footer}) {
    useEffect(() => {
        const onKey = e => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-16" onMouseDown={onClose}>
            <div
                className="w-full max-w-md rounded-md border border-[var(--line)] bg-[var(--card)] text-[var(--ink)] shadow-xl"
                onMouseDown={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2">
                    <h2 className="font-sheet text-lg font-bold text-[var(--accent)]">{title}</h2>
                    <Btn small variant="danger" onClick={onClose} title="Fermer">
                        ✕
                    </Btn>
                </header>
                <div className="space-y-3 p-4 text-sm">{children}</div>
                {footer && <footer className="flex justify-end gap-2 border-t border-[var(--line)] px-4 py-2">{footer}</footer>}
            </div>
        </div>
    );
}

export function Label({text, children}) {
    return (
        <label className="block">
            <span className="mb-0.5 block text-xs uppercase tracking-wide text-[var(--muted)]">{text}</span>
            {children}
        </label>
    );
}

export const inputCls =
    'h-8 w-full rounded border border-[var(--line)] bg-[var(--card)] px-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]';

export function Empty({children}) {
    return <p className="text-sm italic text-[var(--muted)]">{children}</p>;
}

export const Th = ({children, className = ''}) => (
    <th className={`border-b border-[var(--line)] px-1.5 py-1 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)] ${className}`}>
        {children}
    </th>
);
export const Td = ({children, className = ''}) => (
    <td className={`border-b border-[var(--line)] px-1.5 py-1 align-middle ${className}`}>{children}</td>
);

export function SetupBanner({missingFields, noExpand}) {
    const [dismissed, setDismissed] = useState(false);
    if (dismissed || (!missingFields.length && !noExpand.length)) return null;
    return (
        <div className="rounded-md border border-[var(--warn)] bg-[var(--card)] p-3 text-sm text-[var(--warn)]">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <div className="font-semibold">Terminer la configuration dans l&apos;Interface Designer</div>
                    {missingFields.length > 0 && (
                        <div>
                            Ces champs ne sont pas visibles pour l&apos;extension et s&apos;affichent vides. Ajoutez-les dans les
                            paramètres de données de l&apos;élément :
                            <ul className="ml-5 mt-1 list-disc">
                                {missingFields.map(m => (
                                    <li key={m.table}>
                                        <strong>{m.table} :</strong> {m.fields.join(', ')}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {noExpand.length > 0 && (
                        <div>
                            L&apos;ouverture des fiches est désactivée pour <strong>{noExpand.join(', ')}</strong>. Activez les
                            détails d&apos;enregistrement pour ces tables dans les paramètres de l&apos;élément.
                        </div>
                    )}
                </div>
                <button type="button" onClick={() => setDismissed(true)} className="shrink-0 hover:underline">
                    Masquer
                </button>
            </div>
        </div>
    );
}

// Two-step delete: the first click arms it, the second (within 3 s) confirms.
export function ConfirmBtn({onConfirm, disabled, title = 'Supprimer', children = '✕'}) {
    const [armed, setArmed] = useState(false);
    useEffect(() => {
        if (!armed) return undefined;
        const t = setTimeout(() => setArmed(false), 3000);
        return () => clearTimeout(t);
    }, [armed]);
    return (
        <Btn
            small
            variant="danger"
            disabled={disabled}
            title={title}
            onClick={() => {
                if (armed) {
                    setArmed(false);
                    onConfirm();
                } else {
                    setArmed(true);
                }
            }}
        >
            {armed ? 'Confirmer ?' : children}
        </Btn>
    );
}
