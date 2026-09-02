/* ============================================================
   LEUCOTEO — il prodotto
   Tre domande a cui ogni schermata risponde senza farsi leggere:
   dove sono, a che punto è, di chi è la palla adesso.

   Dentro Leucoteo non passa denaro: l'azienda paga con bonifico
   usando le coordinate che trova qui, e le due parti dichiarano
   pagamento e incasso. La moneta si allinea sull'incasso.
   ============================================================ */
import { moneta, gestoMoneta, osserva, MONETA_SVG, eur, eur2, num, mille } from './moto.js?v=20260902-1555';
import { ICO, ILLO } from './segni.js?v=20260902-1555';
import {
  LISTINO, conto, PASSI, FORMULE, FORMATI, DIRITTI,
  ANTEPRIME, CREATOR, AZIENDA, COLLAB, LINK, STORICO, STORICO_ESTERNO,
  TROVA, AZIENDE_APERTE, PAGAMENTI
} from './dati.js?v=20260902-1555';

/* ------------------------------------------------------------
   STATO — riflesso nell'indirizzo
   ------------------------------------------------------------ */
const S = {
  lato: 'creator', vista: 'oggi', aperta: null, schedaCreator: null,
  ordina: 'clic', soloVerificati: true, soloInCerca: false,
  ordinaAzienda: 'budget', catAzienda: 'tutte', soloInCercaAz: false,
  inviateAperte: false,
  anteprime: [...AZIENDA.anteprime],
  passoProposta: 0, destinatario: null, bozza: null
};

function nuovaBozza(destinatario, verso) {
  const candidatura = verso === 'azienda';   // il creator si propone
  return {
    verso,                       // 'creator' = l'azienda scrive a un creator
    destinatario,
    formula: 'fisso',
    /* il creator parte dalla voce più bassa del suo listino: è già una
       cifra che ha deciso lui, e non da un numero inventato da noi */
    cachet: candidatura ? Math.min(...CREATOR.listino.map(l => l.p)) : 450,
    consegne: [{ formato: 'reel', quanti: 1, entro: '' }],
    diritti: 'organico', esclusiva: 'nessuna',
    consegnaEntro: '', note: '',

    /* lato azienda */
    prodotti: '', brief: '', nonDire: '', pubblicazioneEntro: '',

    /* lato creator */
    perche: '', idea: '', serve: '', disponibileDal: ''
  };
}

function leggiIndirizzo() {
  const p = new URLSearchParams(location.search);
  if (p.get('lato') === 'azienda') S.lato = 'azienda';
  const h = location.hash.slice(1);
  if (!h) return;
  const [vista, id] = h.split('/');
  /* Un indirizzo scritto a mano non deve lasciare la barra senza voce
     attiva: se la vista non esiste si torna su Oggi. */
  const valide = MENU[S.lato].map(m => m.k).concat('impostazioni', 'proposta');
  if (vista) S.vista = valide.includes(vista) ? vista : 'oggi';
  /* l'indirizzo è la verità: se non porta un id, quello che era aperto
     va chiuso — altrimenti tornando a #creator resta la scheda di prima */
  S.aperta = vista === 'collab' && id ? id.toUpperCase() : null;
  S.schedaCreator = vista === 'creator' && id ? decodeURIComponent(id) : null;
}
function scriviIndirizzo() {
  const h = S.aperta ? `#collab/${S.aperta}`
    : S.schedaCreator ? `#creator/${encodeURIComponent(S.schedaCreator)}`
    : `#${S.vista}`;
  if (location.hash !== h) history.replaceState(null, '', `?lato=${S.lato}${h}`);
}

const MENU = {
  creator: [
    { k: 'oggi',      ic: ICO.oggi,     t: 'Oggi',           h: 'Oggi',            s: 'Quello che aspetta te' },
    { k: 'collab',    ic: ICO.collab,   t: 'Collaborazioni', h: 'Collaborazioni',  s: 'Dalla richiesta all’incasso' },
    { k: 'aziende',   ic: ICO.proponi,  t: 'Aziende',        h: 'Aziende',         s: 'Proponiti a chi cerca creator come te' },
    { k: 'profilo',   ic: ICO.mediakit, t: 'Profilo',        h: 'Il tuo profilo',  s: 'Quello che vede un’azienda che ti apre' },
    { k: 'pagamenti', ic: ICO.banca,    t: 'Pagamenti',      h: 'Pagamenti',       s: 'Chi ti deve pagare, e dove' }
  ],
  azienda: [
    { k: 'oggi',    ic: ICO.oggi,         t: 'Oggi',           h: 'Oggi',              s: 'Quello che aspetta te' },
    { k: 'collab',  ic: ICO.collab,       t: 'Collaborazioni', h: 'Collaborazioni',    s: 'Accordi, consegne e pagamenti' },
    { k: 'creator', ic: ICO.trova,        t: 'Creator',        h: 'Trova un creator',  s: 'Filtra per risultato, non per follower' },
    { k: 'link',    ic: ICO.attribuzione, t: 'Link e clic',     h: 'Link e clic',       s: 'Quante persone ogni creator ha portato sul tuo sito' }
  ]
};

const el = id => document.getElementById(id);
const conclusa = c => c.passo >= PASSI.length;

/* Ognuno vede solo le proprie: un'azienda non deve trovarsi in casa le
   collaborazioni che un creator ha fatto con altri, e viceversa. Finché
   i dati erano tutti di Giulia la cosa non si notava; appena se ne
   aggiunge una fra Nutriva e un altro creator, si nota subito. */
const mie = () => COLLAB.filter(c => S.lato === 'creator'
  ? c.creator === CREATOR.nome
  : c.azienda === AZIENDA.nome);
const aperte = () => mie().filter(c => !conclusa(c));

/* ------------------------------------------------------------
   DI CHI È LA PALLA
   ------------------------------------------------------------ */
function turno(c) {
  if (conclusa(c)) return { chi: null, frase: 'Non c’è più niente da fare.' };
  switch (c.passo) {
    case 0: return { chi: c.origine === 'azienda' ? 'creator' : 'azienda',
                     frase: 'La richiesta è arrivata. Si accetta, si rilancia o si rifiuta.' };
    case 1:
    case 2: return { chi: 'creator', frase: 'L’accordo è firmato. Mancano dei contenuti da consegnare.' };
    case 3: return { chi: 'azienda', frase: 'Tutto consegnato. Guarda il lavoro e approvalo, o chiedi una modifica.' };
    case 4: return { chi: 'azienda', frase: 'Lavoro approvato. Ora il bonifico, con le coordinate qui sotto.' };
    default: return { chi: 'creator', frase: 'L’azienda dichiara di aver pagato. Conferma quando i soldi arrivano.' };
  }
}

function segnaleTurno(c) {
  const t = turno(c);
  if (!t.chi) return `<span class="turno finito"><i></i>conclusa</span>`;
  const mio = t.chi === S.lato;
  const nome = t.chi === 'creator' ? c.creator.split(' ')[0] : c.azienda;
  return `<span class="turno ${mio ? 'tu' : 'loro'}"><i></i>${mio ? 'tocca a te' : 'tocca a ' + nome}</span>`;
}

const percorso = (c) => {
  const finita = conclusa(c);
  return `<span class="percorso" aria-label="${finita ? 'Conclusa' : `Passo ${c.passo + 1} di ${PASSI.length}`}">${
    PASSI.map((_, i) => `<span class="tappa ${i < c.passo || finita ? 'fatta' : i === c.passo ? 'ora' : ''}">
      <span class="pallino"></span>${i < PASSI.length - 1 ? '<span class="tratto"></span>' : ''}
    </span>`).join('')}</span>`;
};

/* ------------------------------------------------------------
   PEZZI
   ------------------------------------------------------------ */
/* ------------------------------------------------------------
   L'IMMAGINE DI UN PROFILO
   Un tondo pieno del colore del lato, con dentro la sagoma di chi
   è: ambra e una persona per il creator, acquamarina e una vetrina
   per l'azienda. Le due metà sono il marchio di Leucoteo, non
   l'identità di qualcuno — usarle come avatar faceva sembrare
   tutti la stessa cosa, ed erano illeggibili a 34 px.
   ------------------------------------------------------------ */
const SAGOMA = {
  creator: `<svg class="sag" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="8.1" r="4.05"/>
    <path d="M12 13.6c-4.3 0-7.7 2.9-8 6.6-.03.4.3.8.7.8h14.6c.4 0 .73-.4.7-.8-.3-3.7-3.7-6.6-8-6.6Z"/></svg>`,
  azienda: `<svg class="sag" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M3.4 3.6h17.2l1.15 3.75a3.05 3.05 0 0 1-5.87.92 3.05 3.05 0 0 1-6.06 0 3.05 3.05 0 0 1-5.87-.92L3.4 3.6Z"/>
    <path d="M4.9 12.05V19.7c0 .4.3.7.7.7h3.55v-4.45h5.7v4.45h3.55c.4 0 .7-.3.7-.7v-7.65a4.75 4.75 0 0 1-3.55-1.06 4.75 4.75 0 0 1-6.55 0 4.75 4.75 0 0 1-4.1 1.06Z"/></svg>`
};

function ava(tipo, misura = '', foto = null) {
  const t = tipo === 'azienda' ? 'azienda' : 'creator';
  if (foto) return `<span class="ava foto ${misura}"><img src="${foto}" alt=""></span>`;
  return `<span class="ava ${t === 'azienda' ? 'azi' : 'cre'} ${misura}">${SAGOMA[t]}</span>`;
}

/* chi sta dall'altra parte di una collaborazione, visto da me */
const altroLato = () => S.lato === 'creator' ? 'azienda' : 'creator';
const pil = (t, c = '') => `<span class="pil ${c}">${t}</span>`;
const titoloSez = (t, extra = '') => `<div class="sez-t"><h2>${t}</h2><span class="l"></span>${extra}</div>`;

/* --- un gruppo di filtri a scelta singola ---------------------
   Sul desktop è una fila di pastiglie: si vedono tutte le scelte
   insieme e ne basta una per cambiare. Su un telefono la stessa
   fila diventa una striscia da far scorrere con il dito — tante
   pastiglie enormi buttate lì, e nessuna che si vede per intera.
   Quindi sotto gli 860 px lo stesso gruppo si presenta come un
   menù a tendina: una riga sola, il valore scelto sempre in
   chiaro. Le pastiglie restano nel documento e restano la fonte
   della verità: la tendina si limita a premerle.
   `voci` è una lista di { k, t }. --------------------------- */
const gruppoFiltri = (etichetta, attributo, voci, attivo) => {
  const scelta = voci.find(v => v.k === attivo) || voci[0];
  return `
  <div class="gruppo-filtri">
    <span class="uc gri">${etichetta}</span>
    <div class="filtri">
      ${voci.map(v => `<button class="filtro" data-${attributo}="${v.k}"
        aria-pressed="${v.k === attivo}">${v.t}</button>`).join('')}
    </div>
    <div class="tendina">
      <select data-tendina="${attributo}" aria-label="${etichetta}">
        ${voci.map(v => `<option value="${v.k}"${v.k === scelta.k ? ' selected' : ''}>${v.t}</option>`).join('')}
      </select>
      <span class="freccia" aria-hidden="true">${ICO.giu ? ICO.giu() : '&#9662;'}</span>
    </div>
  </div>`;
};

const stelle = (voto, quanti = null) => voto ? `<span class="stelle">${
  [1,2,3,4,5].map(n => {
    const piena = n <= Math.round(voto);
    return `<span class="${piena ? '' : 'spenta'}">${ICO.stella(piena)}</span>`;
  }).join('')
  }<span class="voto">${voto.toFixed(1).replace('.', ',')}${quanti ? ` · ${quanti}` : ''}</span></span>` : '<span class="gri sm">nessun giudizio</span>';

/* Un numero non è una scheda: è una voce di una fascia.
   Le schede le teniamo per gli oggetti su cui si può agire — una
   collaborazione, un creator, un documento. */
const dato = (icona, k, v, d, forte = false) => `
  <div class="voce ${forte ? 'forte' : ''} rise">
    <div class="k">${icona()}<span>${k}</span></div>
    <div class="v ${forte ? 'acc' : ''}">${v}</div><div class="d">${d}</div>
  </div>`;

const fascia = (...voci) => `<div class="fascia">${voci.join('')}</div>`;

const daFare = ({ icona, cod, titolo, testo, azione, tono = '' }) => `
  <div class="compito ${tono} rise">
    <span class="bollo ${tono === 'allerta' ? 'allerta' : ''}">${icona()}</span>
    <div class="crescita">${cod ? `<span class="cod mono ${/^C-\d/.test(cod) ? 'id' : ''}">${cod}</span>` : ''}
      <h3>${titolo}</h3><p>${testo}</p></div>
    <div class="mossa">${azione}</div>
  </div>`;

const vuoto = (testo, azione = '') => `
  <div class="vuoto rise"><div style="max-width:260px;margin:0 auto 22px">${ILLO.vuoto()}</div>
    <p>${testo}</p>${azione ? `<div style="margin-top:20px">${azione}</div>` : ''}</div>`;

/* ------------------------------------------------------------
   IL SEGNALE DI RICERCA
   Senza, l'elenco mente: un'azienda che ha finito il budget
   resterebbe lì a farsi scrivere, e un creator che non ha tempo
   continuerebbe a ricevere proposte da rifiutare. Ha una
   scadenza apposta — uno stato che non scade è uno stato che
   dopo tre mesi non vuol dire più niente.
   ------------------------------------------------------------ */
const mioStato = () => S.lato === 'creator' ? CREATOR.inCerca : AZIENDA.inCerca;

const segnaleRicerca = () => {
  const st = mioStato();
  const attivo = st.attivo;
  return `
  <div class="cerca-stato ${attivo ? 'acceso' : ''}" data-cerca-blocco>
    <div class="riga" style="gap:11px;flex-wrap:nowrap">
      <span class="spia" aria-hidden="true"></span>
      <span class="crescita" style="min-width:0">
        <span class="t">${attivo ? 'In cerca di collaborazioni' : 'Non in cerca'}</span>
        <span class="d">${attivo
          ? `Sei in cima ai risultati · fino al ${st.scadeIl}`
          : 'Il profilo resta, ma non compari nelle ricerche'}</span>
      </span>
      <button class="interruttore" data-cerca role="switch" aria-checked="${attivo}"
        aria-label="${attivo ? 'Smetti di cercare collaborazioni' : 'Mettiti in cerca di collaborazioni'}">
        <span class="pallina"></span>
      </button>
    </div>
  </div>`;
};

/* ------------------------------------------------------------
   DA LEGGERE — quello che l'app ha da dire quando non c'è
   niente da fare. È il pezzo che decide se qualcuno torna:
   una schermata che non ha mai niente da dire si smette di
   aprire dopo tre volte.
   ------------------------------------------------------------ */
function daLeggere() {
  const creator = S.lato === 'creator';
  const st = mioStato();
  const voci = [];

  /* chi ti ha guardato: il richiamo più forte che esista, ed è gratis */
  if (creator && CREATOR.profiloVisto) voci.push(daFare({
    icona: ICO.occhio, cod: 'questa settimana',
    titolo: `${CREATOR.profiloVisto} aziende hanno aperto il tuo profilo`,
    testo: 'Nessuna ti ha ancora scritto. Spesso basta muoversi per primi: una proposta scritta bene arriva prima di un messaggio in privato.',
    azione: `<button class="btn p" data-vai="aziende">Proponiti tu</button>` }));

  /* lo stato spento va detto, non nascosto in un angolo */
  if (!st.attivo) voci.push(daFare({
    icona: ICO.attesa, cod: 'visibilità', tono: 'allerta',
    titolo: 'Non stai comparendo nelle ricerche',
    testo: creator
      ? 'Il tuo profilo esiste ma le aziende non lo trovano. Rimettiti in cerca quando torni disponibile.'
      : 'Il tuo annuncio non è visibile ai creator. Rimettilo attivo quando hai di nuovo budget.',
    azione: `<button class="btn p ${creator ? '' : 'due'}" data-cerca>Rimettiti in cerca</button>` }));

  /* la scadenza dello stato: è quello che tiene vero l'elenco */
  if (st.attivo && st.scadeIl) voci.push(daFare({
    icona: ICO.calendario, cod: 'scadenza',
    titolo: `Sei in cerca fino al ${st.scadeIl}`,
    testo: 'Dopo, ti chiediamo di confermare. Serve a tenere l’elenco vero: senza scadenza si riempirebbe di profili che non cercano più niente.',
    azione: `<button class="btn p ghost" data-avviso="Confermato per altri 30 giorni">Conferma ora</button>` }));

  /* qualcosa di nuovo da guardare, sempre */
  if (creator) {
    const nuove = AZIENDE_APERTE.filter(a => a.inCerca).length;
    if (nuove) voci.push(daFare({
      icona: ICO.proponi, cod: 'nella tua nicchia',
      titolo: `${nuove} aziende stanno cercando creator adesso`,
      testo: 'Hanno detto cosa cercano e con che budget. I posti sono contati e gli annunci scadono.',
      azione: `<button class="btn p" data-vai="aziende">Guarda chi cerca</button>` }));
  } else {
    const liberi = TROVA.filter(t => t.inCerca && t.ver).length;
    if (liberi) voci.push(daFare({
      icona: ICO.trova, cod: 'disponibili ora',
      titolo: `${liberi} creator verificati sono in cerca di collaborazioni`,
      testo: 'Si sono dichiarati disponibili questo mese: sono quelli che rispondono.',
      azione: `<button class="btn p due" data-vai="creator">Trova un creator</button>` }));
  }

  if (!voci.length) return '';
  return titoloSez('da sapere') + `<div class="compiti">${voci.join('')}</div>`;
}

