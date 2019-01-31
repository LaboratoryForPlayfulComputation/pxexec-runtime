import * as fs from "fs";
import { env } from "./core-exec";

import { google } from 'googleapis';

import { log } from './console';


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

// Exported Class Spreadsheet
//   Methods to append row
//   Clear Sheet
//   Read Row
//   Read Cell

export class Spreadsheet {

    private spreadsheetID: string;
    private name: string;

    constructor(spreadsheetID: string, name: string) {
        this.spreadsheetID = spreadsheetID;
        this.name = name;
    }

    public clear() {
        sheets.spreadsheets.values.clear({
            range: this.name,
            spreadsheetId: this.spreadsheetID,
        }, (err: any, result: any) => {
            if (err) {
                // Handle error.
                // console.log(err);
            } else {
                // console.log(`${result.data} cells cleared.`);
            }
        });
    }

    public readRow(row: number) {
        sheets.spreadsheets.values.get({
            range: this.name + "!" + row + ":" + row,
            spreadsheetId: this.spreadsheetID,
        }, (err: any, res: any) => {
            if (err) {
                return log('The API returned an error: ' + err);
            }
            const rows = res.data.values;
            if (rows.length) {
                return rows;
            } else {
                log('No data found.');
            }
        });
    }

    public readCell(cell: string) {
        sheets.spreadsheets.values.get({
            range: this.name + "!" + cell,
            spreadsheetId: this.spreadsheetID,
        }, (err: any, res: any) => {
            if (err) {
                return log('The API returned an error: ' + err);
            }
            const rows = res.data.values;
            if (rows.length) {
                return rows;
            } else {
                log('No data found.');
            }
        });
    }

    public appendRow(row: string[]) {
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
                log(err);
            } else {
                log(`${result.data.updates.updatedCells} cells appended.`);
            }
        });
    }
}


// Factory method to create spreadsheet by name, return spreadsheet class
export function createSheet(name: string) {

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
            log(err);
        } else {
            log(spreadsheet.data.spreadsheetId)
            newID = spreadsheet.data.spreadsheetId;
        }
    });

    return new Spreadsheet(newID, name);
}

// Factory method to get spreadsheet from ID, return spreadsheet class
export function getSheet(id: string, name: string) {
    return new Spreadsheet(id, name);
}