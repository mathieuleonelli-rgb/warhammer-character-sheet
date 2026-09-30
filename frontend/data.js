import {useMemo} from 'react';

// Characteristics in sheet order, with their French labels.
export const CHARS = [
    {key: 'CC', label: 'Capacité de Combat'},
    {key: 'CT', label: 'Capacité de Tir'},
    {key: 'F', label: 'Force'},
    {key: 'E', label: 'Endurance'},
    {key: 'I', label: 'Initiative'},
    {key: 'Ag', label: 'Agilité'},
    {key: 'Dex', label: 'Dextérité'},
    {key: 'Int', label: 'Intelligence'},
    {key: 'FM', label: 'Force Mentale'},
    {key: 'Soc', label: 'Sociabilité'},
];

// Hit locations on the d100 roll, with the Personnages PA field key for each.
export const LOCATIONS = [
    {name: 'Tête', range: '01–09', pa: 'paTete'},
    {name: 'Bras gauche', range: '10–24', pa: 'paBrasG'},
    {name: 'Bras droit', range: '25–44', pa: 'paBrasD'},
    {name: 'Corps', range: '45–79', pa: 'paCorps'},
    {name: 'Jambe gauche', range: '80–89', pa: 'paJambeG'},
    {name: 'Jambe droite', range: '90–00', pa: 'paJambeD'},
];

// Table keys → the exact table name used as the custom-property default.
export const TABLES = {
    persos: 'Personnages',
    skills: 'Compétences du personnage',
    talents: 'Talents du personnage',
    inventory: 'Inventaire',
    conditions: 'États actifs',
    crits: 'Blessures critiques',
    xp: 'Journal XP',
    money: 'Journal financier',
    skillCatalog: 'Compétences',
    talentCatalog: 'Talents',
    equipment: 'Équipement',
    conditionCatalog: 'États',
    spells: 'Sorts et Prières',
    groups: 'Groupes',
};

const charFields = Object.fromEntries(
    CHARS.flatMap(({key}) => [
        [`ini_${key}`, `${key} Initiale`],
        [`aug_${key}`, `${key} Aug`],
        [`cur_${key}`, key],
    ]),
);

// One entry per table key; values are the field names the UI expects.
export const FIELDS = {
    persos: {
        name: 'Nom',
        joueur: 'Joueur',
        age: 'Âge',
        taille: 'Taille',
        cheveux: 'Cheveux',
        yeux: 'Yeux',
        motivation: 'Motivation',
        ambCourt: 'Ambition à court terme',
        ambLong: 'Ambition à long terme',
        psychologie: 'Psychologie',
        mutations: 'Mutations',
        race: 'Race',
        niveau: 'Niveau de carrière',
        groupe: 'Groupe',
        sorts: 'Sorts et Prières',
        carriere: 'Carrière',
        classe: 'Classe',
        statut: 'Statut',
        ...charFields,
        bf: 'BF',
        be: 'BE',
        bfm: 'BFM',
        degats: 'Dégâts subis',
        blessuresMax: 'Blessures max',
        blessures: 'Blessures actuelles',
        destin: 'Destin',
        chance: 'Chance',
        resilience: 'Résilience',
        determination: 'Détermination',
        corruption: 'Corruption',
        peche: 'Péché',
        mouvement: 'Mouvement',
        marche: 'Marche',
        course: 'Course',
        encMax: 'Enc. Max',
        encTotal: 'Enc total',
        surcharge: 'Surcharge',
        encArmes: 'Enc armes',
        encArmures: 'Enc armures',
        encPossessions: 'Enc possessions',
        paTete: 'PA Tête',
        paBrasG: 'PA Bras gauche',
        paBrasD: 'PA Bras droit',
        paCorps: 'PA Corps',
        paJambeG: 'PA Jambe gauche',
        paJambeD: 'PA Jambe droite',
        paBouclier: 'PA Bouclier',
        xpTotale: 'XP Totale',
        xpDepensee: 'XP Dépensée',
        xpActuelle: 'XP Actuelle',
        co: 'CO',
        pa: 'pa',
        sc: 'sc',
    },
    skills: {
        label: 'Libellé',
        perso: 'Personnage',
        competence: 'Compétence',
        spec: 'Spécialisation',
        aug: 'Aug',
        carac: 'Caractéristique',
        type: 'Type',
        valeurCarac: 'Valeur carac.',
        comp: 'Comp',
        enCarriere: 'En carrière',
    },
    talents: {
        label: 'Libellé',
        perso: 'Personnage',
        talent: 'Talent',
        spec: 'Spécialisation',
        nbre: 'Nbre pris',
        enCarriere: 'En carrière',
    },
    inventory: {
        label: 'Libellé',
        perso: 'Personnage',
        objet: 'Objet',
        qte: 'Qté',
        equipe: 'Équipé',
        type: 'Type',
        encTotal: 'Enc total',
        degats: 'Dégâts',
    },
    conditions: {label: 'Libellé', perso: 'Personnage', etat: 'État', niveau: 'Niveau'},
    crits: {label: 'Libellé', perso: 'Personnage', loc: 'Localisation', effets: 'Effets', date: 'Date', guerie: 'Guérie'},
    xp: {
        label: 'Libellé',
        perso: 'Personnage',
        date: 'Date',
        type: 'Type',
        gain: 'XP gagnés',
        carac: 'Caractéristique',
        skill: 'Compétence du personnage',
        talent: 'Talent du personnage',
        augAvant: 'Aug avant',
        nb: 'Nb augmentations',
        cout: 'Coût XP',
        coutSuggere: 'Coût suggéré',
        enCarriere: 'En carrière',
        depense: 'XP dépensés',
    },
    money: {label: 'Libellé', perso: 'Personnage', date: 'Date', co: 'CO', pa: 'pa', sc: 'sc', total: 'Total sc'},
    skillCatalog: {name: 'Nom', carac: 'Caractéristique', type: 'Type', groupee: 'Groupée'},
    talentCatalog: {name: 'Nom', max: 'Max', tests: 'Tests'},
    equipment: {
        name: 'Nom',
        type: 'Type',
        groupe: 'Groupe',
        enc: 'Enc',
        portee: 'Portée / Allonge',
        degats: 'Dégâts',
        pa: 'PA',
        locs: 'Localisations',
        atouts: 'Atouts / Défauts',
    },
    conditionCatalog: {name: 'Nom', cumulable: 'Cumulable', description: 'Description'},
    spells: {
        name: 'Nom',
        type: 'Type',
        domaine: 'Domaine / Culte',
        ni: 'NI',
        portee: 'Portée',
        cible: 'Cible',
        duree: 'Durée',
        effets: 'Effets',
    },
    groups: {name: 'Nom du groupe', ambCourt: 'Ambition à court terme', ambLong: 'Ambition à long terme'},
};