/* Quanto costa Leucoteo, in beta.
   Deliberatamente non c'è nessun contatore che scende: un numero
   che cala prepara a un prezzo, e in beta l'unica cosa che conta
   è che la gente entri e resti. Quando un prezzo ci sarà, si
   dirà molto prima che scatti — e si dirà qui. */
const contatoreSoglia = (esteso = false) => {
  if (!esteso) return `
  <div class="scheda dato rise">
    <div class="riga tra" style="gap:14px;flex-wrap:nowrap">
      <span class="k crescita">Quanto ti costa Leucoteo</span>
      ${pil('beta', 'ok')}
    </div>
    <div class="v acc">${eur2(0)}</div>
    <div class="d">Zero commissioni su tutto, per tutti. Nessuna carta richiesta.</div>
  </div>`;

  return `
  <div class="blocco rise">
    <h3>quanto costa leucoteo</h3>
    <p class="sotto">Leucoteo è in beta: è gratis, e non tratteniamo nessuna percentuale su
      niente. Dentro non passa denaro, quindi non ci sarebbe nemmeno da dove trattenerla.</p>

    <div class="tabulato" style="margin-top:22px">
      <div class="tab-r"><span class="k">Quanto paghi adesso</span><span class="g"></span>
        <span class="n acc">${eur2(0)}</span></div>
      <div class="tab-r"><span class="k">Commissione sulle collaborazioni</span><span class="g"></span>
        <span class="n">nessuna</span></div>
      <div class="tab-r"><span class="k">Canone mensile</span><span class="g"></span>
        <span class="n">nessuno</span></div>
      <div class="tab-r"><span class="k">Carta di credito richiesta</span><span class="g"></span>
        <span class="n">nessuna</span></div>
      <div class="tab-r tot"><span class="k">Quanto paga il creator</span><span class="g"></span>
        <span class="n">${eur2(0)}, sempre</span></div>
    </div>

    <div class="nota due" style="margin-top:18px">
      <b>E quando finirà la beta?</b> Un prezzo arriverà, ma non domani e non di sorpresa:
      te lo diremo con molto anticipo, sarà una commissione di servizio fatturata all'azienda
      con IVA, e i creator non pagheranno comunque niente. Fino ad allora non ti chiediamo
      la carta, perché non ci sarebbe niente da addebitare.
    </div>
  </div>`;
};

const campo = (id, etichetta, valore, opzioni = {}) => `
  <div class="campo-g">
    <label class="etichetta" for="${id}">${etichetta}</label>
    ${opzioni.lungo
      ? `<textarea class="campo" id="${id}" placeholder="${opzioni.segna || ''}" data-bozza="${opzioni.chiave || ''}">${valore || ''}</textarea>`
      : `<input class="campo" id="${id}" value="${valore ?? ''}" placeholder="${opzioni.segna || ''}"
           ${opzioni.tipo ? `inputmode="${opzioni.tipo}"` : ''} data-bozza="${opzioni.chiave || ''}">`}
    ${opzioni.aiuto ? `<span class="aiuto">${opzioni.aiuto}</span>` : ''}
  </div>`;

function rigaCollab(c) {
  const altro = S.lato === 'creator' ? c.azienda : c.creator;
  const ini = S.lato === 'creator' ? c.aziendaIni : c.creatorIni;
  const fine = conclusa(c);
  return `
  <button class="collab registro stretto ${fine ? 'allineato' : ''} rise" data-apri="${c.id}">
    <div class="cap">
      ${ava(altroLato())}
      <span class="crescita" style="min-width:0">
        <span class="ti">${c.titolo}</span>
        <span class="me">${altro} · ${fine ? c.scadenzaConsegna : 'consegna entro il ' + c.scadenzaConsegna}</span>
      </span>
      <span class="soldi">
        <span class="imp">${eur(c.cachet)}</span>
        <span class="sotto">${FORMULE.find(f => f.k === c.formula)?.t.toLowerCase() || ''}</span>
      </span>
    </div>
    <div class="fondo">${percorso(c)}
      <span class="riga" style="gap:14px">${segnaleTurno(c)}
        ${c.link ? `<span class="mono xs gri">${num(c.link.clic)} clic portati</span>` : ''}</span>
    </div>
  </button>`;
}

/* ============================================================
   VISTE · CREATOR
   ============================================================ */
const V = { creator: {}, azienda: {} };

V.creator.oggi = () => {
  const miei = aperte().filter(c => turno(c).chi === 'creator');
  const attesi = PAGAMENTI.filter(p => p.s === 'atteso').reduce((s, p) => s + p.imp, 0);
  const incassati = PAGAMENTI.filter(p => p.s === 'incassato').reduce((s, p) => s + p.imp, 0);

  const compiti = miei.map(c => {
    if (c.passo === 0) return daFare({
      icona: ICO.contratto, cod: c.id, titolo: `${c.azienda} ti propone ${eur(c.cachet)}`,
      testo: `${c.titolo}. Rispondi entro il ${c.rispostaEntro || '—'}: puoi accettare, rilanciare o rifiutare.`,
      azione: `<button class="btn p" data-apri="${c.id}">Leggi la richiesta</button>` });
    if (c.passo <= 2) return daFare({
      icona: ICO.consegna, cod: c.id, titolo: 'Manca un contenuto da consegnare',
      testo: `Consegna entro il ${c.scadenzaConsegna}. ${c.azienda} paga dopo l’approvazione.`,
      azione: `<button class="btn p" data-apri="${c.id}">Vai a consegnare</button>` });
    return daFare({
      icona: ICO.banca, cod: c.id, titolo: `${c.azienda} dichiara di averti pagato`,
      testo: `Controlla il conto e conferma quando i soldi sono arrivati davvero.`,
      azione: `<button class="btn p" data-apri="${c.id}">Conferma l’incasso</button>` });
  }).join('');

  return `
  ${titoloSez('tocca a te', miei.length ? `<span class="conta-sez">${miei.length}</span>` : '')}
  ${miei.length ? `<div class="compiti">${compiti}</div>`
    : vuoto('Niente da fare adesso. Le collaborazioni aperte stanno aspettando l’altra parte.')}

  ${daLeggere()}

  ${titoloSez('denaro · quest’anno')}
  ${fascia(
    dato(ICO.attesa, 'Da incassare', eur2(attesi), 'Su collaborazioni ancora aperte', true),
    dato(ICO.fatto, 'Incassato', eur2(incassati), 'Confermato da te'),
    dato(ICO.storico, 'Persone portate', num(STORICO.clic), `sui tuoi link · ${STORICO.aziende} aziende`)
  )}

  ${titoloSez('collaborazioni aperte')}
  ${aperte().length ? aperte().map(rigaCollab).join('')
    : vuoto('Nessuna collaborazione aperta.',
        `<button class="btn p" data-vai="aziende">Proponiti a un’azienda</button>`)}`;
};

/* Una proposta che ho mandato io e che aspetta ancora una risposta non
   è una collaborazione aperta: non c'è niente da fare, si aspetta. Ma
   non è nemmeno niente — sapere cosa hai in giro serve, e serve anche
   sapere da quanto. Sta in un cassetto sotto le aperte, chiuso di suo. */
const inviateInAttesa = () => mie().filter(c =>
  c.passo === 0 && turno(c).chi && turno(c).chi !== S.lato);

/* quelle in attesa non contano fra le aperte: lì ci vanno le cose che
   sono davvero partite */
const aperteVere = () => aperte().filter(c => !inviateInAttesa().includes(c));

V.creator.collab = () => {
  const chiuse = mie().filter(conclusa);
  const attesa = inviateInAttesa();
  const vive = aperteVere();
  const creator = S.lato === 'creator';

  return `
  ${titoloSez('aperte', `<span class="conta-sez">${vive.length}</span>`)}
  ${vive.length ? vive.map(rigaCollab).join('')
    : vuoto('Nessuna collaborazione aperta.',
        `<button class="btn p ${creator ? '' : 'due'}" data-vai="${creator ? 'aziende' : 'creator'}">
          ${creator ? 'Proponiti a un’azienda' : 'Trova un creator'}</button>`)}

  <div class="cassetto rise ${S.inviateAperte ? 'aperto' : ''}">
    <button class="cassetto-t" data-inviate aria-expanded="${S.inviateAperte}">
      <span class="freccia" aria-hidden="true">${ICO.avanti()}</span>
      <span class="crescita">Visualizza le proposte inviate</span>
      <span class="quante">${attesa.length}</span>
    </button>
    ${S.inviateAperte ? `<div class="cassetto-c">
      ${attesa.length ? `
        <p class="gri sm" style="margin-bottom:16px">${creator
          ? 'Candidature partite da te. Finché non rispondono non c’è niente da fare: se scade la data, si può rimandare.'
          : 'Richieste partite da te. Finché il creator non risponde non c’è niente da fare.'}</p>
        ${attesa.map(rigaAttesa).join('')}`
      : `<p class="gri sm">Nessuna proposta in attesa di risposta.</p>`}
    </div>` : ''}
  </div>

  ${chiuse.length ? titoloSez('concluse') + chiuse.map(rigaCollab).join('') : ''}`;
};
V.azienda.collab = V.creator.collab;

/* la riga di una proposta in attesa: non ha un percorso da mostrare
   — non è partito niente — ma ha una data, ed è quella che conta */
function rigaAttesa(c) {
  const altro = S.lato === 'creator' ? c.azienda : c.creator;
  return `
  <button class="collab registro stretto in-attesa" data-apri="${c.id}">
    <div class="cap">
      ${ava(altroLato())}
      <span class="crescita" style="min-width:0">
        <span class="ti">${c.titolo}</span>
        <span class="me">${altro}${c.inviata ? ' · inviata il ' + c.inviata : ''}</span>
      </span>
      <span class="soldi">
        <span class="imp">${eur(c.cachet)}</span>
        <span class="sotto">${FORMULE.find(f => f.k === c.formula)?.t.toLowerCase() || ''}</span>
      </span>
    </div>
    <div class="fondo">
      <span class="riga" style="gap:12px">
        ${pil('in attesa di risposta', 'corso')}
        ${c.rispostaEntro ? `<span class="mono xs gri">risponde entro il ${c.rispostaEntro}</span>` : ''}
      </span>
      <span class="gri xs">${altro} non ha ancora aperto</span>
    </div>
  </button>`;
}

/* --- il creator si propone a un'azienda --- */
V.creator.aziende = () => {
  /* il budget è scritto come «300-800 €»: per ordinarlo serve un numero,
     e il minimo della forbice è quello che un creator guarda davvero */
  const budgetMin = a => parseInt(String(a.budget).replace(/\./g, '').match(/\d+/)?.[0] || 0, 10);
  const liberi = a => Math.max(0, a.posti - a.presi);

  const categorie = [...new Set(AZIENDE_APERTE.map(a => a.cat))];

  let lista = AZIENDE_APERTE
    .filter(a => S.catAzienda === 'tutte' ? true : a.cat === S.catAzienda)
    .filter(a => S.soloInCercaAz ? a.inCerca : true);

  const ordini = {
    budget:   (x, y) => budgetMin(y) - budgetMin(x),
    posti:    (x, y) => liberi(y) - liberi(x),
    risposta: (x, y) => y.risposta - x.risposta,
    collab:   (x, y) => y.collab - x.collab
  };
  /* chi cerca sta sopra, come per i creator: un annuncio chiuso non è
     una proposta, è un profilo da guardare */
  lista = [...lista].sort((x, y) =>
    (y.inCerca - x.inCerca) || (ordini[S.ordinaAzienda] || ordini.budget)(x, y));

  const etichette = { budget: 'budget più alto', posti: 'posti liberi',
                      risposta: 'chi risponde di più', collab: 'più esperienza' };

  return `
  <div class="nota rise" style="margin-bottom:22px;display:flex;gap:14px;align-items:flex-start">
    <span class="bollo">${ICO.proponi()}</span>
    <span><b>Non aspettare che ti scrivano.</b> Queste aziende hanno detto cosa cercano e con
      quale budget, e quanti posti restano. Una proposta scritta bene, con i tuoi numeri
      allegati, vale più di dieci messaggi in privato.</span>
  </div>

  <div class="riga rise" style="gap:10px;margin-bottom:14px">
    <input class="campo crescita" style="max-width:320px" placeholder="Cerca per nome o prodotto" aria-label="Cerca aziende">
  </div>

  <div class="barra-filtri rise">
    ${gruppoFiltri('nicchia', 'cat-azienda',
      [{ k: 'tutte', t: 'tutte' }].concat(categorie.map(c => ({ k: c, t: c }))), S.catAzienda)}
    <span class="divisore" aria-hidden="true"></span>
    ${gruppoFiltri('ordina per', 'ordina-azienda',
      Object.keys(etichette).map(k => ({ k, t: etichette[k] })), S.ordinaAzienda)}
    <span class="divisore" aria-hidden="true"></span>
    <div class="gruppo-filtri">
      <span class="uc gri">mostra solo</span>
      <div class="filtri interruttori">
        <button class="filtro" data-incerca-az aria-pressed="${S.soloInCercaAz}">chi cerca adesso</button>
      </div>
    </div>
  </div>

  <div class="griglia-3">
    ${lista.map(a => `
    <div class="trovato rise ${a.inCerca ? '' : 'spento'}">
      <div class="cap">${ava('azienda')}
        <div class="crescita"><div class="n">${a.n}</div><div class="h">${a.cat} · ${a.sito}</div></div>
      </div>
      <div class="riga" style="margin-top:14px;gap:6px;flex-wrap:wrap">
        ${a.ver ? pil('verificata', 'ok') : pil('non verificata', 'male')}
        ${a.inCerca ? pil(`${liberi(a)} posti su ${a.posti}`, 'corso') : ''}
      </div>
      ${a.inCerca ? '' : `<p class="fuori-cerca">Attualmente non in cerca di collaborazioni</p>`}
      <div class="num tabulato">
        <div class="tab-r"><span class="k">Cerca</span><span class="g"></span><span class="n">${a.cerca}</span></div>
        <div class="tab-r"><span class="k">Budget</span><span class="g"></span><span class="n acc">${a.budget}</span></div>
        <div class="tab-r"><span class="k">Risponde</span><span class="g"></span>
          <span class="n ${a.risposta >= 80 ? '' : 'giu'}">${a.risposta}%</span></div>
        ${a.inCerca && a.scadeIl ? `<div class="tab-r"><span class="k">Chiude</span><span class="g"></span>
          <span class="n">${a.scadeIl}</span></div>` : ''}
      </div>
      <p class="gri sm" style="margin-top:14px">${a.prodotti}</p>
      <div class="coda"><button class="btn p pieno" data-proponi-a="${a.n}"
        ${a.inCerca ? '' : 'disabled'}>${a.inCerca ? 'Proponiti' : 'Non sta cercando'}</button></div>
    </div>`).join('')}
  </div>

  ${lista.length ? '' : vuoto('Nessuna azienda con questi filtri.',
    `<button class="btn p" data-cat-azienda="tutte">Togli i filtri</button>`)}`;
};

