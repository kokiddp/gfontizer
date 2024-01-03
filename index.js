#!/usr/bin/env node

const fs = require('fs');
const axios = require('axios');
const path = require('path');

const cssUrl = process.argv[2] || null;
const cssOutputPath = process.argv[3] || './resources/assets/styles/common/_gfonts.scss';

const downloadFontsAndCreateStylesheet = async (url, cssOutputPath = './resources/assets/styles/common/_gfonts.scss') => {
  try {
    // Scarica il file CSS per i .woff2
    const responseWOFF2 = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
      }
    });

    let combinedCssText = responseWOFF2.data.replace(/\/\*[\s\S]*?\*\//g, '');

    // Trova tutti gli URL dei file dei font
    const fontUrls = combinedCssText.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g);

    // Itera gli URL e codifica ciascun file in base64
    for (const fontUrl of fontUrls) {
      const actualUrl = fontUrl.slice(4, -1); // Rimuove "url(" e ")"
      const { data } = await axios.get(actualUrl, { responseType: 'arraybuffer' });
      const base64Font = Buffer.from(data).toString('base64');
      const fontFormat = path.extname(actualUrl).substring(1); // Estrae il formato del font dall'URL
      combinedCssText = combinedCssText.replace(actualUrl, `data:font/${fontFormat};charset=utf-8;base64,${base64Font}`);
    }

    combinedCssText = combinedCssText.replace(/'/g, '"');
    combinedCssText = combinedCssText.replace(/\n{2,}/g, '\n');
    combinedCssText = combinedCssText.split('@font-face').join('\n@font-face').replace('\n', '');

    // Assicurati che la cartella di destinazione per il file CSS esista
    fs.mkdirSync(path.dirname(cssOutputPath), { recursive: true });

    // Salva il nuovo file CSS
    fs.writeFileSync(cssOutputPath, combinedCssText);
    console.log(`Stylesheet created at ${cssOutputPath}`);
  } catch (error) {
    console.error(error);
  }
};

downloadFontsAndCreateStylesheet(cssUrl, cssOutputPath);
