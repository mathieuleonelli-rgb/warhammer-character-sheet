import {useMemo, useState} from 'react';
import {useSheet} from './context';
import {CHARS, clamp, links, num, numOrNull, str, today, val} from './data';
import {Btn, Label, Modal, Stepper, inputCls} from './ui';

// ---------- Always-visible play bar: wounds, Chance, Détermination, XP ----------

export function PlayBar({onDialog}) {
    const {m, w, run} = useSheet();
    const s = m.stats;
    const [amount, setAmount] = useState(1);
    const canDmg = w.canUpdate('persos', 'degats');
    const canChance = w.canUpdate('persos', 'chance');
    const canDet = w.canUpdate('persos', 'determination');

    const setDamage = v => run(() => w.update('persos', m.record, {degats: clamp(v, 0, Math.max(0, s.blessuresMax))}));
    const setChance = v => run(() => w.update('persos', m.record, {chance: clamp(v, 0, s.destin)}));
    const setDet = v => run(() => w.update('persos', m.record, {determination: clamp(v, 0, s.resilience)}));
    const n = Math.max(0, Math.floor(Number(amount) || 0));
    const low = s.blessures <= s.be;

    return (
        <div className="flex flex-wrap items-stretch gap-2">
            <div className="flex items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--card)] px-3 py-1.5">
                <div className="text-center">
                    <div className="text-[11px] uppercase tracking-wide text-[var(--muted)]">Blessures</div>
                    <div className={`tabular font-sheet text-2xl font-bold ${low ? 'text-[var(--accent)]' : ''}`}>
                        {s.blessures}
                        <span className="text-base text-[var(--muted)]"> / {s.blessuresMax}</span>
                    </div>
                </div>
                <input
                    type="number"
                    min={0}
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className={`${inputCls} tabular w-14 text-center`}
                    aria-label="Montant"
                />
                <div className="flex flex-col gap-1">
                    <Btn small variant="primary" disabled={!canDmg || !n} onClick={() => setDamage(s.degats + n)}>
                        − Dégâts
                    </Btn>
                    <Btn small disabled={!canDmg || !n || !s.degats} onClick={() => setDamage(s.degats - n)}>
                        + Soin
                    </Btn>
                </div>
                <Btn small disabled={!canDmg || !s.degats} onClick={() => setDamage(0)} title="Remettre les Blessures au maximum">
                    Soin complet
                </Btn>
            </div>

            <div className="flex items-center gap-3 rounded-md border border-[var(--line)] bg-[var(--card)] px-3 py-1.5">
                <div className="text-center">
                    <div className="text-[11px] uppercase tracking-wide text-[var(--muted)]">Chance</div>
                    <Stepper
                        disabled={!canChance}
                        onDec={s.chance > 0 ? () => setChance(s.chance - 1) : null}
                        onInc={s.chance < s.destin ? () => setChance(s.chance + 1) : null}
                        decTitle="Dépenser un point de Chance"
                    >
                        {s.chance}/{s.destin}
                    </Stepper>
                </div>
                <div className="text-center">
                    <div className="text-[11px] uppercase tracking-wide text-[var(--muted)]">Détermination</div>
                    <Stepper
                        disabled={!canDet}
                        onDec={s.determination > 0 ? () => setDet(s.determination - 1) : null}
                        onInc={s.determination < s.resilience ? () => setDet(s.determination + 1) : null}
                        decTitle="Dépenser un point de Détermination"
                    >
                        {s.determination}/{s.resilience}
                    </Stepper>
                </div>
                <Btn
                    small
                    disabled={!canChance || s.chance === s.destin}
                    onClick={() => setChance(s.destin)}
                    title="Nouvelle session : la Chance revient à la valeur de Destin"
                >
                    Nouvelle session
                </Btn>
            </div>

            <div className="flex items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--card)] px-3 py-1.5">
                <div className="text-center">
                    <div className="text-[11px] uppercase tracking-wide text-[var(--muted)]">XP disponibles</div>
                    <div className="tabular font-sheet text-2xl font-bold">{s.xpActuelle}</div>
                </div>
                <div className="flex flex-col gap-1">
                    <Btn small variant="primary" disabled={!w.canCreate('xp')} onClick={() => onDialog('advance')}>
                        Acheter une augmentation
                    </Btn>
                    <Btn small disabled={!w.canCreate('xp')} onClick={() => onDialog('gainXp')}>
                        Gagner de l&apos;XP
                    </Btn>
                </div>
            </div>
        </div>
    );
}