/* --- il profilo, modificabile --- */
V.creator.profilo = () => {
  const c = CREATOR;
  return `
  <div class="riservatezza rise" style="margin-bottom:24px">
    <span class="bollo" style="background:rgba(var(--bra-rgb),.12);color:var(--bra-hi)">${ICO.occhio()}</span>
    <span><b>Questa è la pagina che vede un’azienda.</b> Tutto quello che modifichi qui
      compare subito nel link pubblico. Lo storico si può nascondere in Impostazioni.</span>
  </div>

  <div class="tremezzo">
    <div>
      <div class="blocco rise">
        <div class="riga" style="gap:22px;align-items:flex-start;flex-wrap:nowrap">
          <span class="ritratto">
            ${ava('creator', 'xg', c.foto)}
            <label class="cambia" title="Cambia la foto">${ICO.foto()}
              <input type="file" accept="image/*" id="fFoto" hidden></label>
          </span>
          <div class="crescita campi">
            ${campo('pNome', 'Nome pubblico', c.nome, { chiave: 'nome' })}
            ${campo('pNicchia', 'Di cosa parli', c.nicchia, { chiave: 'nicchia' })}
          </div>
        </div>
        <div class="campi" style="margin-top:20px">
          ${campo('pBio', 'Presentazione', c.bio, { lungo: true, chiave: 'bio',
            aiuto: 'Due righe. Le aziende leggono questa e i numeri, non altro.' })}
        </div>
        <div class="campi due-col" style="margin-top:4px">
          ${campo('pCitta', 'Città', c.citta, { chiave: 'citta' })}
          ${campo('pRisposta', 'Rispondi entro', c.rispondeEntro, { chiave: 'rispondeEntro' })}
        </div>
      </div>

      <div class="blocco rise">
        <h3>il listino</h3>
        <p class="sotto">È il punto di partenza, non un prezzo fisso. Un’azienda che vede
          un listino chiaro scrive più volentieri.</p>
        <div class="campi" style="margin-top:20px">
          ${c.listino.map((l, i) => `
          <div class="riga-consegna">
            ${campo('lT' + i, 'Cosa', l.t, {})}
            ${campo('lP' + i, 'Prezzo', l.p, { tipo: 'numeric' })}
            ${campo('lN' + i, 'Include', l.n, {})}
            <button class="togli" data-avviso="Voce rimossa" aria-label="Togli">${ICO.scartato()}</button>
          </div>`).join('')}
        </div>
        <button class="btn p ghost" style="margin-top:18px" data-avviso="Voce aggiunta">${ICO.piu()} Aggiungi una voce</button>
      </div>

      <div class="blocco rise">
        <h3>numeri verificati</h3>
        <p class="sotto">Letti dalle piattaforme, non scritti da te. Non si possono modificare a mano:
          è esattamente per questo che valgono.</p>
        <div class="scheda" style="margin-top:20px">
          <div class="riga tra"><h3>instagram</h3>${pil('verificato', 'ok')}</div>
          <div class="tabulato" style="margin-top:14px">
            <div class="tab-r"><span class="k">Follower</span><span class="g"></span><span class="n">${num(c.ig.follower)}</span></div>
            <div class="tab-r"><span class="k">Interazione</span><span class="g"></span><span class="n">${c.ig.er}%</span></div>
            <div class="tab-r"><span class="k">Copertura</span><span class="g"></span><span class="n">${num(c.ig.copertura)}</span></div>
            <div class="tab-r tot"><span class="k">Letti il</span><span class="g"></span><span class="n">${c.ig.sync}</span></div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div class="scheda faldone cre rise" data-cod="il tuo link">
        <div class="campo mono" style="font-size:12.5px;overflow:auto;white-space:nowrap">leucoteo.it/g/giulia-fit</div>
        <div class="pila" style="gap:8px;margin-top:12px">
          <a class="btn pieno" href="mediakit.html" target="_blank" rel="noopener">${ICO.occhio()} Apri l’anteprima</a>
          <button class="btn pieno ghost" data-avviso="Link copiato">Copia il link</button>
        </div>
      </div>

      <div class="scheda rise" style="margin-top:16px">
        <h3>come ti giudicano</h3>
        <div style="margin-top:14px">${stelle(STORICO.giudizioMedio, STORICO.giudizi + ' giudizi')}</div>
        <div class="tabulato" style="margin-top:16px">
          <div class="tab-r"><span class="k">Consegne in tempo</span><span class="g"></span><span class="n acc">${STORICO.consegnaInTempo}%</span></div>
          <div class="tab-r"><span class="k">Collaborazioni concluse</span><span class="g"></span><span class="n">${STORICO.collaborazioni}</span></div>
          <div class="tab-r"><span class="k">Persone portate</span><span class="g"></span><span class="n">${num(STORICO.clic)}</span></div>
        </div>
        <button class="btn p ghost pieno" style="margin-top:16px" data-vai="impostazioni">Chi può vedere lo storico</button>
      </div>

      <div class="scheda rise" style="margin-top:16px">
        <div class="riga" style="gap:12px"><span class="bollo ${c.inCerca.attivo ? '' : 'spenta'}">${ICO.calendario()}</span>
          <h3 class="crescita">disponibilità</h3></div>
        <div style="margin-top:16px">${segnaleRicerca()}</div>
        <p class="gri xs" style="margin-top:14px">${c.inCerca.attivo
          ? `Le aziende ti vedono in cima. Confermiamo lo stato il ${c.inCerca.scadeIl}.`
          : 'Sulle schede compare «attualmente non in cerca di collaborazioni». Il profilo resta apribile.'}</p>
      </div>

      <div class="scheda rise" style="margin-top:16px">
        <div class="riga" style="gap:12px"><span class="bollo">${ICO.occhio()}</span>
          <h3 class="crescita">chi ti ha guardato</h3></div>
        <div class="tabulato" style="margin-top:14px">
          <div class="tab-r"><span class="k">Aziende, ultimi 7 giorni</span><span class="g"></span>
            <span class="n acc">${CREATOR.profiloVisto}</span></div>
          <div class="tab-r"><span class="k">Tasso di risposta</span><span class="g"></span>
            <span class="n">${CREATOR.tassoRisposta}%</span></div>
        </div>
        <p class="gri xs" style="margin-top:12px">Il tasso di risposta è pubblico: le aziende lo
          vedono. Rispondere anche per dire di no ti tiene in alto.</p>
      </div>
    </div>
  </div>`;
};

/* --- pagamenti: dove ti pagano, e chi deve ancora farlo --- */
V.creator.pagamenti = () => {
  const b = CREATOR.banca;
  const attesi = PAGAMENTI.filter(p => p.s === 'atteso');
  const fatti = PAGAMENTI.filter(p => p.s === 'incassato');
  return `
  <div class="riservatezza rise" style="margin-bottom:24px">
    <span class="bollo" style="background:rgba(var(--bra-rgb),.12);color:var(--bra-hi)">${ICO.scudo()}</span>
    <span><b>Dentro Leucoteo non passa denaro.</b> L’azienda ti paga con un bonifico normale.
      Le tue coordinate le vede solo l’azienda della collaborazione, e solo dopo aver approvato
      il lavoro. Non compaiono mai nelle ricerche. <a href="termini.html" target="_blank" rel="noopener"
      style="color:var(--bra-hi);text-decoration:underline">Come funziona</a></span>
  </div>

  <div class="tremezzo">
    <div>
      <div class="blocco rise">
        <h3>dove ti pagano</h3>
        <p class="sotto">Queste coordinate finiscono nel documento di pagamento che vede l’azienda.
          Controlla che siano giuste: un IBAN sbagliato è la causa numero uno dei ritardi.</p>
        <div class="campi" style="margin-top:22px">
          ${campo('bInt', 'Intestatario del conto', b.intestatario, { aiuto: 'Deve coincidere con chi firma l’accordo.' })}
          <div class="campo-g">
            <label class="etichetta" for="bIban">IBAN</label>
            <div class="iban"><span id="bIbanTesto">${b.iban}</span>
              <button class="btn p ghost copia" data-avviso="IBAN copiato">Copia</button></div>
            <span class="aiuto">${b.banca} · aggiornato il ${b.aggiornato}
              ${b.verificato ? '· <span style="color:var(--bra-hi)">coordinate verificate</span>' : ''}</span>
          </div>
        </div>
        <p class="gri xs" style="margin-top:16px">Il documento che viene generato a ogni pagamento
          dipende da come hai risposto sulla partita IVA.
          <button class="btn p ghost" data-vai="impostazioni" style="font-size:12.5px">Cambia i dati fiscali</button></p>
        <div class="riga" style="margin-top:20px;gap:8px">
          <button class="btn p" data-avviso="Coordinate aggiornate">Salva</button>
          <button class="btn p ghost" data-avviso="Nessuna modifica">Annulla</button>
        </div>
      </div>

    </div>

    <div>
      <div class="scheda rise">
        <h3>da incassare</h3>
        <div class="tabulato" style="margin-top:14px">
          ${attesi.map(p => `<div class="tab-r"><span class="k">${p.t}</span><span class="g"></span>
            <span class="n">${eur2(p.imp)}</span></div>`).join('')}
          <div class="tab-r tot"><span class="k">Totale atteso</span><span class="g"></span>
            <span class="n">${eur2(attesi.reduce((s, p) => s + p.imp, 0))}</span></div>
        </div>
      </div>

      <div class="scheda rise" style="margin-top:16px">
        <h3>già incassato</h3>
        <div class="tabulato" style="margin-top:14px">
          ${fatti.map(p => `<div class="tab-r"><span class="k">${p.t} <span class="gri xs">— ${p.d}</span></span>
            <span class="g"></span><span class="n acc">${eur2(p.imp)}</span></div>`).join('')}
        </div>
      </div>

      <div class="scheda rise" style="margin-top:16px">
        <h3>documenti</h3>
        <div class="tabulato" style="margin-top:12px">
          <div class="tab-r"><span class="k">Ricevuta 04/2026</span><span class="g"></span>
            <span class="n"><button class="btn p ghost" data-avviso="PDF scaricato">PDF</button></span></div>
          <div class="tab-r"><span class="k">Ricevuta 03/2026</span><span class="g"></span>
            <span class="n"><button class="btn p ghost" data-avviso="PDF scaricato">PDF</button></span></div>
        </div>
      </div>
    </div>
  </div>`;
};

/* ============================================================
   VISTE · AZIENDA
   ============================================================ */
V.azienda.oggi = () => {
  const miei = aperte().filter(c => turno(c).chi === 'azienda');
  const clicTot = LINK.reduce((s, l) => s + l.clic, 0);
  const clic7g = LINK.reduce((s, l) => s + l.clic7g, 0);
  const daPagare = aperte().filter(c => c.passo === 4).reduce((s, c) => s + conto(c).lordo, 0);
  const impegnato = aperte().filter(c => c.passo >= 1).reduce((s, c) => s + conto(c).lordo, 0);

  const compiti = miei.map(c => {
    if (c.passo === 3) return daFare({
      icona: ICO.consegna, cod: c.id, titolo: `${c.creator.split(' ')[0]} ha consegnato tutto`,
      testo: 'Guarda il lavoro e approvalo. Se non fai niente, si approva da solo fra cinque giorni.',
      azione: `<button class="btn p due" data-apri="${c.id}">Guarda il lavoro</button>` });
    if (c.passo === 4) return daFare({
      icona: ICO.banca, cod: c.id, titolo: `Paga ${eur2(conto(c).lordo)} a ${c.creator.split(' ')[0]}`,
      testo: 'Il lavoro è approvato: qui trovi IBAN e intestatario per fare il bonifico.',
      azione: `<button class="btn p due" data-apri="${c.id}">Vai al pagamento</button>` });
    return daFare({
      icona: ICO.contratto, cod: c.id, titolo: 'Una richiesta aspetta la tua risposta',
      testo: c.titolo, azione: `<button class="btn p due" data-apri="${c.id}">Leggi</button>` });
  }).join('');

  return `
  ${titoloSez('tocca a te', miei.length ? `<span class="conta-sez">${miei.length}</span>` : '')}
  ${miei.length ? `<div class="compiti">${compiti}</div>`
    : vuoto('Niente da approvare. Le collaborazioni aperte aspettano i creator.')}

  ${daLeggere()}

  ${titoloSez('denaro · ultimi 30 giorni')}
  ${fascia(
    dato(ICO.banca, 'Da pagare adesso', eur2(daPagare), 'Approvati, bonifico da disporre', true),
    dato(ICO.contratto, 'Impegnato', eur2(impegnato), 'Su collaborazioni aperte'),
    dato(ICO.attribuzione, 'Persone portate', num(clicTot), `${num(clic7g)} negli ultimi 7 giorni`)
  )}

  ${contatoreSoglia()}

  ${titoloSez('collaborazioni aperte')}
  ${aperte().length ? aperte().map(rigaCollab).join('')
    : vuoto('Nessuna collaborazione aperta.', `<button class="btn p due" data-vai="creator">Trova un creator</button>`)}`;
};

V.azienda.creator = () => {
  if (S.schedaCreator) return schedaCreator(S.schedaCreator);

  let lista = TROVA.filter(t => S.soloVerificati ? t.ver : true)
                   .filter(t => S.soloInCerca ? t.inCerca : true);

  const ordini = {
    clic:     (a, b) => b.clic - a.clic,
    er:       (a, b) => b.er - a.er,
    giudizio: (a, b) => b.giudizio - a.giudizio,
    prezzo:   (a, b) => a.prezzo - b.prezzo,
    f:        (a, b) => b.f - a.f
  };
  /* chi cerca sta sopra, sempre: dentro ciascun gruppo vale
     l'ordinamento scelto. Mostrare per primo chi non risponderà
     è il modo più rapido per far smettere di usare la ricerca. */
  lista = [...lista].sort((x, y) =>
    (y.inCerca - x.inCerca) || (ordini[S.ordina] || ordini.clic)(x, y));

  const etichette = { clic: 'persone portate', er: 'interazione',
                      giudizio: 'giudizio', prezzo: 'prezzo', f: 'follower' };

  /* il valore di un'anteprima, formattato come vuole quel dato */
  const valore = (t, k) => {
    switch (k) {
      case 'clic':     return { v: t.clic ? num(t.clic) : '—', c: t.clic ? 'acc' : 'gri' };
      case 'inTempo':  return { v: t.inTempo ? t.inTempo + '%' : '—', c: t.inTempo >= 90 ? '' : 'giu' };
      case 'giudizio': return { v: t.giudizio ? t.giudizio.toFixed(1).replace('.', ',') : '—', c: t.giudizio ? '' : 'gri' };
      case 'f':        return { v: mille(t.f), c: '' };
      case 'er':       return { v: t.er + '%', c: '' };
      case 'prezzo':   return { v: eur(t.prezzo), c: '' };
      case 'collab':   return { v: t.collab || '—', c: t.collab ? '' : 'gri' };
      case 'risposta': return { v: t.risposta ? t.risposta + '%' : '—', c: t.risposta >= 80 ? '' : 'giu' };
      default:         return { v: '—', c: 'gri' };
    }
  };
  const nomeAnt = k => ANTEPRIME.find(a => a.k === k)?.t || k;

  return `
  <div class="nota due rise" style="margin-bottom:22px;display:flex;gap:14px;align-items:flex-start">
    <span class="bollo">${ICO.trova()}</span>
    <span><b>I follower contano meno di quanto pensi.</b> Chi è <b>in cerca</b> sta in cima:
      si è dichiarato disponibile questo mese, quindi è chi ti risponde. Apri una scheda per
      vedere tutto lo storico verificato.</span>
  </div>

  <div class="riga rise" style="gap:10px;margin-bottom:14px">
    <input class="campo crescita" style="max-width:320px" placeholder="Cerca per nome o categoria" aria-label="Cerca creator">
  </div>

  <div class="barra-filtri rise">
    ${gruppoFiltri('ordina per', 'ordina',
      Object.keys(etichette).map(k => ({ k, t: etichette[k] })), S.ordina)}
    <span class="divisore" aria-hidden="true"></span>
    <div class="gruppo-filtri">
      <span class="uc gri">mostra solo</span>
      <div class="filtri interruttori">
        <button class="filtro" data-verificati aria-pressed="${S.soloVerificati}">verificati</button>
        <button class="filtro" data-incerca aria-pressed="${S.soloInCerca}">in cerca</button>
      </div>
    </div>
    <span class="divisore" aria-hidden="true"></span>
    <div class="gruppo-filtri">
      <span class="uc gri">in anteprima</span>
      <div class="filtri interruttori">
        <button class="filtro" data-scegli-anteprime>${ICO.impostazioni()} ${S.anteprime.map(nomeAnt).join(' · ').toLowerCase()}</button>
      </div>
    </div>
  </div>

  <div class="griglia-3">
    ${lista.map(t => `
    <button class="trovato rise ${t.inCerca ? '' : 'spento'}" data-scheda="${t.n}" style="cursor:pointer">
      <div class="cap">${ava('creator')}
        <div class="crescita" style="text-align:left"><div class="n">${t.n}</div><div class="h">${t.h}</div></div>
      </div>
      <div class="riga" style="margin-top:14px;gap:6px;flex-wrap:wrap">
        ${t.ver ? pil('verificato', 'ok') : pil('non verificato', 'male')}
        ${t.inCerca ? pil('in cerca', 'corso') : ''}
      </div>
      ${t.inCerca ? '' : `<p class="fuori-cerca">Attualmente non in cerca di collaborazioni</p>`}
      <div style="margin-top:14px">${stelle(t.giudizio)}</div>
      <div class="num tabulato">
        ${S.anteprime.map(k => { const x = valore(t, k); return `
        <div class="tab-r"><span class="k">${nomeAnt(k)}</span><span class="g"></span>
          <span class="n ${x.c}">${x.v}</span></div>`; }).join('')}
      </div>
      <div class="coda"><span class="btn p due pieno">Apri la scheda</span></div>
    </button>`).join('')}
  </div>

  ${lista.length ? '' : vuoto('Nessun creator con questi filtri.',
    `<button class="btn p due" data-verificati>Togli i filtri</button>`)}`;
};

