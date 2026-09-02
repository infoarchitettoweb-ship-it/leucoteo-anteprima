/* ============================================================
   DATI DIMOSTRATIVI — LEUCOTEO BETA
   Verticale: integratori e nutrizione sportiva.

   NOTA SUL MODELLO: dentro Leucoteo non passa denaro. L'azienda
   paga con bonifico diretto usando le coordinate che trova qui;
   Leucoteo registra la dichiarazione di pagamento e la conferma
   d'incasso. Niente escrow, niente licenza da istituto di
   pagamento, nessun obbligo antiriciclaggio da intermediario.

   NOTA SULLE VENDITE: Leucoteo non si collega al negozio di
   nessuno e non legge ordini. L'unico numero di risultato che
   esiste qui sono i CLIC sul link che l'azienda crea per il
   creator a collaborazione chiusa: il link passa dal nostro
   redirect, quindi i clic li possiamo contare senza toccare
   il carrello di nessuno. Il venduto non lo sappiamo, e non
   facciamo finta di saperlo.
   ============================================================ */

/* --- la beta ---------------------------------------------
   La prima versione è gratuita e a zero commissioni, per tutti
   e su tutto, finché non c'è massa critica di utenti. Non c'è
   contatore, non c'è soglia, non c'è carta. Il giorno che si
   deciderà un prezzo si cambierà qui e cambierà ovunque —
   landing, impostazioni, registrazione.

   Deliberatamente NON si mostra una soglia che scatta: in beta
   l'unica metrica che conta è il numero di iscritti, e un
   contatore che promette un prezzo futuro raffredda proprio
   quello. --------------------------------------------------- */
export const LISTINO = {
  beta: true,
  servizio: 0,      // commissione di servizio all'azienda
  commissione: 0,   // percentuale trattenuta da Leucoteo: nessuna, su niente
  minFollower: 10000,   // il cancello d'ingresso, su Instagram
  scadenzaRicerca: 30,  // giorni dopo cui lo stato «in cerca» chiede conferma
  finestraClic: 90      // giorni per cui un link affiliato resta monitorato
};

/* Il conto di una collaborazione, dai due lati.
   È l'unica funzione che tocca i soldi, ed è volutamente banale:
   la cifra concordata è la cifra, punto. Leucoteo non calcola
   ritenute, bolli o imposte — il regime fiscale è una faccenda
   fra il creator, l'azienda e i loro commercialisti, e sbagliarla
   al posto loro sarebbe un danno, non un servizio. Nessuna quota
   sul venduto: né per il creator né per Leucoteo. */
export function conto(c) {
  const lordo = c.cachet;
  return { lordo, patto: 0, costoAzienda: lordo };
}

/* --- i sei stati di una collaborazione ---------------------
   La moneta si allinea solo quando il creator conferma di
   avere incassato: è l'unico momento in cui il patto è chiuso
   davvero, e l'unico che Leucoteo può registrare senza toccare
   il denaro. --------------------------------------------- */
export const PASSI = [
  { k: 'proposta',    t: 'Richiesta inviata',     d: 'In attesa di risposta' },
  { k: 'accordo',     t: 'Accordo firmato',       d: 'Accettato dalle due parti, con marca temporale' },
  { k: 'consegna',    t: 'Contenuti consegnati',  d: 'Archiviati con data certa' },
  { k: 'approvazione',t: 'Lavoro approvato',      d: 'Oppure approvato da solo dopo 5 giorni' },
  { k: 'bonifico',    t: 'Bonifico dichiarato',   d: 'L’azienda dichiara di aver disposto il pagamento' },
  { k: 'incasso',     t: 'Incasso confermato',    d: 'Il creator conferma di aver ricevuto' }
];

/* --- i modi in cui può essere strutturata una collaborazione ---
   Niente formule a commissione: senza leggere il negozio non
   potremmo verificarle, e una cifra che non possiamo verificare
   non ha posto in un accordo che serve a evitare le liti. --- */
export const FORMULE = [
  { k: 'fisso',    t: 'Compenso fisso',           d: 'Una cifra concordata, pagata a lavoro approvato' },
  { k: 'prodotto', t: 'Compenso + prodotto',      d: 'Una cifra concordata, più il prodotto in omaggio' },
  { k: 'omaggio',  t: 'Solo prodotto in omaggio', d: 'Nessun compenso in denaro. Va detto chiaramente prima.' },
  { k: 'continua', t: 'Rapporto continuativo',    d: 'Una cifra al mese, con un rinnovo mese per mese' }
];

