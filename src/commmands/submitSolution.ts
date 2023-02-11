import axios from "axios"
import { randomUUID } from "crypto"
import { readFile } from "fs-extra"
import MarkdownIt = require("markdown-it")
import { commands, Uri, ViewColumn, window } from "vscode"

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
  const cookies = "_ga=GA1.1.1748630920.1675523611; intercom-device-id-x27gw54w=b2ca6bce-0058-4ccb-9dcc-3842d7594dce; intercom-session-x27gw54w=eU5uR2FnWUhIcStQWXpFdi9yTkZBNHVXOWpVUk9VMjZJQ0c5NWhLTlRCdm5ncmNsNEh4TW82ZDJLZUNNTDN1Ri0tcEJrRndvKzFmMy8rbTRJckUyWk5zdz09--4a2d0d252aba87acad2a94cdf2bc6eb56600c450; remember_user_token=eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaGJDRnNHU1NJZE5XTXlZamt4WlRkbE5qVTVZbVUwWmpJM09HRXdOalZpQmpvR1JWUkpJaGxOZVcxRFdGWmpOV2x2WWpOeFEyOWtSVVJOWXdZN0FGUkpJaGN4TmpjMk1EVXdNemcyTGpJd05EUTVNVFFHT3dCRyIsImV4cCI6IjIwMjQtMDItMTBUMTc6MzM6MDYuMjA0WiIsInB1ciI6bnVsbH19--5560013726eedf9dfd7b7f1e88abd2b9ed1b803e; _session_id=7e77e13420a987b5611f07d47b031e76; _ga_M3JYSQLS8M=GS1.1.1676050388.5.1.1676050604.0.0.0; CSRF-TOKEN=NJrtikCWGLlYp3pItoaQcy6sZhfnv5/hCLc7aJp6zSqSUt7ycR2UgXJKnzzd8bZFGhD0gHRrBho9Pk9ALqf9uw=="
  const headers = {
    "accept": "application/json, text/plain, */*",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    "authorization": "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjVjMmI5MWU3ZTY1OWJlNGYyNzhhMDY1YiIsImV4cCI6MTY3NjkxNTgxN30.nPwZx_WJYlJ4FUSKOPDlcvrQMsWpBTTSKhajikmIWUs",
    "cf-cache-status": "DYNAMIC",
    "cache-control": "no-cache",
    "cookie": cookies,
    "pragma": "no-cache",
    "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "x-csrf-token": "wJnUvGv7jfXfcWQxJPJLVaLHUg23lnhQGMZJY3X5bpLFZSPpChscg5z70nJn5LwTC/oD3YURA9j3gJg+sC5jvQ==",
    "x-requested-with": "XMLHttpRequest",
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
