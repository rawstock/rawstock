const CONS = require("./constants");
const common = require('./common');
const iconv = require("iconv-lite");
const dateu = require('./dateu')
const csv = require('csvtojson')

const { get, getExcel } = common

/**
 * 获取沪深上市公司基本情况
 * @param {string} date 日期YYYY-MM-DD，默认为上一个交易日，目前只能提供2016-08-09之后的历史数据
 * 返回值说明
 * code,代码
 * name,名称
 * industry,细分行业
 * area,地区
 * pe,市盈率
 * outstanding,流通股本
 * totals,总股本(万)
 * totalAssets,总资产(万)
 * liquidAssets,流动资产
 * fixedAssets,固定资产
 * reserved,公积金
 * reservedPerShare,每股公积金
 * eps,每股收益
 * bvps,每股净资
 * pb,市净率
 * timeToMarket,上市日期
 */
async function getStockBasics(date) {
  const wDate = !date
    ? dateu.formatDate(dateu.lastTddate())
    : date
  if (+wDate < 20160809) {
    return null
  }
  const datePre = date ? wDate.substring(0, 4) + wDate.substring(4, 6) + '/' : ''
  const url = CONS.ALL_STOCK_BASICS_FILE(datePre, date ? wDate : '')
  const result = await get(url)
  const csvStr = iconv.decode(result, "GBK")
  const jsonArray = await csv().fromString(csvStr);
  return jsonArray
}

module.exports = {
  getStockBasics
}