import * as vscode from 'vscode';
import { swap } from './swap';
import { scoreOperation } from './score-operation';
import { fullToHalf } from './full2half';

export function activate(context: vscode.ExtensionContext) {
	console.log('"tsugu" is now active!');

	let swapping = vscode.commands.registerCommand('tsugu.swap', () => swap());
	context.subscriptions.push(swapping);

	let operation = vscode.commands.registerCommand('tsugu.operation', () => scoreOperation());
	context.subscriptions.push(operation);

	let full2half = vscode.commands.registerCommand('tsugu.full2half', () => fullToHalf());
	context.subscriptions.push(full2half);
}

export function deactivate() { }