export const FORMATI = [
  { k: 'reel',    t: 'Reel Instagram',       durata: '15-60 s' },
  { k: 'storie',  t: 'Storie Instagram',     durata: '24 h' },
  { k: 'post',    t: 'Post in feed',         durata: 'permanente' },
  { k: 'ugc',     t: 'UGC senza pubblicazione', durata: 'solo consegna file' },
  { k: 'live',    t: 'Diretta',              durata: '20-40 min' }
];

/* --- i diritti d'uso: è la voce che vale di più e che quasi
   sempre viene lasciata implicita, generando liti ---------- */
export const DIRITTI = [
  { k: 'nessuno',  t: 'Nessun riutilizzo',       d: 'Il contenuto resta solo sui canali del creator' },
  { k: 'organico', t: 'Ripubblicazione organica',d: 'L’azienda può ricondividerlo sui suoi canali' },
  { k: 'adv-90',   t: 'Uso pubblicitario 90 gg', d: 'Utilizzabile in campagne a pagamento per 90 giorni' },
  { k: 'adv-365',  t: 'Uso pubblicitario 1 anno',d: 'Utilizzabile in campagne a pagamento per 12 mesi' }
];

/* --- i dati che un'azienda può scegliere di vedere in anteprima
   sulle schede dei creator. Ne sceglie tre: quello che conta
   cambia da azienda ad azienda, e imporne una terna sola vuol
   dire imporre una definizione di «bravo». ------------------ */
export const ANTEPRIME = [
  { k: 'clic',      t: 'Clic portati',        d: 'Visite al sito dai suoi link, su tutte le aziende' },
  { k: 'inTempo',   t: 'Consegne in tempo',   d: 'Quante volte ha consegnato entro la data' },
  { k: 'giudizio',  t: 'Giudizio medio',      d: 'Il voto lasciato dalle aziende con cui ha lavorato' },
  { k: 'f',         t: 'Follower',            d: 'Letti da Instagram, non dichiarati' },
  { k: 'er',        t: 'Interazione',         d: 'Percentuale di pubblico che reagisce' },
  { k: 'prezzo',    t: 'Prezzo di partenza',  d: 'La voce più bassa del suo listino' },
  { k: 'collab',    t: 'Collaborazioni',      d: 'Quante ne ha concluse dentro Leucoteo' },
  { k: 'risposta',  t: 'Tasso di risposta',   d: 'Quante proposte legge e a cui risponde' }
];

/* ============================================================
   CHI SEI
   ============================================================ */
export const CREATOR = {
  /* --- identità pubblica --- */
  nome: 'Giulia Ferrante', handle: '@giulia.fit', ini: 'GF', citta: 'Bologna',
  foto: null,                       // impostata dall'utente, altrimenti le due metà
  nicchia: 'Nutrizione sportiva · fitness femminile',
  bio: 'Preparo ricette proteiche vere, con ingredienti che si trovano al supermercato. Il mio pubblico compra: scontrino medio 53 €, resi sotto il 6%.',
  categorie: ['nutrizione', 'fitness', 'ricette'],

  /* --- identità legale: chi firma davvero. Non è mai pubblica.
     Il minimo per firmare un accordo ed essere una persona vera:
     niente codice fiscale, niente residenza. Se un giorno servono
     per un documento, si chiedono in quel momento e a chi serve. --- */
  legale: {
    nome: 'Giulia', cognome: 'Ferrante',
    nascita: '1 dicembre 1995',
    email: 'giulia.ferrante@gmail.com', emailVerificata: true
  },

  /* --- numeri letti, non dichiarati.
     Solo Instagram: si comincia da lì, e un canale che non leggiamo
     non va mostrato come se lo leggessimo. --- */
  ig: { follower: 38400, er: 4.8, copertura: 112000, sync: 'oggi · 06:14' },
  pubblico: { donne: 78, eta: '25-34', italia: 86 },

  listino: [
    { k: 'reel',   t: 'Reel singolo',     p: 450, n: '1 reel + 1 storia di lancio' },
    { k: 'storie', t: 'Pacchetto storie', p: 180, n: '3 storie con link' },
    { k: 'lancio', t: 'Pacchetto lancio', p: 900, n: '2 reel + 4 storie + codice dedicato' }
  ],

  banca: {
    intestatario: 'Giulia Ferrante',
    iban: 'IT60 X054 2811 1010 0000 0123 456',
    banca: 'Banca Popolare — filiale di Bologna',
    verificato: true, aggiornato: '4 lug 2026'
  },

  /* --- lo stato di ricerca: ha una scadenza, altrimenti l'elenco
     si riempie di profili morti e smette di valere niente --- */
  inCerca: { attivo: true, dal: '18 ago 2026', scadeIl: '17 set 2026' },

  rispondeEntro: '24 ore',
  tassoRisposta: 92,
  consensoStorico: true,    // vedi termini.html
  profiloVisto: 4           // aziende che hanno aperto il profilo, ultimi 7 giorni
};

