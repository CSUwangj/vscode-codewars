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
  const cookies: string = workspace.getConfiguration("codewars").get("cookies") ?? ""
  const headers = {
    ...baseHeaders,
    "cookies": cookies
  }
  const nextChallenge = (await axios.get(`https://www.codewars.com/trainer/peek/${language}/default?dequeue=false`, { "headers": headers })).data
  if(!nextChallenge.success || !nextChallenge.href || !nextChallenge.language) {
    window.showErrorMessage('Cannot get next challenge, check cookie')
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
  const panel = window.createWebviewPanel("codewars.description", "Description", { preserveFocus: true, viewColumn: ViewColumn.Two })
  const mdEngine = new MarkdownIt()
  const description = mdEngine.render(challengeData?.description)
  panel.webview.html = description
})