// ---------- Buy an advance ----------

const XP_TYPE = {carac: 'Caractéristique', skill: 'Compétence', talent: 'Talent'};

function useAdvanceOptions(kind) {
    const {m, records, fields} = useSheet();
    return useMemo(() => {
        if (kind === 'carac') {
            return CHARS.map(c => {
                const ch = m.chars.find(x => x.key === c.key);
                return {value: `carac:${c.key}`, label: `${c.key} — ${c.label} (${ch.courante}, Aug ${ch.aug})`, augAvant: ch.aug, name: c.key};
            });
        }
        if (kind === 'skill') {
            const own = m.skills.map(s => ({value: `own:${s.id}`, label: `${s.label} (Aug ${s.aug})`, augAvant: s.aug, name: s.label}));
            const ownedCatalog = new Set(m.skills.map(s => s.catalogId));
            const fresh = records.skillCatalog
                .filter(r => val(r, fields.skillCatalog.groupee) || !ownedCatalog.has(r.id))
                .map(r => ({
                    value: `new:${r.id}`,
                    label: `Nouvelle : ${r.name}`,
                    augAvant: 0,
                    name: r.name,
                    needsSpec: val(r, fields.skillCatalog.groupee) === true,
                }))
                .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
            return [...own, ...fresh];
        }
        const own = m.talents.map(t => ({value: `own:${t.id}`, label: `${t.label} (rang ${t.nbre})`, augAvant: t.nbre, name: t.label}));
        const fresh = records.talentCatalog
            .map(r => ({value: `new:${r.id}`, label: `Nouveau : ${r.name}`, augAvant: 0, name: r.name, needsSpec: true}))
            .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
        return [...own, ...fresh];
    }, [kind, m, records, fields]);
}

