function getUrlParam(sUrl,sKey){
    var result = {};
    //这里直接用 = 和 & 表示原有的符号
    //这里的正则表达式一定要含有全局变量g，所以回调函数将替换所有匹配的子项
    //正则表达式中的两个括号是有作用的(m1对应第一个匹配，m2对应第二个匹配)
    sUrl.replace(/\??(\w+)\=(\w+)\&?/g,function(a,m1,m2){
        //void 0 表示undefined
        if(result[m1] !== void 0){
            var t = result[m1];
            result[m1] = [].concat(t,m2);
        }else{
            result[m1] = m2;
        }
    });
    if(sKey === void 0){
        return result;
    } else {
        return result[sKey] || '';
    }
}

getUrlParam('http://www.nowcoder.com?key=1&key=2&key=3&key=15&test=4#hehe', 'key');