#!/usr/bin/env node

const cssUrl = process.argv[2] || null;
const destinationFolder = process.argv[3] || './resources/assets/fonts/';
const cssOutputPath = process.argv[4] || './resources/styles/common/_fonts.scss';

const downloadFontsAndCreateStylesheet = async (url, destinationFolder = './resources/assets/fonts/', cssOutputPath = './resources/styles/common/_fonts.scss') => {
  try {
    // Assicurati che la cartella di destinazione esista
    fs.mkdirSync(destinationFolder, { recursive: true });

    // Scarica il file CSS
    const response = await axios.get(url);
    const cssText = response.data;

    // Trova tutti gli URL dei file WOFF2
    const fontUrls = cssText.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g);

    // Itera gli URL e scarica ciascun file
    let newCssText = cssText;
    for (const fontUrl of fontUrls) {
      const actualUrl = fontUrl.slice(4, -1); // Rimuove "url(" e ")"
      const filename = path.basename(actualUrl);
      const localPath = path.join(destinationFolder, filename);
      const { data } = await axios.get(actualUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(localPath, data);
      console.log(`Downloaded ${filename}`);
      // Aggiorna l'URL nel CSS
      const relativePath = path.relative(path.dirname(cssOutputPath), localPath);
      newCssText = newCssText.replace(actualUrl, relativePath);
    }

    // Salva il nuovo file CSS
    fs.writeFileSync(cssOutputPath, newCssText);
    console.log(`Stylesheet created at ${cssOutputPath}`);
  } catch (error) {
    console.error(error);
  }
};

downloadFontsAndCreateStylesheet(cssUrl, destinationFolder, cssOutputPath);
