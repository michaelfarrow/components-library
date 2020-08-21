require('dotenv').config();

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { google } = require('googleapis');
const pEachSeries = require('p-each-series');
const fs = require('fs-extra');
const slugify = require('../util/slugify');
const http = require('http');
// const download = require('download-file');
const querystring = require('querystring');
const Bottleneck = require('bottleneck');
const klaw = require('klaw');
const path = require('path');
const rgbHex = require('rgb-hex');
const hexRgb = require('hex-rgb');
const _ = require('lodash');
const sharp = require('sharp');

const FILE_ID = '1oOCwb1pybm2RI6DSiBEv8W0xA06XPEoygVb6PnAuSno';
const QR_DIR = './public/images/qr';
const COLOUR_DIR = './public/images/colours';

const doc = new GoogleSpreadsheet(FILE_ID);

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 5000,
});

const credentials = {
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
};

const drive = google.drive({
  version: 'v2',
  auth: new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.metadata.readonly'],
  }),
});

const links = {};
// const links = require('../data/links.json');
const componentCats = [];
// const componentCats = require('../data/info.json').categories;
let lastModified = null;

function isDriveLink(str) {
  return !!(str && str.match(/^https:\/\/drive\.google\.com\/file\/d\/[^\/]+/));
}

async function auth() {
  await doc.useServiceAccountAuth(credentials);
}

async function loadInfo() {
  await doc.loadInfo();
}

function cleanupFiles(dir, accepted) {
  const basePath = path.resolve(dir);
  const acceptedFiles = accepted(basePath);

  return new Promise((resolve, reject) => {
    const files = [];

    klaw(`${dir}/`, { depthLimit: 0 })
      .on('data', (file) => {
        if (file.stats.isFile()) files.push(file.path);
      })
      .on('error', (e) => reject(e))
      .on('end', () => {
        resolve(files.filter((file) => !acceptedFiles.includes(file)));
      });
  })
    .catch((e) => {
      if (e.code === 'ENOENT') {
        return [];
      }
      throw e;
    })
    .then((toRemove) => {
      return Promise.all(
        toRemove.map((file) => {
          console.log(`Removing file: ${file}`);
          return fs.remove(file);
        })
      );
    });
}

