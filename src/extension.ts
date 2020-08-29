import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('"tsugu" is now active!');

	let disposable = vscode.commands.registerCommand('tsugu.swap', () => {
		let editor = vscode.window.activeTextEditor;
		let doc = editor?.document;
		let cursors = editor?.selections;

		let selectA: vscode.Selection;
		let selectB: vscode.Selection;

		if (cursors?.length === 2) {

			if (cursors[0].isEmpty) {
				let rangeA = doc?.getWordRangeAtPosition(cursors[0].start);
				if (rangeA?.isEmpty) {
					selectA = new vscode.Selection(rangeA?.start, rangeA?.end);
				}
			}
			else {
				selectA = new vscode.Selection(cursors[0].start, cursors[0].end);
			}

			if (cursors[1].isEmpty) {
				let rangeB = doc?.getWordRangeAtPosition(cursors[1].start);
				if (rangeB?.isEmpty) {
					selectA = new vscode.Selection(rangeB?.start, rangeB?.end);
				}
			}
			else {
				selectB = new vscode.Selection(cursors[1].start, cursors[1].end);
			}

			editor?.edit(edit => {
				edit.replace(selectA, doc?.getText(selectB) + '');
				edit.replace(selectB, doc?.getText(selectA) + '');
			});
		}
		vscode.window.showInformationMessage('Swap!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }