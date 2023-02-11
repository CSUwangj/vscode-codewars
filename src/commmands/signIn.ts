import axios from "axios"
import { commands, window, workspace } from "vscode"

export const signIn = commands.registerCommand('vscode-codewars.signin', async () => {
  const cookies = await window.showInputBox({
    prompt: "Enter Cookies.",
    password: true,
    ignoreFocusOut: true,
  })

  // const headers = {
  //   "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  //   "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
  //   "cache-control": "max-age=0",
  //   "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
  //   "sec-ch-ua-mobile": "?0",
  //   "sec-ch-ua-platform": "\"Windows\"",
  //   "sec-fetch-dest": "document",
  //   "sec-fetch-mode": "navigate",
  //   "sec-fetch-site": "same-origin",
  //   "sec-fetch-user": "?1",
  //   "upgrade-insecure-requests": "1",
  //   "cookies": cookies
  // }

  // const response = (await axios.get("https://www.codewars.com/dashboard", { headers : headers, responseType : "text" }))
  // const routeRegex = /routes: (.*),\n/ 
  // const routeStringMatchResult = response.data.match(routeRegex)
  // if(!routeStringMatchResult) {
  //   window.showErrorMessage('Cannot get user name, check cookie')
  //   return
  // }
  // const routeData = JSON.parse(routeStringMatchResult[1])
  // if(!routeData.user_profile) {
  //   window.showErrorMessage('Cannot get user name, check cookie')
  //   return
  // }
  // const userRegex = /\/users\/(.+)/
  // const userMatchResult = routeData.user_profile.match(userRegex)
  // if(!userMatchResult) {
  //   window.showErrorMessage('Cannot get user name, check cookie')
  //   return
  // }
  // const user = userMatchResult[1]
  workspace.getConfiguration("codewars").update("cookies", cookies)
  // window.showInformationMessage(`Successfully sign in as ${user}`)
})