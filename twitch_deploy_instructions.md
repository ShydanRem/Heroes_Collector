# Istruzioni per il Deploy del Front-End su Twitch

Segui questi passaggi per generare il file ZIP da caricare sulla dashboard sviluppatore di Twitch per la tua estensione.

## 1. Genera la Build del Front-End
Apri il terminale e posizionati nella cartella del front-end:
```bash
cd frontend
```
Esegui il comando di build:
```bash
npm run build
```
Questo comando creerà una cartella chiamata `dist` all'interno della cartella `frontend`.

## 2. Crea il file ZIP
1. Entra nella cartella `frontend/dist`.
2. Seleziona **tutti i file e le cartelle contenuti all'interno** (dovresti vedere `index.html` e la cartella `assets`).
3. Crea un archivio ZIP con questi file.

> [!IMPORTANT]
> **Non zippare la cartella `dist` intera!** Zippa solo i file che ci sono *dentro*. L'estensione di Twitch non funzionerà se il file `index.html` non si trova nella root dell'archivio ZIP.

## 3. Configurazione su Twitch
1. Carica il file ZIP appena creato nella sezione **Files** della tua estensione su Twitch.
2. Nelle impostazioni di visualizzazione, abilita il supporto per **Mobile** spuntando la relativa casella, oltre a quelle per PC (Video Overlay o Component). Lo stesso file ZIP funzionerà per entrambe le piattaforme.
