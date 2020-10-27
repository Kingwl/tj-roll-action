import * as core from '@actions/core'
import axios from 'axios'
import * as qs from 'querystring'
import * as cherrio from 'cheerio'

const url = 'http://apply.xkctk.jtys.tj.gov.cn/apply/norm/personQuery.html'

async function runRequest(applyCode: string, issueNumber: string) {
  const options = qs.stringify({
    pageNo: 1,
    issueNumber,
    applyCode
  })

  return axios.post(url, options)
}

enum ResultType {
  Success,
  Failed
}

interface SuccessResult {
  type: ResultType.Success
  name: string
}

interface FailedResult {
  type: ResultType.Failed
}

type Result = SuccessResult | FailedResult

function parseResult(content: string): Result {
  const doc = cherrio.load(content)
  const allImages = doc('img')
  const allSrc = allImages.map((_, img) => doc(img).attr('src'))
  const allSrcRaw: string[] = allSrc.get()
  const hasFailedResult = allSrcRaw
    .map(x => x.toLowerCase())
    .some(x => x.endsWith('notballot.png'))
  if (hasFailedResult) {
    return {
      type: ResultType.Failed
    }
  }

  const resultTd = doc('.main_content_bg > table table.ge2_content td')
  const name = (<string>resultTd.map((_, x) => doc(x).text()).get(1)).trim()
  return {
    type: ResultType.Success,
    name
  }
}

async function main(applyCode: string, issueNumber: string): Promise<Result> {
  console.log(
    `Apply code is: ${applyCode.slice(0, 4)}*****${applyCode.slice(4 + 5)}`
  )
  console.log(`Issue number is: ${issueNumber}`)
  console.log(`Let's check!`)

  const resp = await runRequest(applyCode, issueNumber)
  console.log(`Request succeed`)
  console.log('Parse start')
  const result = parseResult(resp.data)
  console.log('All done!')
  return result
}

async function run(): Promise<void> {
  try {
    const applyCode = core.getInput('apply-code')
    const issueNumber = core.getInput('issue-number')
    const result = await main(applyCode, issueNumber)

    if (result.type === ResultType.Failed) {
      console.log('Sorry, You did not win.')

      core.setOutput('result', false)
      core.setOutput('name', '')
    } else {
      console.log('Holy shit! You have win the roll!')
      core.setOutput('result', true)
      core.setOutput('name', result.name)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
