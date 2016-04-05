/**
 * 统计字符串中每个字符的出现频率，返回一个 Object，key 为统计字符，value 为出现频率
 * 1. 不限制 key 的顺序
 * 2. 输入的字符串参数不会为空
 * 3. 忽略空白字符 
 * 输入例子:
 * count('hello world')
 *
 * 输出例子:
 *  {h: 1, e: 1, l: 3, o: 2, w: 1, r: 1, d: 1}
 *
 * 思路：
 * 1、用正则，在一个新的对象中去查询找到的字符，若存在则加一，否则置1
 * 
 */
function count(str) {
  var result = {};
  // /S 大写的S匹配所有除了空白字符（空格符、制表符、换页符）以外的字符
  str.replace(/\S/g, function(match){
    result[match] ? result[match]++ : (result[match] = 1);
  });

  //可以再精简
  /*str.replace(/[^\s]{1}/g,function(match, m1){
    if (result[match] == void 0) {
      result[match] = 1;
    } else {
      result[match]++;
    }
  });*/
  return result;
}

console.log(count('hello  world  $%#@'));
