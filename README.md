# unzipper await issue

Install dependencies with `npm install` then run with `node ./index.js`.

## What it does

`index.js` creates a zip file at `./tmp/test.zip` that contains the two
text files from the `./zip-contents` directory.

Then it uses `unzipper` to iterate through this zip and compares 
the files in it to the originals in the `./zip-contents` directory.

## The issue

When using `await fs.promises.readFile` to read the _original_ files during
the `for await (const entry of zip)` loop, the zip stream stops emitting 
entries, so we only ever see the first entry in the zip.

Changing to `fs.readFileSync` to read the original file fixes the issue.
