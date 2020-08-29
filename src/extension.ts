import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('"tsugu" is now active!');

	let swap = vscode.commands.registerCommand('tsugu.swap', () => {
		let editor = vscode.window.activeTextEditor;
		let doc = editor?.document;
		let cursors = editor?.selections;

		let selectA: vscode.Selection,
			selectB: vscode.Selection;

		function selectString(c: vscode.Selection) {
			let toVal = new vscode.Selection(c.start, c.end);
			if (c.isEmpty) {
				let range = doc?.getWordRangeAtPosition(c.start);

				if (range?.isEmpty !== undefined) {
					toVal = new vscode.Selection(range?.start, range?.end);
				}
			}
			return toVal;
		}

		if (cursors?.length === 2) {
			selectA = selectString(cursors[0]);
			selectB = selectString(cursors[1]);

			editor?.edit(edit => {
				edit.replace(selectA, doc?.getText(selectB) + '');
				edit.replace(selectB, doc?.getText(selectA) + '');
			});
		}
	});

	context.subscriptions.push(swap);
}

export function deactivate() { }