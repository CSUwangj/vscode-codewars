import axios from "axios"
import { pathExists, createFile, writeFile } from "fs-extra"
import MarkdownIt = require("markdown-it")
import path = require("path")
import slugify from "slugify"
import { commands, window, ViewColumn, workspace, Uri } from "vscode"
import { baseHeaders } from "../const"

export const nextChallenge =  commands.registerCommand('vscode-codewars.nextChallenge', async () => {
  // TODO: add language & cookies setting
  const language = "rust"
  const cookies = "signed_in=false; _ga=GA1.1.1748630920.1675523611; remember_user_token=eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaGJDRnNHU1NJZE5XTXlZamt4WlRkbE5qVTVZbVUwWmpJM09HRXdOalZpQmpvR1JWUkpJaGxOZVcxRFdGWmpOV2x2WWpOeFEyOWtSVVJOWXdZN0FFWkpJaGN4TmpjMU5USXpOalV5TGpJNE1qSTBOVFlHT3dCRyIsImV4cCI6IjIwMjQtMDItMDRUMTU6MTQ6MTIuMjgyWiIsInB1ciI6bnVsbH19--2c4a318a768f311ff1f48fa308ce20237bb3dff3; _session_id=e518775cd6d9330691d2c989376025de; intercom-device-id-x27gw54w=b2ca6bce-0058-4ccb-9dcc-3842d7594dce; intercom-session-x27gw54w=WlFRRjRnbmNMalg3U1pCVG01NnV1ejdRTWtmckJsZlJHK095Z1JTS0d5eWtnZWhIak5UZmR4NldGdVYvdzI1ci0tbkE1cTlGdnFlc1Mycm5JNnVYS05qdz09--d42ddaa6dbe3aaf3a97c54749c43bdbb97f0c20b; _ga_M3JYSQLS8M=GS1.1.1675526019.2.1.1675530435.0.0.0; CSRF-TOKEN=tLGCEw3xS1kCw+v7nlpYqO3JX0w8ug4TgY8IQilBJTixTXVGbBHaL0FJXbjdTK/uRPQOnA49dZtuydkf7JYoFw=="
  const headers = {
    ...baseHeaders,
    "cookies": cookies
  }
  const nextChallenge = await axios.get(`https://www.codewars.com/trainer/peek/${language}/default?dequeue=false`, { "headers": headers })
  if(!nextChallenge.data?.success || !nextChallenge.data?.href || !nextChallenge.data?.language) {
    window.showInformationMessage('Cannot get next challenge, check cookie')
    return
  }
  const trainUrl = `https://www.codewars.com${nextChallenge.data.href}/train/${language}`
  const dataRegex = /data: JSON\.parse\((.*)\),\n/
  const routeRegex = /routes: (.*),\n/ 
  const challenge = await axios.get(trainUrl, { "headers": headers })
  const challengeData = JSON.parse(JSON.parse(challenge.data.match(dataRegex)[1]))
  const routeData = JSON.parse(challenge.data.match(routeRegex)[1])
  const sessionPath = routeData.session
  const sessionUrl = `https://www.codewars.com${sessionPath.replace("%7Blanguage%7D", language)}`
  const problemData = (await axios.post(sessionUrl, {} ,{ "headers": headers })).data
  const challengeName = challengeData.challengeName
  const panel = window.createWebviewPanel("codewars.description", "Description", { preserveFocus: true, viewColumn: ViewColumn.Two })
  const mdEngine = new MarkdownIt()
  const description = mdEngine.render(challengeData?.description)
  panel.webview.html = description

  // TODO: add more language
  const extensionsMap = {
    "rust": "rs",
    "typescript": "ts"
  }

  // TODO: add workspace folder settings
  const fileName = slugify(challengeName, {
    trim: true,
    lower: true,
    remove: /[!?]/
  }) + `.${extensionsMap[language]}`
  const folderName = workspace.workspaceFolders?.[0].uri.fsPath
  if(!folderName) {
    window.showErrorMessage("Codewars: please use extension under a open folder.")
    return
  }
  const filePath = path.join(folderName, fileName)
  if(!await pathExists(filePath)) {
    await createFile(filePath)

    const content = `/// Solution id=${problemData.solutionId} lang=${language} lang_ver=${problemData.languageVersions[0].id}\n${problemData.setup}\n/// Solution End\n\n/// Sample Tests\n${problemData.exampleFixture}\n/// Tests End\n\n/// Fixture\n${problemData.fixture}\n/// Fixture End\n`
    writeFile(filePath, content, (err) => {
      console.error(err)
    })
  }
  window.showTextDocument(Uri.file(filePath), { preview: false, viewColumn: ViewColumn.One })
})