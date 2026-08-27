import fs from 'node:fs';

const inputPath = process.argv[2];
const outputPath = process.argv[3];
const payload = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const days = payload.contributions ?? [];
const weeks = [];
for (let index = 0; index < days.length; index += 7) weeks.push(days.slice(index, index + 7));
const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const color = (count) => count === 0 ? '#161b22' : count <= 2 ? '#2f5f9f' : count <= 5 ? '#4d8fe8' : count <= 10 ? '#72ff4f' : '#b7ff9d';
const cellSize = 11;
const gap = 3;
const left = 38;
const top = 56;
const width = Math.max(780, left + weeks.length * (cellSize + gap) + 28);
const height = 7 * (cellSize + gap) + top + 38;
const monthLabels = [];
let previousMonth = '';
for (let index = 0; index < days.length; index += 1) {
  const month = new Date(`${days[index].date}T00:00:00Z`).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  if (month !== previousMonth && index % 7 === 0) {
    monthLabels.push(`<text x="${left + Math.floor(index / 7) * (cellSize + gap)}" y=\"38\" fill=\"#8b949e\" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="9">${month.toUpperCase()}</text>`);
    previousMonth = month;
  }
}
const cells = weeks.map((week, weekIndex) => week.map((day, rowIndex) => `<rect x="${left + weekIndex * (cellSize + gap)}" y="${top + rowIndex * (cellSize + gap)}" width="${cellSize}" height="${cellSize}" rx="2" fill="${color(day.count)}"><title>${esc(day.date)} · ${day.count} contributions</title></rect>`).join('')).join('');
const total = payload.total?.lastYear ?? days.reduce((sum, day) => sum + day.count, 0);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc"><title id="title">Abhirai2006 GitHub contribution activity</title><desc id="desc">${total} contributions across the last 12 months. Each square is one calendar day.</desc><rect width="100%" height="100%" fill="#0d1117"/><text x="0" y="16" fill="#72ff4f" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="9" letter-spacing="1.5">CONTRIBUTION ACTIVITY / LAST 12 MONTHS</text>${monthLabels.join('')}<g>${cells}</g><text x="${left}" y="${height - 7}" fill="#8b949e" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="9">${total} contributions · hover squares for date and count</text><g transform="translate(${width - 160},${height - 17})"><text x="0" y="9" fill="#8b949e" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="8">LESS</text>${[0,2,5,10,11].map((count,index) => `<rect x="${32 + index * 15}" y="0" width="10" height="10" rx="2" fill="${color(count)}"/>`).join('')}<text x="112" y="9" fill="#8b949e" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="8">MORE</text></g></svg>`;
fs.writeFileSync(outputPath, svg);
