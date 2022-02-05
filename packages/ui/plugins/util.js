
const DECIMAL = 10 ** 10

export default (_x, inject) => {
  inject('util', {
    normalizeNum(numOrHex){
      if (typeof numOrHex == "string" && numOrHex.startsWith("0x")) {
        return parseInt(numOrHex, 16)
      }
      return numOrHex
    },
    formatCurrency(bal, fixed=4){
      let balStr = "-"
      if (typeof bal == "string" && bal.startsWith("0x")) {
        balStr = (parseInt(bal, 16) / DECIMAL).toFixed(fixed)
      }else{
        balStr = (bal / DECIMAL).toFixed(fixed)
      }
      if (!balStr.endsWith(".0000")) {
        return balStr
      }else{
        return balStr.substr(0, balStr.length - 5)
      }
    }
  });
};