export const AZIENDA = {
  nome: 'Nutriva', ini: 'NU', foto: null,
  sito: 'nutriva.it',              // il sito, qualunque piattaforma ci giri sotto
  settore: 'Integratori e nutrizione sportiva',
  prodotti: 'proteine, barrette, pre-workout',
  cerca: 'reel e ricette',
  budget: '300-800 €',

  /* --- la verifica non passa più dal negozio: passa dall'azienda --- */
  piva: 'IT03847210376', pivaVerificata: true,
  ragioneSociale: 'Nutriva S.r.l.',
  sede: 'Via Emilia 44, 40139 Bologna',
  dominioVerificato: true, comeVerificato: 'record DNS · 12 ago 2026',
  referente: { nome: 'Marta', cognome: 'Bini', ruolo: 'Marketing', email: 'marta.bini@nutriva.it' },

  inCerca: { attivo: true, dal: '20 ago 2026', scadeIl: '19 set 2026', posti: 3, presi: 1 },

  /* --- le tre anteprime che quest'azienda vuole vedere sui creator --- */
  anteprime: ['clic', 'inTempo', 'f']
};

/* ============================================================
   LE COLLABORAZIONI
   ============================================================ */
export const COLLAB = [
  {
    id: 'C-104', origine: 'azienda', azienda: 'Nutriva', aziendaIni: 'NU',
    creator: 'Giulia Ferrante', handle: '@giulia.fit', creatorIni: 'GF',
    titolo: 'Lancio proteine vegetali',
    formula: 'prodotto', cachet: 600,
    passo: 2, scadenzaConsegna: '27 ago', scadenzaPubblicazione: '30 ago',
    firmata: '12 ago · 18:42', pagata: null, incassata: null,
    diritti: 'adv-90', esclusiva: '30 giorni sulla categoria integratori proteici',
    prodotti: 'Proteine vegetali vaniglia · 900 g',
    brief: 'Mostrare la preparazione di una ricetta con il prodotto. Dire che è senza lattosio. Non paragonare ad altre marche, non promettere risultati di dimagrimento.',
    consegne: [
      { t: 'Reel — unboxing e prima ricetta', formato: 'reel',   s: 'consegnato', d: '18 ago', adv: true },
      { t: '3 storie con link in bio',        formato: 'storie', s: 'consegnato', d: '19 ago', adv: true },
      { t: 'Reel — recensione a 7 giorni',    formato: 'reel',   s: 'atteso',     d: '27 ago', adv: false }
    ],
    link: null                       // si crea a collaborazione chiusa
  },
  {
    id: 'C-109', origine: 'azienda', azienda: 'Nutriva', aziendaIni: 'NU',
    creator: 'Giulia Ferrante', handle: '@giulia.fit', creatorIni: 'GF',
    titolo: 'Barrette proteiche',
    formula: 'fisso', cachet: 380,
    passo: 3, scadenzaConsegna: '21 ago', scadenzaPubblicazione: '24 ago',
    firmata: '6 ago · 10:22', pagata: null, incassata: null,
    diritti: 'organico', esclusiva: 'nessuna',
    prodotti: 'Barrette proteiche cacao · confezione da 12',
    brief: 'Tre modi diversi di mangiarle nella giornata. Tono leggero.',
    consegne: [
      { t: 'Reel — tre modi di mangiarle', formato: 'reel',   s: 'consegnato', d: '20 ago', adv: true },
      { t: '2 storie con codice',          formato: 'storie', s: 'consegnato', d: '21 ago', adv: true }
    ],
    link: null
  },
  {
    id: 'C-107', origine: 'azienda', azienda: 'Caffè Mora', aziendaIni: 'CM',
    creator: 'Giulia Ferrante', handle: '@giulia.fit', creatorIni: 'GF',
    titolo: 'Pre-workout al caffè',
    formula: 'fisso', cachet: 400,
    passo: 0, scadenzaConsegna: 'da concordare', scadenzaPubblicazione: 'da concordare',
    firmata: null, pagata: null, incassata: null,
    diritti: 'organico', esclusiva: 'nessuna',
    prodotti: 'Miscela pre-workout · 250 g',
    brief: 'Raccontare la routine del mattino prima dell’allenamento.',
    rispostaEntro: '25 ago',
    consegne: [
      { t: '1 reel + 2 storie', formato: 'reel', s: 'da definire', d: '—', adv: false }
    ],
    link: null
  },
  {
    /* partita dal creator e ancora senza risposta: è quello che sta
       nel cassetto delle proposte inviate, dal lato di chi l'ha mandata */
    id: 'C-112', origine: 'creator', azienda: 'Verde Vivo', aziendaIni: 'VV',
    creator: 'Giulia Ferrante', handle: '@giulia.fit', creatorIni: 'GF',
    titolo: 'Vitamine, routine del mattino',
    formula: 'fisso', cachet: 320,
    passo: 0, scadenzaConsegna: 'da concordare', scadenzaPubblicazione: 'da concordare',
    firmata: null, pagata: null, incassata: null,
    diritti: 'organico', esclusiva: 'nessuna',
    prodotti: 'Multivitaminico · 60 compresse',
    brief: 'Come le prendo la mattina, dentro la mia routine vera.',
    inviata: '29 ago', rispostaEntro: '5 set',
    consegne: [{ t: '1 reel + 2 storie', formato: 'reel', s: 'da definire', d: '—', adv: false }],
    link: null
  },
  {
    /* stessa cosa dal lato azienda: mandata a un creator che non ha
       ancora risposto */
    id: 'C-113', origine: 'azienda', azienda: 'Nutriva', aziendaIni: 'NU',
    creator: 'Sara Ferro', handle: '@sara.runs', creatorIni: 'SF',
    titolo: 'Barrette, prova su strada',
    formula: 'prodotto', cachet: 260,
    passo: 0, scadenzaConsegna: 'da concordare', scadenzaPubblicazione: 'da concordare',
    firmata: null, pagata: null, incassata: null,
    diritti: 'organico', esclusiva: 'nessuna',
    prodotti: 'Barrette proteiche cacao · confezione da 12',
    brief: 'Portarle in borsa durante una corsa lunga.',
    inviata: '31 ago', rispostaEntro: '7 set',
    consegne: [{ t: '2 storie', formato: 'storie', s: 'da definire', d: '—', adv: false }],
    link: null
  },
  {
    id: 'C-101', origine: 'creator', azienda: 'Pura Skin', aziendaIni: 'PS',
    creator: 'Giulia Ferrante', handle: '@giulia.fit', creatorIni: 'GF',
    titolo: 'Routine post-workout',
    formula: 'prodotto', cachet: 350,
    passo: 6, scadenzaConsegna: 'chiusa il 2 ago', scadenzaPubblicazione: '—',
    firmata: '21 lug · 11:05', pagata: '2 ago · 09:10', incassata: '4 ago · 08:30',
    diritti: 'organico', esclusiva: 'nessuna',
    prodotti: 'Detergente viso post-sport',
    brief: 'Routine dopo la palestra, senza promesse mediche.',
    consegne: [{ t: 'Reel unico + 2 storie', formato: 'reel', s: 'consegnato', d: '29 lug', adv: true }],
    link: { url: 'leucoteo.it/r/ps-giulia', clic: 1840, creato: '5 ago', attivo: true },
    giudizio: { azienda: 5, creator: 5, nota: 'Consegna puntuale, contenuto riutilizzato in campagna.' }
  },
  {
    id: 'C-098', origine: 'azienda', azienda: 'Zampa&Co', aziendaIni: 'ZC',
    creator: 'Giulia Ferrante', handle: '@giulia.fit', creatorIni: 'GF',
    titolo: 'Snack proteici cane',
    formula: 'fisso', cachet: 200,
    passo: 6, scadenzaConsegna: 'chiusa il 12 lug', scadenzaPubblicazione: '—',
    firmata: '5 lug · 09:12', pagata: '12 lug · 14:00', incassata: '15 lug · 10:05',
    diritti: 'nessuno', esclusiva: 'nessuna',
    prodotti: 'Snack proteici per cani',
    brief: 'Due storie con il cane.',
    consegne: [{ t: '2 storie', formato: 'storie', s: 'consegnato', d: '10 lug', adv: true }],
    link: { url: 'leucoteo.it/r/zc-giulia', clic: 410, creato: '16 lug', attivo: false },
    giudizio: { azienda: 4, creator: 5, nota: 'Tutto liscio.' }
  },
  {
    /* concluse dell'azienda con altri creator: servono perché Nutriva
       veda uno storico suo, e combaciano con i link qui sotto */
    id: 'C-095', origine: 'azienda', azienda: 'Nutriva', aziendaIni: 'NU',
    creator: 'Sara Ferro', handle: '@sara.runs', creatorIni: 'SF',
    titolo: 'Proteine, prima della corsa',
    formula: 'fisso', cachet: 260,
    passo: 6, scadenzaConsegna: 'chiusa il 28 lug', scadenzaPubblicazione: '—',
    firmata: '14 lug · 09:40', pagata: '28 lug · 11:20', incassata: '30 lug · 08:15',
    diritti: 'organico', esclusiva: 'nessuna',
    prodotti: 'Proteine vegetali vaniglia · 900 g',
    brief: 'Come le prende prima di una corsa lunga.',
    consegne: [{ t: 'Reel unico', formato: 'reel', s: 'consegnato', d: '26 lug', adv: true }],
    link: { url: 'leucoteo.it/r/nu-sara', clic: 1120, creato: '28 lug', attivo: true },
    giudizio: { azienda: 5, creator: 5, nota: 'Puntuale, contenuto riusato in campagna.' }
  },
  {
    id: 'C-090', origine: 'azienda', azienda: 'Nutriva', aziendaIni: 'NU',
    creator: 'Elisa Conti', handle: '@elisa.wellness', creatorIni: 'EC',
    titolo: 'Vitamine, storie informative',
    formula: 'prodotto', cachet: 300,
    passo: 6, scadenzaConsegna: 'chiusa il 14 lug', scadenzaPubblicazione: '—',
    firmata: '1 lug · 15:05', pagata: '14 lug · 10:00', incassata: '16 lug · 09:30',
    diritti: 'nessuno', esclusiva: 'nessuna',
    prodotti: 'Multivitaminico · 60 compresse',
    brief: 'Tre storie che spiegano quando servono davvero.',
    consegne: [{ t: '3 storie', formato: 'storie', s: 'consegnato', d: '12 lug', adv: true }],
    link: { url: 'leucoteo.it/r/nu-elisa', clic: 730, creato: '14 lug', attivo: true },
    giudizio: { azienda: 4, creator: 5, nota: 'Tutto liscio.' }
  }
];

