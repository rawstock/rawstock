const CONS = require("./constants");
const request = require('request-promise')
const iconv = require("iconv-lite");
const JSON5 = require("json5");
const moment = require("moment");
// const excelToJson = require('convert-excel-to-json');
const excelParser = require('simple-excel-to-json');
const neatCsv = require('neat-csv');
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
 * 处理当日行情分页数据，格式为json
 * @param {string} types 股票类型
 * @param {int} page 页码
 */
async function parsingDayPriceJson(types, page = 1) {
  console.log('page', page)
  const url = CONS.SINA_DAY_PRICE_URL(
    CONS.P_TYPE.http,
    CONS.DOMAINS.vsf,
    CONS.PAGES.jv,
    types,
    page
  );
  const result = JSON5.parse(iconv.decode(await get(url), "GBK"))
  return Promise.resolve(result)
}

/**
 * 1 一次性获取最近一个交易日所有股票的交易数据
 * 属性：代码，名称，涨跌幅，现价，开盘价，最高价，最低价，最日收盘价，成交量，换手率，成交额，市盈率，市净率，总市值，流通市值
 */
async function getTodayAll() {
  let asyncFuncs = [];
  for (let i = 1; i < CONS.PAGE_NUM[1]; i++) {
    asyncFuncs.push(parsingDayPriceJson("hs_a", i))
  }
  let asyncResults = await Promise.all(asyncFuncs)
  let arr = []
  asyncResults.forEach(r => {
    arr = arr.concat(r)
  })
  arr = arr.concat(await parsingDayPriceJson("shfxjs", 1));
  return arr;
}

/**
 * 请求k线数据
 * @param {*} params 参数对象
 */
async function _getKData(params) {
  let { url, dataflag = '',
    symbol = '',
    ktype = '' } = params
  const getResult = await get(url)
  const result = iconv.decode(getResult, "GBK")
  if (result) {
    const resArray = result.split('=')
    if (resArray && resArray.length > 1) {
      const data = resArray[1]
      try {
        const jsonObj = JSON5.parse(data)
        if (!(dataflag in jsonObj.data[symbol])) {
          dataflag = CONS.TT_K_TYPE[ktype.toUpperCase()]
        }
        const kData = jsonObj.data[symbol][dataflag]
        // console.log('kData', kData)
        return Promise.resolve(kData)
      } catch (err) {
        console.log('json parse error', err)
      }
    }
  }
  return Promise.resolve(null)
}
/**
 * 2 获取k线数据
 * @param {object} params 对象参数，包含以下详细参数
 * @param {string} code 股票代码 e.g. 600848
 * @param {string} start 开始日期 format：YYYY-MM-DD 为空时取上市首日
 * @param {string} end 结束日期 format：YYYY-MM-DD 为空时取最近一个交易日
 * @param {string} ktype 复权类型，qfq-前复权 hfq-后复权 None-不复权，默认为qfq
 * @param {string} autype 数据类型，D=日k线 W=周 M=月 5=5分钟 15=15分钟 30=30分钟 60=60分钟，默认为D
 * @param {boolean} index 指数标志，true代表是指数，默认false
 */
async function getKData(params) {
  let { code = "",
    start = "",
    end = "",
    ktype = "D",
    autype = "qfq",
    index = false } = params
  console.log("getKData");
  if (index && !CONS.INDEX_SYMBOL[code]) {
    throw new Error('找不到指数，请检验code参数')
  }
  let urls
  let dataflag = ''
  const symbol = index ? CONS.INDEX_SYMBOL[code] : CONS.codeToSymbol(code);
  autype = autype || ''
  if (start) {
    end = end || moment().format("YYYY-MM-DD")
  }
  if (CONS.K_LABELS.includes(ktype.toUpperCase())) {
    let fq = autype || ''
    if (['1', '5'].includes(code[0]) || index) {
      fq = ''
    }
    kline = !!autype ? 'fq' : ''
    if (!start && !end) {
      urls = [
        CONS.KLINE_TT_URL(CONS.P_TYPE['http'],
          CONS.DOMAINS['tt'],
          kline, fq, symbol,
          CONS.TT_K_TYPE[ktype.toUpperCase()],
          start, end,
          fq, Math.random())
      ]
    } else {
      years = CONS.ttDates(start, end)
      urls = []
      years.forEach(year => {
        const startdate = year + '-01-01'
        const enddate = (year + 1) + '-12-31'
        url = CONS.KLINE_TT_URL(CONS.P_TYPE['http'],
          CONS.DOMAINS['tt'],
          kline, fq + year, symbol,
          CONS.TT_K_TYPE[ktype.toUpperCase()],
          startdate, enddate,
          fq, Math.random())
        urls.push(url)
      })
    }
    dataflag = `${fq}${CONS.TT_K_TYPE[ktype.toUpperCase()]}`
  } else if (CONS.K_MIN_LABELS.includes(ktype)) {
    urls = [
      CONS.KLINE_TT_MIN_URL(CONS.P_TYPE['http'], CONS.DOMAINS['tt'],
        symbol, ktype, ktype, Math.random())
    ]
    dataflag = `m${ktype}`
  } else {
    throw new Error('ktype input error.')
  }
  let reqs = urls.map(async function (u) {
    return await _getKData({ url: u, dataflag, symbol, ktype })
  })
  const result = await Promise.all(reqs);
  let arr = []
  result.forEach(r => {
    arr = arr.concat(r)
  })
  return arr
}

