import * as fs from "fs";
import { env } from "./core-exec";

import { google } from 'googleapis';

import { log } from './console';

import { _await } from './core-exec';


let token: any;
let credentials: any;

let oAuth2Client: any;
let sheets: any;

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

    sheets = google.sheets({ version: 'v4', oAuth2Client });

    return;
}

/** Class representing a google spreadsheet. */
export class Spreadsheet {

    private spreadsheetID: string;
    private name: string;

    /**
     * Creates an instance of Spreadsheet.
     *
     * @constructor
     * @this {Spreadsheet}
     * @param {string} spreadsheetID unique ID of spreadsheet
     * @param {string} name name of sheet inside
     */
    constructor(spreadsheetID: string, name: string) {
        this.spreadsheetID = spreadsheetID;
        this.name = name;
    }

    /**
     * Clear all the spreadsheet values.
     */
    public clear(): void {
        _await(new Promise((resolve, reject) => {
            sheets.spreadsheets.values.clear({
                range: this.name,
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
                range: this.name + "!" + row + ":" + row,
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
    public readCell(cell: string): string[] {
        return _await(new Promise((resolve, reject) => {
            sheets.spreadsheets.values.get({
                range: this.name + "!" + cell,
                spreadsheetId: this.spreadsheetID,
            }, (err: any, res: any) => {
                if (err) {
                    reject('The API returned an error: ' + err);
                }
                // Array containing single returned values
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
     * Clear all the spreadsheet values.
     * @param {string[]} row row of values to append to spreadsheet.
     */
    public appendRow(row: string[]): void {
        _await(new Promise((resolve, reject) => {
            const values = row;
            const resource = {
                values,
            };
            sheets.spreadsheets.values.append({
                range: this.name,
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
export function createSheet(name: string): Spreadsheet {
    return _await(new Promise((resolve, reject) => {
        let newID: string;

        const resource = {
            properties: {
                title: name
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
            }
        });

        resolve(new Spreadsheet(newID, name));
    }));
}

// Factory method to get spreadsheet from ID, return spreadsheet class
export function getSheet(id: string, name: string): Spreadsheet {
    return new Spreadsheet(id, name);
}