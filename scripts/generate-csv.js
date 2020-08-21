const info = require('../data/info.json');
const fs = require('fs-extra');
const fsNode = require('fs');
const path = require('path');
const encoding = require('encoding');

const data = [];
const headers = ['Name', 'Description', '@QR', '@Colour'];

const convertPath = (p) => p.replace(/^\//, '').replace(/\//g, ':');

const formatValue = (str) =>
  `"${String(str !== undefined ? str : '').replace(/"/g, '""')}"`;

info.categories.forEach((category) => {
  category.groups.forEach((group) => {
    const colour = (group.colour && group.colour.replace(/#/g, '')) || '000000';
    group.components.forEach((component) => {
      data.push(
        [
          component.name || '',
          component.description || component.fieldDescription.join(' ') || '',
          component.qr &&
            convertPath(
              path.resolve(__dirname, '../public', component.qr.substr(1))
            ),
          convertPath(
            path.resolve(__dirname, '../public/images/colours', `${colour}.png`)
          ),
        ].map(formatValue)
      );
    });
  });
});

const writeData = `${headers.join(',')}\n${data
  .map((values) => values.join(','))
  .join('\n')}`;

// const utf16buffer = Buffer.from(`\ufeff${writeData}`, 'utf16le');

// fsNode.writeFileSync('./indesign/data/components.csv', {
//   encoding: (data) => {
//     console.log(data);
//     return encoding.convert(data, 'macroman', 'utf-8');
//   },
// });

fs.outputFile(
  './indesign/data/components.csv',
  encoding.convert(writeData, 'macroman', 'utf-8')
);