async function processSheet(sheet) {
  const rows = await sheet.getRows();
  const headers = sheet.headerValues;
  await sheet.loadCells({
    startRowIndex: 0,
    endRowIndex: rows.length + 1,
    startColumnIndex: 0,
    endColumnIndex: 1,
  });
  await sheet.loadCells({
    startRowIndex: 0,
    endRowIndex: 1,
    startColumnIndex: 0,
    endColumnIndex: headers.length,
  });
  const filledHeaders = [];
  console.log('');
  console.log(`Processing sheet: ${sheet.title}`);
  const groups = [{ name: undefined, components: [] }];
  rows.forEach((row) => {
    // console.log(row.rowNumber);
    const id = row._rawData[0];
    const filledCells = row._rawData.filter(
      (cell) => cell && String(cell).length
    );

    if (filledCells.length === 1) {
      const cell = sheet.getCell(row._rowNumber - 1, 0);
      const format = cell.effectiveFormat;
      let colour = undefined;
      if (format) {
        if (format.backgroundColor) {
          const { red, green, blue } = format.backgroundColor;
          const hex = rgbHex(red * 255, green * 255, blue * 255);
          if (hex !== 'eeeeee') {
            colour = `#${hex}`;
          } else {
            colour = '#000000';
          }
        }
      }
      if (!groups[groups.length - 1].components.length) {
        groups[groups.length - 1].name = id;
        groups[groups.length - 1].colour = colour;
      } else {
        groups.push({ name: id, colour, components: [] });
      }
    } else if (filledCells.length > 1) {
      const slug = slugify(id);
      let quantity = 0;
      let name = undefined;
      let description = undefined;
      let datasheet = undefined;
      let datasheetPreview = undefined;
      let labelSize = 2;
      const fields = [];

      for (let i = 1; i < headers.length; i++) {
        const header = headers[i];
        if (header && String(header).trim().length) {
          const fieldVal = row._rawData[i];
          // if (fieldVal && String(fieldVal).trim().length) {
          const headerTitle = String(header).trim();
          const headerCell = sheet.getCell(0, i);
          const headerFormat = headerCell.effectiveFormat;

          switch (headerTitle.toLowerCase()) {
            case 'name':
              if (fieldVal) {
                name = String(fieldVal).trim();
              }
              break;
            case 'bin size':
              if (fieldVal) {
                labelSize = Number(fieldVal);
              }
              break;
            case 'datasheet':
              if (fieldVal) {
                datasheet = String(fieldVal).trim();
                datasheetPreview = `https://drive.google.com/file/d/${
                  datasheet.match(
                    /^https:\/\/drive\.google\.com\/file\/d\/([^\/]+)/
                  )[1]
                }/preview`;
              }
              break;
            case 'quantity':
              quantity = Number(fieldVal);
              break;
            case 'unit':
              if (fields.length) {
                fields[fields.length - 1].value = `${
                  fields[fields.length - 1].value
                }${fieldVal}`;
              }
              break;
            default:
              const headerUnit = headerTitle.match(/(.+)\s*\(\s*(.+)\s*\)$/);
              let processedFieldVal = String(
                fieldVal === undefined ? '' : fieldVal
              ).trim();
              if (processedFieldVal.match(/^\d+\.\d+$/)) {
                processedFieldVal = processedFieldVal
                  .replace(/0+$/, '')
                  .replace(/^(\d+)\.$/, '$1');
              }

              switch (headerTitle.toLowerCase()) {
                case 'description':
                  description = processedFieldVal;
                  break;
              }

              const headerLabel = headerUnit
                ? headerUnit[1].trim()
                : headerTitle;

              const finalFieldValue =
                headerUnit && processedFieldVal.length
                  ? `${processedFieldVal}${headerUnit[2]}`
                  : processedFieldVal;

              fields.push({
                label: headerLabel,
                value: finalFieldValue,
                name: Boolean(
                  headerFormat &&
                    headerFormat.textFormat &&
                    headerFormat.textFormat.underline
                ),
                hidden: Boolean(
                  headerFormat &&
                    headerFormat.textFormat &&
                    headerFormat.textFormat.strikethrough
                ),
              });

              if (!filledHeaders.find((header) => header.index === i)) {
                filledHeaders.push({
                  index: i,
                  title: headerLabel,
                });
              }
          }
          // }
        }
      }

      let componentName = name;
      if (!componentName) {
        const fieldName = fields.find((f) => f.name);
        if (fieldName) componentName = fieldName.value;
      }

      groups[groups.length - 1].components.push({
        id,
        slug,
        name: componentName,
        description,
        fieldDescription: fields
          .filter(
            (f) =>
              f.value.length &&
              f.label.toLowerCase() !== 'rs components code' &&
              f.label.toLowerCase() !== 'rs code'
          )
          .filter((f) => !f.name)
          .filter((f) => !f.hidden)
          .map((f) => f.value),
        quantity,
        labelSize,
        datasheet,
        datasheetPreview,
        qr: (datasheet && `/images/qr/${slug}.png`) || undefined,
        fields,
      });
      row._rawData.forEach((cell) => {
        const driveLink = isDriveLink(cell);
        if (driveLink) {
          if (!id || !id.length) {
            console.error(`no id for url ${cell}`);
            process.exit(1);
          }
          if (links[slug]) {
            console.error(`duplicate id: ${slug}`);
            process.exit(1);
          }
          links[slug] = cell;
          console.log(`${slug} - ${cell}`);
        }
      });
    }
  });
  componentCats.push({
    title: sheet.title,
    slug: slugify(sheet.title),
    groups,
    headers: filledHeaders,
  });
}

function processSheets() {
  // return processSheet(doc.sheetsByIndex[0]);
  return pEachSeries(doc.sheetsByIndex, (sheet) => {
    return limiter.schedule(() => processSheet(sheet));
  });
}

function saveLinks() {
  return fs.outputJSON('./data/links.json', links, { spaces: 2 });
}

function saveInfo() {
  return fs.outputJSON(
    './data/info.json',
    { lastModified, categories: componentCats },
    { spaces: 2 }
  );
}

