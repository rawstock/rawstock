const rawstock = require('../index')
const { trading } = rawstock

async function main () {

  try {
    // 百度股票日线数据
    const result = await trading.getKDataFromBaidu({ code: '600048', count: 30 })
    console.log(result.mashData[0])
  } catch (err) {
    console.error(err)
  }
}

main()