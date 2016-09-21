var ary = [0,1,2];
ary[10] = 10;
ary.filter(function(x) { return x === undefined;});


//source code of Array.prototype.filter, so function will not be called when value is undefined
//Array.prototype.map is also in same behavior.
if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun/*, thisArg*/) {
    'use strict';
 
    if (this === void 0 || this === null) {
      throw new TypeError();
    }
 
    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== 'function') {
      throw new TypeError();
    }
 
    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t) { // 注意这里!!!
        var val = t[i];
        if (fun.call(thisArg, val, i, t)) {
          res.push(val);
        }
      }
    }
 
    return res;
  };
}

