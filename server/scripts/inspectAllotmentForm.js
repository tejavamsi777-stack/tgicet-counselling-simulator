import fs from 'fs';

const html = fs.readFileSync('server/src/data/tgpolycet_college_allotment.html', 'utf8');

console.log('Form action and inputs:');
const inputs = html.match(/<input[^>]+>/gi) || [];
inputs.forEach(i => console.log(i));

const selects = html.match(/<select[^>]+>[\s\S]*?<\/select>/gi) || [];
console.log(`Found ${selects.length} select dropdowns:`);
selects.forEach((s, idx) => {
  const nameMatch = s.match(/name=["']([^"']+)["']/i);
  const idMatch = s.match(/id=["']([^"']+)["']/i);
  const options = s.match(/<option[^>]*>([^<]+)<\/option>/gi) || [];
  console.log(`Dropdown #${idx+1}: name=${nameMatch ? nameMatch[1] : ''}, id=${idMatch ? idMatch[1] : ''}, optionsCount=${options.length}`);
  console.log('Sample options:', options.slice(0, 5));
});