/* --- i link affiliati creati dall'azienda a collaborazione chiusa.
   Il redirect passa da noi: per questo i clic li sappiamo contare
   senza collegarci a nessun negozio. Cosa succede DOPO il clic —
   se compra, quanto spende — non lo sappiamo e non lo scriviamo
   da nessuna parte. ---------------------------------------- */
export const LINK = [
  { id: 'L-04', creator: 'Giulia Ferrante', ini: 'GF', collab: 'C-101', url: 'leucoteo.it/r/ps-giulia',
    creato: '5 ago',  clic: 1840, clic7g: 96,  attivo: true,  fonte: 'reel + storie' },
  { id: 'L-03', creator: 'Sara Ferro',      ini: 'SF', collab: 'C-095', url: 'leucoteo.it/r/nu-sara',
    creato: '28 lug', clic: 1120, clic7g: 41,  attivo: true,  fonte: 'reel' },
  { id: 'L-02', creator: 'Elisa Conti',     ini: 'EC', collab: 'C-090', url: 'leucoteo.it/r/nu-elisa',
    creato: '14 lug', clic: 730,  clic7g: 12,  attivo: true,  fonte: 'storie' },
  { id: 'L-01', creator: 'Giulia Ferrante', ini: 'GF', collab: 'C-098', url: 'leucoteo.it/r/zc-giulia',
    creato: '16 lug', clic: 410,  clic7g: 0,   attivo: false, fonte: '2 storie' }
];

