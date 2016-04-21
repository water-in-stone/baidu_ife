/**
 * aqiData，存储用户输入的空气指数数据
 * 示例格式：
 * aqiData = {
 *    "北京": 90,
 *    "上海": 40
 * };
 */
var aqiData = {};

/**
 * 从用户输入中获取数据，向aqiData中增加一条数据
 * 然后渲染aqi-list列表，增加新增的数据
 */
function addAqiData() {
  var city = document.querySelector("#aqi-city-input").value.trim();
  var quality = document.querySelector("#aqi-value-input").value.trim();
  if (!city.match(/^[A-Za-z\u4E00-\u9FA5]+$/)) {
    alert("城市名必须为中英文字符！")
    return;
  }
  if (!quality.match(/^\d+$/)) {
    alert("空气质量指数必须为整数！")
    return;
  }
  aqiData[city] = quality;
}

/**
 * 渲染aqi-table表格
 */
function renderAqiList() {
  var table = document.querySelector("#aqi-table");
  var listArr = [];
  listArr.push("<tr><td>城市</td><td>空气质量</td><td>操作</td></tr>");
  for (var city in aqiData) {
    //使用自定义属性data-city，便于删除操作，cool！
    var html = "<tr><td>" + city + "</td><td>" + aqiData[city] + "</td><td><button data-city='" + city + "'>删除</button></td></tr>"
    listArr.push(html);
  }
  table.innerHTML = listArr.join("");
}

/**
 * 点击add-btn时的处理逻辑
 * 获取用户输入，更新数据，并进行页面呈现的更新
 */
function addBtnHandle() {
  addAqiData();
  renderAqiList();
}

/**
 * 点击各个删除按钮的时候的处理逻辑
 * 获取哪个城市数据被删，删除数据，更新表格显示
 */
function delBtnHandle(city) {
  delete aqiData[city];
  renderAqiList();
}

function init() {

  // 在这下面给add-btn绑定一个点击事件，点击时触发addBtnHandle函数
  document.querySelector("#add-btn").addEventListener("click", addBtnHandle);

  // 想办法给aqi-table中的所有删除按钮绑定事件，触发delBtnHandle函数
  // 使用事件捕获机制，确定事件中的冒泡到底是从哪里出来的，nice
  document.querySelector("#aqi-table").addEventListener("click", function(event) {
    if (event.target.nodeName.toLowerCase() === "button") {
      //若写成event.target.onclick = delBtnHandle，则只是注册点击事件，必须要再次点击才能
      //触发删除函数，所以应直接delBtnHandle.call，且把之前和按钮绑定的自定义属性city取出
      delBtnHandle.call(null, event.target.dataset.city);
    }
  });
}

init();