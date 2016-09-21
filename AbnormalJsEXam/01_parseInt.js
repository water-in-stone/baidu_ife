["1", "2", "3"].map(parseInt);
/*
  because the arguments of map is element, index, array, and parseInt only accept two arguments,
  so it is equal to 
  parseInt("1", 0);
  parseInt("2", 1);
  parseInt("3", 2);
  result is [1, NaN, NaN]
 */