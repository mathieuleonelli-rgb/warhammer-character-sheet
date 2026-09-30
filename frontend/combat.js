import {useEffect, useMemo, useState} from 'react';
import {useSheet} from './context';
import {LOCATIONS, clamp} from './data';
import {Portrait} from './ui';

// Skills worth having at hand in a fight, matched by the start of their label.
const COMBAT_SKILLS = ['Corps à corps', 'Projectiles', 'Esquive', 'Athlétisme', 'Calme', 'Résistance', 'Intimidation'];
const COMBAT_CHARS = ['CC', 'CT', 'I', 'Ag'];

// Condition names for one-tap adding. Matched to the États catalog by name when it exists.
const QUICK_CONDITIONS = ['Hémorragie', 'Assommé', 'À terre', 'Empêtré', 'Épuisé', 'En feu', 'Surpris', 'Aveuglé', 'Assourdi', 'Brisé', 'Empoisonné', 'Inconscient'];

const SPARKS = Array.from({length: 14}, (_, i) => {
    const angle = (i / 14) * Math.PI * 2 + (i % 2 ? 0.2 : -0.1);
    const dist = 90 + (i % 3) * 55;
    return {dx: `${Math.round(Math.cos(angle) * dist)}px`, dy: `${Math.round(Math.sin(angle) * dist)}px`, delay: `${0.28 + (i % 4) * 0.04}s`};
});

// Full-screen overlay played when entering combat.
export function CallToArms({name}) {
    return (
        <div className="call-to-arms" aria-hidden="true">
            <div className="slash" />
            <div className="slash second" />
            {SPARKS.map((s, i) => (
                <span key={i} className="spark" style={{'--dx': s.dx, '--dy': s.dy, animationDelay: s.delay}} />
            ))}
            <div className="title">
                <CrossedSwords size={64} />
                <div className="font-sheet text-5xl font-black uppercase sm:text-7xl">Aux armes !</div>
                <div className="font-sheet text-lg uppercase tracking-[0.3em] opacity-80">{name}</div>
            </div>
        </div>
    );
}

export function CrossedSwords({size = 24, className = ''}) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
            <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
            <path d="m13 19 6-6" />
            <path d="m16 16 4 4" />
            <path d="m19 21 2-2" />
            <path d="M14.5 6.5 18 3h3v3l-3.5 3.5" />
            <path d="m5 14 4 4" />
            <path d="m7 17-3 3" />
            <path d="m3 19 2 2" />
        </svg>
    );
}

// The floating button that starts a fight.
export function CombatButton({onClick}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="combat-fab fixed bottom-4 right-4 z-40 flex h-14 items-center gap-2 rounded-full pl-4 pr-5 font-sheet text-lg font-bold uppercase tracking-wider transition-transform"
            style={{marginBottom: 'env(safe-area-inset-bottom)'}}
        >
            <CrossedSwords size={26} />
            Combat
        </button>
    );
}

const readAdvantage = id => {
    try {
        return Number(window.localStorage.getItem(`wfrp-advantage-${id}`)) || 0;
    } catch {
        return 0;
    }
};
const writeAdvantage = (id, v) => {
    try {
        window.localStorage.setItem(`wfrp-advantage-${id}`, String(v));
    } catch {
        // storage unavailable: the counter just resets on reload
    }
};

function Panel({title, right, children, className = ''}) {
    return (
        <section className={`rounded-xl border border-[var(--line)] bg-[var(--card)] p-3 ${className}`}>
            {(title || right) && (
                <header className="mb-2 flex items-center justify-between gap-2">
                    <h2 className="font-sheet text-sm font-bold uppercase tracking-[0.15em] text-[var(--accent)]">{title}</h2>
                    {right}
                </header>
            )}
            {children}
        </section>
    );
}