/* il pannello che sceglie le tre anteprime: quello che conta
   cambia da azienda ad azienda, e imporre una terna sola vuol
   dire imporre una definizione di «bravo» */
function pannelloAnteprime() {
  return `
    <h3 style="margin-bottom:6px">cosa vuoi vedere sulle schede</h3>
    <p class="gri sm" style="margin-bottom:20px">Scegli tre dati. Sono quelli che compaiono in
      anteprima su ogni creator, senza aprire la scheda.</p>
    <div class="opzioni-riga">
      ${ANTEPRIME.map(a => {
        const on = S.anteprime.includes(a.k);
        return `<button class="opz" data-anteprima="${a.k}" aria-pressed="${on}">
          <span class="segno"></span><span><span class="t">${a.t}</span>
          <span class="d">${a.d}</span></span></button>`;
      }).join('')}
    </div>
    <p class="gri xs" style="margin-top:16px">${S.anteprime.length} di 3 scelti.</p>`;
}

/* I contatti restano chiusi finché non c'è un accordo firmato.
   Non è per dispetto: è l'unica cosa che tiene la collaborazione
   dentro Leucoteo. Se ci si scambia il numero prima, tutto il
   resto — accordo, date, diritti, storico — non succede mai. */
function contattiChiusi(t) {
  const firmata = COLLAB.some(c => c.creator === t.n && c.passo >= 1);
  if (firmata) return `
  <div class="riservatezza rise" style="margin-top:20px">
    <span class="bollo" style="background:rgba(var(--acc-rgb),.12);color:var(--acc)">${ICO.fatto()}</span>
    <span><b>Avete un accordo firmato:</b> i contatti diretti sono visibili dentro la
      collaborazione, insieme all’IBAN.</span>
  </div>`;
  return `
  <div class="riservatezza rise" style="margin-top:20px">
    <span class="bollo" style="background:rgba(var(--bra-rgb),.12);color:var(--bra-hi)">${ICO.custodia()}</span>
    <span><b>Email e telefono si vedono dopo l’accordo firmato.</b> Fino ad allora si parla
      qui dentro. Serve a te quanto a lui: quello che vi dite resta scritto, con una data,
      e se qualcosa va storto c’è una traccia invece della parola di uno contro l’altro.</span>
  </div>`;
}

/* Lo storico dichiarato dal creator: quello che ha fatto prima
   di arrivare qui. Sta in un blocco separato e dichiarato tale.
   Non si mescola mai col verificato — è precisamente quella
   separazione che rende il verificato utile. */
function storicoDichiarato() {
  if (!STORICO_ESTERNO.length) return '';
  return `
  ${titoloSez('dichiarate dal creator', pil('non verificate'))}
  <div class="riservatezza rise" style="margin-bottom:14px">
    <span class="bollo" style="background:rgba(var(--bra-rgb),.12);color:var(--bra-hi)">${ICO.attesa()}</span>
    <span><b>Queste le ha scritte lui, non le abbiamo viste succedere.</b> Non sono passate da
      Leucoteo: non c’è un accordo, non c’è una consegna datata e non ci sono numeri.
      Valgono quanto vale la sua parola — che non è poco, ma non è la stessa cosa.</span>
  </div>
  <div class="scheda rise">
    ${STORICO_ESTERNO.map(r => `
      <div class="storia-riga velata">
        <span class="quando">${r.quando}</span>
        <div>
          <div class="chi">${r.azienda}</div>
          <div class="cosa">${r.formati}${r.nota ? ' · ' + r.nota : ''}</div>
        </div>
        <div class="riga" style="gap:12px;flex:none">${pil('non verificata')}</div>
      </div>`).join('')}
  </div>`;
}

/* --- la scheda completa di un creator, con lo storico --- */
function schedaCreator(nome) {
  const t = TROVA.find(x => x.n === nome) || TROVA[0];
  const suo = t.n === CREATOR.nome;
  const s = STORICO;
  return `
  <button class="btn p ghost rise" data-vai="creator" style="margin-bottom:26px">${ICO.indietro()} Tutti i creator</button>

  <div class="blocco rise">
    <div class="riga" style="gap:22px;align-items:flex-start;flex-wrap:nowrap">
      ${ava('creator', 'xg')}
      <div class="crescita">
        <div class="riga" style="gap:8px">${t.ver ? pil('verificato', 'ok') : pil('non verificato', 'male')}
          ${t.inCerca ? pil('in cerca · da ' + t.daQuando, 'corso') : pil('non in cerca')}</div>
        <h3 style="font-weight:800;font-size:27px;letter-spacing:var(--tr-xl);text-transform:lowercase;margin-top:12px">${t.n.toLowerCase()}</h3>
        <div class="mono sm gri" style="margin-top:6px">${t.h} · ${t.citta} · ${t.cat}</div>
        ${t.inCerca ? '' : `<p class="fuori-cerca" style="margin-top:12px">Attualmente non in cerca di collaborazioni. Puoi scrivergli lo stesso, ma potrebbe non rispondere.</p>`}
        <div style="margin-top:14px">${stelle(t.giudizio, s.giudizi + ' giudizi')}</div>
      </div>
      <div style="text-align:right;flex:none">
        <div class="uc gri">a partire da</div>
        <div class="cifra" style="font-size:32px;margin-top:6px">${eur(t.prezzo)}</div>
        <button class="btn due" style="margin-top:16px" data-proponi="${t.n}">Proponi una collaborazione</button>
      </div>
    </div>
    ${suo ? `<p class="gri2 sm" style="margin-top:20px">${CREATOR.bio}</p>` : ''}
  </div>

  ${fascia(
    dato(ICO.storico, 'Persone portate', num(t.clic), `${s.aziende} aziende · ${s.clicFinestra}`, true),
    dato(ICO.fatto, 'Consegne in tempo', t.inTempo + '%', `su ${t.collab} collaborazioni`),
    dato(ICO.attesa, 'Tasso di risposta', t.risposta + '%', 'proposte lette e a cui ha risposto')
  )}

  ${contattiChiusi(t)}

  ${titoloSez('storico delle collaborazioni')}
  <div class="riservatezza rise" style="margin-bottom:14px">
    <span class="bollo" style="background:rgba(var(--bra-rgb),.12);color:var(--bra-hi)">${ICO.scudo()}</span>
    <span><b>Il nome di un’azienda compare solo se quell’azienda lo ha consentito.</b>
      Negli altri casi resta il settore. Compensi e fatturato delle singole collaborazioni non
      sono mai visibili a terzi. <a href="termini.html" target="_blank" rel="noopener"
      style="color:var(--bra-hi);text-decoration:underline">Cosa si vede e cosa no</a></span>
  </div>

  <div class="scheda rise">
    ${s.righe.map(r => `
      <div class="storia-riga">
        <span class="quando">${r.quando}</span>
        <div>
          <div class="chi">${r.consenso ? r.azienda
            : `<span class="velato">un’azienda di ${r.settore}</span>`}</div>
          <div class="cosa">${r.formati} · ${num(r.clic)} persone portate${r.note ? ' · ' + r.note : ''}</div>
        </div>
        <div class="riga" style="gap:12px;flex:none">
          ${r.inTempo ? pil('in tempo', 'ok') : pil('in ritardo', 'att')}
          ${stelle(r.giudizio)}
        </div>
      </div>`).join('')}
  </div>

  ${storicoDichiarato()}

  ${titoloSez('persone portate · ' + s.clicFinestra)}
  <div class="scheda tagliato su2 rise">
    <div class="riga tra"><span class="cifra" style="font-size:28px">${num(s.clic)}</span>
      <span class="uc gri">mese per mese, su tutte le aziende</span></div>
    <div class="isto">${s.serie.map(v => `<i class="b" style="height:${Math.round(v / Math.max(...s.serie) * 100)}%"></i>`).join('')}</div>
  </div>`;
}

V.azienda.link = () => {
  const attivi = LINK.filter(l => l.attivo);
  const tot = LINK.reduce((s, l) => s + l.clic, 0);
  const sett = LINK.reduce((s, l) => s + l.clic7g, 0);
  const chiuse = mie().filter(conclusa);
  const senzaLink = chiuse.filter(c => !c.link);
  const max = Math.max(...LINK.map(l => l.clic), 1);

  return `
  <div class="nota due rise" style="margin-bottom:22px;display:flex;gap:14px;align-items:flex-start">
    <span class="bollo">${ICO.link()}</span>
    <span><b>Leucoteo non entra nel tuo negozio.</b> Il link passa dal nostro redirect e poi
      atterra sul tuo sito: così contiamo quante persone ha portato ogni creator senza vedere
      un solo ordine, un solo cliente o un solo euro. Cosa succede dopo il clic lo sai solo tu,
      dalle tue analitiche.</span>
  </div>

  ${fascia(
    dato(ICO.attribuzione, 'Persone portate', num(tot), `su ${LINK.length} link · sempre`, true),
    dato(ICO.oggi, 'Ultimi 7 giorni', num(sett), `${attivi.length} link ancora attivi`),
    dato(ICO.fatto, 'Link attivi', String(attivi.length), `su ${chiuse.length} collaborazioni concluse`)
  )}

  ${senzaLink.length ? titoloSez('da fare') + `<div class="compiti">${senzaLink.map(c => daFare({
    icona: ICO.link, cod: c.id, titolo: `${c.creator.split(' ')[0]} non ha ancora un link`,
    testo: 'La collaborazione è chiusa. Crea il link e saprai quante persone ti ha portato — e lo saprà anche lui, che è il motivo per cui tornerà a lavorare con te.',
    azione: `<button class="btn p due" data-crea-link="${c.id}">Crea il link</button>` })).join('')}</div>` : ''}

  ${titoloSez('i link', `<button class="btn p ghost" data-avviso="Rapporto scaricato">Scarica il rapporto</button>`)}
  <div class="scheda tagliato su2 scorri rise">
    <table class="reg-t tab-schede">
      <thead><tr><th></th><th>Creator</th><th>Link</th><th>Creato</th><th>Da cosa</th><th class="n">7 giorni</th><th class="n">Totale</th></tr></thead>
      <tbody>${LINK.map(l => `<tr>
        <td class="segno" style="color:var(--${l.attivo ? 'acc' : 'gri-3'})">${l.attivo ? ICO.fatto() : ICO.attesa()}</td>
        <td class="primo" data-k="">${l.creator}</td>
        <td class="mono gri sm" data-k="Link">${l.url}</td>
        <td class="mono gri" data-k="Creato">${l.creato}</td>
        <td class="gri sm" data-k="Da cosa">${l.fonte}</td>
        <td class="n ${l.clic7g ? '' : 'gri'}" data-k="7 giorni">${l.clic7g ? num(l.clic7g) : '—'}</td>
        <td class="n acc" data-k="Totale">${num(l.clic)}</td>
      </tr>`).join('')}</tbody>
    </table>
  </div>

  ${titoloSez('confronto')}
  <div class="scheda rise">
    <div class="tabulato">
      ${[...LINK].sort((x, y) => y.clic - x.clic).map(l => `
      <div class="tab-r"><span class="k">${l.creator}</span>
        <span class="g"></span>
        <span class="n ${l.attivo ? 'acc' : 'gri'}">${num(l.clic)}</span></div>
      <div class="barra" style="margin:-4px 0 10px"><i style="width:${Math.round(l.clic / max * 100)}%"></i></div>`).join('')}
    </div>
    <p class="gri xs" style="margin-top:10px">Sono clic, non vendite. Quanti di questi hanno
      comprato lo dicono le tue analitiche, non noi — e va bene così: per saperlo dovremmo
      entrare nel tuo negozio, e non vogliamo.</p>
  </div>

  ${titoloSez('come funziona un link')}
  <div class="griglia-2">
    <div class="scheda rise"><h3>quando si crea</h3>
      <p class="gri sm" style="margin-top:10px">A collaborazione conclusa. Non prima: finché
        il lavoro non è approvato e pagato non c'è niente da misurare.</p>
      <div class="tabulato" style="margin-top:14px">
        <div class="tab-r"><span class="k">Chi lo crea</span><span class="g"></span><span class="n">l'azienda</span></div>
        <div class="tab-r"><span class="k">Chi vede i clic</span><span class="g"></span><span class="n">tutti e due</span></div>
        <div class="tab-r"><span class="k">Quanto resta attivo</span><span class="g"></span><span class="n">${LISTINO.finestraClic} giorni</span></div>
      </div>
    </div>
    <div class="scheda rise"><h3>cosa NON misura</h3>
      <div class="tabulato" style="margin-top:12px">
        <div class="tab-r"><span class="k">Ordini</span><span class="g"></span><span class="n gri">non lo sappiamo</span></div>
        <div class="tab-r"><span class="k">Fatturato</span><span class="g"></span><span class="n gri">non lo sappiamo</span></div>
        <div class="tab-r"><span class="k">Dati dei tuoi clienti</span><span class="g"></span><span class="n gri">mai visti</span></div>
      </div>
      <p class="gri xs" style="margin-top:14px">Un clic contato bene vale più di un venduto
        stimato male. Preferiamo dirti un numero vero e piccolo.</p>
    </div>
  </div>`;
};

/* ============================================================
   IMPOSTAZIONI — dove si configura, non dove si lavora
   ============================================================ */
