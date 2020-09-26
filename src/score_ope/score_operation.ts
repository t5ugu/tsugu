import vscode = require('vscode');
import rpn = require('./rpn/rpn');

export function scoreOperation() {
    // function gle(arr: any[]) { return arr.slice(-1)[0]; }   // Get Last Element

    const editor = vscode.window.activeTextEditor!;
    const doc = editor.document;
    const selection = editor.selection;

    let text = doc.getText(selection).split("=");

    //vscode.window.showInformationMessage(rpn.rpnGenerate(text));
    vscode.window.showInformationMessage(`${text[0]} = ${rpn.rpnCalculation(rpn.rpnGenerate(text[1])).toString()}`);
}