/* ============================================================
   LO STORICO CHE UN'AZIENDA PUÒ VEDERE
   Regola: i dati del creator sono suoi e li pubblica lui.
   Il nome dell'azienda compare SOLO se quella azienda ha dato
   il consenso; altrimenti resta il settore. I compensi non
   compaiono mai. Vedi termini.html.

   Due blocchi distinti e mai mescolati: quello VERIFICATO, che
   esiste solo perché la collaborazione è passata di qui, e
   quello DICHIARATO, che il creator ha scritto a mano. Il
   secondo non diventa mai il primo: è precisamente questo che
   rende il primo prezioso.
   ============================================================ */
export const STORICO = {
  collaborazioni: 9, aziende: 12, settore: 'nutrizione e benessere',
  clic: 8420, clicFinestra: 'ultimi 12 mesi',
  consegnaInTempo: 100,
  giudizioMedio: 4.9, giudizi: 7,
  serie: [320, 480, 410, 690, 560, 900, 810, 1080, 940, 1180, 1290, 1030],
  /* riga per riga: quello che un'azienda vede aprendo la scheda */
  righe: [
    { id: 'C-101', azienda: 'Pura Skin', consenso: true,  settore: 'skincare',     quando: 'lug 2026', formati: '1 reel + 2 storie', inTempo: true,  giudizio: 5, clic: 1840, note: 'contenuto riutilizzato in campagna' },
    { id: 'C-098', azienda: null,        consenso: false, settore: 'accessori pet',quando: 'lug 2026', formati: '2 storie',          inTempo: true,  giudizio: 4, clic: 410,  note: '' },
    { id: 'C-092', azienda: null,        consenso: false, settore: 'nutrizione',   quando: 'giu 2026', formati: '2 reel',            inTempo: true,  giudizio: 5, clic: 1520, note: '' },
    { id: 'C-085', azienda: 'Caffè Mora',consenso: true,  settore: 'caffè',        quando: 'mag 2026', formati: '1 reel + 3 storie', inTempo: true,  giudizio: 5, clic: 980,  note: 'rinnovata due volte' },
    { id: 'C-071', azienda: null,        consenso: false, settore: 'nutrizione',   quando: 'apr 2026', formati: '1 post + storie',   inTempo: false, giudizio: 4, clic: 640,  note: 'consegna posticipata di 2 giorni, concordata' },
    { id: 'C-064', azienda: null,        consenso: false, settore: 'benessere',    quando: 'mar 2026', formati: '3 storie',          inTempo: true,  giudizio: 5, clic: 520,  note: '' }
  ]
};

