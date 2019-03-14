import { RUNTIME_BASE } from "./core-exec";

type LogLevel = "silent" | "error" | "warn" | "info" | "verbose" | "debug";

enum TermSettings {
    Reset = "\x1b[0m",
    Bright = "\x1b[1m",
    Dim = "\x1b[2m",
    Underscore = "\x1b[4m",
    Blink = "\x1b[5m",
    Reverse = "\x1b[7m",
    Hidden = "\x1b[8m",

    FgBlack = "\x1b[30m",
    FgRed = "\x1b[31m",
    FgGreen = "\x1b[32m",
    FgYellow = "\x1b[33m",
    FgBlue = "\x1b[34m",
    FgMagenta = "\x1b[35m",
    FgCyan = "\x1b[36m",
    FgWhite = "\x1b[37m",

    BgBlack = "\x1b[40m",
    BgRed = "\x1b[41m",
    BgGreen = "\x1b[42m",
    BgYellow = "\x1b[43m",
    BgBlue = "\x1b[44m",
    BgMagenta = "\x1b[45m",
    BgCyan = "\x1b[46m",
    BgWhite = "\x1b[47m",
}

const _DEFAULT_CONSOLE: Console = console;
const _DEFAULT_LEVEL: LogLevel = "info"

const _PRECEDENCE: LogLevel[] = ["silent", "error", "warn", "info", "verbose", "debug"];

let _level: LogLevel = (() => {
    if (process.env.LOG_LEVEL && (_PRECEDENCE as string[]).includes(process.env.LOG_LEVEL)) {
        return (process.env.LOG_LEVEL as LogLevel);
    } else {
        return _DEFAULT_LEVEL;
    }
})();

let _console: Console = _DEFAULT_CONSOLE;

let _active_levels: Set<LogLevel> = _get_active_levels();

function _get_active_levels(): Set<LogLevel> {
    return new Set(_PRECEDENCE.slice(0, _PRECEDENCE.indexOf(_level) + 1));
}

function _get_caller_info(): string {
    const stack = new Error().stack;
    return stack.split('\n')[4].split("at ")[1].trim().split(RUNTIME_BASE)[1];
}

function _timestamp() : string {
    return TermSettings.FgGreen + "[" + (new Date()).toISOString() + "]" + TermSettings.Reset;
}

function _colorize(v: string, color: TermSettings) : string {
    return color + v + TermSettings.Reset;
}

function _header(v: LogLevel) : string{
    let color : TermSettings;
    switch (v) {
        case "error":
            color = TermSettings.FgRed;
            break;
        case "warn":
            color = TermSettings.FgYellow;
            break;
        case "info":
            color = TermSettings.FgWhite;
            break;
        case "verbose":
            color = TermSettings.FgCyan;
            break;
        case "debug":
            color = TermSettings.FgMagenta;
            break;
        default:
            throw new Error("Tried to log with an invalid log-level or 'silent'");
    }

    return `${_timestamp()} ${_colorize(v.toUpperCase(), color)} (${_get_caller_info()})\t:: `
}

export function getLogLevel(): LogLevel {
    return _level;
}

export function setLogLevel(level: LogLevel): void {
    _level = level;
    _active_levels = _get_active_levels();
}

export function replaceConsole(newConsole: Console): void {
    _console = newConsole;
}

export function error(...args: any[]) {
    if (_active_levels.has("error")) {
        _console.error(_header('error'), ...args);
    }
}

export function warn(...args: any[]) {
    if (_active_levels.has("warn")) {
        _console.error(_header('warn'), ...args);
    }
}

export function info(...args: any[]) {
    if (_active_levels.has("info")) {
        _console.log(_header('info'), ...args);
    }
}

export function verbose(...args: any[]) {
    if (_active_levels.has("verbose")) {
        _console.log(_header('verbose'), ...args);
    }
}

export function debug(...args: any[]) {
    if (_active_levels.has("debug")) {
        _console.log(_header('debug'), ...args);
    }
}
