var print,abs,all,any,basestring,bin;
bin=function (x) {
    return [ +x].toString(2)
};
basestring=function (s) {
    return String(s)
};
any=function (iter_) {
    var is_true, is_true;
    is_true = function(i) {
        return i==true
    };
    return iter_.some(is_true)
};
all=function (iter_) {
    var is_true, is_true;
    is_true = function(i) {
        return i==true
    };
    return iter_.every(is_true)
};
abs=function (n) {
    return Math.abs(n)
};
print=function (msg) {
    console.log(msg)
};
print(bin(15));
module.exports.print=print;
module.exports.abs=abs;
module.exports.all=all;
module.exports.any=any;
module.exports.basestring=basestring;
module.exports.bin=bin