function saveQrCode(id) {
  const hash = id;
  const svgDest = `${QR_DIR}/${hash}.svg`;
  const pngDest = `${QR_DIR}/${hash}.png`;
  return fs
    .pathExists(pngDest)
    .then((exists) => {
      if (exists) return;
      return new Promise((resolve, reject) => {
        console.log(`downloading QR code for: ${id}`);
        http.get(
          `http://api.qrserver.com/v1/create-qr-code/?format=svg&data=${querystring.escape(
            `https://ds.farrow.io/${id}`
          )}`,
          (res) => {
            res.setEncoding('utf8');

            let data = '';
            res.on('data', (chunk) => {
              data += chunk;
            });
            res.on('end', () => {
              fs.outputFile(
                svgDest,
                data
                // data.replace(
                //   /style="fill:rgb\(0, 0, 0\)/g,
                //   'style="fill:rgb(0, 0, 0) device-cmyk(0.00 0.00 0.00 1.00)'
                // )
              ).then(resolve);
            });
            res.on('error', (e) => {
              reject(e);
            });
          }
        );
        // download(
        //   `https://api.qrserver.com/v1/create-qr-code/?format=svg&data=${querystring.escape(
        //     `https://ds.farrow.io/${id}`
        //   )}`,
        //   { directory: `${QR_DIR}/`, filename: `${hash}.svg` },
        //   function(err) {
        //     if (err) return reject(err);
        //     resolve();
        //   }
        // );
      }).then(() => {
        return sharp(svgDest)
          .resize({ width: 1000, height: 1000 })
          .toColourspace('b-w')
          .toFile(pngDest);
      });
    })
    .then(() => {
      return { id };
    });
}

function saveQrCodes() {
  if (process.env.GENERATE_QR_CODES !== 'false') {
    console.log('Saving QR codes');
    return pEachSeries(Object.keys(links), saveQrCode);
  }
  return Promise.resolve();
}

function cleanupQrCodes() {
  return cleanupFiles(QR_DIR, (basePath) => {
    return _.flatten(
      Object.keys(links).map((slug) => [
        `${basePath}/${slug}.svg`,
        `${basePath}/${slug}.png`,
      ])
    );
  });
}

function getColours() {
  const colours = _(
    componentCats.map((category) => {
      return category.groups.map((group) => group.colour);
    })
  )
    .flattenDeep()
    .filter((c) => !!c)
    .uniq()
    .value();

  if (!colours.includes('#000000')) {
    colours.push('#000000');
  }
  return colours.map((colour) => colour.replace(/#/g, ''));
}

function saveColour(colour) {
  return fs.ensureDir(COLOUR_DIR).then(() => {
    const pngDest = `${COLOUR_DIR}/${colour}.png`;
    return fs.pathExists(pngDest).then((exists) => {
      if (exists) return;
      console.log(`Generating colour: #${colour}`);
      const rgb = hexRgb(`#${colour}`);
      const image = sharp({
        create: {
          width: 200,
          height: 200,
          channels: 4,
          background: { r: rgb.red, g: rgb.green, b: rgb.blue, alpha: 1 },
        },
      });
      if ((rgb.red === rgb.green) === rgb.blue) {
        image.toColourspace('b-w');
      }
      return image.toFile(pngDest);
    });
  });
}

function saveColours() {
  if (process.env.GENERATE_COLOURS !== 'false') {
    console.log('Saving component group colours');
    const colours = getColours();
    return pEachSeries(colours, saveColour);
  }
  return Promise.resolve();
}

function cleanupColours() {
  return cleanupFiles(COLOUR_DIR, (basePath) => {
    return getColours().map((colour) => `${basePath}/${colour}.png`);
  });
}

function go() {
  // return saveColours().then(cleanupColours);
  // return saveQrCodes().then(cleanupQrCodes);
  return drive.files.get({ fileId: FILE_ID }).then((file) => {
    lastModified = file.data.modifiedDate;
    return fs
      .readJSON('./data/info.json')
      .catch((e) => {
        if (e.code === 'ENOENT') {
          return { lastModified: null };
        }
        throw e;
      })
      .then((data) => {
        if (data.lastModified === lastModified) {
          console.log('Data up to date');
          return Promise.resolve();
        }
        return processSheets()
          .then(saveQrCodes)
          .then(cleanupQrCodes)
          .then(saveColours)
          .then(cleanupColours)
          .then(saveLinks)
          .then(saveInfo);
      });
  });
}

auth()
  .then(loadInfo)
  .then(go)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
