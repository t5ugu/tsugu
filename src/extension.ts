import * as vscode from 'vscode';
import { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } from 'constants';

export function activate(context: vscode.ExtensionContext) {
	console.log('"tsugu" is now active!');

	let editor = vscode.window.activeTextEditor;
	let doc = editor?.document;

	let swap = vscode.commands.registerCommand('tsugu.swap', () => {
		let cursors = editor?.selections;

		function select(s: vscode.Selection) {
			let toVal = new vscode.Selection(s.start, s.end);
			if (s.isEmpty) {
				let range = doc?.getWordRangeAtPosition(s.start);

				if (range?.isEmpty !== undefined) {
					toVal = new vscode.Selection(range.start, range.end);
				}
			}
			return toVal;
		}

		if (cursors?.length === 2) {
			let selectA = select(cursors[0]),
				selectB = select(cursors[1]);

			editor?.edit(edit => {
				edit.replace(selectA, doc?.getText(selectB) + '');
				edit.replace(selectB, doc?.getText(selectA) + '');
			});
		}
	});
	context.subscriptions.push(swap);


	let operation = vscode.commands.registerCommand('tsugu.operation', () => {
		let select = editor?.selection;

		let text = doc?.getText(select);
		let formulas = text?.split('=');
		for (let i = 0; formulas !== undefined && i < formulas.length; i++) {
			formulas[i].trim();
		}

		if (formulas !== undefined && formulas[0].length !== 0 && formulas[1].length !== 0) {
			for (let i = 0; i < formulas.length; i++) {
				vscode.window.showInformationMessage(formulas[i]);
			}

			let elements: (string)[][] = [][formulas.length];
			for (let i = 0; i < formulas.length; i++) {
				for (let j = 0; j < formulas[i].split('(')?.length; j++) {
					elements[j][i] = formulas[i].slice(formulas[i].lastIndexOf('('), formulas[i].indexOf(')'));
					// TODO
				}
			}

		} else {
			vscode.window.showErrorMessage('Your Formula is Deficient!');
		}
	});
	context.subscriptions.push(operation);
}

export function deactivate() { }