export function resolveFields(table, names) {
    const out = {};
    for (const [key, name] of Object.entries(names)) {
        // null when hidden/missing
        out[key] = table ? table.getFieldIfExists(name) : null;
    }
    return out;
}

export function findMissingFields(tables, fields) {
    const missing = [];
    for (const [key, names] of Object.entries(FIELDS)) {
        const hidden = Object.entries(names)
            .filter(([fieldKey]) => !fields[key][fieldKey])
            .map(([, name]) => name);
        if (hidden.length) missing.push({table: tables[key].name, fields: hidden});
    }
    return missing;
}

// Read helpers that tolerate a null field
export const val = (record, field) => (field ? record.getCellValue(field) : null);
export const str = (record, field) => (field ? record.getCellValueAsString(field) : '');

// Numbers from number, formula or rollup fields (rollups may return arrays).
export function numOrNull(record, field) {
    let v = val(record, field);
    if (Array.isArray(v)) v = v[0];
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : null;
}
export const num = (record, field) => numOrNull(record, field) ?? 0;

export function links(record, field) {
    const v = val(record, field);
    return Array.isArray(v) ? v : [];
}

export const today = () => {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

// Build a {fieldId: value} payload from {fieldKey: value}, failing loudly on hidden fields.
function payload(fieldsForTable, tableName, values) {
    const out = {};
    for (const [key, v] of Object.entries(values)) {
        const field = fieldsForTable[key];
        if (!field) throw new Error(`Le champ « ${FIELDS_NAME(tableName, key)} » n'est pas visible pour l'extension.`);
        out[field.id] = v;
    }
    return out;
}
const FIELDS_NAME = (tableKey, key) => FIELDS[tableKey]?.[key] ?? key;

// Permission-checked writes. Each throws an Error with a displayable message.
export function makeWriter(tables, fields) {
    return {
        async create(tableKey, values) {
            const table = tables[tableKey];
            const data = payload(fields[tableKey], tableKey, values);
            const check = table.checkPermissionsForCreateRecord(data);
            if (!check.hasPermission) throw new Error(check.reasonDisplayString);
            return table.createRecordAsync(data);
        },
        async update(tableKey, record, values) {
            const table = tables[tableKey];
            const data = payload(fields[tableKey], tableKey, values);
            const check = table.checkPermissionsForUpdateRecord(record, data);
            if (!check.hasPermission) throw new Error(check.reasonDisplayString);
            return table.updateRecordAsync(record, data);
        },
        async remove(tableKey, recordOrId) {
            const table = tables[tableKey];
            const check = table.checkPermissionsForDeleteRecord(recordOrId);
            if (!check.hasPermission) throw new Error(check.reasonDisplayString);
            return table.deleteRecordAsync(recordOrId);
        },
        canUpdate(tableKey, fieldKey) {
            const field = fields[tableKey][fieldKey];
            return Boolean(field) && tables[tableKey].hasPermissionToUpdateRecord(undefined, {[field.id]: undefined});
        },
        canCreate(tableKey) {
            return tables[tableKey].hasPermissionToCreateRecord();
        },
    };
}

const byLabel = (a, b) => a.label.localeCompare(b.label, 'fr');

// Everything the sheet shows for one character, as plain objects.
export function useCharacterModel(records, fields, charId) {
    return useMemo(() => {
        const perso = records.persos.find(r => r.id === charId) ?? null;
        if (!perso) return null;
        const F = fields;
        const P = F.persos;
        const owned = (key, linkField) => records[key].filter(r => links(r, F[key][linkField]).some(l => l.id === charId));

        const catalogById = key => new Map(records[key].map(r => [r.id, r]));
        const equipmentById = catalogById('equipment');
        const talentCatalogById = catalogById('talentCatalog');
        const conditionCatalogById = catalogById('conditionCatalog');
        const spellsById = catalogById('spells');

        const skills = owned('skills', 'perso')
            .map(r => ({
                id: r.id,
                record: r,
                label: str(r, F.skills.label) || r.name,
                catalogId: links(r, F.skills.competence)[0]?.id ?? null,
                carac: str(r, F.skills.carac),
                type: str(r, F.skills.type),
                valeurCarac: numOrNull(r, F.skills.valeurCarac),
                aug: num(r, F.skills.aug),
                comp: numOrNull(r, F.skills.comp),
                enCarriere: num(r, F.skills.enCarriere) === 1,
            }))
            .sort(byLabel);

        const talents = owned('talents', 'perso')
            .map(r => {
                const catalogId = links(r, F.talents.talent)[0]?.id ?? null;
                const cat = catalogId ? talentCatalogById.get(catalogId) : null;
                return {
                    id: r.id,
                    record: r,
                    label: str(r, F.talents.label) || r.name,
                    catalogId,
                    nbre: num(r, F.talents.nbre),
                    max: cat ? str(cat, F.talentCatalog.max) : '',
                    tests: cat ? str(cat, F.talentCatalog.tests) : '',
                    enCarriere: num(r, F.talents.enCarriere) === 1,
                };
            })
            .sort(byLabel);

        const inventory = owned('inventory', 'perso')
            .map(r => {
                const objetId = links(r, F.inventory.objet)[0]?.id ?? null;
                const obj = objetId ? equipmentById.get(objetId) : null;
                const E = F.equipment;
                return {
                    id: r.id,
                    record: r,
                    label: str(r, F.inventory.label) || (obj ? obj.name : r.name),
                    type: str(r, F.inventory.type) || 'Possession',
                    qte: numOrNull(r, F.inventory.qte) ?? 1,
                    equipe: val(r, F.inventory.equipe) === true,
                    encTotal: num(r, F.inventory.encTotal),
                    degats: str(r, F.inventory.degats),
                    groupe: obj ? str(obj, E.groupe) : '',
                    portee: obj ? str(obj, E.portee) : '',
                    atouts: obj ? str(obj, E.atouts) : '',
                    pa: obj ? numOrNull(obj, E.pa) : null,
                    locs: obj ? str(obj, E.locs) : '',
                };
            })
            .sort(byLabel);

        const conditions = owned('conditions', 'perso')
            .map(r => {
                const etatId = links(r, F.conditions.etat)[0]?.id ?? null;
                const cat = etatId ? conditionCatalogById.get(etatId) : null;
                return {
                    id: r.id,
                    record: r,
                    label: str(r, F.conditions.label) || (cat ? cat.name : r.name),
                    niveau: numOrNull(r, F.conditions.niveau) ?? 1,
                    // Unknown (free-text) conditions can always be stacked.
                    cumulable: cat ? val(cat, F.conditionCatalog.cumulable) === true : true,
                    description: cat ? str(cat, F.conditionCatalog.description) : '',
                };
            })
            .sort(byLabel);

        const crits = owned('crits', 'perso')
            .map(r => ({
                id: r.id,
                record: r,
                label: str(r, F.crits.label) || r.name,
                loc: str(r, F.crits.loc),
                effets: str(r, F.crits.effets),
                date: str(r, F.crits.date),
                guerie: val(r, F.crits.guerie) === true,
            }))
            .sort((a, b) => Number(a.guerie) - Number(b.guerie) || byLabel(a, b));

        // Newest first: by date, then by creation time for rows on the same day.
        const byDateDesc = (a, b) => b.rawDate.localeCompare(a.rawDate) || b.createdTime - a.createdTime;
        const xpLog = owned('xp', 'perso')
            .map(r => ({
                id: r.id,
                record: r,
                label: str(r, F.xp.label) || r.name,
                date: str(r, F.xp.date),
                rawDate: val(r, F.xp.date) ?? '',
                type: str(r, F.xp.type),
                gain: numOrNull(r, F.xp.gain),
                depense: numOrNull(r, F.xp.depense),
                createdTime: r.createdTime ? new Date(r.createdTime).getTime() : 0,
            }))
            .sort(byDateDesc);

        const moneyLog = owned('money', 'perso')
            .map(r => ({
                id: r.id,
                record: r,
                label: str(r, F.money.label) || r.name,
                date: str(r, F.money.date),
                rawDate: val(r, F.money.date) ?? '',
                co: num(r, F.money.co),
                pa: num(r, F.money.pa),
                sc: num(r, F.money.sc),
                total: num(r, F.money.total),
                createdTime: r.createdTime ? new Date(r.createdTime).getTime() : 0,
            }))
            .sort(byDateDesc);

        const spells = links(perso, P.sorts).map(l => {
            const r = spellsById.get(l.id);
            const S = F.spells;
            return {
                id: l.id,
                record: r ?? null,
                label: l.name,
                type: r ? str(r, S.type) : '',
                domaine: r ? str(r, S.domaine) : '',
                ni: r ? numOrNull(r, S.ni) : null,
                portee: r ? str(r, S.portee) : '',
                cible: r ? str(r, S.cible) : '',
                duree: r ? str(r, S.duree) : '',
                effets: r ? str(r, S.effets) : '',
            };
        });

        const groupId = links(perso, P.groupe)[0]?.id ?? null;
        const groupRecord = groupId ? records.groups.find(g => g.id === groupId) : null;
        const group = groupRecord
            ? {
                  id: groupRecord.id,
                  record: groupRecord,
                  name: str(groupRecord, F.groups.name) || groupRecord.name,
                  ambCourt: str(groupRecord, F.groups.ambCourt),
                  ambLong: str(groupRecord, F.groups.ambLong),
              }
            : null;

        const chars = CHARS.map(({key, label}) => ({
            key,
            label,
            initiale: num(perso, P[`ini_${key}`]),
            aug: num(perso, P[`aug_${key}`]),
            courante: num(perso, P[`cur_${key}`]),
        }));

        const n = key => num(perso, P[key]);
        return {
            id: perso.id,
            record: perso,
            name: str(perso, P.name) || perso.name,
            race: links(perso, P.race),
            niveau: links(perso, P.niveau),
            carriere: str(perso, P.carriere),
            classe: str(perso, P.classe),
            statut: str(perso, P.statut),
            text: Object.fromEntries(
                ['joueur', 'age', 'taille', 'cheveux', 'yeux', 'motivation', 'ambCourt', 'ambLong', 'psychologie', 'mutations'].map(
                    k => [k, str(perso, P[k])],
                ),
            ),
            chars,
            stats: Object.fromEntries(
                [
                    'bf', 'be', 'bfm', 'degats', 'blessuresMax', 'blessures', 'destin', 'chance', 'resilience',
                    'determination', 'corruption', 'peche', 'mouvement', 'marche', 'course', 'encMax', 'encTotal',
                    'surcharge', 'encArmes', 'encArmures', 'encPossessions', 'paTete', 'paBrasG', 'paBrasD', 'paCorps',
                    'paJambeG', 'paJambeD', 'paBouclier', 'xpTotale', 'xpDepensee', 'xpActuelle', 'co', 'pa', 'sc',
                ].map(k => [k, n(k)]),
            ),
            skills,
            basicSkills: skills.filter(s => s.type === 'Base'),
            otherSkills: skills.filter(s => s.type !== 'Base'),
            talents,
            weapons: inventory.filter(i => i.type === 'Arme'),
            armour: inventory.filter(i => i.type === 'Armure'),
            possessions: inventory.filter(i => i.type !== 'Arme' && i.type !== 'Armure'),
            conditions,
            crits,
            xpLog,
            moneyLog,
            spells,
            group,
        };
    }, [records, fields, charId]);
}
