import {expandRecord, initializeBlock, useCustomProperties, useRecords} from '@airtable/blocks/interface/ui';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import './style.css';
import {AddConditionDialog, AddCritDialog, AddItemDialog, AddSpellDialog, AdvanceDialog, GainXpDialog, MoneyDialog, PlayBar} from './actions';
import {CallToArms, CombatButton, CombatMode} from './combat';
import {SheetContext} from './context';
import {FIELDS, TABLES, findMissingFields, makeWriter, resolveFields, str, useCharacterModel} from './data';
import {Journals, PageOne, PageTwo} from './sheet';
import {Portrait, SetupBanner, inputCls} from './ui';

// One table picker per table, defaulted by exact name so it works on first load.
function getCustomProperties(base) {
    return Object.entries(TABLES).map(([key, name]) => ({
        key,
        label: `Table : ${name}`,
        type: 'table',
        defaultValue: base.tables.find(t => t.name.toLowerCase() === name.toLowerCase()),
    }));
}

function App() {
    const {customPropertyValueByKey} = useCustomProperties(getCustomProperties);
    const missing = Object.entries(TABLES).filter(([key]) => !customPropertyValueByKey[key]);
    if (missing.length) {
        return (
            <Shell>
                <div className="mx-auto mt-16 max-w-lg rounded-md border border-[var(--line)] bg-[var(--card)] p-6 text-sm">
                    <h1 className="mb-2 font-sheet text-xl font-bold text-[var(--accent)]">Configuration</h1>
                    Ouvrez le panneau des propriétés et choisissez les tables pour : <strong>{missing.map(([, n]) => n).join(', ')}</strong>.
                    Chaque table doit aussi être ajoutée comme source de données de l&apos;élément.
                </div>
            </Shell>
        );
    }
    return <Sheet tables={customPropertyValueByKey} />;
}

function Shell({children}) {
    return <div className="fixed inset-0 overflow-auto bg-[var(--paper)] text-[var(--ink)]">{children}</div>;
}

