import axios from "axios"
import { randomUUID } from "crypto"
import { readFile } from "fs-extra"
import MarkdownIt = require("markdown-it")
import { commands, Uri, ViewColumn, window, workspace } from "vscode"
import { baseHeaders } from "../const"

export const submitSolution =  commands.registerCommand('vscode-codewars.submitSolution', async (uri: Uri) => {
  const solutionRegex = /\/\/\/ Solution id=(.*) lang=(.*) lang_ver=(.+).*\n((.+\n)+?)\/\/\/ Solution End/
  const content = (await readFile(uri.fsPath)).toString()
  const matchResult = content.match(solutionRegex)
  if(!matchResult) {
    window.showErrorMessage("Not a valid solution file.")
    return
  }
  const endpoint = matchResult[1]
  const language = matchResult[2]
  const languageVersion = matchResult[3]
  const solution = matchResult[4]
  const fixtureRegex = /\/\/\/ Fixture.*\n((.+\n)+?)\/\/\/ Fixture End/
  const fixtureMatchResult = content.match(fixtureRegex)
  if(!fixtureMatchResult) {
    window.showErrorMessage("No fixture.")
    return
  }
  const fixture = fixtureMatchResult[1]
  const cookies: string = workspace.getConfiguration("codewars").get("cookies") ?? ""
  const headers = {
    ...baseHeaders,
    "cookies": cookies
  }
  const body = {
    "channel": "runner:" + randomUUID(),
    "ciphered": [,
      "setup",
      "fixture",
    ],
    "code": solution,
    "fixture": fixture,
    "language": language,
    "languageVersion": languageVersion,
    "relayId": endpoint,
    "setup": "",
    "successMode": null,
    "testFramework": "rust",
  }
  await axios.post("https://www.codewars.com/api/v1/runner/authorize", null, { headers : headers }).catch((e) => console.log(e))
  const authorization = `Bearer ${(await axios.post("https://www.codewars.com/api/v1/runner/authorize", null, { headers : headers })).data.token}`
  const response: IResult = (await axios.post("https://runner.codewars.com/run", body, { headers : {
    ...headers,
    "authorization": authorization
  } })).data
  
  
  const panel = window.createWebviewPanel("codewars.submission", "Submission", { preserveFocus: true, viewColumn: ViewColumn.Two })
  const mdEngine = new MarkdownIt()
  const description = mdEngine.render(`
- return code: ${response.exitCode}
- passed: ${response.result.passed}
- failed: ${response.result.failed}
- time: ${response.wallTime}

---

\`\`\`
${response.stderr ?? response.stdout}
\`\`\`
 `)
  panel.webview.html = description
})

interface IResult {
  exitCode: number
  message: string
  result: {
    failed: number
    passed: number
  }
  stderr: string
  stdout: string
  wallTime: number
}
