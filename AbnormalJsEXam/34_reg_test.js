var lowerCaseOnly =  /^[a-z]+$/;
[lowerCaseOnly.test(null), lowerCaseOnly.test()]
//the arguments is converted to a string with the abstract toString operation, so it is "null" and "undefined".