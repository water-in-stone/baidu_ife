function add(num1, num2) {
  arguments[1] = 10; //这里已经修改了num2的值
  return arguments[0] + num2;
}

console.log(add(1, 2));



function sidEffecting(ary) {
  ary[0] = ary[2];
}

function bar(a, b, c) {
  c = 10
  sidEffecting(arguments);
  return a + b + c;
}
bar(1, 1, 1) //21



function sidEffecting(ary) {
  ary[0] = ary[2];
}

function bar(a, b, c = 3) {
  c = 10
  sidEffecting(arguments);
  return a + b + c;
}
bar(1, 1, 1) //12
