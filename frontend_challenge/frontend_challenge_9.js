function strLength(s, bUnicode255For1) {
  var i = 0;
  var num = 0;
  if (bUnicode255For1) {
    while (s.charCodeAt(i) === s.charCodeAt(i)) {
      num++;
      i++;
    }
  } else {
    while (s.charCodeAt(i) === s.charCodeAt(i)) {
      if (s.charCodeAt(i) > 255) {
        num += 2;
      } else {
        num++;
      }
      i++;
    }
    
  }
  return num;
}
var str = 'hello world, 牛客';
console.log(strLength(str, false));
