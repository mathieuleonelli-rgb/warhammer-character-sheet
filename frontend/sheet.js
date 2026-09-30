import {useSheet} from './context';
import {LOCATIONS} from './data';
import {Btn, Card, ConfirmBtn, Empty, InlineNumber, InlineText, Pills, RecordLink, Stat, Stepper, Td, Th} from './ui';

// Inline-editable text field on the character record.
function PersoText({field, multiline, className}) {
    const {m, w, run} = useSheet();
    const canEdit = w.canUpdate('persos', field);
    return (
        <InlineText
            value={m.text[field]}
            multiline={multiline}
            className={className}
            onSave={canEdit ? v => run(() => w.update('persos', m.record, {[field]: v || null})) : null}
        />
    );
}

function Info({label, children}) {
    return (
        <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wide text-[var(--muted)]">{label}</div>
            <div className="min-h-[1.5rem] font-sheet text-[15px]">{children}</div>
        </div>
    );
}

// ---------- Page 1 ----------

export function PageOne() {
    const {m, open} = useSheet();
    return (
        <div className="space-y-3">
            <Card title="Personnage">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4 lg:grid-cols-6">
                    <Info label="Race">
                        <Pills items={m.race} />
                    </Info>
                    <Info label="Classe">{m.classe || '—'}</Info>
                    <Info label="Carrière">{m.carriere || '—'}</Info>
                    <Info label="Niveau de carrière">
                        <Pills items={m.niveau} openFor={null} />
                    </Info>
                    <Info label="Statut">{m.statut || '—'}</Info>
                    <Info label="Joueur">
                        <PersoText field="joueur" />
                    </Info>
                    <Info label="Âge">
                        <PersoText field="age" />
                    </Info>
                    <Info label="Taille">
                        <PersoText field="taille" />
                    </Info>
                    <Info label="Cheveux">
                        <PersoText field="cheveux" />
                    </Info>
                    <Info label="Yeux">
                        <PersoText field="yeux" />
                    </Info>
                </div>
            </Card>

            <Characteristics />

            <div className="grid gap-3 md:grid-cols-3">
                <Card title="Destin & Résilience">
                    <div className="grid grid-cols-2 gap-2">
                        <Stat label="Destin" value={m.stats.destin} />
                        <Stat label="Chance" value={m.stats.chance} />
                        <Stat label="Résilience" value={m.stats.resilience} />
                        <Stat label="Détermination" value={m.stats.determination} />
                    </div>
                    <div className="mt-2">
                        <Info label="Motivation">
                            <PersoText field="motivation" />
                        </Info>
                    </div>
                </Card>
                <Card title="Expérience">
                    <div className="grid grid-cols-3 gap-2">
                        <Stat label="Actuelle" value={m.stats.xpActuelle} big />
                        <Stat label="Dépensée" value={m.stats.xpDepensee} />
                        <Stat label="Totale" value={m.stats.xpTotale} />
                    </div>
                </Card>
                <Card title="Mouvement">
                    <div className="grid grid-cols-3 gap-2">
                        <Stat label="Mouvement" value={m.stats.mouvement} big />
                        <Stat label="Marche" value={m.stats.marche} />
                        <Stat label="Course" value={m.stats.course} />
                    </div>
                </Card>
            </div>

            <div className="grid gap-3 lg:grid-cols-5">
                <Card title="Compétences de base" className="lg:col-span-3">
                    <div className="grid gap-x-4 md:grid-cols-2">
                        <SkillTable skills={m.basicSkills.slice(0, Math.ceil(m.basicSkills.length / 2))} open={open} />
                        <SkillTable skills={m.basicSkills.slice(Math.ceil(m.basicSkills.length / 2))} open={open} />
                    </div>
                </Card>
                <Card title="Compétences groupées & avancées" className="lg:col-span-2">
                    {m.otherSkills.length ? <SkillTable skills={m.otherSkills} open={open} /> : <Empty>Aucune.</Empty>}
                </Card>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
                <Card title="Talents">
                    {m.talents.length ? (
                        <table className="w-full text-sm">
                            <thead>
                                <tr>
                                    <Th>Talent</Th>
                                    <Th className="text-center">Pris</Th>
                                    <Th>Max</Th>
                                    <Th>Tests</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {m.talents.map(t => (
                                    <tr key={t.id}>
                                        <Td>
                                            <RecordLink label={t.label} onOpen={open('talents', t.id)} />
                                            {t.enCarriere && <CareerMark />}
                                        </Td>
                                        <Td className="tabular text-center">{t.nbre}</Td>
                                        <Td className="text-[var(--muted)]">{t.max}</Td>
                                        <Td className="text-[var(--muted)]">{t.tests}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <Empty>Aucun talent.</Empty>
                    )}
                </Card>
                <Card title="Ambitions & groupe">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Info label="Ambition à court terme">
                                <PersoText field="ambCourt" multiline />
                            </Info>
                            <Info label="Ambition à long terme">
                                <PersoText field="ambLong" multiline />
                            </Info>
                        </div>
                        <div className="space-y-2">
                            <Info label="Groupe">
                                {m.group ? <RecordLink label={m.group.name} onOpen={open('groups', m.group.id)} /> : '—'}
                            </Info>
                            {m.group && (
                                <>
                                    <Info label="Ambition du groupe (court terme)">
                                        <span className="whitespace-pre-wrap">{m.group.ambCourt || '—'}</span>
                                    </Info>
                                    <Info label="Ambition du groupe (long terme)">
                                        <span className="whitespace-pre-wrap">{m.group.ambLong || '—'}</span>
                                    </Info>
                                </>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

const CareerMark = () => (
    <span className="ml-1 text-[var(--accent)]" title="En carrière">
        ★
    </span>
);

function Characteristics() {
    const {m, w, run} = useSheet();
    return (
        <Card title="Caractéristiques">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                    <thead>
                        <tr>
                            <Th />
                            {m.chars.map(c => (
                                <Th key={c.key} className="text-center">
                                    <span title={c.label}>{c.key}</span>
                                </Th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <Td className="text-xs text-[var(--muted)]">Initiale</Td>
                            {m.chars.map(c => {
                                const key = `ini_${c.key}`;
                                const canEdit = w.canUpdate('persos', key);
                                return (
                                    <Td key={c.key} className="text-center">
                                        <InlineNumber
                                            value={c.initiale}
                                            onSave={canEdit ? v => run(() => w.update('persos', m.record, {[key]: v})) : null}
                                        />
                                    </Td>
                                );
                            })}
                        </tr>
                        <tr>
                            <Td className="text-xs text-[var(--muted)]">Aug</Td>
                            {m.chars.map(c => (
                                <Td key={c.key} className="tabular text-center">
                                    {c.aug || ''}
                                </Td>
                            ))}
                        </tr>
                        <tr>
                            <Td className="text-xs font-semibold">Courante</Td>
                            {m.chars.map(c => (
                                <Td key={c.key} className="tabular text-center font-sheet text-lg font-bold">
                                    {c.courante}
                                </Td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">
                BF {m.stats.bf} · BE {m.stats.be} · BFM {m.stats.bfm}. Les augmentations s&apos;achètent avec l&apos;XP.
            </p>
        </Card>
    );
}

function SkillTable({skills, open}) {
    return (
        <table className="w-full text-sm">
            <thead>
                <tr>
                    <Th>Compétence</Th>
                    <Th className="text-center">Car.</Th>
                    <Th className="text-center">Aug</Th>
                    <Th className="text-center">Comp</Th>
                </tr>
            </thead>
            <tbody>
                {skills.map(s => (
                    <tr key={s.id}>
                        <Td>
                            <RecordLink label={s.label} onOpen={open('skills', s.id)} />
                            {s.enCarriere && <CareerMark />}
                        </Td>
                        <Td className="tabular text-center text-[var(--muted)]">
                            <span title={s.carac}>{s.valeurCarac ?? s.carac}</span>
                        </Td>
                        <Td className="tabular text-center">{s.aug || ''}</Td>
                        <Td className="tabular text-center font-bold">{s.comp ?? '—'}</Td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

// ---------- Page 2 ----------

function EquipToggle({item}) {
    const {w, run} = useSheet();
    return (
        <input
            type="checkbox"
            checked={item.equipe}
            disabled={!w.canUpdate('inventory', 'equipe')}
            onChange={e => run(() => w.update('inventory', item.record, {equipe: e.target.checked}))}
            className="accent-[var(--accent)]"
            aria-label="Équipé"
        />
    );
}

function RemoveItem({item, tableKey = 'inventory'}) {
    const {w, run} = useSheet();
    return <ConfirmBtn onConfirm={() => run(() => w.remove(tableKey, item.record))} />;
}

export function PageTwo({onDialog}) {
    const {m, w, run, open} = useSheet();
    const s = m.stats;
    const canInv = w.canCreate('inventory');
    const addItem = (
        <Btn small onClick={() => onDialog('item')} disabled={!canInv}>
            + Objet
        </Btn>
    );
    const qty = item => (
        <Stepper
            disabled={!w.canUpdate('inventory', 'qte')}
            onDec={item.qte > 1 ? () => run(() => w.update('inventory', item.record, {qte: item.qte - 1})) : null}
            onInc={() => run(() => w.update('inventory', item.record, {qte: item.qte + 1}))}
            value={item.qte}
        />
    );
    const stepPerso = (field, v) => run(() => w.update('persos', m.record, {[field]: Math.max(0, v)}));

    return (
        <div className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-2">
                <Card title="Armure" actions={addItem}>
                    <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-7">
                        {LOCATIONS.map(l => (
                            <Stat key={l.name} label={l.name} value={s[l.pa]} sub={l.range} />
                        ))}
                        <Stat label="Bouclier" value={s.paBouclier} />
                    </div>
                    {m.armour.length ? (
                        <table className="w-full text-sm">
                            <thead>
                                <tr>
                                    <Th>Armure</Th>
                                    <Th>Localisations</Th>
                                    <Th className="text-center">PA</Th>
                                    <Th className="text-center">Enc</Th>
                                    <Th className="text-center">Équipée</Th>
                                    <Th />
                                </tr>
                            </thead>
                            <tbody>
                                {m.armour.map(a => (
                                    <tr key={a.id} className={a.equipe ? '' : 'opacity-60'}>
                                        <Td>
                                            <RecordLink label={a.label} onOpen={open('inventory', a.id)} />
                                        </Td>
                                        <Td className="text-xs text-[var(--muted)]">{a.locs}</Td>
                                        <Td className="tabular text-center">{a.pa ?? ''}</Td>
                                        <Td className="tabular text-center">{a.encTotal}</Td>
                                        <Td className="text-center">
                                            <EquipToggle item={a} />
                                        </Td>
                                        <Td className="text-right">
                                            <RemoveItem item={a} />
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <Empty>Aucune armure. Les PA ne comptent que pour les pièces portées.</Empty>
                    )}
                </Card>

                <Card title="Armes" actions={addItem}>
                    {m.weapons.length ? (
                        <table className="w-full text-sm">
                            <thead>
                                <tr>
                                    <Th>Arme</Th>
                                    <Th>Groupe</Th>
                                    <Th>Portée</Th>
                                    <Th className="text-center">Dégâts</Th>
                                    <Th className="text-center">Enc</Th>
                                    <Th className="text-center">En main</Th>
                                    <Th />
                                </tr>
                            </thead>
                            <tbody>
                                {m.weapons.map(a => (
                                    <tr key={a.id}>
                                        <Td>
                                            <RecordLink label={a.label} onOpen={open('inventory', a.id)} />
                                            {a.atouts && <div className="text-xs text-[var(--muted)]">{a.atouts}</div>}
                                        </Td>
                                        <Td className="text-[var(--muted)]">{a.groupe}</Td>
                                        <Td className="text-[var(--muted)]">{a.portee}</Td>
                                        <Td className="tabular text-center font-bold">{a.degats}</Td>
                                        <Td className="tabular text-center">{a.encTotal}</Td>
                                        <Td className="text-center">
                                            <EquipToggle item={a} />
                                        </Td>
                                        <Td className="text-right">
                                            <RemoveItem item={a} />
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <Empty>Aucune arme.</Empty>
                    )}
                </Card>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
                <Card title="Possessions" actions={addItem} className="lg:col-span-2">
                    {m.possessions.length ? (
                        <table className="w-full text-sm">
                            <thead>
                                <tr>
                                    <Th>Objet</Th>
                                    <Th className="text-center">Qté</Th>
                                    <Th className="text-center">Enc</Th>
                                    <Th />
                                </tr>
                            </thead>
                            <tbody>
                                {m.possessions.map(p => (
                                    <tr key={p.id}>
                                        <Td>
                                            <RecordLink label={p.label} onOpen={open('inventory', p.id)} />
                                        </Td>
                                        <Td className="text-center">{qty(p)}</Td>
                                        <Td className="tabular text-center">{p.encTotal}</Td>
                                        <Td className="text-right">
                                            <RemoveItem item={p} />
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <Empty>Aucune possession.</Empty>
                    )}
                </Card>
                <Card title="Encombrement">
                    <div className="grid grid-cols-3 gap-2">
                        <Stat label="Armes" value={s.encArmes} />
                        <Stat label="Armures" value={s.encArmures} />
                        <Stat label="Possessions" value={s.encPossessions} />
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <Stat label="Total" value={`${s.encTotal} / ${s.encMax}`} big />
                        <Stat label="Surcharge" value={s.surcharge} big />
                    </div>
                    {s.surcharge > 0 && <p className="mt-2 text-sm font-semibold text-[var(--accent)]">Surchargé de {s.surcharge}.</p>}
                </Card>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
                <Card title="Blessures">
                    <div className="grid grid-cols-2 gap-2">
                        <Stat label="Actuelles" value={s.blessures} big />
                        <Stat label="Max" value={s.blessuresMax} big />
                    </div>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                        BF {s.bf} + 2×BE {s.be} + BFM {s.bfm} (règles de race et Dur à cuire incluses). Dégâts subis : {s.degats}.
                    </p>
                </Card>
                <Card
                    title="Blessures critiques"
                    actions={
                        <Btn small onClick={() => onDialog('crit')} disabled={!w.canCreate('crits')}>
                            + Critique
                        </Btn>
                    }
                >
                    {m.crits.length ? (
                        <ul className="space-y-1.5 text-sm">
                            {m.crits.map(c => (
                                <li key={c.id} className={`flex items-start gap-2 ${c.guerie ? 'opacity-50' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={c.guerie}
                                        title="Guérie"
                                        disabled={!w.canUpdate('crits', 'guerie')}
                                        onChange={e => run(() => w.update('crits', c.record, {guerie: e.target.checked}))}
                                        className="mt-1 accent-[var(--accent)]"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <RecordLink label={c.label} onOpen={open('crits', c.id)} className={c.guerie ? 'line-through' : 'font-semibold'} />
                                        {c.loc && <span className="ml-1 text-xs text-[var(--muted)]">· {c.loc}</span>}
                                        {c.effets && <div className="whitespace-pre-wrap text-xs text-[var(--muted)]">{c.effets}</div>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <Empty>Aucune.</Empty>
                    )}
                </Card>
                <Card
                    title="États"
                    actions={
                        <Btn small onClick={() => onDialog('condition')} disabled={!w.canCreate('conditions')}>
                            + État
                        </Btn>
                    }
                >
                    {m.conditions.length ? (
                        <ul className="space-y-1.5 text-sm">
                            {m.conditions.map(c => (
                                <li key={c.id} className="flex items-center gap-2">
                                    <RecordLink label={c.label} onOpen={open('conditions', c.id)} className="flex-1 font-semibold" />
                                    {c.cumulable && (
                                        <Stepper
                                            disabled={!w.canUpdate('conditions', 'niveau')}
                                            onDec={c.niveau > 1 ? () => run(() => w.update('conditions', c.record, {niveau: c.niveau - 1})) : null}
                                            onInc={() => run(() => w.update('conditions', c.record, {niveau: c.niveau + 1}))}
                                            value={c.niveau}
                                        />
                                    )}
                                    <ConfirmBtn title="Retirer l'état" onConfirm={() => run(() => w.remove('conditions', c.record))} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <Empty>Aucun état actif.</Empty>
                    )}
                </Card>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
                <Card title="Corruption">
                    <div className="flex flex-wrap items-center gap-4">
                        <div>
                            <div className="text-[11px] uppercase tracking-wide text-[var(--muted)]">Corruption</div>
                            <Stepper
                                disabled={!w.canUpdate('persos', 'corruption')}
                                onDec={s.corruption > 0 ? () => stepPerso('corruption', s.corruption - 1) : null}
                                onInc={() => stepPerso('corruption', s.corruption + 1)}
                                value={s.corruption}
                            />
                        </div>
                        <div>
                            <div className="text-[11px] uppercase tracking-wide text-[var(--muted)]">Péché</div>
                            <Stepper
                                disabled={!w.canUpdate('persos', 'peche')}
                                onDec={s.peche > 0 ? () => stepPerso('peche', s.peche - 1) : null}
                                onInc={() => stepPerso('peche', s.peche + 1)}
                                value={s.peche}
                            />
                        </div>
                    </div>
                    <div className="mt-3 space-y-2">
                        <Info label="Mutations">
                            <PersoText field="mutations" multiline />
                        </Info>
                        <Info label="Psychologie">
                            <PersoText field="psychologie" multiline />
                        </Info>
                    </div>
                </Card>
                <Card
                    title="Sorts & prières"
                    className="lg:col-span-2"
                    actions={
                        <Btn small onClick={() => onDialog('spell')} disabled={!w.canUpdate('persos', 'sorts')}>
                            + Sort
                        </Btn>
                    }
                >
                    {m.spells.length ? <SpellTable /> : <Empty>Aucun sort ni prière.</Empty>}
                </Card>
            </div>

            <Card
                title="Richesse"
                actions={
                    <Btn small onClick={() => onDialog('money')} disabled={!w.canCreate('money')}>
                        ± Argent
                    </Btn>
                }
            >
                <div className="grid max-w-md grid-cols-3 gap-2">
                    <Stat label="Couronnes d'or" value={s.co} big />
                    <Stat label="Pistoles d'argent" value={s.pa} big />
                    <Stat label="Sous de cuivre" value={s.sc} big />
                </div>
            </Card>
        </div>
    );
}

function SpellTable() {
    const {m, w, run, open, fields} = useSheet();
    const unlink = id =>
        run(() =>
            w.update('persos', m.record, {
                sorts: m.spells.filter(sp => sp.id !== id).map(sp => ({id: sp.id})),
            }),
        );
    return (
        <table className="w-full text-sm">
            <thead>
                <tr>
                    <Th>Nom</Th>
                    <Th>Type</Th>
                    <Th className="text-center">NI</Th>
                    <Th>Portée</Th>
                    <Th>Cible</Th>
                    <Th>Durée</Th>
                    <Th />
                </tr>
            </thead>
            <tbody>
                {m.spells.map(sp => (
                    <tr key={sp.id}>
                        <Td>
                            <RecordLink label={sp.label} onOpen={open('spells', sp.id)} />
                            {sp.domaine && <div className="text-xs text-[var(--muted)]">{sp.domaine}</div>}
                        </Td>
                        <Td className="text-[var(--muted)]">{sp.type}</Td>
                        <Td className="tabular text-center">{sp.ni ?? ''}</Td>
                        <Td>{sp.portee}</Td>
                        <Td>{sp.cible}</Td>
                        <Td>{sp.duree}</Td>
                        <Td className="text-right">
                            <ConfirmBtn title="Retirer du personnage" disabled={!fields.persos.sorts} onConfirm={() => unlink(sp.id)} />
                        </Td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

// ---------- Journals ----------

export function Journals() {
    const {m, open} = useSheet();
    const coins = r => [r.co && `${r.co} CO`, r.pa && `${r.pa} pa`, r.sc && `${r.sc} sc`].filter(Boolean).join(' ');
    return (
        <div className="grid gap-3 lg:grid-cols-2">
            <Card title="Journal XP">
                {m.xpLog.length ? (
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                <Th>Date</Th>
                                <Th>Libellé</Th>
                                <Th>Type</Th>
                                <Th className="text-right">XP</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {m.xpLog.map(r => (
                                <tr key={r.id}>
                                    <Td className="whitespace-nowrap text-[var(--muted)]">{r.date}</Td>
                                    <Td>
                                        <RecordLink label={r.label} onOpen={open('xp', r.id)} />
                                    </Td>
                                    <Td className="text-[var(--muted)]">{r.type}</Td>
                                    <Td className={`tabular text-right font-semibold ${r.gain ? 'text-[var(--good)]' : ''}`}>
                                        {r.gain ? `+${r.gain}` : r.depense ? `−${r.depense}` : ''}
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <Empty>Aucune entrée.</Empty>
                )}
            </Card>
            <Card title="Journal financier">
                {m.moneyLog.length ? (
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                <Th>Date</Th>
                                <Th>Libellé</Th>
                                <Th className="text-right">Montant</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {m.moneyLog.map(r => (
                                <tr key={r.id}>
                                    <Td className="whitespace-nowrap text-[var(--muted)]">{r.date}</Td>
                                    <Td>
                                        <RecordLink label={r.label} onOpen={open('money', r.id)} />
                                    </Td>
                                    <Td className={`tabular text-right font-semibold ${r.total > 0 ? 'text-[var(--good)]' : ''}`}>{coins(r)}</Td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <Empty>Aucun mouvement.</Empty>
                )}
            </Card>
        </div>
    );
}
