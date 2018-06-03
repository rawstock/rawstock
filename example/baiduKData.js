const rawstock = require('../index')
const { trading, fundamental } = rawstock

async function main () {

  try {
    // 百度股票日线数据
    // const result = await trading.getKDataFromBaidu({ code: '600048', count: 30 })
    // console.log(result.mashData[0])
    const result = await fundamental.getStockBasics()
    // console.log('result', result);
  } catch (err) {
    console.error(err)
  }
}

main()