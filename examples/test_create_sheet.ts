import * as console from '../lib/console';
import * as _core from '../lib/core-exec';
import * as sheets from '../lib/sheets';

_core.main(() => {
    sheets.initialize();

    const sheet = sheets.createSheet("TestSheet");

    sheet.appendRow(["asdf", "asdf", "1", "13", "asdf"]);

    const cell = sheet.readCell("A1");

    // tslint:disable-next-line:no-console
    console.log(cell);
});