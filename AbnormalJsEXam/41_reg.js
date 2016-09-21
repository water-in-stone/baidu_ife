function captureOne(re, str) {
  var match = re.exec(str);
  return match && match[1];
}
/*
  /g flag will carry a state across matcher, even if they are actually used on different strings. 
*/
var numRe  = /num=(\d+)/ig,
    wordRe = /word=(\w+)/i,
    a1 = captureOne(numRe,  "num=1"),
    a2 = captureOne(wordRe, "word=1"),
    a3 = captureOne(numRe,  "NUM=2"),
    a4 = captureOne(wordRe,  "WORD=2");
