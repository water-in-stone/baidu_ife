/**
 * @param  {[Date]} oDate    
 * @param  {[String]} sFormation 
 * @return {[String]}            
 */
/*function formatDate(oDate, sFormation) {
  sFormation.replace(/(y+)-(M+)-(d+) (H+):(m+):(s+)/gi,function(match, year, month, date, hour, minute, seconds, weekend){
    var arrStr = [];
    if (year === "yyyy") {
      arrStr.push(oDate.getFullYear() + "-");
    } else {
      arrStr.push((oDate.getFullYear() + "").substr(2,2) + "-");
    }
    var mFormatted = oDate.getMonth() + 1;
    if (month === "MM" && mFormatted < 10) {
        mFormatted = "0" + mFormatted;
    }
    arrStr.push(mFormatted + "-");
    var dFormatted = oDate.getDate();
    if (date === "dd" && dFormatted < 10) {
        dFormatted = "0" + dFormatted;
    }
    arrStr.push(dFormatted + " ");
    var hFormatted;
    switch(hour){
      case "HH":
        if (oDate.getHours() < 10) {
          hFormatted = "0" + oDate.getHours();
        } else {
          hFormatted = oDate.getHours() + ":";
        }
      break;
      case "H":
          hFormatted = oDate.getHours() + ":";
      break;
      case "hh":
        if (oDate.getHours() >= 12) {
          hFormatted = oDate.getHours() - 12;
        }
        if (hFormatted < 10) {
          hFormatted = "0" + hFormatted + ":"; 
        } 
      break;
      case "h":
        if (oDate.getHours() >= 12) {
          hFormatted = oDate.getHours() - 12 + ":";
        }
      break;
      default:
      break;
    }
    arrStr.push(hFormatted);
    var minFormatted;
    if (minute === "mm" && oDate.getMinutes() < 10) {
        minFormatted = "0" + oDate.getMinutes();
    } else {
      minFormatted = oDate.getMinutes();
    }
    arrStr.push(minFormatted  + ":");
    var seFormatted;
    if (seconds === "ss" && oDate.getSeconds() < 10) {
        seFormatted = "0" + oDate.getSeconds();
    } else {
      seFormatted = oDate.getSeconds();
    }
    arrStr.push(seFormatted + " ");
    var arrWeekend = ["����һ","���ڶ�","������","������","������","������","������"];
    var realDay = oDate.getDay();
    if (weekend === "w") {
      if (realDay === 0) {
        realDay += 7;
      }
      arrStr.push(" " + arrWeekend[realDay - 1]);
    }
    console.log(arrStr.join(""));
    return arrStr.join("");
  });
}*/

/**
 * ֱ�ӶԸ�ʽ����ƥ������
 * @param  {[Date]} d      [����]
 * @param  {[String]} format [ת���ĸ�ʽ]
 * @return {[String]}        [����ʽת����������ַ���]
 */
function formatDate(d, format) {
    var year = d.getFullYear(),
        month = d.getMonth()+1,
        date = d.getDate(),
        hour = d.getHours(),
        minute = d.getMinutes(),
        second = d.getSeconds(),
        day = d.getDay(),
        week = ['��', 'һ', '��', '��', '��', '��', '��'];
        //ֱ����ʽ���ã�
    return format.replace(/yyyy/, year)
                    .replace(/yy/, pad(year % 100))
                    .replace(/MM/, pad(month))
                    .replace(/M/, month)
                    .replace(/dd/, pad(date))
                    .replace(/d/, date)
                    .replace(/HH/, pad(hour))
                    .replace(/H/, hour)
                    .replace(/hh/, pad(hour % 12))
                    .replace(/h/, hour % 12)
                    .replace(/mm/, pad(minute))
                    .replace(/m/, minute)
                    .replace(/ss/, pad(second))
                    .replace(/s/, second)
                    .replace(/w/, week[day]);
}
 
//���㺯�� 
function pad(n){
    return n < 10 ? '0' +n : n;
}
console.log(formatDate(new Date(1613394065400), 'yyyy-M-d hh:mm:ss ��w'));