// Big touch target (48px+).
function Tap({onClick, disabled, children, tone = 'ghost', className = '', title}) {
    const tones = {
        ghost: 'border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] active:bg-[var(--accent-soft)]',
        blood: 'border-[#ff8a5c] bg-gradient-to-b from-[#b3261e] to-[#6d0f0a] text-[#fbe9d0] active:brightness-125',
        heal: 'border-[#4f8a55] bg-gradient-to-b from-[#2f6b34] to-[#1c4220] text-[#e6f5e6] active:brightness-125',
        on: 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--ink)]',
    };
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`min-h-12 select-none rounded-lg border px-3 font-semibold transition active:scale-95 disabled:opacity-35 ${tones[tone]} ${className}`}
        >
            {children}
        </button>
    );
}

function BigCounter({label, value, max, onSpend, onGain, disabled, spendLabel}) {
    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className="text-[11px] uppercase tracking-[0.15em] text-[var(--muted)]">{label}</div>
            <div className="flex gap-1">
                {Array.from({length: Math.max(max, value)}, (_, i) => (
                    <span
                        key={i}
                        className={`h-3 w-3 rotate-45 border ${i < value ? 'border-[#ffb35c] bg-[#e5482c] shadow-[0_0_8px_#e5482c]' : 'border-[var(--line)]'}`}
                    />
                ))}
            </div>
            <div className="tabular font-sheet text-3xl font-bold">
                {value}
                <span className="text-lg text-[var(--muted)]">/{max}</span>
            </div>
            <div className="flex w-full gap-1.5">
                <Tap tone="blood" className="flex-1" onClick={onSpend} disabled={disabled || value <= 0}>
                    {spendLabel}
                </Tap>
                <Tap className="w-12" onClick={onGain} disabled={disabled || value >= max} title="Récupérer">
                    +
                </Tap>
            </div>
        </div>
    );
}