export function AdvanceDialog({onClose}) {
    const {m, w, run, records, fields} = useSheet();
    const [kind, setKind] = useState('carac');
    const options = useAdvanceOptions(kind);
    const [choice, setChoice] = useState('');
    const [spec, setSpec] = useState('');
    const [count, setCount] = useState(1);
    // The draft is a real Journal XP row, created so Airtable computes Coût suggéré.
    const [draft, setDraft] = useState(null);
    const [override, setOverride] = useState('');
    const [force, setForce] = useState(false);
    const [busy, setBusy] = useState(false);

    const option = options.find(o => o.value === choice) ?? options[0];
    const n = Math.max(1, Math.floor(Number(count) || 1));

    const draftRecord = draft ? records.xp.find(r => r.id === draft.xpId) : null;
    const suggested = draftRecord ? numOrNull(draftRecord, fields.xp.coutSuggere) : null;
    const enCarriere = draftRecord ? num(draftRecord, fields.xp.enCarriere) === 1 : null;
    const cost = override.trim() !== '' ? Number(override) : suggested;
    const after = draft && cost !== null ? draft.xpBefore - cost : null;
    const overBudget = after !== null && after < 0;

    const discardDraft = async d => {
        await w.remove('xp', d.xpId);
        if (d.junctionId) await w.remove(d.kind === 'skill' ? 'skills' : 'talents', d.junctionId);
    };

    const close = async () => {
        if (draft) await run(() => discardDraft(draft));
        onClose();
    };

    const prepare = async () => {
        if (!option) return;
        setBusy(true);
        let junctionId = null;
        await run(async () => {
            const perso = [{id: m.id}];
            let label = option.name;
            let targetId = option.value.split(':')[1];
            if (option.value.startsWith('new:')) {
                label = spec.trim() ? `${option.name} (${spec.trim()})` : option.name;
                const specValue = spec.trim() ? {spec: spec.trim()} : {};
                junctionId =
                    kind === 'skill'
                        ? await w.create('skills', {label, perso, competence: [{id: targetId}], ...specValue, aug: 0})
                        : await w.create('talents', {label, perso, talent: [{id: targetId}], ...specValue, nbre: 0});
                targetId = junctionId;
            }
            const target =
                kind === 'carac' ? {carac: {name: targetId}} : kind === 'skill' ? {skill: [{id: targetId}]} : {talent: [{id: targetId}]};
            try {
                const xpId = await w.create('xp', {
                    label: `${label} +${n}`,
                    perso,
                    date: today(),
                    type: {name: XP_TYPE[kind]},
                    augAvant: option.augAvant,
                    nb: n,
                    ...target,
                });
                setDraft({xpId, junctionId, kind, targetId, augAvant: option.augAvant, label, xpBefore: m.stats.xpActuelle});
            } catch (e) {
                if (junctionId) await w.remove(kind === 'skill' ? 'skills' : 'talents', junctionId).catch(() => {});
                throw e;
            }
        });
        setBusy(false);
    };

    const back = async () => {
        setBusy(true);
        await run(() => discardDraft(draft));
        setDraft(null);
        setOverride('');
        setForce(false);
        setBusy(false);
    };

    const confirm = async () => {
        setBusy(true);
        const ok = await run(async () => {
            if (override.trim() !== '') await w.update('xp', draftRecord, {cout: Number(override)});
            const newValue = draft.augAvant + n;
            if (draft.kind === 'carac') {
                await w.update('persos', m.record, {[`aug_${draft.targetId}`]: newValue});
            } else if (draft.kind === 'skill') {
                const rec = records.skills.find(r => r.id === draft.targetId);
                await w.update('skills', rec, {aug: newValue});
            } else {
                const rec = records.talents.find(r => r.id === draft.targetId);
                await w.update('talents', rec, {nbre: newValue});
            }
            return true;
        });
        setBusy(false);
        if (ok) onClose();
    };

    const footer = draft ? (
        <>
            <Btn onClick={back} disabled={busy}>
                Modifier
            </Btn>
            <Btn variant="primary" onClick={confirm} disabled={busy || cost === null || (overBudget && !force)}>
                Confirmer l&apos;achat
            </Btn>
        </>
    ) : (
        <>
            <Btn onClick={close} disabled={busy}>
                Annuler
            </Btn>
            <Btn variant="primary" onClick={prepare} disabled={busy || !option}>
                Calculer le coût
            </Btn>
        </>
    );

    return (
        <Modal title="Acheter une augmentation" onClose={close} footer={footer}>
            {!draft ? (
                <>
                    <div className="flex gap-1">
                        {Object.entries(XP_TYPE).map(([k, label]) => (
                            <Btn
                                key={k}
                                small
                                variant={kind === k ? 'primary' : 'ghost'}
                                onClick={() => {
                                    setKind(k);
                                    setChoice('');
                                    setSpec('');
                                }}
                            >
                                {label}
                            </Btn>
                        ))}
                    </div>
                    <Label text={XP_TYPE[kind]}>
                        <select className={inputCls} value={option?.value ?? ''} onChange={e => setChoice(e.target.value)}>
                            {options.map(o => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </Label>
                    {option?.needsSpec && (
                        <Label text="Spécialisation (facultatif)">
                            <input className={inputCls} value={spec} onChange={e => setSpec(e.target.value)} placeholder="ex. halfling, Reikland…" />
                        </Label>
                    )}
                    <Label text={kind === 'talent' ? 'Rangs à acheter' : "Nombre d'augmentations"}>
                        <input type="number" min={1} className={`${inputCls} w-24`} value={count} onChange={e => setCount(e.target.value)} />
                    </Label>
                    <p className="text-xs text-[var(--muted)]">
                        Aug avant : <strong>{option?.augAvant ?? 0}</strong> → après : <strong>{(option?.augAvant ?? 0) + n}</strong>. Le coût est
                        calculé par Airtable à l&apos;étape suivante.
                    </p>
                </>
            ) : (
                <>
                    <p>
                        <strong>{draft.label}</strong> : {draft.augAvant} → {draft.augAvant + n}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="rounded border border-[var(--line)] p-2 text-center">
                            <div className="text-[11px] uppercase text-[var(--muted)]">Coût suggéré</div>
                            <div className="tabular font-sheet text-xl font-bold">{suggested ?? '…'}</div>
                            {enCarriere !== null && suggested !== null && (
                                <div className="text-[11px] text-[var(--muted)]">{enCarriere ? 'en carrière' : 'hors carrière ×2'}</div>
                            )}
                        </div>
                        <div className="rounded border border-[var(--line)] p-2 text-center">
                            <div className="text-[11px] uppercase text-[var(--muted)]">XP avant</div>
                            <div className="tabular font-sheet text-xl font-bold">{draft.xpBefore}</div>
                        </div>
                        <div className="rounded border border-[var(--line)] p-2 text-center">
                            <div className="text-[11px] uppercase text-[var(--muted)]">XP après</div>
                            <div className={`tabular font-sheet text-xl font-bold ${overBudget ? 'text-[var(--accent)]' : ''}`}>{after ?? '…'}</div>
                        </div>
                    </div>
                    <Label text="Coût XP réel (facultatif, remplace le coût suggéré)">
                        <input
                            type="number"
                            min={0}
                            className={`${inputCls} w-28`}
                            value={override}
                            onChange={e => setOverride(e.target.value)}
                            placeholder={suggested === null ? '' : String(suggested)}
                        />
                    </Label>
                    {overBudget && (
                        <label className="flex items-center gap-2 text-[var(--accent)]">
                            <input type="checkbox" checked={force} onChange={e => setForce(e.target.checked)} />
                            Pas assez d&apos;XP. Acheter quand même ?
                        </label>
                    )}
                </>
            )}
        </Modal>
    );
}

// ---------- Small forms ----------

export function GainXpDialog({onClose}) {
    const {m, w, run} = useSheet();
    const [amount, setAmount] = useState('');
    const [label, setLabel] = useState('Session');
    const n = Math.floor(Number(amount) || 0);
    const save = async () => {
        const ok = await run(async () => {
            await w.create('xp', {label: label.trim() || 'Gain', perso: [{id: m.id}], date: today(), type: {name: 'Gain'}, gain: n});
            return true;
        });
        if (ok) onClose();
    };
    return (
        <Modal
            title="Gagner de l'XP"
            onClose={onClose}
            footer={
                <Btn variant="primary" onClick={save} disabled={n <= 0}>
                    Ajouter {n > 0 ? `${n} XP` : ''}
                </Btn>
            }
        >
            <Label text="XP gagnés">
                <input type="number" min={1} autoFocus className={`${inputCls} w-28`} value={amount} onChange={e => setAmount(e.target.value)} />
            </Label>
            <Label text="Libellé">
                <input className={inputCls} value={label} onChange={e => setLabel(e.target.value)} />
            </Label>
        </Modal>
    );
}

export function MoneyDialog({onClose}) {
    const {m, w, run} = useSheet();
    const [sign, setSign] = useState(-1);
    const [label, setLabel] = useState('');
    const [amounts, setAmounts] = useState({co: '', pa: '', sc: ''});
    const parsed = Object.fromEntries(Object.entries(amounts).map(([k, v]) => [k, Math.abs(Math.floor(Number(v) || 0))]));
    const any = parsed.co || parsed.pa || parsed.sc;
    const save = async () => {
        const values = {};
        for (const k of ['co', 'pa', 'sc']) if (parsed[k]) values[k] = sign * parsed[k];
        const ok = await run(async () => {
            await w.create('money', {label: label.trim() || (sign > 0 ? 'Gain' : 'Dépense'), perso: [{id: m.id}], date: today(), ...values});
            return true;
        });
        if (ok) onClose();
    };
    return (
        <Modal
            title="Mouvement d'argent"
            onClose={onClose}
            footer={
                <Btn variant="primary" onClick={save} disabled={!any}>
                    Enregistrer
                </Btn>
            }
        >
            <div className="flex gap-1">
                <Btn small variant={sign < 0 ? 'primary' : 'ghost'} onClick={() => setSign(-1)}>
                    Dépense
                </Btn>
                <Btn small variant={sign > 0 ? 'primary' : 'ghost'} onClick={() => setSign(1)}>
                    Gain
                </Btn>
            </div>
            <Label text="Libellé">
                <input className={inputCls} value={label} onChange={e => setLabel(e.target.value)} placeholder="ex. Chambre à l'auberge" autoFocus />
            </Label>
            <div className="grid grid-cols-3 gap-2">
                {[
                    ['co', 'CO'],
                    ['pa', 'pa'],
                    ['sc', 'sc'],
                ].map(([k, l]) => (
                    <Label key={k} text={l}>
                        <input type="number" min={0} className={inputCls} value={amounts[k]} onChange={e => setAmounts({...amounts, [k]: e.target.value})} />
                    </Label>
                ))}
            </div>
            <p className="text-xs text-[var(--muted)]">
                Bourse actuelle : {m.stats.co} CO {m.stats.pa} pa {m.stats.sc} sc. 1 CO = 20 pa = 240 sc.
            </p>
        </Modal>
    );
}

// Catalog picker with a free-text fallback, shared by items and conditions.
function CatalogOrText({catalog, groupBy, value, onChange, text, onText, placeholder}) {
    const groups = useMemo(() => {
        const map = new Map();
        for (const r of catalog) {
            const g = groupBy ? groupBy(r) || 'Autre' : '';
            if (!map.has(g)) map.set(g, []);
            map.get(g).push(r);
        }
        for (const list of map.values()) list.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
        return [...map.entries()];
    }, [catalog, groupBy]);
    return (
        <>
            <Label text="Catalogue">
                <select className={inputCls} value={value} onChange={e => onChange(e.target.value)}>
                    <option value="">— saisie libre —</option>
                    {groups.map(([g, list]) =>
                        g ? (
                            <optgroup key={g} label={g}>
                                {list.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.name}
                                    </option>
                                ))}
                            </optgroup>
                        ) : (
                            list.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))
                        ),
                    )}
                </select>
            </Label>
            {!value && (
                <Label text="Nom">
                    <input className={inputCls} value={text} onChange={e => onText(e.target.value)} placeholder={placeholder} />
                </Label>
            )}
            {catalog.length === 0 && <p className="text-xs text-[var(--muted)]">Le catalogue est vide : saisissez un nom.</p>}
        </>
    );
}

