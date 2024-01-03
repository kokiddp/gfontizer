#!/usr/bin/env node

const fs = require('fs');
const axios = require('axios');
const path = require('path');

const cssUrl = process.argv[2] || null;
const destinationFolder = process.argv[3] || './resources/assets/fonts/';
const cssOutputPath = process.argv[4] || './resources/assets/styles/common/_gfonts.scss';

const downloadFontsAndCreateStylesheet = async (url, destinationFolder = './resources/assets/fonts/', cssOutputPath = './resources/assets/styles/common/_gfonts.scss') => {
  try {
    // Assicurati che la cartella di destinazione esista
    fs.mkdirSync(destinationFolder, { recursive: true });

    // Scarica il file CSS per i .woff2
    const responseWOFF2 = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36', // User Agent per un moderno browser Chrome
      }
    });

    // Rimuove i commenti
    combinedCssText = responseWOFF2.data.replace(/\/\*[\s\S]*?\*\//g, '');

    // Trova tutti gli URL dei file dei font
    const fontUrls = combinedCssText.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g);

    // Itera gli URL e scarica ciascun file
    for (const fontUrl of fontUrls) {
      const actualUrl = fontUrl.slice(4, -1); // Rimuove "url(" e ")"
      const filename = path.basename(actualUrl);
      const localPath = path.join(destinationFolder, filename);
      const { data } = await axios.get(actualUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(localPath, data);
      console.log(`Downloaded ${filename}`);
      // Aggiorna l'URL nel CSS
      const relativePath = path.relative(path.dirname(cssOutputPath), localPath);
      combinedCssText = combinedCssText.replace(actualUrl, relativePath);
    }

    // Sostituisci tutti gli apici semplici con doppi apici
    combinedCssText = combinedCssText.replace(/'/g, '"');

    // Sostituisci tutti i doppi ritorni a capo con un singolo ritorno a capo
    combinedCssText = combinedCssText.trim().replace(/\n{2,}/g, '\n');

    // Aggiungi un ritorno a capo prima di ogni @font-face tranne il primo
    combinedCssText = combinedCssText.split('@font-face').join('\n@font-face').replace('\n', '');

    // Aggiungi una riga vuota alla fine del file
    combinedCssText = combinedCssText + '\n';

    // Assicurati che la cartella di destinazione per il file CSS esista
    fs.mkdirSync(path.dirname(cssOutputPath), { recursive: true });

    // Salva il nuovo file CSS
    fs.writeFileSync(cssOutputPath, combinedCssText);
    console.log(`Stylesheet created at ${cssOutputPath}`);
  } catch (error) {
    console.error(error);
  }
};

downloadFontsAndCreateStylesheet(cssUrl, destinationFolder, cssOutputPath);