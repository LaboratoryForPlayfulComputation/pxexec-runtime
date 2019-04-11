require('source-map-support').install();

import Fiber = require('fibers');
import Future = require('fibers/future');
import { machineIdSync } from 'node-machine-id';

import { log } from './console';

export const env = process.env;

export const machineID: string = machineIdSync();

export const hacks: {
	wrtc: any
} = {
	wrtc: undefined,
}

let executing: boolean = false;
const initializers: Set<() => void> = new Set();
const exitHandlers: Set<() => void> = new Set();

/*
 *  The behavior of the default rejection handler.
 *
 *  Log the reason and kill the process.
 */
function catchPromiseRejection(reason: any) {
	log("Unhandled exception from Event Loop:", reason);
	process.exit(1);
}

/**
 * Code to run on start
 * 
 * @param body The main thread of the program.
 */
export function main(body: () => void) {
	if (!executing) {
		executing = true;
		initializers.forEach((init) => init());

		Fiber(body).run();
	} else {
		throw new Error("core module attempted to execute twice");
	}
}

/**
 * Add an initializer to the initializer stack. Initializers are run in FIFO
 * order: the first initializer added to the stack will be the first initializer
 * that is executed on the start of the program.
 * 
 * @param initializer The function to run when the user code is initialized
 */
export function onInit(initializer: () => void) {
	initializers.add(initializer);
}

/**
 * Add a routine to the exit stack. Exit handlers are run in FIFO order: the
 * first cleanup routine added to the stack will be the first cleanup routine
 * that is executed when the program exits.
 * 
 * @param cleanup The function to run when the program terminates.
 */
export function onExit(cleanup: () => void) {
	exitHandlers.add(cleanup);
}

export function _detach(body: () => void) {
	(Future as any).task(body).detach();
}

export function _await<T>(task: Promise<T>, catcher?: (reason: any) => PromiseLike<T>): T {
	const fiber = Fiber.current;
	let r: T;
	task.then((val: T) => {
		r = val;
		fiber.run();
	}).catch(catcher || catchPromiseRejection);
	Fiber.yield();
	return r;
}

// Set up the exit handlers for the module
function atexit(reason: string, ...args: any[]) {
	log("EXIT: " + reason);

	if (reason === 'uncaughtException') {
		log(args[0].message, args[0].stack);
	}

	exitHandlers.forEach((h) => h());

	process.exit(1);
}

process.on('exit', () => atexit('EXIT'));
process.on('SIGINT', () => atexit('SIGINT'));
process.on('uncaughtException', (e) => atexit('uncaughtException', e));