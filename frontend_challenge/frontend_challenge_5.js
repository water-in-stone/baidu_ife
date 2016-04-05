/**
 * 用迭代的方法做斐波那契数列
 * @param  {[Number]} n [表示第几项]
 * @return {[Number]}   [对应那一项的值]
 */
function fibonacci(n) {
    if (n <= 0) {
      return null;
    }
    if (n === 1 || n === 2) {
      return 1;
    }
    //交替相加的两项
    var first = 1;
    var second = 1;
    var temp = 1;
    for (var i = 0; i < n - 2; i++) {
      temp = second;
      second = first + second;
      first = temp;
    }
    return second;
}
console.log(fibonacci(5));