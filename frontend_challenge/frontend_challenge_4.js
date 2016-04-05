/**
 * 思路：
 *   用split方法获取参数
 *   得到参数数组后通过从上至下的方式进行访问
 *   因为JS中对象传递的是地址，所以在函数中对传进来的对象进行修改即可
 * @param  {[type]} oNamespace [原始空间]
 * @param  {[type]} sPackage   [包名]
 * @return {[object]}          [返回按照要求创建了的对象]
 */

function namespace(oNamespace, sPackage) {
  var arr = sPackage.split(".");
    for(var i=0; i<arr.length; i++){
        //如果指定空间中不包含arr[i] 属性，则添加该属性并设为空对象
        if(!oNamespace[arr[i]] || typeof oNamespace[arr[i]] !== 'object'){
            oNamespace[arr[i]] = {};
        }
        oNamespace = oNamespace[arr[i]];//将当前对象的属性值变成下一个检测的对象
    }
}
var test1 = {a: {test: 1, b: 2}};
namespace(test1, 'a.b.c.d');
console.log(test1.a.b);