export function AddItemDialog({onClose}) {
    const {m, w, run, records, fields} = useSheet();
    const [objet, setObjet] = useState('');
    const [text, setText] = useState('');
    const [qte, setQte] = useState(1);
    const groupBy = useMemo(() => r => str(r, fields.equipment.type), [fields]);
    const selected = records.equipment.find(r => r.id === objet);
    const label = selected ? selected.name : text.trim();
    const save = async () => {
        const q = Math.max(1, Math.floor(Number(qte) || 1));
        const ok = await run(async () => {
            await w.create('inventory', {
                label,
                perso: [{id: m.id}],
                ...(selected ? {objet: [{id: selected.id}]} : {}),
                ...(q !== 1 ? {qte: q} : {}),
            });
            return true;
        });
        if (ok) onClose();
    };
    return (
        <Modal
            title="Ajouter un objet"
            onClose={onClose}
            footer={
                <Btn variant="primary" onClick={save} disabled={!label}>
                    Ajouter
                </Btn>
            }
        >
            <CatalogOrText
                catalog={records.equipment}
                groupBy={groupBy}
                value={objet}
                onChange={setObjet}
                text={text}
                onText={setText}
                placeholder="ex. Corde (10 m)"
            />
            <Label text="Quantité">
                <input type="number" min={1} className={`${inputCls} w-24`} value={qte} onChange={e => setQte(e.target.value)} />
            </Label>
            {!selected && <p className="text-xs text-[var(--muted)]">Un objet libre compte comme possession, sans Enc ni PA.</p>}
        </Modal>
    );
}