/* --- le collaborazioni chiuse fuori da Leucoteo, dichiarate dal
   creator. Nessun numero di risultato: non abbiamo modo di
   saperlo, quindi non lo chiediamo nemmeno. Servono a non far
   partire un profilo nuovo da zero, e restano marcate per
   sempre. ------------------------------------------------- */
export const STORICO_ESTERNO = [
  { azienda: 'FitBox Italia', quando: 'feb 2026', formati: '2 reel',   link: 'instagram.com/p/…', nota: 'box mensile di snack proteici' },
  { azienda: 'Aqua Pura',     quando: 'gen 2026', formati: '3 storie', link: 'instagram.com/p/…', nota: '' },
  { azienda: 'Gymtech',       quando: 'nov 2025', formati: '1 post',   link: '',                  nota: 'attrezzatura da casa' }
];

/* --- creator trovabili dall'azienda ---
   `inCerca` è il segnale che decide l'ordine e l'opacità della
   scheda: chi non cerca resta visibile ma spento, così l'elenco
   dice la verità invece di far perdere tempo a tutti. --------- */
export const TROVA = [
  { n: 'Giulia Ferrante', h: '@giulia.fit',     i: 'GF', f: 38400, er: 4.8, clic: 8420, collab: 9,  cat: 'nutrizione', prezzo: 450, ver: true,  giudizio: 4.9, inTempo: 100, risposta: 92, citta: 'Bologna', inCerca: true,  daQuando: '18 ago' },
  { n: 'Sara Ferro',      h: '@sara.runs',      i: 'SF', f: 15600, er: 7.4, clic: 5210, collab: 6,  cat: 'running',    prezzo: 260, ver: true,  giudizio: 5.0, inTempo: 100, risposta: 100,citta: 'Torino',  inCerca: true,  daQuando: '24 ago' },
  { n: 'Marco Bandini',   h: '@marcolifts',     i: 'MB', f: 74200, er: 3.1, clic: 12900,collab: 14, cat: 'nutrizione', prezzo: 800, ver: true,  giudizio: 4.4, inTempo: 86,  risposta: 61, citta: 'Milano',  inCerca: false, daQuando: null },
  { n: 'Elisa Conti',     h: '@elisa.wellness', i: 'EC', f: 28900, er: 5.6, clic: 4380, collab: 7,  cat: 'benessere',  prezzo: 390, ver: true,  giudizio: 4.7, inTempo: 100, risposta: 88, citta: 'Roma',    inCerca: true,  daQuando: '30 ago' },
  { n: 'Dario Sala',      h: '@dario.crossfit', i: 'DS', f: 91300, er: 1.9, clic: 2100, collab: 3,  cat: 'fitness',    prezzo: 950, ver: true,  giudizio: 3.8, inTempo: 67,  risposta: 34, citta: 'Napoli',  inCerca: false, daQuando: null },
  { n: 'Luca Neri',       h: '@luca.kitchen',   i: 'LN', f: 52800, er: 2.4, clic: 0,    collab: 0,  cat: 'food',       prezzo: 600, ver: false, giudizio: 0,   inTempo: 0,   risposta: 0,  citta: 'Firenze', inCerca: true,  daQuando: '31 ago' }
];

