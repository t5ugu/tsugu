import * as vscode from 'vscode';
import { swap } from './swap';
import { scoreOperation } from './score-operation';

export function activate(context: vscode.ExtensionContext) {
	console.log('"tsugu" is now active!');

	let editor = vscode.window.activeTextEditor;
	let doc = editor?.document;

	let swapping = vscode.commands.registerCommand('tsugu.swap', () => swap());
	context.subscriptions.push(swapping);

	let operation = vscode.commands.registerCommand('tsugu.operation', () => scoreOperation());
	context.subscriptions.push(operation);
}

export function deactivate() { }