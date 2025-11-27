# Daily Pulse – Product Brief

## 1. Visione

Daily Pulse è un assistente editoriale AI-driven che trasforma la routine LinkedIn in un flusso end-to-end:

> **ricerca → insight → scrittura → immagine → pubblicazione → apprendimento**

Obiettivo: consentire a founder, executive e creator di pubblicare contenuti autorevoli in pochi minuti, mantenendo **controllo umano totale** su testo, immagine e pubblicazione.

**Piattaforma v1.0**
La versione v1.0 di Daily Pulse è una **web app responsive**, ottimizzata per l’utilizzo **mobile da browser** (mobile-first). Non sono previste app native (iOS/Android) per questa prima versione.

---

## 2. Target e casi d'uso

### 2.1 Target

* Founder / CEO / C-level
* Consulenti ed esperti di settore
* Knowledge worker con forte (o desiderata) presenza professionale su LinkedIn

### 2.2 Casi d’uso chiave

1. Creare un **post quotidiano** in 5–10 minuti.
2. Mantenere **coerenza di personal brand** su temi, tono e qualità.
3. Avere una **curazione di insight sintetici** da fonti autorevoli (no feed infinito).
4. Gestire in un unico flusso:

   * ricerca contenuti,
   * generazione testo,
   * generazione immagine,
   * pubblicazione (o programmazione).

---

## 3. Principi di prodotto

1. **Human-in-control**

   * Nessuna pubblicazione automatica.
   * L’utente può modificare completamente testo e immagine.

2. **Qualità > quantità**

   * Poche fonti, ma autorevoli.
   * Pochi insight, ad alta densità informativa.

3. **Apprendimento progressivo**

   * Il sistema impara da engagement, scelte di tema, stile dei post.
   * Suggerimenti sempre più mirati.

4. **Esperienza mobile-first**

   * Ogni schermata ha un singolo focus.
   * Frizione minima nel flusso quotidiano.

---

## 4. Moduli funzionali

### 4.1 Calendario editoriale intelligente

* Vista settimanale (5–7 giorni) con card per ogni giorno.
* Ogni card contiene:

  * titolo tema (es. “Innovazione tecnologica”),
  * descrizione breve opzionale.
* Funzionalità:

  * drag & drop per spostare temi tra i giorni,
  * preset iniziale di temi,
  * salvataggio e duplicazione di “settimane tipo”.
* Suggerimenti:

  * suggerimenti di temi basati su settore utente,
  * in futuro: adattamento in base a storico di engagement.

---

### 4.2 Ricerca & Insight

* **Fonti baseline**:

  * Bloomberg
  * Harvard Business Review
  * MIT Technology Review
  * The Economist

* **Parametri di ricerca**:

  * tema del giorno (dal calendario),
  * settore utente,
  * finestra temporale (7–30 giorni).

* **Filtri**:

  * esclusione, ove possibile, di contenuti marcati come AI-generated non verificati,
  * priorità a articoli analitici e non promozionali.

* **Output**: per ogni tema del giorno, generare un **Insight Deck** composto da 3–5 card:

  * titolo,
  * fonte + data,
  * 3–5 bullet di sintesi,
  * link all’articolo originale,
  * **Pulse Score** (1–100).

* **Pulse Score** (logica concettuale):

  * allineamento al tema del giorno,
  * profondità analitica,
  * coerenza col settore dell’utente,
  * potenziale di stimolare discussione su LinkedIn.

> **Nota v1.0 (MVP)**:
> L’implementazione del Pulse Score può essere inizialmente semplificata, basata su: tema + recency + stima di profondità (via modello).

---

### 4.3 Generazione testi (Ghostwriter AI)

Obiettivo: generare una **bozza di post LinkedIn** con struttura precisa e adatta all’utente.

#### Struttura vincolata

Ogni post generato deve rispettare la seguente logica:

1. **HOOK**

   * Massimo 2 frasi.
   * Domanda provocatoria o dato forte.
   * Vietate aperture tipo “In questo post parlerò di…”.

2. **INSIGHT**

   * Ancorato ad almeno 1 insight selezionato dall’utente.
   * Non ripete letteralmente i bullet; li parafrasa e li interpreta.
   * 3–6 frasi o bullet brevi.

3. **HUMAN CONNECTION**

   * Sempre presente.
   * 1–2 frasi di esperienza, scenario concreto o prospettiva personale plausibile per un professionista nel ruolo specificato.

4. **OPEN LOOP**

   * Domanda aperta o invito alla conversazione.
   * Nessuna call-to-action di vendita in v1.0.