V.creator.impostazioni = () => `
  <button class="btn p ghost rise" data-vai="oggi" style="margin-bottom:26px">${ICO.indietro()} Torna al lavoro</button>
  <div class="modulo-lungo">
    <nav class="passi-lato rise">
      <button aria-current="step"><span class="nu">1</span>Disponibilità</button>
      <button><span class="nu">2</span>Riservatezza</button>
      <button><span class="nu">3</span>Profili collegati</button>
      <button><span class="nu">4</span>Dati fiscali</button>
    </nav>
    <div>
      <div class="blocco rise">
        <h3>sei in cerca di collaborazioni?</h3>
        <p class="sotto">È il primo filtro che usano le aziende. Chi cerca sta in cima ai
          risultati; chi non cerca resta visibile ma spento, con scritto che non è disponibile.
          Meglio dirlo che far perdere tempo a tutti e due.</p>
        <div style="margin-top:20px">${segnaleRicerca()}</div>
        <p class="gri xs" style="margin-top:14px">Lo stato dura 30 giorni, poi ti chiediamo di
          confermarlo. Non è una scocciatura: è quello che tiene vero l’elenco su cui gli altri
          contano — e su cui contano anche loro quando cercano te.</p>
      </div>

      <div class="blocco rise">
        <h3>chi può vedere il tuo storico</h3>
        <p class="sotto">Lo storico è tuo: sei tu a decidere se un’azienda che non ti conosce
          può vederlo. Spegnendolo perdi la carta migliore che hai in trattativa, ma resti visibile.</p>
        <div class="opzioni-riga" style="margin-top:22px">
          <button class="opz" aria-pressed="${CREATOR.consensoStorico}" data-consenso="1">
            <span class="segno"></span><span><span class="t">Visibile alle aziende iscritte</span>
            <span class="d">Collaborazioni concluse, formati, puntualità, giudizi e persone portate.
              Mai i compensi, mai il fatturato di una singola azienda.</span></span></button>
          <button class="opz" aria-pressed="${!CREATOR.consensoStorico}" data-consenso="0">
            <span class="segno"></span><span><span class="t">Solo su richiesta</span>
            <span class="d">Un’azienda deve chiederti il permesso ogni volta. Più controllo, meno proposte.</span></span></button>
        </div>
        <div class="riservatezza" style="margin-top:20px">
          <span class="bollo" style="background:rgba(var(--bra-rgb),.12);color:var(--bra-hi)">${ICO.scudo()}</span>
          <span>Il consenso si revoca quando vuoi e vale per il futuro: le aziende con cui hai già
            lavorato continuano a vedere le vostre collaborazioni, come è giusto.
            <a href="termini.html" target="_blank" rel="noopener" style="color:var(--bra-hi);text-decoration:underline">Cosa si vede e cosa no</a></span>
        </div>
      </div>

      <div class="blocco rise">
        <h3>profili collegati</h3>
        <p class="sotto">Da qui arrivano i numeri verificati. Se scolleghi, il profilo perde la spunta.
          Per ora leggiamo solo Instagram: gli altri canali arriveranno, e finché non li leggiamo
          non li mostriamo.</p>
        <div class="collega" style="margin-top:20px">
          <div class="canale collegato"><span class="bollo">${ICO.fatto()}</span>
            <span><span class="n">Instagram</span><span class="d">@giulia.fit · sincronizzato ${CREATOR.ig.sync}</span></span>
            <span class="esito"><button class="btn p ghost" data-avviso="Profilo scollegato">Scollega</button></span></div>
        </div>
      </div>

      <div class="blocco rise">
        <h3>collaborazioni dichiarate</h3>
        <p class="sotto">Quelle che hai fatto prima di arrivare qui, o chiuse fuori da Leucoteo.
          Restano marcate come non verificate: non le abbiamo viste succedere, e fingere il
          contrario toglierebbe valore a quelle vere.</p>
        <div class="scheda" style="margin-top:20px">
          ${STORICO_ESTERNO.map(r => `
          <div class="storia-riga velata">
            <span class="quando">${r.quando}</span>
            <div><div class="chi">${r.azienda}</div><div class="cosa">${r.formati}${r.nota ? ' · ' + r.nota : ''}</div></div>
            <div class="riga" style="gap:10px;flex:none">${pil('non verificata')}
              <button class="togli" data-avviso="Voce rimossa" aria-label="Togli">${ICO.scartato()}</button></div>
          </div>`).join('')}
        </div>
        <button class="btn p ghost" style="margin-top:18px" data-avviso="Voce aggiunta">${ICO.piu()} Aggiungi una collaborazione</button>
      </div>
    </div>
  </div>`;

V.azienda.impostazioni = () => `
  <button class="btn p ghost rise" data-vai="oggi" style="margin-bottom:26px">${ICO.indietro()} Torna al lavoro</button>
  <div class="modulo-lungo">
    <nav class="passi-lato rise">
      <button aria-current="step"><span class="nu">1</span>Sito e verifica</button>
      <button><span class="nu">2</span>Chi cerchi</button>
      <button><span class="nu">3</span>Anagrafica</button>
      <button><span class="nu">4</span>Riservatezza</button>
      <button><span class="nu">5</span>Quanto costa</button>
    </nav>
    <div>
      <div class="blocco rise">
        <h3>il tuo sito</h3>
        <p class="sotto">Leucoteo non entra nel tuo negozio e non legge ordini. Il sito serve
          a due cose: dire ai creator chi sei, e far atterrare i link che crei per loro.</p>
        <div class="scheda registro stretto allineato " style="margin-top:20px">
          <div class="riga tra"><div class="riga">${ava('azienda')}
            <div><h3>${AZIENDA.nome}</h3><div class="mono sm gri">${AZIENDA.sito}</div></div></div>
            ${AZIENDA.dominioVerificato ? pil('dominio verificato', 'ok') : pil('non verificato', 'male')}</div>
        </div>
        <div class="tabulato" style="margin-top:20px">
          <div class="tab-r"><span class="k">Partita IVA</span><span class="g"></span>
            <span class="n">${AZIENDA.piva} ${AZIENDA.pivaVerificata ? '<span class="verde">· valida</span>' : ''}</span></div>
          <div class="tab-r"><span class="k">Dominio</span><span class="g"></span>
            <span class="n verde">${AZIENDA.comeVerificato}</span></div>
          <div class="tab-r"><span class="k">Email del referente</span><span class="g"></span>
            <span class="n verde">confermata</span></div>
          <div class="tab-r tot"><span class="k">Stato del profilo</span><span class="g"></span>
            <span class="n acc">verificato</span></div>
        </div>
        <div class="riservatezza" style="margin-top:20px">
          <span class="bollo" style="background:rgba(var(--bra-rgb),.12);color:var(--bra-hi)">${ICO.scudo()}</span>
          <span><b>Nessun accesso al tuo negozio, su nessuna piattaforma.</b> Non installiamo
            niente, non leggiamo ordini, non vediamo clienti. Le tre verifiche qui sopra
            riguardano l&rsquo;azienda, non il software che usi per vendere.</span>
        </div>
      </div>

      <div class="blocco rise">
        <h3>chi stai cercando</h3>
        <p class="sotto">&Egrave; l&rsquo;annuncio che vedono i creator. Scade dopo 30 giorni e ti chiediamo
          di confermarlo: una bacheca di annunci morti non serve a nessuno, te compreso.</p>
        <div style="margin-top:20px">${segnaleRicerca()}</div>
        <div class="tabulato" style="margin-top:20px">
          <div class="tab-r"><span class="k">Cosa cerchi</span><span class="g"></span><span class="n">${AZIENDA.cerca}</span></div>
          <div class="tab-r"><span class="k">Budget per collaborazione</span><span class="g"></span><span class="n acc">${AZIENDA.budget}</span></div>
          <div class="tab-r"><span class="k">Posti</span><span class="g"></span>
            <span class="n">${AZIENDA.inCerca.presi} presi su ${AZIENDA.inCerca.posti}</span></div>
          <div class="tab-r tot"><span class="k">L&rsquo;annuncio scade</span><span class="g"></span>
            <span class="n">${AZIENDA.inCerca.scadeIl}</span></div>
        </div>
      </div>

      <div class="blocco rise">
        <h3>anagrafica</h3>
        <div class="campi due-col" style="margin-top:20px">
          ${campo('aRagione', 'Ragione sociale', AZIENDA.ragioneSociale)}
          ${campo('aPiva', 'Partita IVA', AZIENDA.piva)}
          ${campo('aNome', 'Nome commerciale', AZIENDA.nome)}
          ${campo('aSito', 'Sito', AZIENDA.sito)}
          ${campo('aSede', 'Sede legale', AZIENDA.sede)}
          ${campo('aRef', 'Chi firma', `${AZIENDA.referente.nome} ${AZIENDA.referente.cognome} · ${AZIENDA.referente.ruolo}`)}
        </div>
      </div>

      <div class="blocco rise">
        <h3>farsi nominare nello storico</h3>
        <p class="sotto">Quando un creator con cui hai lavorato mostra il suo storico ad altre aziende,
          il tuo nome compare solo se lo consenti. Di norma conviene: vale come referenza.</p>
        <div class="opzioni-riga" style="margin-top:20px">
          <button class="opz" aria-pressed="true"><span class="segno"></span>
            <span><span class="t">Sì, mostra il nome</span>
            <span class="d">Compare «Nutriva». Nessun dato economico, mai.</span></span></button>
          <button class="opz" aria-pressed="false"><span class="segno"></span>
            <span><span class="t">No, resta anonima</span>
            <span class="d">Compare «un’azienda di integratori».</span></span></button>
        </div>
      </div>

      ${contatoreSoglia(true)}
    </div>
  </div>`;

/* ============================================================
   LA PROPOSTA — un brief vero, non tre campi
   ============================================================ */
/* Due strade diverse, non lo stesso modulo con i nomi cambiati.
   Un'azienda che scrive a un creator chiede: ti chiedo questo, ti
   pago tanto, entro questa data. Un creator che si propone offre:
   ecco chi sono, ecco cosa farei, ecco quanto costa. Le domande
   non sono le stesse e non possono esserlo — chiedere a un creator
   «quanti reel chiedi» non vuol dire niente. */
const SEZIONI = {
  richiesta: [
    { k: 'formula',  t: 'Come si paga' },
    { k: 'cosa',     t: 'Cosa chiedi' },
    { k: 'brief',    t: 'Il brief' },
    { k: 'diritti',  t: 'Diritti e vincoli' },
    { k: 'tempi',    t: 'Tempi' }
  ],
  candidatura: [
    { k: 'chiSono',  t: 'Perché io' },
    { k: 'faccio',   t: 'Cosa farei' },
    { k: 'idea',     t: 'L’idea' },
    { k: 'chiedo',   t: 'Quanto chiedo' },
    { k: 'quando',   t: 'Quando posso' }
  ]
};

