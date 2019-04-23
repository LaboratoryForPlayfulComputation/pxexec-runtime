import * as console from '../lib/console';
import * as _core from '../lib/core-exec';
import * as sheets from '../lib/sheets';

_core.main(() => {
    const sheet = sheets.getSheet("1FcfEth7aMtUG1MbU9h_uEIoaHMS9tQq0zJryIAroZpE");
    // sheet.clear();

    sheet.appendRow(["asdf", "asdf", "1", "13", "asdf"]);

    const cell = sheet.readCell("A1");

    // tslint:disable-next-line:no-console
    console.info(cell);
});