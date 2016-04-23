/* 数据格式演示
var aqiSourceData = {
  "北京": {
    "2016-01-01": 10,
    "2016-01-02": 10,
    "2016-01-03": 10,
    "2016-01-04": 10
  }
};
*/

/**
 * 适配不同浏览器的事件订阅
 */
function addEventHandler(ele, event, handler) {
  if (ele.addEventListener) {
    ele.addEventListener(event,handler,false);
  } else if(ele.attachEvent){
    ele.attachEvent("on" + event, handler);
  } else {
    ele["on" + event] = handler;
  }
}

// 以下两个函数用于随机模拟生成测试数据
function getDateStr(date) {
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  var d = date.getDate();
  d = d < 10 ? '0' + d : d;
  return y + '-' + m + '-' + d;
}

function randomBuildData(seed) {
  var returnData = {};
  var date = new Date("2016-01-01");
  var datStr = ''
  for (var i = 1; i < 92; i++) {
    datStr = getDateStr(date);
    returnData[datStr] = Math.ceil(Math.random() * seed);
    date.setDate(date.getDate() + 1);
  }
  return returnData;
}

var aqiSourceData = {
  "南京": randomBuildData(300),
  "杭州": randomBuildData(200),
  "上海": randomBuildData(300),
  "广州": randomBuildData(200),
  "深圳": randomBuildData(100),
  "成都": randomBuildData(300),
  "西安": randomBuildData(500),
  "福州": randomBuildData(100),
  "厦门": randomBuildData(100),
  "沈阳": randomBuildData(500)
};

// 用于渲染图表的数据
var chartData = {};

// 记录当前页面的表单选项
var pageState = {
  nowSelectCity: "南京",
  nowGraTime: "day"
}

var color = ["#B83D3D","#3366FF","#3DF500","#F5B800","#B800F5"];

/**
 * 渲染图表
 */
function renderChart() {
  var chart = document.querySelector(".aqi-chart-wrap");
  //代表生成的长条个数
  var i = 0;
  var arrHTML = [];
  var renderData = chartData[pageState.nowGraTime][pageState.nowSelectCity];
  for (var strDate in renderData) {
     arrHTML.push("<div class='aqi-bar' style='width: " + 20 + "px;height: " + renderData[strDate] + "px;left: " + (20 * i + 10)  + "px;background-color:"+ color[Math.floor(Math.random() * 4)] + "'></div>");
     i++;
  }
  chart.innerHTML = arrHTML.join("");
}

/**
 * 日、周、月的radio事件点击时的处理函数
 */
function graTimeChange(time) {
  // 确定是否选项发生了变化 

  // 设置对应数据

  // pageState.nowGraTime = time;
  // 时间原因，只考虑画每天的数据；
  pageState.nowGraTime = "day";
  renderChart();

  // 调用图表渲染函数


}

/**
 * select发生变化时的处理函数
 */
function citySelectChange(city) {
  // 确定是否选项发生了变化 

  // 设置对应数据
  pageState.nowSelectCity = city;
  renderChart();

  // 调用图表渲染函数
}

/**
 * 初始化日、周、月的radio事件，当点击时，调用函数graTimeChange
 */
function initGraTimeForm() {
  var graTime = document.querySelector("#form-gra-time");
  addEventHandler(graTime, "change", function (event) {
    citySelectChange(event.target.value);
  });
}

/**
 * 初始化城市Select下拉选择框中的选项
 */
function initCitySelector() {

  // 读取aqiSourceData中的城市，然后设置id为city-select的下拉列表中的选项
  var selectCity = document.querySelector("#city-select");
  var arrHTML = [];
  for(var city in aqiSourceData){
    arrHTML.push("<option>" + city + "</option>");
  }
  selectCity.innerHTML = arrHTML.join("");

  // 给select设置事件，当选项发生变化时调用函数citySelectChange
  addEventHandler(selectCity, "change", function (event) {
    citySelectChange(event.target.value);
  });
}

/**
 * 初始化图表需要的数据格式
 */
function initAqiChartData() {
  // 将原始的源数据处理成图表需要的数据格式
  // 处理好的数据存到 chartData 中
  chartData.day = aqiSourceData;
  //当鼠标在表格某一列上方时
  addEventHandler(document.querySelector(".aqi-chart-wrap"),"mouseover",function(event){
    event.target.className += "show";
  });
  //当鼠标移出表格某一列上方时
  addEventHandler(document.querySelector(".aqi-chart-wrap"),"mouseout",function(event){
    event.target.className.replace(/show/,"");
  });
}

/**
 * 初始化函数
 */
function init() {
  initGraTimeForm();
  initCitySelector();
  initAqiChartData();
}

init();