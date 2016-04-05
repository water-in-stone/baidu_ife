/**
 * 1、先用正则表达判断是否是一个正常的RGB式子
 * 2、replace方法得到对应的三个十进制整数，转为16进制后拼接返回
 * @param  {[String]} sRGB ['rgb(255, 255, 255)']
 * @return {[String]}      [十六进制形式的RGB]
 */

function rgb2hex(sRGB) {
  //对于空格、制表符、换页符等空白字符
  var reg = /^rgb\(+(\d+)\,\s*(\d+)\,\s*(\d+)\)$/i;
  if (!reg.test(sRGB)) {
    return sRGB;
  }
  return sRGB.replace(reg, function(m, n1, n2, n3, index, origin) {
    if (0 <= n1 && n1 <= 255 && 0 <= n2 && n2 <= 255 && 0 <= n3 && n3 <= 255) {
      var arr = ['#'];
      arr.push(hex(n1));
      arr.push(hex(n2));
      arr.push(hex(n3));
      return arr.join('');
    } else {
      return sRGB;
    }
  });
}

//若数字小于16，则转换后加个0
//函数名应起得更加准确
//var convert = function (n) {
var hex = function(n){
  n = Number(n);
  //对简单的if else情况直接用 ? : 即可
  return (+n) < 16 ? '0' + n.toString(16) : n.toString(16);
 /* if (n >= 0 && n <= 15) {
    return  '0' + n.toString(16);
  } else {
    return n.toString(16);
  }*/
};

var str = 'RGB(11,0,  15)';
console.log(rgb2hex(str));