#### Tono di voce

* **Banditi**:

  * formule tipo “Gentili colleghi,”
  * slang fuori contesto,
  * emoji in quantità eccessiva.
* **Consentiti con moderazione**:

  * 0–2 emoji coerenti col contenuto.
* **Obbligatorio**:

  * tono assertivo, non aggressivo,
  * tecnico ma comprensibile per un professionista informato.

#### Lunghezza target

* Target: **700–1.400 caratteri** (range ottimale per LinkedIn).
* Se l’output supera una soglia (es. 1.600 caratteri), il sistema deve:

  * rigenerare con lunghezza ridotta, oppure
  * troncare in modo intelligente preservando HOOK + INSIGHT + OPEN LOOP.

#### Voice Match

* Visione completa:

  * Analisi dei post LinkedIn più performanti dell’utente per estrarre:

    * lunghezza media,
    * uso di frasi brevi/lunghe,
    * livello di tecnicismo,
    * uso di storytelling vs bullet.
  * Applicazione di questi pattern come vincoli per la generazione.

* **Nota v1.0 (MVP)**:

  * Per la prima versione, il modello usa un profilo di tono “professionista esperto” generico, con parametri regolabili (es. slider “più tecnico / più narrativo”).
  * Il vero Voice Match basato su analisi dei post esistenti è previsto come estensione successiva (vedi sezione 7.2, Voice Match semplificato).

#### UX

* L’utente seleziona 1–3 insight dal deck.
* Il sistema genera 1 bozza principale.
* L’utente può:

  * rigenerare la bozza mantenendo gli stessi insight,
  * modificare liberamente il testo in un editor con:

    * conteggio caratteri,
    * eventuali controlli rapidi su tono (più tecnico/narrativo),
  * duplicare la bozza,
  * salvare come **draft** senza pubblicare.

---

### 4.4 Generazione immagini (Direttore Artistico AI)

Obiettivo: fornire un’immagine che supporti visivamente il concetto del post e sia coerente nel tempo con la “identità visiva” dell’utente.

* **Stile**:

  * illustrato editoriale, ispirazione “Humaaans evoluto” / magazine editoriale.
  * evitare look stock/fotorealistico generico.

* **Palette**:

  * palette configurabile per utente (brand colors).
  * l’AI deve cercare coerenza cromatica tra i post dello stesso utente.

* **Concetto**:

  * l’AI interpreta il concetto chiave del post (es. “paradosso produttività”, “leadership remota”) e propone una **metafora visiva**.

* **UX**:

  * anteprima dell’immagine accanto al testo del post,
  * azioni:

    * rigenera immagine,
    * sostituisci con upload dell’utente,
    * prosegui anche senza immagine.

* **Output tecnico**:

  * v1.0: formato unico **1200x1200** ottimizzato per feed LinkedIn.
  * Futuro: supporto a 1200x1350 come formato aggiuntivo (vedi 7.3).

---

### 4.5 Pubblicazione & scheduling

Obiettivo: permettere all’utente di pubblicare (e in seguito programmare) il post su LinkedIn con frizione minima.

* **Integrazione LinkedIn**:

  * autenticazione via OAuth,
  * in v1.0: supporto **solo profilo personale**.

* **UI**:

  * la **card post** (testo + immagine) è l’unità centrale,
  * anteprima fedele di come apparirà su LinkedIn:

    * a capo,
    * spaziatura,
    * immagine.

* **Modalità v1.0 (MVP)**:

  * solo **“Pubblica ora”** con conferma esplicita.

* **Modalità successive (Fase 1.x)**:

  * **“Programma”**:

    * scelta data e ora,
    * orario consigliato (semplice, basato su best practice generali).
  * Queste funzionalità sono classificate come **Should-have / fase successiva** (vedi 7.2) e non sono richieste per la prima versione funzionante.

* **Analytics**:

  * v1.0:

    * salvataggio dei **metadata** del post pubblicato:

      * link,
      * timestamp,
      * eventuale id LinkedIn.
  * Fasi successive:

    * dashboard sintetica con:

      * impression,
      * like,
      * commenti,
      * share,
      * correlazione con tema/orario/struttura (vedi 7.2).

* **Vincolo assoluto**:

  * nessuna pubblicazione avviene senza azione esplicita dell’utente.

---

### 4.6 Personalizzazione & learning (Pulse Engine)

Obiettivo: usare i dati reali per affinare suggerimenti e generazione nel tempo.

* **Dati considerati**:

  * performance post: impression, like, commenti, share (quando disponibili),
  * temi utilizzati,
  * strutture/hook dei post più performanti,
  * orari di pubblicazione con più engagement.

