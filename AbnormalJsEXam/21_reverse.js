var x = [].reverse;
x();

//because reverse method transposes the elements of the calling array object in place, mutaing the array, and returning
//the a reference to the array, so window call x, then we get window object