function vistaProposta() {
  const b = S.bozza;
  if (!b) { S.vista = 'oggi'; return V[S.lato].oggi(); }

  /* verso 'creator' = l'azienda scrive a un creator (una richiesta)
     verso 'azienda' = il creator si propone a un'azienda (una candidatura) */
  const versoCreator = b.verso === 'creator';
  const lista = versoCreator ? SEZIONI.richiesta : SEZIONI.candidatura;
  if (S.passoProposta >= lista.length) S.passoProposta = lista.length - 1;
  const sez = lista[S.passoProposta].k;
  const k = conto({ cachet: +b.cachet || 0 });

  const blocchi = {

    /* ---------- LATO AZIENDA · la richiesta ---------- */
    formula: `
      <div class="blocco">
        <h3>come si paga</h3>
        <p class="sotto">La formula decide tutto il resto: quanto rischia ciascuno e cosa si può pretendere.</p>
        <div class="opzioni-riga" style="margin-top:22px">
          ${FORMULE.map(f => `<button class="opz" data-campo="formula" data-valore="${f.k}"
            aria-pressed="${b.formula === f.k}"><span class="segno"></span>
            <span><span class="t">${f.t}</span><span class="d">${f.d}</span></span></button>`).join('')}
        </div>
        <div class="campi due-col" style="margin-top:24px">
          ${['fisso','prodotto','continua'].includes(b.formula)
            ? campo('bCachet', 'Compenso in euro', b.cachet, { tipo: 'numeric', chiave: 'cachet',
                aiuto: b.formula === 'continua' ? 'Al mese. È la cifra che riceve il creator.' : 'È la cifra che riceve il creator.' }) : ''}
        </div>
        <div class="nota" style="margin-top:20px;font-size:13.5px">
          <b>Niente quote sul venduto.</b> Leucoteo non si collega al tuo negozio e non legge
          ordini, quindi una percentuale sulle vendite non potremmo verificarla &mdash; e una cifra
          che non si pu&ograve; verificare &egrave; esattamente quello che poi fa litigare. A
          collaborazione chiusa potrai creare un link e vedere quante persone ti ha portato.
        </div>
      </div>`,

    cosa: `
      <div class="blocco">
        <h3>cosa chiedi</h3>
        <p class="sotto">Una riga per ogni contenuto. Più è preciso, meno si discute dopo.</p>
        ${righeConsegne(b)}
        <button class="btn p ghost" style="margin-top:18px" data-aggiungi-consegna>${ICO.piu()} Aggiungi un contenuto</button>

        <div class="campi" style="margin-top:26px">
          ${campo('bProdotti', 'Prodotti che mandi', b.prodotti, { chiave: 'prodotti',
            segna: 'Proteine vegetali vaniglia · 900 g',
            aiuto: 'Cosa mandi, in che quantità, in che formato.' })}
        </div>
      </div>`,

    brief: `
      <div class="blocco">
        <h3>il brief</h3>
        <p class="sotto">La parte che di solito sta in un vocale su WhatsApp e poi nessuno ritrova.</p>
        <div class="campi" style="margin-top:22px">
          ${campo('bBrief', 'Cosa deve mostrare o dire', b.brief, { lungo: true, chiave: 'brief',
            segna: 'Mostrare la preparazione di una ricetta. Dire che è senza lattosio.',
            aiuto: 'Concreto: azioni e frasi, non aggettivi.' })}
          ${campo('bNonDire', 'Cosa NON deve dire', b.nonDire, { lungo: true, chiave: 'nonDire',
            segna: 'Non paragonare ad altre marche. Non promettere risultati di dimagrimento.',
            aiuto: 'Su integratori e cosmetici è la voce che evita guai con l’AGCM.' })}
        </div>
        <div class="nota due" style="margin-top:20px;font-size:13.5px">
          <b>La dicitura pubblicitaria è obbligatoria e la mette Leucoteo.</b> Ogni contenuto viene
          archiviato con la verifica che #adv (o equivalente) fosse presente e visibile.
        </div>
      </div>`,

    diritti: `
      <div class="blocco">
        <h3>diritti d’uso</h3>
        <p class="sotto">È la voce che vale di più e che quasi sempre resta implicita.
          Un contenuto riutilizzabile in campagna a pagamento vale molto più di uno che resta sul profilo.</p>
        <div class="opzioni-riga" style="margin-top:22px">
          ${DIRITTI.map(d => `<button class="opz" data-campo="diritti" data-valore="${d.k}"
            aria-pressed="${b.diritti === d.k}"><span class="segno"></span>
            <span><span class="t">${d.t}</span><span class="d">${d.d}</span></span></button>`).join('')}
        </div>
      </div>
      <div class="blocco">
        <h3>esclusiva</h3>
        <p class="sotto">Impedire al creator di lavorare con un concorrente ha un prezzo:
          se la chiedi, mettila per iscritto e riconoscila nel compenso.</p>
        <div class="campi" style="margin-top:22px">
          ${campo('bEsclusiva', 'Vincolo di esclusiva', b.esclusiva, { chiave: 'esclusiva',
            segna: '30 giorni sulla categoria integratori proteici',
            aiuto: 'Scrivi «nessuna» se non la chiedi.' })}
        </div>
      </div>`,

    tempi: `
      <div class="blocco">
        <h3>tempi</h3>
        <div class="campi due-col" style="margin-top:22px">
          ${campo('bConsegna', 'Consegna dei contenuti entro', b.consegnaEntro, { chiave: 'consegnaEntro',
            segna: '27 ago', aiuto: 'Quando devi averli in mano tu.' })}
          ${campo('bPubb', 'Pubblicazione entro', b.pubblicazioneEntro, { chiave: 'pubblicazioneEntro',
            segna: '30 ago', aiuto: 'Utile se stai lanciando qualcosa.' })}
        </div>
        <div class="campi" style="margin-top:20px">
          ${campo('bNote', 'Altro da dire', b.note, { lungo: true, chiave: 'note',
            segna: 'Spedizione entro lunedì. Disponibili a una call di 15 minuti.' })}
        </div>
      </div>`,

    /* ---------- LATO CREATOR · la candidatura ---------- */
    chiSono: `
      <div class="blocco">
        <h3>perché tu</h3>
        <p class="sotto">Non ripetere i numeri: quelli li allega Leucoteo e sono verificati.
          Scrivi la cosa che dai tu e che un altro con gli stessi follower non darebbe.</p>
        <div class="campi" style="margin-top:22px">
          ${campo('bPerche', 'In due righe', b.perche, { lungo: true, chiave: 'perche',
            segna: 'Il mio pubblico cucina davvero: le ricette che pubblico le rifanno e me le mandano.',
            aiuto: 'Concreto. «Sono appassionata e solare» non dice niente a nessuno.' })}
        </div>
      </div>

      <div class="blocco">
        <h3>quello che allego</h3>
        <p class="sotto">Va con la candidatura e non lo scrivi tu: è quello che rende una
          proposta diversa da un messaggio in privato.</p>
        <div class="tabulato" style="margin-top:18px">
          <div class="tab-r"><span class="k">Follower su Instagram</span><span class="g"></span>
            <span class="n">${num(CREATOR.ig.follower)} <span class="verde">· letti</span></span></div>
          <div class="tab-r"><span class="k">Interazione</span><span class="g"></span>
            <span class="n">${CREATOR.ig.er}%</span></div>
          <div class="tab-r"><span class="k">Collaborazioni concluse qui</span><span class="g"></span>
            <span class="n">${STORICO.collaborazioni}</span></div>
          <div class="tab-r"><span class="k">Consegne in tempo</span><span class="g"></span>
            <span class="n acc">${STORICO.consegnaInTempo}%</span></div>
          <div class="tab-r tot"><span class="k">Storico verificato</span><span class="g"></span>
            <span class="n">${CREATOR.consensoStorico ? 'visibile' : 'solo su richiesta'}</span></div>
        </div>
        ${CREATOR.consensoStorico ? '' : `<p class="gri xs" style="margin-top:14px">
          Il tuo storico è impostato su «solo su richiesta»: chi riceve questa candidatura
          non lo vedrà. <button class="btn p ghost" data-vai="impostazioni">Cambia</button></p>`}
      </div>`,

    faccio: `
      <div class="blocco">
        <h3>cosa faresti</h3>
        <p class="sotto">I contenuti che proponi tu. Se l&rsquo;azienda vuole altro te lo dirà
          rispondendo: è una proposta, non un preventivo definitivo.</p>
        ${righeConsegne(b, 'proposta')}
        <button class="btn p ghost" style="margin-top:18px" data-aggiungi-consegna>${ICO.piu()} Aggiungi un contenuto</button>

        <div class="riga" style="margin-top:22px;gap:10px;flex-wrap:wrap">
          ${CREATOR.listino.map(l => `<button class="chip" data-listino="${l.k}">
            ${l.t} · ${eur(l.p)}</button>`).join('')}
          <span class="gri xs">Dal tuo listino, se vuoi partire da lì</span>
        </div>
      </div>`,

    idea: `
      <div class="blocco">
        <h3>l’idea</h3>
        <p class="sotto">Come mostreresti il prodotto. È la parte che fa rispondere:
          un&rsquo;azienda riceve dieci «disponibile per collaborazioni» al giorno e una sola idea.</p>
        <div class="campi" style="margin-top:22px">
          ${campo('bIdea', 'Cosa faresti vedere', b.idea, { lungo: true, chiave: 'idea',
            segna: 'Una ricetta con le proteine alla vaniglia girata la mattina presto, come la faccio davvero prima di allenarmi.',
            aiuto: 'Una scena, non una categoria.' })}
        </div>
      </div>

      <div class="blocco">
        <h3>cosa ti serve da loro</h3>
        <p class="sotto">Dirlo adesso evita il rimpallo di messaggi dopo.</p>
        <div class="campi" style="margin-top:22px">
          ${campo('bServe', 'Prodotto, materiali, indicazioni', b.serve, { chiave: 'serve',
            segna: 'Un campione del gusto vaniglia e le indicazioni su cosa non dire',
            aiuto: 'Se non ti serve niente, scrivi «niente».' })}
        </div>
      </div>`,

    chiedo: `
      <div class="blocco">
        <h3>quanto chiedi</h3>
        <p class="sotto">Una cifra scritta chiara fa risparmiare tempo a tutti e due.
          Resta trattabile: è una proposta.</p>
        <div class="opzioni-riga" style="margin-top:22px">
          ${FORMULE.map(f => `<button class="opz" data-campo="formula" data-valore="${f.k}"
            aria-pressed="${b.formula === f.k}"><span class="segno"></span>
            <span><span class="t">${f.t}</span><span class="d">${f.d}</span></span></button>`).join('')}
        </div>
        <div class="campi due-col" style="margin-top:24px">
          ${['fisso','prodotto','continua'].includes(b.formula)
            ? campo('bCachet', 'Quanto chiedi, in euro', b.cachet, { tipo: 'numeric', chiave: 'cachet',
                aiuto: b.formula === 'continua' ? 'Al mese. È la cifra che ti arriva.' : 'È la cifra che ti arriva: Leucoteo non trattiene niente.' }) : ''}
        </div>

        ${+b.cachet ? `
        <div class="scheda tagliato su2" style="margin-top:22px">
          <div class="tabulato">
            <div class="tab-r"><span class="k">Chiedi</span><span class="g"></span><span class="n">${eur2(k.lordo)}</span></div>
            <div class="tab-r"><span class="k">Trattenuto da Leucoteo</span><span class="g"></span><span class="n">gratis · beta</span></div>
            <div class="tab-r tot"><span class="k">Ti arrivano</span><span class="g"></span><span class="n">${eur2(k.lordo)}</span></div>
          </div>
          <p class="gri xs" style="margin-top:12px">Come dichiarare questa cifra dipende dal tuo
            regime fiscale: quello lo decidi tu con il tuo commercialista, Leucoteo non calcola
            imposte al posto tuo.</p>
        </div>` : ''}
      </div>

      <div class="blocco">
        <h3>cosa concedi</h3>
        <p class="sotto">I diritti d&rsquo;uso li dai tu, quindi decidi tu cosa offrire.
          Concedere di più giustifica un prezzo più alto: è la voce che vale di più.</p>
        <div class="opzioni-riga" style="margin-top:22px">
          ${DIRITTI.map(d => `<button class="opz" data-campo="diritti" data-valore="${d.k}"
            aria-pressed="${b.diritti === d.k}"><span class="segno"></span>
            <span><span class="t">${d.t}</span><span class="d">${d.d}</span></span></button>`).join('')}
        </div>
        <div class="campi" style="margin-top:22px">
          ${campo('bEsclusiva', 'Esclusiva che offri', b.esclusiva, { chiave: 'esclusiva',
            segna: 'Nessuna, oppure: 30 giorni sulla categoria',
            aiuto: 'Offrirla è una carta in mano tua. Se la offri, fattela pagare.' })}
        </div>
      </div>`,

    quando: `
      <div class="blocco">
        <h3>quando puoi</h3>
        <div class="campi due-col" style="margin-top:22px">
          ${campo('bDal', 'Disponibile dal', b.disponibileDal, { chiave: 'disponibileDal',
            segna: '15 set', aiuto: 'Quando puoi cominciare a girare.' })}
          ${campo('bConsegna', 'Consegneresti entro', b.consegnaEntro, { chiave: 'consegnaEntro',
            segna: '30 set', aiuto: 'Sii realistico: la puntualità finisce nel tuo storico.' })}
        </div>
        <div class="campi" style="margin-top:20px">
          ${campo('bNote', 'Altro da dire', b.note, { lungo: true, chiave: 'note',
            segna: 'Disponibile a una call di 15 minuti. In ottobre sono in viaggio due settimane.' })}
        </div>
        <div class="nota" style="margin-top:20px;font-size:13.5px">
          <b>La puntualità è l&rsquo;unica cosa che ti porti dietro.</b> Ogni consegna in tempo
          finisce nello storico verificato, e le aziende la vedono prima di scriverti.
        </div>
      </div>`
  };

  const soldiEtichetta = versoCreator ? 'costo indicativo' : 'quanto chiedi';

  return `
  <button class="btn p ghost rise" data-annulla-proposta style="margin-bottom:26px">${ICO.indietro()} Annulla</button>

  <div class="blocco rise" style="margin-bottom:18px">
    <div class="riga" style="gap:16px;flex-wrap:nowrap">
      ${ava(versoCreator ? 'creator' : 'azienda')}
      <div class="crescita">
        <div class="uc gri">${versoCreator ? 'richiesta a' : 'candidatura a'}</div>
        <h3 style="font-weight:700;font-size:20px;letter-spacing:var(--tr-l);text-transform:lowercase;margin-top:6px">${b.destinatario.toLowerCase()}</h3>
      </div>
      <div style="text-align:right;flex:none">
        <div class="uc gri">${soldiEtichetta}</div>
        <div class="cifra" style="font-size:26px;margin-top:6px">${eur(+b.cachet || 0)}</div>
      </div>
    </div>
  </div>

  <div class="modulo-lungo">
    <div class="passo-mobile" aria-hidden="true">
      <div class="riga tra" style="gap:12px">
        <span class="ora">${S.passoProposta + 1} di ${lista.length} · ${lista[S.passoProposta].t}</span>
        <span class="gri xs">${Math.round((S.passoProposta + 1) / lista.length * 100)}%</span>
      </div>
      <div class="barra" style="margin-top:10px"><i style="width:${(S.passoProposta + 1) / lista.length * 100}%"></i></div>
    </div>
    <nav class="passi-lato rise" aria-label="Sezioni della proposta">
      ${lista.map((s, i) => `<button data-passo-proposta="${i}"
        ${i === S.passoProposta ? 'aria-current="step"' : ''} class="${i < S.passoProposta ? 'fatto' : ''}">
        <span class="nu">${i < S.passoProposta ? '✓' : i + 1}</span>${s.t}</button>`).join('')}
    </nav>
    <div class="rise">
      ${blocchi[sez]}
      <div class="riepilogo piede-flusso">
        <span class="gri sm quanti">Sezione ${S.passoProposta + 1} di ${lista.length}</span>
        <div class="mosse">
          ${S.passoProposta > 0 ? `<button class="btn p ghost tap indietro" data-passo-proposta="${S.passoProposta - 1}">Indietro</button>` : ''}
          ${S.passoProposta < lista.length - 1
            ? `<button class="btn p tap avanti ${versoCreator ? 'due' : ''}" data-passo-proposta="${S.passoProposta + 1}">Avanti ${ICO.avanti()}</button>`
            : `<button class="btn p tap avanti ${versoCreator ? 'due' : ''}" data-invia-proposta>${versoCreator ? 'Invia la richiesta' : 'Invia la candidatura'}</button>`}
        </div>
      </div>
    </div>
  </div>`;
}

/* le righe dei contenuti: stessa forma dalle due parti, cambia solo
   che da un lato si chiedono e dall'altro si offrono */
function righeConsegne(b, modo = 'richiesta') {
  return `
    <div class="campi" style="margin-top:22px">
      ${b.consegne.map((d, i) => `
      <div class="riga-consegna ${i ? 'senza-etichette' : ''}">
        <div class="campo-g"><label class="etichetta" for="dF${i}">Formato</label>
          <select class="campo" id="dF${i}" data-consegna="${i}" data-chiave="formato">
            ${FORMATI.map(f => `<option value="${f.k}" ${d.formato === f.k ? 'selected' : ''}>${f.t}</option>`).join('')}
          </select></div>
        <div class="campo-g"><label class="etichetta" for="dQ${i}">Quanti</label>
          <input class="campo" id="dQ${i}" value="${d.quanti}" inputmode="numeric"
            data-consegna="${i}" data-chiave="quanti"></div>
        <div class="campo-g"><label class="etichetta" for="dE${i}">${modo === 'proposta' ? 'Consegno entro' : 'Entro il'}</label>
          <input class="campo" id="dE${i}" value="${d.entro}" placeholder="27 ago"
            data-consegna="${i}" data-chiave="entro"></div>
        ${b.consegne.length > 1
          ? `<button class="togli" data-togli-consegna="${i}" aria-label="Togli">${ICO.scartato()}</button>`
          : '<span></span>'}
      </div>`).join('')}
    </div>`;
}

/* ============================================================
   LA COLLABORAZIONE
   ============================================================ */
