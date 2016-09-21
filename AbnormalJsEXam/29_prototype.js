var a = {}, b = Object.prototype;
a.prototype === b;
Object.getPrototypeOf(a) === b;
//Functions have a prototype property but other objects don't, so a.prototype is undefined


//another example
function f() {}
var a = f.prototype, b = Object.getPrototypeOf(f);
// Object.getPrototypeOf(f) returns the parent in the inheritance hierarchy
b === Function.prototype; // true