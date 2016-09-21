function foo() {}
var oldName = foo.name;
foo.name = "bar";
[oldName, foo.name] //["foo", "foo"]
//name is a read only property, and can not be changed.
