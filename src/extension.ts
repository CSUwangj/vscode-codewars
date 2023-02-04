import * as vscode from 'vscode'
import get from 'axios'

export function activate(context: vscode.ExtensionContext) {
  console.log("Activated")
  const disposable =  vscode.commands.registerCommand('vscode-codewars.nextChallenge', async () => {
    const headers = {
      "accept": "application/json, text/plain, */*",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      "authorization": "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjVjMmI5MWU3ZTY1OWJlNGYyNzhhMDY1YiIsImV4cCI6MTY3NjM5MTQ4NH0.vOQ1N-BtK98uDBRgXmiRZxtfZ7d3WAXyiiI2seXC2bM",
      "cf-cache-status": "DYNAMIC",
      "cache-control": "no-cache",
      "cookie": "leave it for later",
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
    const nextChallenge = await get("https://www.codewars.com/trainer/peek/rust/default?dequeue=false", {
      "headers": headers
    })
    if(!nextChallenge.data?.success || !nextChallenge.data?.href || !nextChallenge.data?.language) {
      vscode.window.showInformationMessage('Cannot get next challenge, check cookie')
      return
    }
    const url = `https://www.codewars.com${nextChallenge.data.href}/train/${nextChallenge.data.language}`
    const dataRegex = /data: JSON\.parse\((.*)\),\n/
    const sessionRegex = /routes: (.*),\n/ 
    const challenge = await get(url, { "headers": headers })
    const challengeData = JSON.parse(JSON.parse(challenge.data.match(dataRegex)[1]))
    const sessionData = JSON.parse(challenge.data.match(sessionRegex)[1]).session
    console.log(challengeData)
    console.log(sessionData)
  })

  context.subscriptions.push(disposable)
}

// This method is called when your extension is deactivated
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() {}