export function CombatMode({onExit, onDialog, leaving, children}) {
    const {m, w, run, open, records} = useSheet();
    const s = m.stats;
    const canDmg = w.canUpdate('persos', 'degats');

    const [advantage, setAdvantageState] = useState(() => readAdvantage(m.id));
    useEffect(() => setAdvantageState(readAdvantage(m.id)), [m.id]);
    const setAdvantage = v => {
        const next = Math.max(0, v);
        setAdvantageState(next);
        writeAdvantage(m.id, next);
    };

    const [loc, setLoc] = useState('Corps');
    const [raw, setRaw] = useState('');
    const [heal, setHeal] = useState(1);
    const location = LOCATIONS.find(l => l.name === loc);
    const pa = location ? s[location.pa] : 0;
    const rawN = Math.floor(Number(raw) || 0);
    // Damage taken = damage − (BE + PA at the location), minimum 1 on a hit.
    const taken = rawN > 0 ? Math.max(1, rawN - s.be - pa) : 0;

    const setDamage = v => run(() => w.update('persos', m.record, {degats: clamp(v, 0, Math.max(0, s.blessuresMax))}));
    const hit = async n => {
        await setDamage(s.degats + n);
        setRaw('');
        try {
            window.navigator.vibrate?.(n >= 5 ? [60, 40, 120] : 50);
        } catch {
            // no vibration support
        }
    };

    const pct = s.blessuresMax ? clamp(s.blessures / s.blessuresMax, 0, 1) : 0;
    const danger = s.blessures <= s.be;
    const down = s.blessures === 0;

    const weapons = m.weapons.some(x => x.equipe) ? m.weapons.filter(x => x.equipe) : m.weapons;
    const combatSkills = m.skills.filter(sk => COMBAT_SKILLS.some(p => sk.label.startsWith(p)));
    const combatChars = m.chars.filter(c => COMBAT_CHARS.includes(c.key));

    const catalogByName = useMemo(
        () => new Map(records.conditionCatalog.map(r => [r.name.toLowerCase(), r])),
        [records.conditionCatalog],
    );
    const toggleQuickCondition = name => {
        const active = m.conditions.find(c => c.label.toLowerCase() === name.toLowerCase());
        if (active) {
            return run(() => w.update('conditions', active.record, {niveau: active.niveau + 1}));
        }
        const cat = catalogByName.get(name.toLowerCase());
        return run(() => w.create('conditions', {label: name, perso: [{id: m.id}], ...(cat ? {etat: [{id: cat.id}]} : {}), niveau: 1}));
    };
    const openCrits = m.crits.filter(c => !c.guerie);

    return (
        <div className={`combat fixed inset-0 z-30 overflow-y-auto ${leaving ? 'leaving' : ''}`}>
            <div className="mx-auto max-w-xl space-y-3 p-3 pb-28" style={{paddingTop: 'max(0.75rem, env(safe-area-inset-top))'}}>
                {/* Header */}
                <header className="flex items-center gap-3">
                    <Portrait url={m.photo} name={m.name} size={64} onOpen={open('persos', m.id)} className={danger ? 'danger-pulse' : ''} />
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">
                            <CrossedSwords size={14} /> En combat
                        </div>
                        <h1 className="truncate font-sheet text-2xl font-bold">{m.name}</h1>
                    </div>
                    <Tap onClick={onExit} className="shrink-0 text-sm">
                        Fin du combat
                    </Tap>
                </header>

                {/* Wounds */}
                <Panel>
                    <div className="flex items-end justify-between">
                        <div className="text-[11px] uppercase tracking-[0.15em] text-[var(--muted)]">Blessures</div>
                        <div className="text-xs text-[var(--muted)]">BE {s.be} · Dégâts subis {s.degats}</div>
                    </div>
                    <div className={`tabular font-sheet text-6xl font-black leading-none ${danger ? 'text-[var(--accent)]' : ''}`}>
                        {s.blessures}
                        <span className="text-2xl text-[var(--muted)]"> / {s.blessuresMax}</span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-[var(--paper)]">
                        <div
                            className={`h-full rounded-full transition-[width] duration-500 ${danger ? 'danger-pulse' : ''}`}
                            style={{
                                width: `${pct * 100}%`,
                                background: danger ? 'linear-gradient(90deg,#7a0b00,#e5482c)' : 'linear-gradient(90deg,#8a1c12,#e5482c 60%,#ffb35c)',
                            }}
                        />
                    </div>
                    {down && (
                        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] p-2 text-sm">
                            <span className="font-semibold">0 Blessures : chaque coup cause une blessure critique.</span>
                            <Tap tone="blood" className="shrink-0 text-sm" onClick={() => onDialog('crit')} disabled={!w.canCreate('crits')}>
                                + Critique
                            </Tap>
                        </div>
                    )}

                    {/* Take a hit */}
                    <div className="mt-4 text-[11px] uppercase tracking-[0.15em] text-[var(--muted)]">Encaisser un coup</div>
                    <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                        {LOCATIONS.map(l => (
                            <Tap key={l.name} tone={loc === l.name ? 'on' : 'ghost'} className="flex flex-col items-center justify-center py-1 text-sm leading-tight" onClick={() => setLoc(l.name)}>
                                <span>{l.name}</span>
                                <span className="text-[11px] font-normal text-[var(--muted)]">
                                    {l.range} · PA {s[l.pa]}
                                </span>
                            </Tap>
                        ))}
                    </div>
                    <div className="mt-2 flex items-stretch gap-1.5">
                        <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            value={raw}
                            onChange={e => setRaw(e.target.value)}
                            placeholder="Dégâts"
                            className="tabular min-h-12 w-24 rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 text-center text-xl font-bold text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                            aria-label="Dégâts de l'attaque"
                        />
                        <Tap tone="blood" className="flex-1 text-lg" onClick={() => hit(taken)} disabled={!canDmg || !taken}>
                            {taken ? `Encaisser −${taken}` : 'Encaisser'}
                        </Tap>
                    </div>
                    <div className="mt-1 text-xs text-[var(--muted)]">
                        {rawN > 0
                            ? `${rawN} − BE ${s.be} − PA ${pa} (${loc}) = ${rawN - s.be - pa}${rawN - s.be - pa < 1 ? ', minimum 1' : ''}`
                            : 'Saisissez les dégâts de l’attaque : BE et PA de la localisation sont retirés.'}
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-1.5">
                        {[1, 2, 3].map(n => (
                            <Tap key={n} tone="blood" onClick={() => hit(n)} disabled={!canDmg} title="Perte directe, sans BE ni PA">
                                −{n}
                            </Tap>
                        ))}
                        <Tap tone="heal" onClick={() => setDamage(s.degats - heal)} disabled={!canDmg || !s.degats}>
                            +{heal}
                        </Tap>
                    </div>
                    <div className="mt-1.5 flex items-center justify-end gap-1.5 text-xs text-[var(--muted)]">
                        Soin de
                        {[1, 2, 5].map(n => (
                            <button key={n} type="button" onClick={() => setHeal(n)} className={`rounded px-2 py-1 ${heal === n ? 'bg-[var(--accent-soft)] text-[var(--ink)]' : ''}`}>
                                {n}
                            </button>
                        ))}
                    </div>
                </Panel>

                {/* Advantage, Chance, Détermination */}
                <Panel>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center gap-1.5">
                            <div className="text-[11px] uppercase tracking-[0.15em] text-[var(--muted)]">Avantage</div>
                            <div className="h-3" />
                            <div className="tabular font-sheet text-3xl font-bold text-[#ffb35c]">{advantage}</div>
                            <div className="flex w-full gap-1.5">
                                <Tap className="w-12" onClick={() => setAdvantage(advantage - 1)} disabled={!advantage}>
                                    −
                                </Tap>
                                <Tap tone="blood" className="flex-1" onClick={() => setAdvantage(advantage + 1)}>
                                    +1
                                </Tap>
                            </div>
                            <button type="button" className="text-xs text-[var(--muted)] underline" onClick={() => setAdvantage(0)} disabled={!advantage}>
                                Perdu
                            </button>
                        </div>
                        <BigCounter
                            label="Chance"
                            value={s.chance}
                            max={s.destin}
                            spendLabel="Relance"
                            disabled={!w.canUpdate('persos', 'chance')}
                            onSpend={() => run(() => w.update('persos', m.record, {chance: clamp(s.chance - 1, 0, s.destin)}))}
                            onGain={() => run(() => w.update('persos', m.record, {chance: clamp(s.chance + 1, 0, s.destin)}))}
                        />
                        <BigCounter
                            label="Détermination"
                            value={s.determination}
                            max={s.resilience}
                            spendLabel="Dépenser"
                            disabled={!w.canUpdate('persos', 'determination')}
                            onSpend={() => run(() => w.update('persos', m.record, {determination: clamp(s.determination - 1, 0, s.resilience)}))}
                            onGain={() => run(() => w.update('persos', m.record, {determination: clamp(s.determination + 1, 0, s.resilience)}))}
                        />
                    </div>
                </Panel>

                {/* Weapons */}
                <Panel title="Armes">
                    {weapons.length ? (
                        <div className="space-y-2">
                            {weapons.map(x => (
                                <div key={x.id} className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--paper)] p-2">
                                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-[var(--accent-soft)]">
                                        <span className="tabular font-sheet text-2xl font-black text-[#ffb35c]">{x.degats || '—'}</span>
                                        <span className="text-[10px] uppercase text-[var(--muted)]">dégâts</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <button type="button" className="text-left font-semibold" onClick={open('inventory', x.id)} disabled={!open('inventory', x.id)}>
                                            {x.label}
                                        </button>
                                        <div className="text-xs text-[var(--muted)]">{[x.groupe, x.portee].filter(Boolean).join(' · ')}</div>
                                        {x.atouts && <div className="text-xs text-[var(--muted)]">{x.atouts}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm italic text-[var(--muted)]">Aucune arme dans l&apos;inventaire.</p>
                    )}
                </Panel>

                {/* Tests */}
                <Panel title="Tests">
                    <div className="grid grid-cols-4 gap-1.5">
                        {combatChars.map(c => (
                            <div key={c.key} className="rounded-lg border border-[var(--line)] bg-[var(--paper)] py-1.5 text-center" title={c.label}>
                                <div className="text-[11px] uppercase text-[var(--muted)]">{c.key}</div>
                                <div className="tabular font-sheet text-2xl font-bold">{c.courante}</div>
                            </div>
                        ))}
                    </div>
                    {combatSkills.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 gap-1.5">
                            {combatSkills.map(sk => (
                                <div key={sk.id} className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--paper)] px-2.5 py-2">
                                    <span className="truncate text-sm">{sk.label}</span>
                                    <span className="tabular ml-2 font-sheet text-xl font-bold">{sk.comp ?? '—'}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-2 text-xs text-[var(--muted)]">
                        Mouvement {s.mouvement} · Marche {s.marche} · Course {s.course}
                    </div>
                </Panel>

                {/* Conditions */}
                <Panel
                    title="États"
                    right={
                        <button type="button" className="text-xs text-[var(--muted)] underline" onClick={() => onDialog('condition')} disabled={!w.canCreate('conditions')}>
                            Autre…
                        </button>
                    }
                >
                    {m.conditions.length > 0 && (
                        <div className="mb-2 space-y-1.5">
                            {m.conditions.map(c => (
                                <div key={c.id} className="flex items-center gap-2 rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] p-1.5 pl-3">
                                    <span className="flex-1 font-semibold">{c.label}</span>
                                    {c.cumulable && (
                                        <>
                                            <Tap className="w-12" disabled={!w.canUpdate('conditions', 'niveau')} onClick={() => run(() => (c.niveau > 1 ? w.update('conditions', c.record, {niveau: c.niveau - 1}) : w.remove('conditions', c.record)))}>
                                                −
                                            </Tap>
                                            <span className="tabular w-6 text-center font-sheet text-xl font-bold">{c.niveau}</span>
                                            <Tap className="w-12" disabled={!w.canUpdate('conditions', 'niveau')} onClick={() => run(() => w.update('conditions', c.record, {niveau: c.niveau + 1}))}>
                                                +
                                            </Tap>
                                        </>
                                    )}
                                    <Tap className="w-12" onClick={() => run(() => w.remove('conditions', c.record))} title="Retirer">
                                        ✕
                                    </Tap>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                        {QUICK_CONDITIONS.filter(n => !m.conditions.some(c => c.label.toLowerCase() === n.toLowerCase())).map(n => (
                            <button
                                key={n}
                                type="button"
                                disabled={!w.canCreate('conditions')}
                                onClick={() => toggleQuickCondition(n)}
                                className="min-h-10 rounded-full border border-[var(--line)] px-3 text-sm active:scale-95 active:bg-[var(--accent-soft)] disabled:opacity-35"
                            >
                                + {n}
                            </button>
                        ))}
                    </div>
                </Panel>

                {/* Critical wounds */}
                <Panel
                    title="Blessures critiques"
                    right={
                        <button type="button" className="text-xs text-[var(--muted)] underline" onClick={() => onDialog('crit')} disabled={!w.canCreate('crits')}>
                            + Critique
                        </button>
                    }
                >
                    {openCrits.length ? (
                        <div className="space-y-1.5">
                            {openCrits.map(c => (
                                <div key={c.id} className="flex items-start gap-2 rounded-lg border border-[var(--line)] bg-[var(--paper)] p-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="font-semibold">
                                            {c.label}
                                            {c.loc && <span className="ml-1 text-xs font-normal text-[var(--muted)]">· {c.loc}</span>}
                                        </div>
                                        {c.effets && <div className="whitespace-pre-wrap text-xs text-[var(--muted)]">{c.effets}</div>}
                                    </div>
                                    <Tap tone="heal" className="shrink-0 text-sm" disabled={!w.canUpdate('crits', 'guerie')} onClick={() => run(() => w.update('crits', c.record, {guerie: true}))}>
                                        Guérie
                                    </Tap>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm italic text-[var(--muted)]">Aucune.</p>
                    )}
                </Panel>
            </div>
            {children}
        </div>
    );
}
