import fs from 'fs';

const progStr = `
export const ICET_PROGRAMS = [
  { code: 'MBA', name: 'Master of Business Administration (MBA)', durationYears: 2 },
  { code: 'MCA', name: 'Master of Computer Applications (MCA)', durationYears: 2 }
];
`;

fs.appendFileSync('server/src/data/icetInstitutions.js', progStr);
fs.appendFileSync('client/src/data/icetInstitutions.js', progStr);
console.log('Appended ICET_PROGRAMS successfully!');
