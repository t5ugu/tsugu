import * as vscode from 'vscode';
import { swap } from './swap';
import { scoreOperation } from './score_ope/score_operation';
import { fullToHalf } from './full2half';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('tsugu.swap',		() => swap()),
		vscode.commands.registerCommand('tsugu.operation',	() => scoreOperation()),
		vscode.commands.registerCommand('tsugu.full2half',	() => fullToHalf()),
	);
}

export function deactivate() { }