import * as fs from "fs";
import { env } from "./core-exec";

import { google } from 'googleapis';
import { OAuth2Client } from "googleapis-common";

import { log } from './console';

import { _await } from './core-exec';


let token: any;
let credentials: any;

let oAuth2Client: OAuth2Client;
let sheets: any;

const SHEET_NAME = 'Sheet1';

// parse token.js and credentials.js
export function initialize() {
    const tokenPath = env.GOOGLE_TOKEN_PATH;
    const credPath = env.GOOGLE_CREDENTIAL_PATH;

    const tokenFile = fs.readFileSync(tokenPath, 'utf8');
    const credFile = fs.readFileSync(credPath, 'utf8');

    token = JSON.parse(tokenFile);
    credentials = JSON.parse(credFile);

    const { client_secret, client_id, redirect_uris } = credentials.installed;
    oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(token);

    sheets = google.sheets({ version: 'v4', auth: oAuth2Client });

    return;
}

/** Class representing a google spreadsheet. */
export class Spreadsheet {

    private spreadsheetID: string;
    // tslint:disable-next-line:variable-name
    private _title: string;

    /**
     * Creates an instance of Spreadsheet.
     *
     * @constructor
     * @this {Spreadsheet}
     * @param {string} spreadsheetID unique ID of spreadsheet
     * @param {string} title title of sheet inside
     */
    constructor(spreadsheetID: string, title: string) {
        this.spreadsheetID = spreadsheetID;
        this._title = title;
    }

    /**
     * Get title value
     */
    get title(): string {
        return this._title;
    }

    /**
     * Clear all the spreadsheet values.
     */
    public clear(): void {
        _await(new Promise((resolve, reject) => {
            sheets.spreadsheets.values.clear({
                range: SHEET_NAME,
                spreadsheetId: this.spreadsheetID,
            }, (err: any, result: any) => {
                if (err) {
                    // Handle error.
                    reject(err);
                } else {
                    log(`${result.data} cells cleared.`)
                    resolve();
                }
            });
        }));
    }

    /**
     * Read one row of the spreadsheet.
     * @param {number} row row number to be read.
     * @return {string[]} values in the row.
     */
    public readRow(row: number): string[] {
        return _await(new Promise((resolve, reject) => {
            sheets.spreadsheets.values.get({
                range: SHEET_NAME + "!" + row + ":" + row,
                spreadsheetId: this.spreadsheetID,
            }, (err: any, res: any) => {
                if (err) {
                    reject('The API returned an error: ' + err);
                }
                // Array of returned values
                const rows = res.data.values;
                if (rows.length) {
                    resolve(rows);
                } else {
                    reject('No data found.');
                }
            });
        }));
    }

    /**
     * Read one row of the spreadsheet.
     * @param {string} cell cell to be read in A1 notation.
     * @return {string[]} value in the cell.
     */
    public readCell(cell: string): string {
        return _await(new Promise((resolve, reject) => {
            sheets.spreadsheets.values.get({
                range: SHEET_NAME + "!" + cell,
                spreadsheetId: this.spreadsheetID,
            }, (err: any, res: any) => {
                if (err) {
                    reject('The API returned an error: ' + err);
                }
                // Array containing single returned values
                const rows = res.data.values;
                if (rows[0] && rows[0][0]) {
                    resolve(rows[0][0] as string);
                } else {
                    reject('No data found.');
                }
            });
        }));
    }

    /**
     * Clear all the spreadsheet values.
     * @param {string[]} row row of values to append to spreadsheet.
     */
    public appendRow(row: string[]): void {
        _await(new Promise((resolve, reject) => {
            const resource = {
                values: [row],
            };
            sheets.spreadsheets.values.append({
                range: SHEET_NAME,
                resource,
                spreadsheetId: this.spreadsheetID,
                valueInputOption: 'RAW',
            }, (err: any, result: any) => {
                if (err) {
                    // Handle error.
                    reject(err);
                } else {
                    log(`${result.data.updates.updatedCells} cells appended.`)
                    resolve();
                }
            });
        }));
    }
}


// Factory method to create spreadsheet by name, return spreadsheet class
export function createSheet(title: string): Spreadsheet {
    return _await(new Promise((resolve, reject) => {
        let newID: string;

        const resource = {
            properties: {
                title
            },
        };

        sheets.spreadsheets.create({
            fields: 'spreadsheetId',
            resource,
        }, (err: any, spreadsheet: any) => {
            if (err) {
                // Handle error.
                reject(err);
            } else {
                log(spreadsheet.data.spreadsheetId)
                newID = spreadsheet.data.spreadsheetId;
                resolve(new Spreadsheet(newID, title));
            }
        });
    }));
}

// Factory method to get spreadsheet from ID, return spreadsheet class
export function getSheet(id: string): Spreadsheet {
    return _await(new Promise((resolve, reject) => {
        sheets.spreadsheets.get({
            includeGridData: false,
            ranges: [],
            spreadsheetId: id,
        }, (err: any, res: any) => {
            if (err) {
                reject('The API returned an error: ' + err);
            }
            else {
                // Get name from response
                const title = res.data.properties.title;
                resolve(new Spreadsheet(id, title))
            }
        });
    }));
}