require('dotenv').config();

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { google } = require('googleapis');
const pEachSeries = require('p-each-series');
const fs = require('fs-extra');
const slugify = require('../util/slugify');
const crypto = require('crypto');
const download = require('download-file');
const querystring = require('querystring');
const Bottleneck = require('bottleneck');
const klaw = require('klaw');
const path = require('path');

const FILE_ID = '1oOCwb1pybm2RI6DSiBEv8W0xA06XPEoygVb6PnAuSno';
const QR_DIR = './public/images/qr';

const doc = new GoogleSpreadsheet(FILE_ID);

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 2000,
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
const componentCats = [];
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

async function processSheet(sheet) {
  const rows = await sheet.getRows();
  // await sheet.loadCells();
  const headers = sheet.headerValues;
  const filledHeaders = [];
  console.log('');
  console.log(`Processing sheet: ${sheet.title}`);
  const groups = [{ name: undefined, components: [] }];
  rows.forEach((row) => {
    // console.log(row.rowNumber);
    const id = row._rawData[0];
    const slug = slugify(id);
    const filledCells = row._rawData.filter(
      (cell) => cell && String(cell).length
    );
    let quantity = 0;
    let datasheet = undefined;
    let datasheetPreview = undefined;
    if (filledCells.length === 1) {
      if (!groups[groups.length - 1].components.length) {
        groups[groups.length - 1].name = id;
      } else {
        groups.push({ name: id, components: [] });
      }
    } else if (filledCells.length > 1) {
      const fields = [];
      for (let i = 1; i < headers.length; i++) {
        const header = headers[i];
        if (header && String(header).trim().length) {
          const fieldVal = row._rawData[i];
          // if (fieldVal && String(fieldVal).trim().length) {
          const headerTitle = String(header).trim();
          switch (headerTitle.toLowerCase()) {
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
              const headerLabel = headerUnit
                ? headerUnit[1].trim()
                : headerTitle;
              fields.push({
                label: headerLabel,
                value: headerUnit
                  ? `${processedFieldVal}${headerUnit[2]}`
                  : processedFieldVal,
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
      groups[groups.length - 1].components.push({
        id,
        slug,
        quantity,
        datasheet,
        datasheetPreview,
        qr: (datasheet && `/images/qr/${slug}.svg`) || undefined,
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
  // const hash = crypto
  //   .createHash('sha1')
  //   .update(url, 'utf-8')
  //   .digest('hex');
  const hash = id;
  return fs
    .pathExists(`${QR_DIR}/${hash}.svg`)
    .then((exists) => {
      if (exists) return;
      return new Promise((resolve, reject) => {
        console.log(`downloading QR code for: ${id}`);
        download(
          `https://api.qrserver.com/v1/create-qr-code/?format=svg&data=${querystring.escape(
            `https://ds.farrow.io/${id}`
          )}`,
          { directory: `${QR_DIR}/`, filename: `${hash}.svg` },
          function(err) {
            if (err) return reject(err);
            resolve();
          }
        );
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
  return true;
}

function cleanupQrCodes() {
  const basePath = path.resolve(QR_DIR);
  const svgFiles = Object.keys(links).map((slug) => `${basePath}/${slug}.svg`);

  return new Promise((resolve, reject) => {
    const files = [];

    klaw(`${QR_DIR}/`, { depthLimit: 0 })
      .on('data', (file) => {
        if (file.stats.isFile()) files.push(file.path);
      })
      .on('error', (e) => reject(e))
      .on('end', () => {
        resolve(files.filter((file) => !svgFiles.includes(file)));
      });
  }).then((toRemove) => {
    return Promise.all(
      toRemove.map((file) => {
        console.log(`Removing file: ${file}`);
        return fs.remove(file);
      })
    );
  });
}

function go() {
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
