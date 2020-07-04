const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const zipFolder = promisify(require('zip-folder'));
const rimraf = promisify(require('rimraf'));
const unzipper = require('unzipper');

const tmpDir = path.resolve(__dirname, 'tmp');
const zipFile = path.resolve(tmpDir, 'test.zip');
const zipContents = path.resolve(__dirname, 'zip-contents');

(async function(){
  await rimraf(tmpDir);
  await fs.promises.mkdir(tmpDir);
  await zipFolder(zipContents, zipFile);

  const entries = await compareZipContents();
  if (entries.length !== 2) {
    console.error(`ERROR: Expected 2 entries, found ${entries.length}!`);
  }
  console.log(`Entries: ${entries}`);
})();


async function compareZipContents() {
  const entries = [];

  const zip = fs.createReadStream(zipFile).pipe(unzipper.Parse({ forceStream: true }));

  for await (const entry of zip) {
    entries.push(entry.path);
    await compareEntry(entry);
  }

  return entries;
}

async function compareEntry(entry) {
  const realPath = path.resolve(zipContents, entry.path);
  // For some reason trying to do the below with fs.promises causes the original
  // zip stream to stop emitting entries so we only ever see the first a.txt entry
  // and no others...
  //
  const expectedContent = await fs.promises.readFile(realPath);
  //
  // ...However, replacing the above line with fs.readFileSync doesn't interrupt
  // the entry iteration, and we see both zip file entries:
  //
  // const expectedContent = fs.readFileSync(realPath);

  const actualContent = await entry.buffer();

  if (actualContent.toString('utf8').trim() === expectedContent.toString('utf8').trim()) {
    console.log(`Contents of ${entry.path} match`);
  } else {
    console.error(`Unexpected content of ${entry.path}`);
  }
}