/* --- aziende a cui un creator può proporsi ---
   `posti` e `scadeIl` non sono decorazione: sono quello che
   riporta un creator dentro l'app senza che gli si scriva.
   Un annuncio senza fine è un annuncio che non si guarda. --- */
export const AZIENDE_APERTE = [
  { n: 'Nutriva',    i: 'NU', cat: 'integratori', sito: 'nutriva.it',   prodotti: 'proteine, barrette, pre-workout', cerca: 'reel e ricette',        budget: '300-800 €', collab: 6, ver: true, inCerca: true,  posti: 3, presi: 1, scadeIl: '19 set', risposta: 94 },
  { n: 'Caffè Mora', i: 'CM', cat: 'caffè',       sito: 'caffemora.it', prodotti: 'miscele e pre-workout al caffè',  cerca: 'storie mattutine',      budget: '200-500 €', collab: 3, ver: true, inCerca: true,  posti: 2, presi: 0, scadeIl: '12 set', risposta: 78 },
  { n: 'Pura Skin',  i: 'PS', cat: 'skincare',    sito: 'puraskin.com', prodotti: 'detergenti e creme post-sport',   cerca: 'routine quotidiane',    budget: '250-600 €', collab: 8, ver: true, inCerca: false, posti: 0, presi: 0, scadeIl: null,     risposta: 90 },
  { n: 'Verde Vivo', i: 'VV', cat: 'integratori', sito: 'verdevivo.it', prodotti: 'vitamine e omega 3',              cerca: 'contenuti informativi', budget: '150-400 €', collab: 2, ver: true, inCerca: true,  posti: 4, presi: 2, scadeIl: '25 set', risposta: 55 }
];

/* --- pagamenti attesi e ricevuti (nessun denaro passa da qui) --- */
export const PAGAMENTI = [
  { d: '4 ago',  t: 'Pura Skin · C-101', causale: 'Bonifico ricevuto',    imp: 278.00, s: 'incassato' },
  { d: '15 lug', t: 'Zampa&Co · C-098',  causale: 'Bonifico ricevuto',    imp: 158.00, s: 'incassato' },
  { d: '—',      t: 'Nutriva · C-109',   causale: 'Atteso alla consegna', imp: 302.00, s: 'atteso' },
  { d: '—',      t: 'Nutriva · C-104',   causale: 'Atteso alla consegna', imp: 478.00, s: 'atteso' }
];
