import { ExtensionContext} from 'vscode'
import { codeLensController } from './codelens/CodeLensController'
import { nextChallenge } from './commmands/nextChallenge'

export function activate(context: ExtensionContext) {
  

  context.subscriptions.push(
    nextChallenge, 
    codeLensController
  )
}

// This method is called when your extension is deactivated
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() {}