function vistaCollab(c) {
  const k = conto(c), io = S.lato, t = turno(c);
  const altro = io === 'creator' ? c.azienda : c.creator;
  const ini = io === 'creator' ? c.aziendaIni : c.creatorIni;
  const fine = conclusa(c);
  const mio = t.chi === io;
  const consegnati = c.consegne.filter(d => d.s === 'consegnato').length;
  const diritto = DIRITTI.find(d => d.k === c.diritti) || DIRITTI[0];
  const formula = FORMULE.find(f => f.k === c.formula) || FORMULE[0];

  let bottone = '';
  if (mio) {
    if (c.passo === 0) bottone =
      `<div class="riga" style="gap:8px">
        <button class="btn ${io === 'creator' ? '' : 'due'}" data-avanza="${c.id}">Accetta e firma</button>
        <button class="btn ghost p" data-avviso="Rilancio inviato">Rilancia</button>
      </div>`;
    else if (c.passo <= 2) bottone = `<button class="btn" data-avanza="${c.id}">Carica l'ultimo contenuto</button>`;
    else if (c.passo === 3) bottone =
      `<div class="riga" style="gap:8px">
        <button class="btn due" data-avanza="${c.id}">Approva il lavoro</button>
        <button class="btn ghost p" data-avviso="Richiesta di modifica inviata">Chiedi una modifica</button>
      </div>`;
    else if (c.passo === 4) bottone = `<button class="btn due" data-avanza="${c.id}">Ho disposto il bonifico</button>`;
  }

  /* il riquadro con le coordinate: solo all'azienda, solo dopo l'approvazione */
  const banca = CREATOR.banca;
  const mostraBanca = io === 'azienda' && c.passo >= 4;

  return `
  <button class="btn p ghost rise" data-vai="collab" style="margin-bottom:34px">${ICO.indietro()} Tutte le collaborazioni</button>

  <div class="scheda registro ${fine ? 'allineato' : ''} faldone contro tagliato su2 rise"
       data-cod="${c.id} · ${fine ? 'conclusa' : 'aperta'}">
    <div class="riga tra" style="align-items:flex-start;gap:20px">
      <div class="crescita" style="min-width:240px">
        ${segnaleTurno(c)}
        <h3 style="font-size:21px;margin-top:12px">${c.titolo}</h3>
        <div class="riga" style="margin-top:12px">${ava(altroLato())}
          <span class="gri2 sm">${altro} · ${formula.t.toLowerCase()}</span></div>
      </div>
      <div style="text-align:right">
        <div class="uc gri">compenso</div>
        <div class="cifra" style="font-size:34px;margin-top:6px">${eur(c.cachet)}</div>
        <div class="gri sm" style="margin-top:6px">${FORMULE.find(f => f.k === c.formula)?.t.toLowerCase() || ''}</div>
      </div>
    </div>
    <div style="margin-top:22px">${percorso(c)}</div>
  </div>

  ${!fine ? `
  <div class="adesso ${mio ? 'mio' : ''} rise">
    <span class="bollo ${mio ? '' : 'spenta'}">${
      c.passo === 0 ? ICO.contratto() : c.passo <= 2 ? ICO.consegna()
      : c.passo === 3 ? ICO.fatto() : ICO.banca()}</span>
    <div class="crescita">
      <h3>${mio ? 'Adesso tocca a te' : `Adesso tocca a ${t.chi === 'creator' ? c.creator.split(' ')[0] : c.azienda}`}</h3>
      <p>${t.frase}</p>
    </div>
    ${bottone ? `<div class="mossa">${bottone}</div>` : ''}
  </div>` : ''}

  ${mostraBanca ? `
  <div class="blocco rise" style="margin-top:18px;border-left:3px solid var(--acc)">
    <div class="riga" style="gap:12px"><span class="bollo">${ICO.banca()}</span>
      <h3 class="crescita">dove pagare ${c.creator.split(' ')[0]}</h3>
      ${pil('visibile solo a te', 'corso')}</div>
    <p class="sotto">Il bonifico lo disponi tu dalla tua banca: Leucoteo non tocca denaro.
      Quando l’hai fatto, segnalo qui sopra — ${c.creator.split(' ')[0]} confermerà l’incasso.</p>
    <div class="campi" style="margin-top:22px">
      <div class="campo-g"><span class="etichetta">Intestatario</span>
        <div class="iban">${banca.intestatario}</div></div>
      <div class="campo-g"><span class="etichetta">IBAN</span>
        <div class="iban"><span>${banca.iban}</span>
          <button class="btn p ghost copia" data-avviso="IBAN copiato">Copia</button></div>
        <span class="aiuto">${banca.banca}</span></div>
      <div class="campo-g"><span class="etichetta">Causale suggerita</span>
        <div class="iban" style="font-size:14px"><span>Compenso collaborazione ${c.id} — ${c.titolo}</span>
          <button class="btn p ghost copia" data-avviso="Causale copiata">Copia</button></div></div>
    </div>
    <div class="tabulato" style="margin-top:22px">
      <div class="tab-r"><span class="k">Compenso concordato</span><span class="g"></span><span class="n">${eur2(k.lordo)}</span></div>
      <div class="tab-r tot"><span class="k">Da bonificare</span><span class="g"></span><span class="n">${eur2(k.lordo)}</span></div>
    </div>
    <p class="gri xs" style="margin-top:12px">È la cifra concordata, senza altro. Il documento
      fiscale e le eventuali trattenute li gestite voi due come sempre: Leucoteo non calcola
      imposte e non emette documenti al posto vostro.</p>
    <button class="btn p ghost pieno" style="margin-top:18px" data-avviso="Riepilogo scaricato">Scarica il riepilogo dell’accordo</button>
  </div>` : ''}

  <div class="tremezzo" style="margin-top:26px">
    <div>
      ${titoloSez('cosa è stato concordato')}
      <div class="scheda rise">
        <div class="tabulato">
          <div class="tab-r"><span class="k">Formula</span><span class="g"></span><span class="n">${formula.t}</span></div>
          <div class="tab-r"><span class="k">Prodotti</span><span class="g"></span><span class="n">${c.prodotti || '—'}</span></div>
          <div class="tab-r"><span class="k">Diritti d’uso</span><span class="g"></span><span class="n">${diritto.t}</span></div>
          <div class="tab-r"><span class="k">Esclusiva</span><span class="g"></span><span class="n">${c.esclusiva}</span></div>
          <div class="tab-r"><span class="k">Consegna entro</span><span class="g"></span><span class="n">${c.scadenzaConsegna}</span></div>
          <div class="tab-r"><span class="k">Pubblicazione entro</span><span class="g"></span><span class="n">${c.scadenzaPubblicazione}</span></div>
          ${c.codice && c.codice !== '—' ? `<div class="tab-r"><span class="k">Codice sconto</span><span class="g"></span><span class="n acc">${c.codice}</span></div>` : ''}
        </div>
        ${c.brief ? `<div class="nota" style="margin-top:20px;font-size:13.5px"><b>Brief.</b> ${c.brief}</div>` : ''}
      </div>

      ${titoloSez('la storia')}
      <div class="scheda rise">
        <div class="spina">
          ${PASSI.map((p, i) => {
            const stato = i < c.passo || fine ? 'fatto' : i === c.passo ? 'ora' : 'futuro';
            let quando = p.d;
            if (i === 0 && c.passo > 0) quando = 'accettata';
            if (i === 1 && c.firmata) quando = c.firmata;
            if (i === 4 && c.pagata) quando = c.pagata;
            if (i === 5 && c.incassata) quando = c.incassata;
            return `<div class="nodo ${stato}"><div class="t">${p.t}</div><div class="d">${quando}</div></div>`;
          }).join('')}
        </div>
      </div>

      ${titoloSez('consegne', `<span class="conta-sez ${consegnati === c.consegne.length ? '' : 'spenta'}">${consegnati}/${c.consegne.length}</span>`)}
      <div class="scheda rise">
        ${c.consegne.map(d => `
          <div class="consegna ${d.s === 'consegnato' ? 'ok' : ''}">
            <span class="box" aria-hidden="true">${d.s === 'consegnato' ? '✓' : ''}</span>
            <div class="crescita"><div class="t">${d.t}</div>
              <div class="d"><span>${d.s === 'consegnato' ? 'consegnato il ' + d.d
                : d.s === 'atteso' ? 'atteso entro il ' + d.d : 'da definire'}</span>
                ${d.adv ? pil('#adv verificato', 'corso') : ''}</div></div>
          </div>`).join('')}
      </div>

      ${c.link ? `
      ${titoloSez('quante persone ha portato')}
      <div class="scheda rise">
        <div class="riga tra" style="gap:14px;flex-wrap:wrap">
          <div><div class="uc gri">dal link</div>
            <div class="cifra acc" style="font-size:30px;margin-top:6px">${num(c.link.clic)}</div></div>
          <div style="text-align:right">
            <div class="mono sm gri">${c.link.url}</div>
            <div class="gri xs" style="margin-top:6px">creato il ${c.link.creato} ·
              ${c.link.attivo ? 'attivo' : 'chiuso'}</div>
          </div>
        </div>
        <p class="gri xs" style="margin-top:16px">Sono visite al sito, non vendite: il link passa
          dal redirect di Leucoteo, quindi i clic li contiamo noi. Cosa succede dopo lo sa solo
          l'azienda, dalle sue analitiche.</p>
      </div>` : fine ? `
      ${titoloSez('il link')}
      <div class="scheda rise">
        <p class="gri sm">La collaborazione è chiusa ma non c'è ancora un link.
          ${io === 'azienda'
            ? 'Creandolo saprai quante persone ti ha portato — e lo saprà anche il creator, che è il motivo per cui tornerà a lavorare con te.'
            : 'Lo crea l\'azienda: quando lo fa, i clic compaiono qui e finiscono nel tuo storico.'}</p>
        ${io === 'azienda' ? `<button class="btn p due" style="margin-top:16px"
          data-crea-link="${c.id}">Crea il link</button>` : ''}
      </div>` : ''}
    </div>

    <div>
      ${titoloSez(io === 'creator' ? 'quanto ti arriva' : 'quanto ti costa')}
      <div class="scheda tagliato su2 rise">
        <div class="tabulato">
          <div class="tab-r"><span class="k">Compenso</span><span class="g"></span><span class="n">${eur2(c.cachet)}</span></div>
          <div class="tab-r"><span class="k">Quota Leucoteo</span>
            <span class="g"></span><span class="n">gratis · beta</span></div>
          <div class="tab-r tot"><span class="k">${io === 'creator' ? 'A te' : 'Totale a tuo carico'}</span><span class="g"></span><span class="n">${eur2(k.lordo)}</span></div>
        </div>
        <p class="gri xs" style="margin-top:14px">${io === 'creator'
          ? 'È la cifra concordata: Leucoteo non trattiene niente e non calcola imposte. Come la dichiari lo decidi tu.'
          : 'Leucoteo non trattiene niente e non entra nel bonifico: paghi solo il creator.'}</p>
      </div>

      ${titoloSez('la chiusura')}
      ${fine ? `
      <div class="rilascio rise">
        <div style="width:110px;margin:0 auto">${moneta('on')}</div>
        <div class="eti fatto uc" style="margin-top:18px">incasso confermato</div>
        <p class="gri sm" style="margin-top:10px">${eur2(k.lordo)} ricevuti il ${c.incassata}. Le due metà combaciano.</p>
      </div>` : c.passo === 5 && io === 'creator' ? `
      <div class="rilascio rise">
        <div class="presa" id="presaRil" role="slider" tabindex="0"
             aria-label="Trascina verso il basso per confermare che il bonifico è arrivato"
             aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">${moneta('libera')}</div>
        <div class="eti uc" id="etiRil" style="margin-top:18px">trascina giù per confermare ${eur2(k.lordo)}</div>
        <p class="gri sm" style="margin-top:10px">Confermalo solo quando li vedi sul conto:
          da qui in poi la collaborazione risulta chiusa e pagata.</p>
      </div>` : `
      <div class="rilascio rise">
        <div style="width:100px;margin:0 auto">${moneta(c.passo === 0 ? 'vuota' : '')}</div>
        <div class="eti uc" style="margin-top:18px">${c.passo === 0 ? 'non ancora aperto' : 'accordo aperto'}</div>
        <p class="gri sm" style="margin-top:10px">${c.passo === 0
          ? 'Le due metà si toccano quando l’accordo è firmato.'
          : 'Si allineano quando il creator conferma di aver incassato.'}</p>
      </div>`}

      <div class="scheda rise" style="margin-top:16px">
        <div class="riga" style="gap:12px"><span class="bollo ${c.firmata ? '' : 'spenta'}">${ICO.contratto()}</span>
          <h3 class="crescita">l'accordo</h3></div>
        <p class="gri sm" style="margin-top:12px">${c.firmata
          ? `Accettato dalle due parti il ${c.firmata}, con marca temporale, indirizzo IP e conferma via codice.`
          : 'Non ancora firmato. Il testo è già compilato con i termini della richiesta.'}</p>
        <button class="btn p ghost pieno" style="margin-top:14px" data-avviso="${c.firmata ? 'PDF scaricato' : 'Anteprima dell’accordo'}">
          ${c.firmata ? 'Scarica il PDF firmato' : 'Leggi l’accordo'}</button>
      </div>

      ${c.giudizio ? `
      <div class="scheda rise" style="margin-top:16px">
        <h3>come è andata</h3>
        <div style="margin-top:14px">${stelle(io === 'creator' ? c.giudizio.azienda : c.giudizio.creator)}</div>
        <p class="gri sm" style="margin-top:12px">${c.giudizio.nota}</p>
      </div>` : ''}
    </div>
  </div>`;
}

/* ============================================================
   DISEGNO
   ============================================================ */
/* ============================================================
   IL GUSCIO — navigazione, movimento, pannelli
   Tutto ciò che riguarda il contenitore sta qui, così le viste
   restano pure funzioni che restituiscono HTML.
   ============================================================ */

const tocco = () => matchMedia('(max-width:860px)').matches;
const calmo = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --- la pastiglia: un solo oggetto che scivola.
       Sul fianco si muove in verticale, nel dock in orizzontale, ma è la
       stessa idea e lo stesso elemento. --- */
function posaPastiglia() {
  const menu = el('menu');
  if (!menu) return;
  const attivo = menu.querySelector('button[aria-current="page"]');
  if (!attivo) { menu.style.setProperty('--pill-o', '0'); return; }
  const m = menu.getBoundingClientRect(), b = attivo.getBoundingClientRect();
  if (tocco()) {
    menu.style.setProperty('--pill-x', (b.left - m.left) + 'px');
    menu.style.setProperty('--pill-w', b.width + 'px');
  } else {
    menu.style.setProperty('--pill-y', (b.top - m.top) + 'px');
    menu.style.setProperty('--pill-h', b.height + 'px');
  }
  menu.style.setProperty('--pill-o', '1');
}
addEventListener('resize', posaPastiglia, { passive: true });

/* --- il fianco si richiude, e se lo ricorda --- */
const PIEGA = 'leucoteo:fianco';
function fianco(stato) {
  document.body.dataset.fianco = stato;
  el('piega').setAttribute('aria-expanded', String(stato === 'aperto'));
  el('piega').setAttribute('aria-label', stato === 'aperto' ? 'Riduci il menu' : 'Allarga il menu');
  try { localStorage.setItem(PIEGA, stato); } catch (e) {}
}
try {
  const salvato = localStorage.getItem(PIEGA);
  /* sul tablet parte chiuso: lo schermo è troppo stretto per un fianco disteso */
  fianco(salvato || (matchMedia('(max-width:1180px)').matches ? 'chiuso' : 'aperto'));
} catch (e) { fianco('aperto'); }
el('piega').addEventListener('click', () => {
  fianco(document.body.dataset.fianco === 'aperto' ? 'chiuso' : 'aperto');
  /* la card cambia larghezza per mezzo secondo: la pastiglia la insegue
     invece di restare dov'era */
  const fine = performance.now() + 460;
  (function insegui() {
    posaPastiglia();
    if (performance.now() < fine) requestAnimationFrame(insegui);
  })();
});

/* --- il pannello: sale dal basso su telefono, compare in un angolo su desktop --- */
let fogliOra = false;
function apriFoglio(html) {
  el('foglio').innerHTML = `<div class="maniglia" aria-hidden="true"></div>${html}`;
  el('velo').classList.add('qui');
  el('foglio').classList.add('qui');
  fogliOra = true;
}
function chiudiFoglio() {
  el('velo').classList.remove('qui');
  el('foglio').classList.remove('qui');
  fogliOra = false;
}
el('velo').addEventListener('click', chiudiFoglio);
addEventListener('keydown', e => { if (e.key === 'Escape' && fogliOra) chiudiFoglio(); });

/* trascinando il foglio verso il basso si chiude, come ovunque su un telefono */
(function trascinaFoglio() {
  const f = el('foglio');
  let y0 = null, dy = 0;
  f.addEventListener('touchstart', e => {
    if (f.scrollTop > 0) return;
    y0 = e.touches[0].clientY; dy = 0; f.style.transition = 'none';
  }, { passive: true });
  f.addEventListener('touchmove', e => {
    if (y0 === null) return;
    dy = Math.max(0, e.touches[0].clientY - y0);
    f.style.transform = `translate3d(0,${dy}px,0)`;
  }, { passive: true });
  f.addEventListener('touchend', () => {
    if (y0 === null) return;
    f.style.transition = ''; f.style.transform = '';
    if (dy > 90) chiudiFoglio();
    y0 = null;
  });
})();

function pannelloIo() {
  const c = S.lato === 'creator';
  const chi = c ? CREATOR : AZIENDA;
  return `
    <div class="riga" style="gap:14px;margin-bottom:20px">
      ${ava(S.lato, 'g', chi.foto)}
      <div class="crescita" style="min-width:0">
        <div style="font-weight:600;font-size:17px">${chi.nome}</div>
        <div class="gri sm" style="margin-top:3px">${c ? CREATOR.handle : AZIENDA.sito}</div>
      </div>
    </div>
    <div style="margin-bottom:14px">${segnaleRicerca()}</div>
    <div class="menu-foglio">
      <button class="tap" data-vai="profilo">${ICO.mediakit()}<span>Il tuo profilo</span></button>
      <button class="tap" data-vai="impostazioni">${ICO.impostazioni()}<span>Impostazioni</span></button>
      <a class="tap" href="index.html">${ICO.indietro()}<span>Torna al sito</span></a>
    </div>`;
}
el('io').addEventListener('click', () => apriFoglio(pannelloIo()));

/* --- la testata si ritira mentre scendi, e il dock si toglie di mezzo --- */
(function scorrimento() {
  let ultimo = 0, fermo;
  addEventListener('scroll', () => {
    const y = scrollY;
    if (tocco() && !calmo()) {
      /* si nasconde solo scendendo, e solo dopo un tratto vero */
      if (y > ultimo + 8 && y > 140) document.body.classList.add('dock-via');
      else if (y < ultimo - 6) document.body.classList.remove('dock-via');
      clearTimeout(fermo);
      fermo = setTimeout(() => document.body.classList.remove('dock-via'), 900);
    }
    ultimo = y;
  }, { passive: true });
})();

/* --- ogni cambio di vista è una piccola scena: il contenuto entra,
       le liste si compongono, i numeri salgono --- */
