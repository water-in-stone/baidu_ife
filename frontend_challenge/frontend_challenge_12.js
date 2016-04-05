/**
 * 1. 以 - 为分隔符，将第二个起的非空单词首字母转为大写
 * 2. -webkit-border-image 转换为 webkitBorderImage
 * 3. font-size 转换为 fontSize
 *
 * 思路如下：
 * 1、针对首字符可能为-的情况做处理,先把第一个单词取出来
 * 2、接着对后面所有的单词的首字符做大写处理
 * @param  {[String]} sName [待转换的字符]
 * @return {[String]}       [转换后的字符]
 */
function cssStyle2DomStyle(sName) {
  if (sName) {
    //sexy code! 其中 ?!^ 表示不匹配开头
    return sName.replace(/(?!^)\-(\w)(\w+)/g, function(a, b, c){
      return b.toUpperCase() + c.toLowerCase();
    }).replace(/^\-/, '');

    /*var arr = [];
    sName.replace(/^\-?(\w+)\-/, function (m, first) {
        arr.push(first);
        return '-';
      })
      .replace(/\-(\w+)/g, function (m, match) {
        //将匹配到的单词的首字符大写
      arr.push(match.replace(/(\w)/, function (v) {
        return v.toUpperCase();
      }));
    });
    return arr.join('');*/
  } else {
    return null;
  }
}

cssStyle2DomStyle('-webkit-border-image');
//cssStyle2DomStyle('font-size');