* **Applicazioni**:

  * suggerire modifica di temi del calendario (aggiunta/rimozione/spostamento),
  * privilegiare strutture/lunghezze di post che storicamente performano meglio,
  * proporre finestre orarie “preferite” per l’utente,
  * prioritizzare insight con maggiore potenziale di generare discussione.

> Implementazione può essere inizialmente euristica e poi evolvere verso modelli più sofisticati.

---

## 5. Flusso utente end-to-end

### 5.1 Onboarding (primo utilizzo)

1. L’utente inserisce:

   * settore,
   * ruolo,
   * lingua principale,
   * obiettivo (enum: awareness / lead / autorevolezza).
2. Configura il **calendario temi**:

   * può accettare un preset,
   * può rinominare i temi,
   * può usare drag & drop.
3. Collega il profilo LinkedIn via OAuth (opzionale ma raccomandato).
4. (Fasi successive) Avvio di Voice Match analizzando un set di post esistenti.

### 5.2 Routine giornaliera

1. L’utente apre l’app → vede:

   * tema del giorno,
   * 3–5 insight con Pulse Score.
2. Seleziona 1–3 insight.
3. Il sistema genera:

   * bozza del post (HOOK → INSIGHT → HUMAN CONNECTION → OPEN LOOP),
   * proposta di immagine.
4. L’utente:

   * modifica il testo,
   * eventualmente rigenera l’immagine o carica la propria.
5. L’utente sceglie:

   * **“Pubblica ora”** (v1.0),
   * in fasi successive: “Programma”.
6. Il post viene pubblicato su LinkedIn.

**Tempo target v1.0**: 3–5 minuti per un utente abituale che fa solo review + piccole modifiche.

---

## 6. Vincoli tecnici e di sicurezza

* **LLM**:

  * modulo di generazione testo basato su LLM avanzato (via API).
* **Generazione immagini**:

  * modello di image generation dedicato, integrato via API.
* **Content retrieval**:

  * integrazione con fonti (Bloomberg, HBR, MIT Tech Review, The Economist) tramite API ufficiali o sistemi conformi ai termini d’uso.
* **Sicurezza e privacy**:

  * isolamento dei dati per account,
  * gestione sicura delle credenziali LinkedIn (OAuth),
  * conformità a normative su privacy e dati (es. GDPR, se applicabile).
* **Scalabilità**:

  * architettura predisposta per:

    * multi-utente,
    * aggiunta di nuove fonti,
    * supporto ad altri social in futuro (esplicitamente **non** in v1.0).

---

## 6.bis Non obiettivi v1 (esplicitamente esclusi)

Per la versione **v1.0** sono esplicitamente esclusi:

* Supporto ad altri social oltre LinkedIn (X, Instagram, TikTok, ecc.).
* Funzionalità multi-utente avanzate (team editoriali, workspace condivisi).
* Libreria complessa di template salvati dall’utente (oltre ai draft base).
* Automazioni di pubblicazione ricorrente (es. “posta ogni lunedì questo template”).
* Integrazione con strumenti esterni di analytics.
* Moderazione automatica dei commenti su LinkedIn.
* Workflow complessi di approvazione multi-step (es. redattore → revisore → approvatore).

Questi elementi potranno essere valutati in roadmap successiva, ma **non fanno parte dell’MVP**.

---

## 7. Scope MVP – Cosa deve esserci in v1 (e cosa no)

### 7.1 Must-have (MVP v1.0)

Queste funzionalità devono essere presenti nella prima versione funzionante:

1. **Onboarding base**

   * Raccolta: settore, ruolo, lingua principale, obiettivo.
   * Configurazione calendario editoriale con:

     * preset settimanale,
     * possibilità di rinominare i temi,
     * drag & drop per spostarli tra i giorni.
   * Collegamento LinkedIn via OAuth (profilo personale).

2. **Insight Deck minimo**

   * Per il tema del giorno:

     * ricerca articoli su almeno **2 fonti** tra Bloomberg, HBR, MIT Tech Review, The Economist,
     * output di **minimo 3 card insight** con:

       * titolo,
       * fonte + data,
       * 3–5 bullet di sintesi,
       * link all’articolo,
       * Pulse Score semplificato (1–100) basato su:

         * allineamento al tema del giorno,
         * recency,
         * profondità percepita (valutata dal modello).