const STORAGE_KEY = 'wfrp-selected-character';
const readStored = () => {
    try {
        return window.localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
};
const writeStored = id => {
    try {
        window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
        // storage unavailable: the choice just isn't remembered
    }
};

const DIALOGS = {
    advance: AdvanceDialog,
    gainXp: GainXpDialog,
    money: MoneyDialog,
    item: AddItemDialog,
    condition: AddConditionDialog,
    crit: AddCritDialog,
    spell: AddSpellDialog,
};

const TABS = [
    ['page1', 'Feuille'],
    ['page2', 'Équipement & état'],
    ['journals', 'Journaux'],
];

function Sheet({tables}) {
    const persos = useRecords(tables.persos);
    const skills = useRecords(tables.skills);
    const talents = useRecords(tables.talents);
    const inventory = useRecords(tables.inventory);
    const conditions = useRecords(tables.conditions);
    const crits = useRecords(tables.crits);
    const xp = useRecords(tables.xp);
    const money = useRecords(tables.money);
    const skillCatalog = useRecords(tables.skillCatalog);
    const talentCatalog = useRecords(tables.talentCatalog);
    const equipment = useRecords(tables.equipment);
    const conditionCatalog = useRecords(tables.conditionCatalog);
    const spells = useRecords(tables.spells);
    const groups = useRecords(tables.groups);
    const records = useMemo(
        () => ({persos, skills, talents, inventory, conditions, crits, xp, money, skillCatalog, talentCatalog, equipment, conditionCatalog, spells, groups}),
        [persos, skills, talents, inventory, conditions, crits, xp, money, skillCatalog, talentCatalog, equipment, conditionCatalog, spells, groups],
    );

    const fields = useMemo(
        () => Object.fromEntries(Object.keys(TABLES).map(key => [key, resolveFields(tables[key], FIELDS[key])])),
        [tables],
    );
    const missingFields = useMemo(() => findMissingFields(tables, fields), [tables, fields]);
    const canExpand = useMemo(() => Object.fromEntries(Object.keys(TABLES).map(key => [key, tables[key].hasPermissionToExpandRecords()])), [tables]);
    const noExpand = Object.entries(canExpand)
        .filter(([key, ok]) => !ok && !key.endsWith('Catalog') && key !== 'equipment')
        .map(([key]) => tables[key].name);

    // open(tableKey, id) returns a click handler, or undefined when record details are off.
    const open = useCallback(
        (key, id) => {
            if (!canExpand[key]) return undefined;
            return () => {
                const record = records[key].find(r => r.id === id);
                if (record) expandRecord(record);
            };
        },
        [canExpand, records],
    );

    const w = useMemo(() => makeWriter(tables, fields), [tables, fields]);
    const [error, setError] = useState(null);
    const run = useCallback(async fn => {
        try {
            return await fn();
        } catch (e) {
            setError(e?.message || String(e));
            return undefined;
        }
    }, []);

    const sortedPersos = useMemo(
        () => [...persos].sort((a, b) => str(a, fields.persos.name).localeCompare(str(b, fields.persos.name), 'fr')),
        [persos, fields],
    );
    const [charId, setCharId] = useState(readStored);
    const activeId = sortedPersos.some(p => p.id === charId) ? charId : sortedPersos[0]?.id ?? null;
    const selectChar = id => {
        setCharId(id);
        writeStored(id);
    };

    const m = useCharacterModel(records, fields, activeId);
    const [tab, setTab] = useState('page1');
    const [dialog, setDialog] = useState(null);
    const Dialog = dialog ? DIALOGS[dialog] : null;

    useEffect(() => {
        if (!error) return undefined;
        const t = setTimeout(() => setError(null), 8000);
        return () => clearTimeout(t);
    }, [error]);

    // Combat mode: the call-to-arms overlay plays, the combat screen mounts under it mid-way.
    const [combat, setCombat] = useState(false);
    const [intro, setIntro] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const timers = useRef([]);
    useEffect(() => () => timers.current.forEach(clearTimeout), []);
    const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
    const enterCombat = () => {
        setIntro(true);
        try {
            window.navigator.vibrate?.([40, 60, 110]);
        } catch {
            // no vibration support
        }
        later(() => setCombat(true), 420);
        later(() => setIntro(false), 1450);
    };
    const exitCombat = () => {
        setLeaving(true);
        later(() => {
            setCombat(false);
            setLeaving(false);
        }, 280);
    };

    const ctx = useMemo(() => ({m, w, run, open, records, fields}), [m, w, run, open, records, fields]);

    const errorToast = error && (
        <div className="fixed inset-x-3 top-3 z-[70] mx-auto flex max-w-xl items-start justify-between gap-3 rounded-md border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--ink)] shadow-lg">
            <span>{error}</span>
            <button type="button" className="hover:underline" onClick={() => setError(null)}>
                OK
            </button>
        </div>
    );
    const dialogEl = Dialog && m && <Dialog key={`${dialog}-${m.id}`} onClose={() => setDialog(null)} />;

    return (
        <Shell>
            {errorToast}
            {m && combat && (
                <SheetContext.Provider value={ctx}>
                    <CombatMode onExit={exitCombat} onDialog={setDialog} leaving={leaving}>
                        {dialogEl}
                    </CombatMode>
                </SheetContext.Provider>
            )}
            {intro && m && <CallToArms name={m.name} />}
            {!combat && (
                <div className="mx-auto max-w-7xl space-y-3 p-3 pb-24 sm:p-4 sm:pb-24">
                    <header className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            {m && <Portrait url={m.photo} name={m.name} size={60} onOpen={open('persos', m.id)} />}
                            <div className="min-w-0">
                                <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">Warhammer Fantasy Roleplay</div>
                                <h1 className="truncate font-sheet text-3xl font-bold text-[var(--accent)]">{m ? m.name : 'Aucun personnage'}</h1>
                                {m && (
                                    <div className="text-sm text-[var(--muted)]">
                                        {[m.race.map(r => r.name).join(', '), m.carriere, m.niveau.map(n => n.name).join(', '), m.statut]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </div>
                                )}
                            </div>
                        </div>
                        <label className="flex w-full items-center gap-2 text-sm sm:w-auto">
                            <span className="text-[var(--muted)]">Personnage</span>
                            <select className={`${inputCls} flex-1 sm:w-56`} value={activeId ?? ''} onChange={e => selectChar(e.target.value)}>
                                {sortedPersos.map(p => {
                                    const joueur = str(p, fields.persos.joueur);
                                    return (
                                        <option key={p.id} value={p.id}>
                                            {str(p, fields.persos.name) || p.name}
                                            {joueur ? ` — ${joueur}` : ' — PNJ'}
                                        </option>
                                    );
                                })}
                            </select>
                        </label>
                    </header>

                    <SetupBanner missingFields={missingFields} noExpand={noExpand} />

                    {!m ? (
                        <p className="text-[var(--muted)]">Ajoutez un personnage dans la table {tables.persos.name}.</p>
                    ) : (
                        <SheetContext.Provider value={ctx}>
                            <PlayBar onDialog={setDialog} />
                            <nav className="flex gap-1 overflow-x-auto border-b border-[var(--line)]">
                                {TABS.map(([key, label]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setTab(key)}
                                        className={`-mb-px shrink-0 border-b-2 px-3 py-1.5 font-sheet text-[15px] font-semibold ${
                                            tab === key ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </nav>
                            {tab === 'page1' && <PageOne />}
                            {tab === 'page2' && <PageTwo onDialog={setDialog} />}
                            {tab === 'journals' && <Journals />}
                            {dialogEl}
                            {!intro && <CombatButton onClick={enterCombat} />}
                        </SheetContext.Provider>
                    )}
                </div>
            )}
        </Shell>
    );
}

initializeBlock({interface: () => <App />});