export function AddConditionDialog({onClose}) {
    const {m, w, run, records} = useSheet();
    const [etat, setEtat] = useState('');
    const [text, setText] = useState('');
    const [niveau, setNiveau] = useState(1);
    const selected = records.conditionCatalog.find(r => r.id === etat);
    const label = selected ? selected.name : text.trim();
    const save = async () => {
        const ok = await run(async () => {
            await w.create('conditions', {
                label,
                perso: [{id: m.id}],
                ...(selected ? {etat: [{id: selected.id}]} : {}),
                niveau: Math.max(1, Math.floor(Number(niveau) || 1)),
            });
            return true;
        });
        if (ok) onClose();
    };
    return (
        <Modal
            title="Ajouter un état"
            onClose={onClose}
            footer={
                <Btn variant="primary" onClick={save} disabled={!label}>
                    Ajouter
                </Btn>
            }
        >
            <CatalogOrText catalog={records.conditionCatalog} value={etat} onChange={setEtat} text={text} onText={setText} placeholder="ex. Hémorragie" />
            <Label text="Niveau">
                <input type="number" min={1} className={`${inputCls} w-24`} value={niveau} onChange={e => setNiveau(e.target.value)} />
            </Label>
        </Modal>
    );
}

export function AddCritDialog({onClose}) {
    const {m, w, run, fields} = useSheet();
    const choices = fields.crits.loc?.options?.choices?.map(c => c.name) ?? [];
    const [label, setLabel] = useState('');
    const [loc, setLoc] = useState('');
    const [effets, setEffets] = useState('');
    const save = async () => {
        const ok = await run(async () => {
            await w.create('crits', {
                label: label.trim(),
                perso: [{id: m.id}],
                date: today(),
                ...(loc ? {loc: {name: loc}} : {}),
                ...(effets.trim() ? {effets: effets.trim()} : {}),
            });
            return true;
        });
        if (ok) onClose();
    };
    return (
        <Modal
            title="Blessure critique"
            onClose={onClose}
            footer={
                <Btn variant="primary" onClick={save} disabled={!label.trim()}>
                    Ajouter
                </Btn>
            }
        >
            <Label text="Nom">
                <input className={inputCls} value={label} onChange={e => setLabel(e.target.value)} autoFocus placeholder="ex. Oreille arrachée" />
            </Label>
            <Label text="Localisation">
                <select className={inputCls} value={loc} onChange={e => setLoc(e.target.value)}>
                    <option value="">—</option>
                    {choices.map(c => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </Label>
            <Label text="Effets">
                <textarea className={`${inputCls} h-20 py-1`} value={effets} onChange={e => setEffets(e.target.value)} />
            </Label>
        </Modal>
    );
}

export function AddSpellDialog({onClose}) {
    const {m, w, run, records, fields} = useSheet();
    const linked = links(m.record, fields.persos.sorts);
    const available = records.spells.filter(r => !linked.some(l => l.id === r.id)).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    const [id, setId] = useState('');
    const save = async () => {
        const ok = await run(async () => {
            await w.update('persos', m.record, {sorts: [...linked.map(l => ({id: l.id})), {id}]});
            return true;
        });
        if (ok) onClose();
    };
    return (
        <Modal
            title="Ajouter un sort ou une prière"
            onClose={onClose}
            footer={
                <Btn variant="primary" onClick={save} disabled={!id}>
                    Ajouter
                </Btn>
            }
        >
            {available.length ? (
                <Label text="Catalogue">
                    <select className={inputCls} value={id} onChange={e => setId(e.target.value)}>
                        <option value="">—</option>
                        {available.map(r => (
                            <option key={r.id} value={r.id}>
                                {r.name} {str(r, fields.spells.type) && `(${str(r, fields.spells.type)})`}
                            </option>
                        ))}
                    </select>
                </Label>
            ) : (
                <p className="text-[var(--muted)]">Aucun sort disponible : ajoutez-en d&apos;abord dans la table Sorts et Prières.</p>
            )}
        </Modal>
    );
}
