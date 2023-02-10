import { ExtensionContext} from 'vscode'
import { codeLensController } from './codelens/CodeLensController'
import { nextChallenge } from './commmands/nextChallenge'
import { submitSolution } from './commmands/submitSolution'
import { testSolution } from './commmands/testSolution'

export function activate(context: ExtensionContext) {
  
  context.subscriptions.push(
    nextChallenge,
    submitSolution,
    testSolution,
    codeLensController
  )
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() {}
