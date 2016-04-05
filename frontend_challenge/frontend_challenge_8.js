Array.prototype.uniq = function () {
  var self = this;
  for (var i = 0; i < self.length; i++) {
    for (var j = i + 1; j < self.length; j++) {
      // NaN === NaN 的结果为false，所以对NaN的情况做特殊处理，使用isNaN函数来辅助判断
      if (self[i] === self[j]) {
        self.splice(j, 1);
        j--;
      } else if (self[j] !== self[j] && self[i] !== self[i]) { //NaN有个有趣的特性，那就是自身不等于自身
        self.splice(j, 1);
        j--;
      }
        else if(typeof self[j] === 'number' && isNaN(self[j]) && typeof self[i] === 'number' && isNaN(self[i])){
       self.splice(j,1);
       j--;
       }
    }
  }
  return self;
};

var arr = [false, true, undefined, null, NaN, 0, 1, 'a', 'a', NaN, NaN];
console.log(arr.uniq());
