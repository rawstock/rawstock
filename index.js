const trading = require('./utils/trading')

async function main () {

  try {
    // 1 实时行情

    // 一次性获取当前交易所有股票的行情数据（如果是节假日，即为上一交易日）
    // const result = await trading.getTodayAll()

    // 2 获取股票行情

    // 2.1）获取浦发银行近一年半的前复权日线行情：
    // const result = await trading.getKData({ code: '600000' })

    // 2.2）获取浦发银行近6年后复权周线行情：
    // const result = await trading.getKData({ code: '600000', ktype: 'W', autype: 'hfq' })

    // 2.3）获取浦发银行近期5分钟行情：
    // const result = await trading.getKData({ code: '600000', ktype: '5' })

    // 2.4）获取沪深300指数10月份日线行情：
    // const result = await trading.getKData({ code: '399300', index: true, start: '2016-10-01', end: '2016-10-31' })

    // 2.5）获取鹏华银行分级B的60分钟行情：
    // const result = await trading.getKData({ code: '150228', ktype: '60' })

    // 3 历史分笔

    // 获取个股以往交易历史的分笔数据明细，通过分析分笔数据，可以大致判断资金的进出情况。
    // 在使用过程中，对于获取股票某一阶段的历史分笔数据，需要通过参入交易日参数并append到一个DataFrame或者直接append到本地同一个文件里。
    // 历史分笔接口只能获取当前交易日之前的数据，当日分笔历史数据请调用get_today_ticks()接口或者在当日18点后通过本接口获取。
    // const result = await trading.getTickData({ code: '600048', date:'2018-05-29', src: 'nt' })
    console.log(result)
  } catch (err) {
    console.error(err)
  }
  


  


  
}

main()