3. **Generazione bozza post**

   * L’utente seleziona 1–3 insight.
   * Il sistema genera **1 bozza principale** con struttura vincolata:

     * HOOK (max 2 frasi),
     * INSIGHT (3–6 frasi o bullet),
     * HUMAN CONNECTION (1–2 frasi),
     * OPEN LOOP (1 domanda o invito alla discussione).
   * Editor integrato con:

     * conteggio caratteri,
     * possibilità di rigenerare mantenendo gli stessi insight.

4. **Generazione immagine**

   * Generazione di **1 immagine** per post con:

     * stile illustrato non fotorealistico,
     * formato 1200x1200.
   * Azioni utente:

     * rigenera,
     * sostituisci con upload propria.

5. **Pubblicazione base su LinkedIn**

   * Funzionalità **“Pubblica ora”** sul profilo personale.
   * Anteprima fedele del post (testo + immagine).
   * Conferma esplicita prima dell’invio.

6. **Persistenza minima**

   * Salvataggio:

     * calendario temi,
     * draft non pubblicati,
     * storico dei post pubblicati (metadata + link / id LinkedIn).

### 7.2 Should-have (se rientra in tempi / release 1.x)

* **Scheduling “Programma”**

  * scelta data/ora,
  * orario consigliato semplice (fascia oraria standard).

* **Analytics base**

  * raccolta e visualizzazione:

    * impression (se disponibili via API),
    * like,
    * commenti,
    * share.

* **Voice Match semplificato**

  * analisi di 5–10 post recenti per estrarre:

    * lunghezza media,
    * struttura tipica (paragrafi brevi/lunghi),
    * prevalenza di storytelling vs bullet,
  * applicazione di questi parametri come vincoli soft nella generazione.

### 7.3 Could-have (Fase 2+)

* Ottimizzazione avanzata degli orari di pubblicazione basata sullo storico reale dell’utente.
* Modello Pulse Score più sofisticato (più feature, peso engagement storico, ecc.).
* Supporto a pagine aziendali LinkedIn oltre che al profilo personale.
* Formati immagine aggiuntivi (1200x1350).
* Vista analytics avanzata per tema, orario, struttura del post.

---

## 8. Modello dati – Oggetti chiave

I seguenti oggetti sono concetti obbligatori, i nomi dei campi possono variare ma la semantica va preservata.

1. **User**

   * id
   * nome
   * email
   * settore
   * ruolo
   * lingua_principale
   * obiettivo (enum: awareness / lead / autorevolezza)
   * palette_brand (opzionale v1)
   * linkedin_auth (token / metadata)

2. **Topic (Tema editoriale)**

   * id
   * user_id
   * nome (es. “Innovazione tecnologica”)
   * descrizione_breve
   * giorno_settimana (0–6)
   * attivo (bool)

3. **Insight**

   * id
   * user_id
   * topic_id (opzionale)
   * fonte (enum: Bloomberg / HBR / MIT / Economist / altro futuro)
   * titolo
   * url
   * data_pubblicazione
   * sintesi_bullet[] (lista stringhe)
   * pulse_score (1–100)
   * tags / parole_chiave

4. **PostDraft**

   * id
   * user_id
   * data_creazione
   * topic_id
   * insight_ids[] (lista id Insight)
   * testo_generato
   * testo_modificato (se diverso dal generato)
   * stato (enum: draft / pronto / pubblicato / programmato)
   * scheduled_at (nullable, se programmato)
   * linkedin_post_id (post-pubblicazione, se disponibile)

5. **ImageAsset**

   * id
   * user_id
   * post_draft_id
   * url
   * tipo (enum: generata / upload)
   * formato (es. 1200x1200)

6. **AnalyticsSnapshot**

   * id
   * user_id
   * post_draft_id
   * linkedin_post_id
   * impression
   * like
   * commenti
   * share
   * data_rilevazione

---

## 9. Regole dure per la generazione AI

Queste regole sono **non negoziabili**: se non rispettate dall’output, il modello/integrazione va ritarato.

### 9.1 Struttura del post

Ogni generazione deve avere:

* HOOK:

  * max 2 frasi,
  * evitare frasi introduttive povere (“In questo post vorrei parlare di…”).
* INSIGHT:

  * ancorato a almeno 1 insight selezionato,
  * parafrasi analitica, non copia dei bullet.
* HUMAN CONNECTION:

  * sempre presente,
  * 1–2 frasi di esperienza/perspective umana plausibile.
* OPEN LOOP:

  * domanda aperta o invito alla conversazione,
  * vietate CTA di vendita in v1.0.

### 9.2 Lunghezza target

* target: 700–1.400 caratteri,
* oltre 1.600 caratteri: output da rigenerare o ridurre automaticamente.