function animaVista() {
  const v = el('vista');
  /* un solo sistema di entrata: tutto ciò che era .rise diventa .su,
     così non ci sono due meccanismi che si contendono gli stessi nodi */
  const pezzi = [...v.querySelectorAll('.rise, .compito, .collab, .trovato, .scheda, .cardino, .blocco, .storia-riga')];
  pezzi.forEach(e => { e.classList.remove('rise', 'in'); e.classList.add('su'); });

  if (calmo()) { pezzi.forEach(e => e.classList.add('in')); return; }

  v.classList.remove('vista-nuova'); void v.offsetWidth; v.classList.add('vista-nuova');

  /* quelle già a schermo si compongono subito e in ordine;
     le altre aspettano di essere raggiunte scorrendo */
  const alto = innerHeight;
  let n = 0;
  const dopo = [];
  pezzi.forEach(e => {
    if (e.getBoundingClientRect().top < alto) { e.style.setProperty('--i', Math.min(n++, 9)); }
    else { e.style.setProperty('--i', 0); dopo.push(e); }
  });
  requestAnimationFrame(() => requestAnimationFrame(() =>
    pezzi.filter(e => !dopo.includes(e)).forEach(e => e.classList.add('in'))));

  if (dopo.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(voci => {
      voci.filter(x => x.isIntersecting).forEach((x, i) => {
        setTimeout(() => x.target.classList.add('in'), i * 55);
        io.unobserve(x.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: .08 });
    dopo.forEach(e => io.observe(e));
  } else dopo.forEach(e => e.classList.add('in'));

  v.querySelectorAll('.dato .v, .saldo .q, .collab .imp').forEach((e, i) => {
    e.classList.remove('cifra-viva'); void e.offsetWidth;
    e.style.animationDelay = Math.min(i, 8) * 55 + 'ms';
    e.classList.add('cifra-viva');
  });

  v.querySelectorAll('.barra i').forEach(b => {
    const w = b.style.width; b.style.width = '0';
    requestAnimationFrame(() => requestAnimationFrame(() => { b.style.width = w; }));
  });
  v.querySelectorAll('.isto .b').forEach((b, i) => {
    const h = b.style.height; b.style.height = '0';
    setTimeout(() => { b.style.height = h; }, 40 + i * 28);
  });
  /* il percorso si accende una tappa alla volta */
  v.querySelectorAll('.percorso').forEach(pc => {
    pc.querySelectorAll('.tappa.fatta, .tappa.ora').forEach((tp, i) => {
      tp.style.transitionDelay = (90 + i * 90) + 'ms';
      setTimeout(() => { tp.style.transitionDelay = ''; }, 900);
    });
  });
}

function disegna() {
  document.body.dataset.lato = S.lato;
  scriviIndirizzo();

  /* Su telefono il dock tiene cinque icone: le voci principali e basta.
     Impostazioni e cambio lato vivono nel pannello del ritratto, in alto
     a destra — cose che si toccano una volta, non ogni minuto. */
  el('menu').innerHTML = MENU[S.lato].map(v => {
    const conteggio = v.k === 'oggi' ? aperte().filter(c => turno(c).chi === S.lato).length : 0;
    const qui = S.vista === v.k && !S.aperta && !S.schedaCreator;
    return `<button class="tap" data-vai="${v.k}" ${qui ? 'aria-current="page"' : ''} aria-label="${v.t}">
      <span class="ic">${v.ic()}</span><span class="et">${v.t}</span>
      ${conteggio ? `<span class="cont">${conteggio}</span>` : ''}
      <span class="sugg" aria-hidden="true">${v.t}</span></button>`;
  }).join('') + `<button class="tap solo-largo" data-vai="impostazioni" aria-label="Impostazioni"
      ${S.vista === 'impostazioni' ? 'aria-current="page"' : ''}>
      <span class="ic">${ICO.impostazioni()}</span><span class="et">Impostazioni</span>
      <span class="sugg" aria-hidden="true">Impostazioni</span></button>`;
  posaPastiglia();

  /* il segnale di ricerca sta sopra il menu: è la prima cosa da
     decidere ogni volta che si apre l'app */
  el('cerca').innerHTML = segnaleRicerca();

  const chi = S.lato === 'creator'
    ? { ini: CREATOR.ini, n: CREATOR.nome, r: 'creator · verificata', foto: CREATOR.foto }
    : { ini: AZIENDA.ini, n: AZIENDA.nome, r: 'azienda · verificata', foto: AZIENDA.foto };
  el('chi').innerHTML = `${ava(S.lato, '', chi.foto)}
    <div class="testo"><div class="n">${chi.n}</div><div class="r">${chi.r}</div></div>`;
  el('io').innerHTML = ava(S.lato, '', chi.foto);

  /* l'azione principale del lato che stai guardando */
  /* Una proposta ha sempre un destinatario: l'azione principale porta
     a sceglierlo, non a un modulo vuoto. */
  const primaria = S.lato === 'azienda'
    ? { et: 'Nuova richiesta', vai: 'creator' }
    : { et: 'Proponiti', vai: 'aziende' };
  el('primaAzioneEt').textContent = primaria.et;
  el('primaAzione').dataset.vai = primaria.vai;


  const v = MENU[S.lato].find(m => m.k === S.vista);
  const c = S.aperta ? COLLAB.find(x => x.id === S.aperta) : null;
  let titolo, sotto;
  if (c) { titolo = c.id; sotto = c.titolo; }
  else if (S.vista === 'proposta') {
    /* le due strade non si chiamano allo stesso modo: un'azienda chiede,
       un creator si propone */
    const candidatura = S.bozza && S.bozza.verso === 'azienda';
    titolo = candidatura ? 'Nuova candidatura' : 'Nuova richiesta';
    sotto = candidatura
      ? 'Un’idea concreta vale più di dieci messaggi in privato'
      : 'Più è precisa, meno si discute dopo';
  }
  else if (S.vista === 'impostazioni') { titolo = 'Impostazioni'; sotto = 'Quello che si configura una volta sola'; }
  else if (S.schedaCreator) { titolo = S.schedaCreator; sotto = 'Storico verificato e disponibilità'; }
  else { titolo = (v || MENU[S.lato][0]).h; sotto = (v || MENU[S.lato][0]).s; }
  el('titolo').textContent = titolo;
  el('sottotitolo').textContent = sotto;

  el('azioniTestata').innerHTML =
    (!c && S.vista === 'profilo') ? `<a class="btn p" href="mediakit.html" target="_blank" rel="noopener">${ICO.occhio()} Anteprima pubblica</a>`
    : (!c && S.vista === 'creator' && !S.schedaCreator) ? ''
    : '';

  el('vista').innerHTML = c ? vistaCollab(c)
    : S.vista === 'proposta' ? vistaProposta()
    : (V[S.lato][S.vista] || V[S.lato].oggi)();

  /* un flusso concentrato (la proposta) non ha bisogno del dock:
     toglierlo dà una schermata intera e una CTA sola */
  document.body.classList.toggle('flusso', S.vista === 'proposta');
  posaPastiglia();
  animaVista();
  chiudiFoglio();

  scrollTo({ top: 0, behavior: 'instant' });
  attaccaGesto();
  attaccaFoto();
}

function attaccaGesto() {
  const presa = el('presaRil');
  if (!presa) return;
  const c = COLLAB.find(x => x.id === S.aperta);
  const k = conto(c);
  const eti = el('etiRil');
  gestoMoneta(presa.querySelector('.mon'), {
    corsa: 70,
    onCambio(q) { if (q > .35 && q < 1) eti.textContent = 'ancora un po’…'; },
    onChiuso() {
      eti.textContent = 'confermato';
      eti.classList.add('fatto');
      if (navigator.vibrate) navigator.vibrate([10, 30, 18]);
      /* il gesto più importante del prodotto merita la sua scena:
         le due metà combaciano, il riquadro si accende un istante */
      presa.classList.add('chiuso');
      avvisa(`Incasso confermato · ${eur2(k.lordo)} da ${c.azienda}`);
      setTimeout(() => {
        c.passo = PASSI.length; c.incassata = 'oggi · adesso';
        c.scadenzaConsegna = 'conclusa oggi';
        disegna();
      }, 900);
    }
  });
}

/* la foto del profilo: resta nel browser, non viene caricata da nessuna parte */
function attaccaFoto() {
  const f = el('fFoto');
  if (!f) return;
  f.addEventListener('change', () => {
    const file = f.files && f.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) return avvisa('Immagine troppo grande: massimo 4 MB');
    const lettore = new FileReader();
    lettore.onload = () => {
      (S.lato === 'creator' ? CREATOR : AZIENDA).foto = lettore.result;
      avvisa('Foto aggiornata');
      disegna();
    };
    lettore.readAsDataURL(file);
  });
}

/* ------------------------------------------------------------
   AZIONI
   ------------------------------------------------------------ */
function avanza(id) {
  const c = COLLAB.find(x => x.id === id);
  if (!c || conclusa(c)) return;
  if (c.passo === 0) { c.passo = 2; c.firmata = 'oggi · adesso'; avvisa('Accordo firmato da entrambe le parti'); }
  /* nota: ogni avanzamento ridisegna, e animaVista riaccende percorso,
     barre e cifre — il cambio di stato si vede, non va cercato */
  else if (c.passo <= 2) {
    c.consegne.forEach(d => { if (d.s !== 'consegnato') { d.s = 'consegnato'; d.d = 'oggi'; d.adv = true; } });
    c.passo = 3; avvisa('Contenuti consegnati e archiviati con data certa');
  }
  else if (c.passo === 3) { c.passo = 4; avvisa('Lavoro approvato · ora il bonifico'); }
  else if (c.passo === 4) { c.passo = 5; c.pagata = 'oggi · adesso'; avvisa('Bonifico dichiarato · in attesa della conferma'); }
  disegna();
}

let orologio;
function avvisa(t) {
  const a = el('avviso');
  a.innerHTML = `<span class="segno" aria-hidden="true"></span><span>${t}</span>`;
  a.classList.remove('qui'); void a.offsetWidth;
  a.classList.add('qui');
  if (navigator.vibrate && tocco()) navigator.vibrate(8);
  clearTimeout(orologio);
  orologio = setTimeout(() => a.classList.remove('qui'), 3400);
}

const MESI = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
function fra30Giorni() {
  const d = new Date(Date.now() + 30 * 864e5);
  return `${d.getDate()} ${MESI[d.getMonth()]} ${d.getFullYear()}`;
}

/* ------------------------------------------------------------
   ASCOLTI
   ------------------------------------------------------------ */
/* --- la tendina dei filtri: non decide niente da sola ---------
   Cambiare la scelta nel menù equivale a premere la pastiglia
   corrispondente, che è rimasta nel documento. Così esiste una
   sola strada per cambiare un filtro, e mobile e desktop non
   possono divergere. ------------------------------------------ */
document.addEventListener('change', (e) => {
  const sel = e.target.closest('select[data-tendina]');
  if (!sel) return;
  const bottone = document.querySelector(`[data-${sel.dataset.tendina}="${CSS.escape(sel.value)}"]`);
  if (bottone) bottone.click();
});

document.addEventListener('click', (e) => {
  const b = e.target.closest(`[data-vai],[data-apri],[data-avanza],[data-avviso],[data-proponi],[data-proponi-a],
    [data-ordina],[data-verificati],[data-incerca],[data-scheda],
    [data-ordina-azienda],[data-cat-azienda],[data-incerca-az],[data-passo-proposta],[data-campo],
    [data-aggiungi-consegna],[data-togli-consegna],[data-invia-proposta],[data-annulla-proposta],
    [data-consenso],[data-cerca],[data-scegli-anteprime],[data-anteprima],
    [data-crea-link],[data-listino],[data-inviate]`.replace(/\s+/g, ''));
  if (!b) return;

  if (b.dataset.vai !== undefined) {
    S.vista = b.dataset.vai; S.aperta = null; S.schedaCreator = null; return disegna();
  }
  if (b.dataset.apri) { S.aperta = b.dataset.apri; S.vista = 'collab'; S.schedaCreator = null; return disegna(); }
  if (b.dataset.scheda) { S.schedaCreator = b.dataset.scheda; S.vista = 'creator'; return disegna(); }
  if (b.dataset.avanza) return avanza(b.dataset.avanza);
  if (b.dataset.ordina) { S.ordina = b.dataset.ordina; return disegna(); }
  if (b.dataset.verificati !== undefined) { S.soloVerificati = !S.soloVerificati; return disegna(); }
  if (b.dataset.incerca !== undefined) { S.soloInCerca = !S.soloInCerca; return disegna(); }
  if (b.dataset.ordinaAzienda) { S.ordinaAzienda = b.dataset.ordinaAzienda; return disegna(); }
  if (b.dataset.catAzienda) {
    S.catAzienda = b.dataset.catAzienda;
    if (b.dataset.catAzienda === 'tutte') S.soloInCercaAz = false;
    return disegna();
  }
  if (b.dataset.incercaAz !== undefined) { S.soloInCercaAz = !S.soloInCercaAz; return disegna(); }
  if (b.dataset.consenso !== undefined) { CREATOR.consensoStorico = b.dataset.consenso === '1'; return disegna(); }
  /* --- il segnale di ricerca: si accende e si spegne ovunque compaia --- */
  if (b.dataset.cerca !== undefined) {
    const st = mioStato();
    st.attivo = !st.attivo;
    if (st.attivo) { st.dal = 'oggi'; st.scadeIl = fra30Giorni(); }
    avvisa(st.attivo
      ? 'Sei in cerca: compari in cima ai risultati'
      : 'Non compari più nelle ricerche');
    return disegna();
  }

  /* --- le tre anteprime delle schede creator --- */
  if (b.dataset.scegliAnteprime !== undefined) return apriFoglio(pannelloAnteprime());
  if (b.dataset.anteprima) {
    const k = b.dataset.anteprima;
    if (S.anteprime.includes(k)) {
      if (S.anteprime.length <= 1) return avvisa('Almeno un dato deve restare');
      S.anteprime = S.anteprime.filter(x => x !== k);
    } else {
      if (S.anteprime.length >= 3) return avvisa('Tre alla volta: togline uno');
      S.anteprime.push(k);
    }
    apriFoglio(pannelloAnteprime());
    return disegna();
  }

  /* --- il link affiliato lo crea l'azienda, a collaborazione chiusa --- */
  if (b.dataset.creaLink) {
    const c = COLLAB.find(x => x.id === b.dataset.creaLink);
    if (c && !c.link) {
      const chiave = c.azienda.toLowerCase().replace(/[^a-z]/g, '').slice(0, 2)
        + '-' + c.creator.split(' ')[0].toLowerCase();
      c.link = { url: `leucoteo.it/r/${chiave}`, clic: 0, creato: 'oggi', attivo: true };
      LINK.unshift({ id: 'L-' + (LINK.length + 1), creator: c.creator, ini: c.creatorIni,
        collab: c.id, url: c.link.url, creato: 'oggi', clic: 0, clic7g: 0, attivo: true,
        fonte: c.consegne.map(d => d.formato).join(' + ') });
      avvisa('Link creato: da adesso i clic si contano');
    }
    return disegna();
  }

  /* --- proposta --- */
  if (b.dataset.proponi) {
    S.bozza = nuovaBozza(b.dataset.proponi, 'creator');
    S.passoProposta = 0; S.vista = 'proposta'; S.aperta = null; S.schedaCreator = null;
    return disegna();
  }
  if (b.dataset.proponiA) {
    S.bozza = nuovaBozza(b.dataset.proponiA, 'azienda');
    S.passoProposta = 0; S.vista = 'proposta'; return disegna();
  }
  if (b.dataset.passoProposta !== undefined) {
    raccogliBozza(); S.passoProposta = +b.dataset.passoProposta; return disegna();
  }
  if (b.dataset.campo) {
    raccogliBozza();
    S.bozza[b.dataset.campo] = b.dataset.valore === 'toggle'
      ? !S.bozza[b.dataset.campo] : b.dataset.valore;
    return disegna();
  }
  if (b.dataset.inviate !== undefined) { S.inviateAperte = !S.inviateAperte; return disegna(); }
  if (b.dataset.listino) {
    raccogliBozza();
    const v = CREATOR.listino.find(l => l.k === b.dataset.listino);
    if (v) { S.bozza.cachet = v.p; avvisa(`${v.t} · ${v.n}`); }
    return disegna();
  }
  if (b.dataset.aggiungiConsegna !== undefined) {
    raccogliBozza(); S.bozza.consegne.push({ formato: 'storie', quanti: 1, entro: '' }); return disegna();
  }
  if (b.dataset.togliConsegna !== undefined) {
    raccogliBozza(); S.bozza.consegne.splice(+b.dataset.togliConsegna, 1); return disegna();
  }
  if (b.dataset.inviaProposta !== undefined) {
    raccogliBozza();
    avvisa(S.bozza.verso === 'creator'
      ? `Richiesta inviata a ${S.bozza.destinatario}`
      : `Candidatura inviata a ${S.bozza.destinatario}`);
    S.bozza = null; S.vista = 'collab'; return disegna();
  }
  if (b.dataset.annullaProposta !== undefined) {
    S.bozza = null; S.vista = S.lato === 'azienda' ? 'creator' : 'aziende'; return disegna();
  }

  if (b.dataset.avviso) return avvisa(b.dataset.avviso);
});

/* prima di ridisegnare, si tiene quello che l'utente ha già scritto */
function raccogliBozza() {
  if (!S.bozza) return;
  document.querySelectorAll('[data-bozza]').forEach(i => {
    if (i.dataset.bozza) S.bozza[i.dataset.bozza] = i.value;
  });
  document.querySelectorAll('[data-consegna]').forEach(i => {
    const d = S.bozza.consegne[+i.dataset.consegna];
    if (d) d[i.dataset.chiave] = i.value;
  });
}

addEventListener('hashchange', () => { leggiIndirizzo(); disegna(); });

const _m = el('marchioMon'); if (_m) _m.innerHTML = MONETA_SVG;
leggiIndirizzo();
disegna();
