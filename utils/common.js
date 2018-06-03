const request = require('request-promise')
const excelParser = require('simple-excel-to-json');
const path = require('path')
const fs = require('fs')

/**
 * get请求
 * @param {string} url 请求地址
 */
async function get(url) {
  return await request.get(url, { encoding: null })
}

/**
 * 获取Excel链接内容并转化为json
 * @param {string} url 链接
 */
async function getExcel(url) {
  const buffer = await get(url)
  // console.log('getExcel', url, buffer)
  if (buffer) {
    const tempFilePath = path.join(__dirname, `./temp${(new Date()).getTime()}.xls`)
    fs.writeFileSync(tempFilePath, buffer)
    // console.log('tempFilePath', tempFilePath)
    const result = excelParser.parseXls2Json(tempFilePath);
    fs.unlinkSync(tempFilePath);
    // console.log('getExcel result', result)
    return Promise.resolve(result)
  }
  return Promise.resolve(null)
}

module.exports = {
  get,
  getExcel
}