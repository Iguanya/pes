import fs from 'fs';
import fetch from 'node-fetch';

const targetLangs = ['fr', 'es'];
const baseLang = 'en';
const base = JSON.parse(fs.readFileSync(`public/locales/${baseLang}/translation.json`, 'utf8'));

async function translateText(text: string, targetLang: string) {
  const res = await fetch('https://libretranslate.de/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source: baseLang,
      target: targetLang,
      format: 'text',
    }),
  });
  const json = await res.json();
  return json.translatedText;
}

(async () => {
  for (const lang of targetLangs) {
    const filePath = `public/locales/${lang}/translation.json`;
    const existing = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
      : {};

    for (const key in base) {
      if (!existing[key]) {
        const translated = await translateText(base[key], lang);
        existing[key] = translated;
        console.log(`[${lang}] ${key} => ${translated}`);
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
  }
})();
