import vscode = require('vscode');
import rpn = require('./rpn/rpn');
import json = require('./anSample/data.json');

export function scoreOperation() {
    // function gle(arr: any[]) { return arr.slice(-1)[0]; }   // Get Last Element
/*
    const editor = vscode.window.activeTextEditor!;
    const doc = editor.document;
    const selection = editor.selection;
*/
    let text = "a = 1 + 2"/*doc.getText(selection)*/.split("=");

    vscode.window.showInformationMessage(rpn.rpnGenerate(text[1])!);
    //vscode.window.showInformationMessage(`${text[0]} = ${rpn.rpnCalculation(rpn.rpnGenerate(text[1])!)!.toString()}`);
}