/**
 * 获取Excel链接内容并转化为json
 * @param {string} url 链接
 */
async function getExcel(url) {
  const buffer = await get(url)
  // console.log('getExcel', url, buffer)
  if (buffer) {
    const tempFilePath = path.join(__dirname, "./temp.xls")
    fs.writeFileSync(tempFilePath, buffer)
    // console.log('tempFilePath', tempFilePath)
    const result = excelParser.parseXls2Json(tempFilePath);
    fs.unlinkSync(tempFilePath);
    // console.log('getExcel result', result)
    return Promise.resolve(result)
  }
  return Promise.resolve(null)
}

/**
 * 3 获取分笔数据
 * @param {object} params 参数对象，包含以下详细参数
 * @param {string} code 股票代码
 * @param {string} date 日期 format: YYYY-MM-DD
 * @param {string} src 数据源选择，可输入sn(新浪)、tt(腾讯)、nt(网易)，默认sn
 */
async function getTickData(params) {
  const { code, date, src = 'sn' } = params
  if (!CONS.TICK_SRCS.includes(src)){
    throw new Error(CONS.TICK_SRC_ERROR)
  }
  const symbol = CONS.codeToSymbol(code)
  const symbol_dgt = CONS.codeToSymbolDgt(code)
  const datestr = date.replace(/-/g, '')
  const url = {
    [CONS.TICK_SRCS[0]]: CONS.TICK_PRICE_URL(CONS.P_TYPE['http'], CONS.DOMAINS['sf'], CONS.PAGES['dl'], date, symbol),
    [CONS.TICK_SRCS[1]]: CONS.TICK_PRICE_URL_TT(CONS.P_TYPE['http'], CONS.DOMAINS['tt'], CONS.PAGES['idx'], symbol, datestr),
    [CONS.TICK_SRCS[2]]: CONS.TICK_PRICE_URL_NT(CONS.P_TYPE['http'], CONS.DOMAINS['163'], date.substring(0, 4), datestr, symbol_dgt)
  }
  if (src === CONS.TICK_SRCS[2]) {
    const data = await getExcel(url[src])
    // console.log('data', data)
    return data
  } else {
    const result = await get(url[src])
    const csv = iconv.decode(result, "GBK")
    // console.log('csv', url[src], csv)
    const data = await neatCsv(csv, { separator: '\t'})
    return data
  }
}

/**
 * 百度股票日线数据
 * @param {string} code 股票完整代码，如sz300162
 * @param {int} count 距离今天多少天的数据
 * @param {string} fq 复权：front为前复权，no为不复权
 * @param {boolean} index 指数标志，true代表是指数，默认false
 */
async function getKDataFromBaidu(params) {
  const { code, count = 160, fq = 'front', index = false } = params
  const symbol = index ? CONS.INDEX_SYMBOL[code] : CONS.codeToSymbol(code);
  const url = CONS.BAIDU_K_DATA_URL(CONS.P_TYPE['https'],
    symbol, count, fq, +(new Date()))
  // console.log('url', url)
  const result = await get(url)
  return JSON5.parse(result.toString('utf8'))
}

module.exports = {
  getTodayAll,
  getKData,
  getTickData,
  getKDataFromBaidu
};