### 9.3 Tono di voce

* banditi:

  * “Gentili colleghi,” e analoghi,
  * slang casuale fuori contesto,
  * emoji spam.
* consentiti:

  * 0–2 emoji coerenti con tema e tono.
* obbligatorio:

  * tono assertivo,
  * registro professionale,
  * linguaggio chiaro e non eccessivamente accademico.

### 9.4 Safe-guard minimi

* vietato:

  * contenuti discriminatori, d’odio, sensibili o politicamente esplosivi in contesto non professionale.
* se l’utente chiede temi borderline:

  * il sistema deve rispondere con messaggio di errore contestuale oppure
  * generare un contenuto neutro/informativo.

---

## 10. Gestione errori e stati vuoti

### 10.1 Nessun articolo trovato

* Messaggio:

  * “Per il tema di oggi non ci sono articoli rilevanti nel periodo selezionato.”
* Opzioni:

  * “Allarga la finestra temporale”,
  * “Cambia tema”,
  * “Genera comunque un post partendo dal tema, senza articoli”.

### 10.2 Errore LinkedIn OAuth

* Notifica chiara che la pubblicazione diretta non è disponibile.
* L’utente può comunque:

  * generare testo,
  * generare immagine,
  * copiare il contenuto o scaricare immagine per pubblicazione manuale.

### 10.3 Generazione immagine fallita

* Fino a 3 tentativi automatici.
* Se fallisce:

  * mostra placeholder,
  * opzioni:

    * “Riprova”,
    * “Carica immagine manuale”,
    * “Prosegui senza immagine”.

### 10.4 Timeout generazione testo

* Soglia indicativa: 15 secondi.
* Se superata:

  * messaggio: “La generazione sta richiedendo più del previsto.”
  * opzioni:

    * “Riprova”,
    * “Riduci la lunghezza target e riprova”.

---

## 11. KPI di successo v1

### 11.1 Time-to-first-post

* Utente nuovo:

  * obiettivo: completare onboarding + generare + pubblicare 1 post in **≤ 15 minuti**.

### 11.2 Tempo medio generazione post giornaliero

* Utente abituale:

  * obiettivo: **≤ 5 minuti** da apertura app a “Pubblica ora”.

### 11.3 Stabilità

* Tasso di fallimento generazioni (testo/immagine) **< 2%** delle richieste totali.

* Utente nuovo:

## 12. Gerarchia di riferimento

In caso di conflitto tra sezioni o dubbi interpretativi:

1. La sezione **7. Scope MVP** definisce cosa va implementato in **v1.0**.
2. Le sezioni **8–11** definiscono **come** il sistema deve comportarsi (regole, dati, errori, KPI).
3. Le sezioni **1–6 / 6.bis** rappresentano la **visione completa di prodotto** e guidano le evoluzioni successive, ma non prevalgono sulle specifiche MVP.

## 13. Priorità di sviluppo – Vertical slices v1

Lo sviluppo di v1.0 deve seguire una logica di **vertical slices**: ogni step produce un flusso utilizzabile end-to-end, anche se parziale.

**Slice 1 – Base prodotto (Research → Insight)**

* Implementazione onboarding base (raccolta dati utente + calendario temi con preset).
* Integrazione con almeno 2 fonti (Bloomberg / HBR / MIT / Economist).
* Generazione dell’Insight Deck (3–5 card con titolo, fonte/data, bullet, link, Pulse Score semplificato).
* Persistenza di user, topic, insight.

**Slice 2 – Insight → Bozza testo (Ghostwriter)**

* Flusso completo: selezione 1–3 insight → generazione bozza conforme alle regole del §4.3 e §9.
* Editor integrato con conteggio caratteri e possibilità di rigenerare la bozza mantenendo gli stessi insight.
* Salvataggio dei draft (PostDraft) secondo il modello dati del §8.

**Slice 3 – Testo → Immagine → Pubblica ora**

* Generazione di 1 immagine illustrata 1200x1200 per post (con opzioni rigenera / upload manuale).
* Anteprima fedele del post (testo + immagine).
* Integrazione LinkedIn OAuth (profilo personale) e funzionalità **“Pubblica ora”** con conferma esplicita.
* Salvataggio metadata del post pubblicato (link, timestamp, linkedin_post_id).

Ogni slice deve essere rilasciabile e testabile in autonomia, senza dipendere dal completamento delle funzionalità classificate come **Should-have** o **Could-have**.

---

Questo è il perimetro di riferimento vincolante per progettazione, sviluppo e priorità di implementazione di Daily Pulse v1.0.
