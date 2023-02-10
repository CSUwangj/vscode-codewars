import { CodeLensProvider, EventEmitter, Event, ProviderResult, CodeLens, Range, TextDocument } from 'vscode'

export class CustomCodeLensProvider implements CodeLensProvider {

  private onDidChangeCodeLensesEmitter: EventEmitter<void> = new EventEmitter<void>()

  get onDidChangeCodeLenses(): Event<void> {
    return this.onDidChangeCodeLensesEmitter.event
  }

  public refresh(): void {
    this.onDidChangeCodeLensesEmitter.fire()
  }

  public provideCodeLenses(document: TextDocument): ProviderResult<CodeLens[]> {
    const content: string = document.getText()
    const matchResult = content.match(/\/\/\/ Solution id=(.*) lang=(.*)/)
    if (!matchResult) {
      return undefined
    }

    let codeLensLine: number = document.lineCount - 1
    for (let i: number = document.lineCount - 1; i >= 0; i--) {
      const lineContent: string = document.lineAt(i).text
      if (lineContent.indexOf("/// Test End") >= 0 || lineContent.indexOf("/// Solution End") >= 0) {
        codeLensLine = i + 1
        break
      }
    }

    const range: Range = new Range(codeLensLine, 0, codeLensLine, 0)
    const codeLens: CodeLens[] = []

    codeLens.push(new CodeLens(range, {
      title: "Submit",
      command: "vscode-codewars.submitSolution",
      arguments: [document.uri],
    }))

    codeLens.push(new CodeLens(range, {
      title: "Test",
      command: "vscode-codewars.testSolution",
      arguments: [document.uri],
    }))

    return codeLens
  }
}

export const customCodeLensProvider: CustomCodeLensProvider = new CustomCodeLensProvider()