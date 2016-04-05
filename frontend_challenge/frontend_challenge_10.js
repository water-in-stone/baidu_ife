function isAvailableEmail(sEmail) {
    var reg = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
    return reg.test(sEmail);
}
