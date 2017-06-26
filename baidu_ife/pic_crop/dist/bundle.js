(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var my_cropper_1 = require("./my_cropper");
var downloadCount = 0;
var container = document.querySelector('#cropper');
var previews = document.querySelectorAll('.preview');
var fileInput = document.querySelector('#file');
var pick = document.querySelector('#pick-file');
var setCropper = document.querySelector('#set-cropper');
var widthInput = setCropper.querySelector('[name="width"]');
var heightInput = setCropper.querySelector('[name="height"]');
var setBtn = document.querySelector('#set-btn');
var cropBtn = document.querySelector('#crop-btn');
var download = document.createElement('a');
//canvas画布的初始宽高
var w = 700;
var h = 450;
var cropper = new my_cropper_1.Cropper(container, {
    previews: Array.prototype.map.call(previews, function (el, index) {
        return {
            container: el,
            scale: 0.7 + index * 0.3
        };
    }),
    width: w,
    height: h
});
// 设置max属性,不能大于画布的宽高
widthInput.setAttribute('max', '' + w);
heightInput.setAttribute('max', '' + h);
//处理输入的图片
fileInput.addEventListener('change', function (e) {
    var el = e.target;
    if (el.files.length < 1 || el.value === '') {
        return;
    }
    var file = el.files[0];
    if (file.type.match(/^image\/.+/)) {
        cropper.setImage(file);
        pick.innerHTML = file.name;
    }
    else {
        window.alert('请选择正确的图片!');
    }
});
// 纠正用户输入
setCropper.addEventListener('change', function (e) {
    var el = e.target;
    if (el.tagName.toLowerCase() === 'input') {
        var val = +el.value;
        var max = +el.getAttribute('max');
        var min = +el.getAttribute('mix');
        if (val > max) {
            el.value = '' + max;
        }
        else if (val < min) {
            el.value = '' + min;
        }
        else if (val === 0) {
            el.value = '';
        }
    }
});
// 点击设置按钮
setBtn.addEventListener('click', function () {
    var width = +widthInput.value, height = +heightInput.value;
    if (!width || !height) {
        return alert('请输入正确的宽高!');
    }
    cropper.setCropper(width, height);
});
// 点击裁剪按钮
cropBtn.addEventListener('click', function () {
    try {
        var canvas = cropper.crop();
        download.href = canvas.toDataURL();
        download.download = "cropper-" + ++downloadCount + ".png";
        download.click();
    }
    catch (e) {
        console.error(e);
        alert('不支持HTML5!');
    }
});
},{"./my_cropper":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Types;
(function (Types) {
    Types[Types["image"] = 0] = "image";
    Types[Types["pointRD"] = 1] = "pointRD";
    Types[Types["background"] = 2] = "background";
    Types[Types["cropper"] = 3] = "cropper";
})(Types || (Types = {}));
var Cropper = (function () {
    function Cropper(container, options) {
        var _this = this;
        this._image = {};
        this._cropper = {};
        this._scale = 1;
        this._hasPreview = false; // 是否需要预览功能，默认是否
        this._previewList = [];
        this._lineWidth = 1;
        this._pointWidth = 8;
        this._pointHeight = 8;
        this.handlePointMove = function (e) {
            var _a = [e.offsetX, e.offsetY], x = _a[0], y = _a[1];
            var w = x - _this._cropper.x - _this._xOffset + _this._pointWidth / 2, h = y - _this._cropper.y - _this._yOffset + _this._pointHeight / 2;
            if (w <= 0 || h <= 0) {
                return;
            }
            _this.setCropper(w, h, false);
        };
        this.handleCropperMove = function (e) {
            var _a = [e.offsetX, e.offsetY], x = _a[0], y = _a[1];
            var _b = [_this._xOffset, _this._yOffset, _this._cropper.width, _this._cropper.height, _this._width, _this._height], oX = _b[0], oY = _b[1], cW = _b[2], cH = _b[3], w = _b[4], h = _b[5];
            var currentX = x - oX, currentY = y - oY;
            // 判断边界
            if (x < oX) {
                currentX = 0;
            }
            if (x > w - cW + oX) {
                currentX = w - cW;
            }
            if (y < oY) {
                currentY = 0;
            }
            if (y > h - cH + oY) {
                currentY = h - cH;
            }
            _this._cropper.x = currentX;
            _this._cropper.y = currentY;
        };
        this.handleImageMove = function (e) {
            var _a = [e.offsetX, e.offsetY], x = _a[0], y = _a[1];
            var _b = [_this._xOffset, _this._yOffset], oX = _b[0], oY = _b[1];
            _this._image.x = x - oX;
            _this._image.y = y - oY;
        };
        var option = {
            width: container.offsetWidth,
            height: container.offsetHeight
        };
        Object.assign(option, options);
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        this._canvas = canvas;
        this._ctx = ctx;
        this._options = option;
        this._container = container;
        this._width = option.width;
        this._height = option.height;
        this._types = (_a = {},
            _a[Types.pointRD] = {
                cursor: 'nwse-resize',
                handle: this.handlePointMove
            },
            _a[Types.image] = {
                cursor: 'default',
                handle: this.handleImageMove
            },
            _a[Types.cropper] = {
                cursor: 'all-scroll',
                handle: this.handleCropperMove
            },
            _a[Types.background] = {
                cursor: 'default',
            },
            _a);
        try {
            this.init();
        }
        catch (e) {
            alert("There is no Canvas");
            console.error(e);
        }
        var _a;
    }
    Cropper.prototype.init = function () {
        var _this = this;
        //初始化裁剪框
        var option = this._options;
        var cropperCanvas = document.createElement('canvas');
        var cropperCtx = cropperCanvas.getContext('2d');
        Object.assign(cropperCanvas, {
            width: option.width,
            height: option.height
        });
        this._canvas = cropperCanvas;
        this._ctx = cropperCtx;
        this._container.appendChild(cropperCanvas);
        //初始化预览框
        if (option.previews && Array.isArray(option.previews) && option.previews.length) {
            //遍历所有的preview并创建canvas
            option.previews.forEach(function (p) {
                var previewCanvas = document.createElement('canvas');
                var previewCtx = previewCanvas.getContext('2d');
                var scale = p.scale;
                var el = p.container;
                var preview = {
                    canvas: previewCanvas,
                    ctx: previewCtx,
                    scale: scale > 0 ? scale : 1
                };
                el.appendChild(previewCanvas); //将canvas加入对应的element中
                _this._previewList.push(preview);
            });
            this._previewScaleCanvas = document.createElement('canvas');
            this._previewScaleCtx = this._previewScaleCanvas.getContext('2d');
            this._hasPreview = true;
        }
        // 根据点击时的区域来移动对应的画布元素，且因为实在canvas画布上绑定，
        // 所以 mouseevent.offsetX指的是点击位置相对于画布左边缘的偏移
        cropperCanvas.addEventListener('mousedown', function (e) {
            if (e.which === 1) {
                var typeInfo = _this.getTypeInfo(e);
                if (typeInfo.type === Types.background) {
                    _this._moving = false;
                }
                else {
                    _this._moving = true;
                    _this._currentType = typeInfo.type;
                    _this._xOffset = typeInfo.offsetX;
                    _this._yOffset = typeInfo.offsetY;
                }
            }
        });
        window.addEventListener('mouseup', function (e) {
            if (e.which === 1) {
                _this._moving = false;
            }
        });
        cropperCanvas.addEventListener('mousemove', function (e) {
            var info = _this.getTypeInfo(e), moveType = _this._types[info.type], currentType = _this._types[_this._currentType];
            if (_this._moving && currentType.handle) {
                currentType.handle(e);
                _this.draw();
            }
            else if (moveType.cursor) {
                var oldCursor = _this._container.style.cursor;
                if (oldCursor !== moveType.cursor) {
                    _this._container.style.cursor = moveType.cursor;
                }
            }
        });
        //处理缩放事件（仅有firefox不支持mousewheel事件，所以若想在firefox中看到缩放，需要另外处理）
        cropperCanvas.addEventListener('mousewheel', function (e) {
            e.preventDefault();
            var image = _this._image;
            if (image.element) {
                // 不变的图片原始宽高
                var width = image.element.width;
                var height = image.element.height;
                var k = void 0; // 最终的缩放系数
                var scale = _this._scale;
                var offset = e.deltaY / 800; //delta代表了滑动速度
                if (offset > 0) {
                    k = 1 / (1 + offset);
                }
                else {
                    k = (1 + Math.abs(offset));
                }
                k *= scale;
                _this._scale = k;
                width *= k;
                height *= k;
                image.x += (image.width - width) / 2;
                image.y += (image.height - height) / 2;
                image.width = width;
                image.height = height;
                _this.draw();
            }
        });
    };
    //根据点击位置的不同，返回对应的值
    Cropper.prototype.getTypeInfo = function (e) {
        var _a = [e.offsetX, e.offsetY], x = _a[0], y = _a[1];
        var point = this.getPoint();
        var cropper = this._cropper;
        var image = this._image;
        var info = {};
        if (x > point.x && x < point.x + point.width && y > point.y && y < point.y + point.height) {
            //点击的位置在缩放锚点上
            info.offsetX = x - point.x; //表示点击位置相对于锚点的偏移
            info.offsetY = y - point.y;
            info.type = Types.pointRD;
        }
        else if (x > cropper.x && x < cropper.x + cropper.width && y > cropper.y && y < cropper.y + cropper.height) {
            //点击位置在裁剪框里面
            info.offsetX = x - cropper.x; //表示点击位置相对于裁剪框的偏移
            info.offsetY = y - cropper.y;
            info.type = Types.cropper;
        }
        else if (x > image.x && x < image.x + image.width && y > image.y && y < image.y + image.height) {
            //点击的位置在图片上
            info.offsetX = x - image.x; //表示点击位置相对于图片的偏移
            info.offsetY = y - image.y;
            info.type = Types.image;
        }
        else {
            info.type = Types.background;
        }
        return info;
    };
    /**
     * 画图函数
     */
    Cropper.prototype.draw = function () {
        this._ctx.clearRect(0, 0, this._width, this._height);
        this.fillImage(); //将image信息填充到canvas中
        this.preview(); //渲染预览区的canvas
        //为了避免预览区出现黑白相间的背景，再次clear
        this._ctx.clearRect(0, 0, this._width, this._height);
        this.fillBackground();
        this.fillImage();
        this.fillCropper();
    };
    //将图片填充到canvas中
    Cropper.prototype.fillImage = function () {
        var ctx = this._ctx;
        var image = this._image;
        if (image) {
            ctx.drawImage(image.element, image.x, image.y, image.width, image.height);
        }
    };
    Cropper.prototype.preview = function () {
        var _this = this;
        if (this._image.element && this._hasPreview) {
            var cropperData_1 = this.getCropperData();
            this._previewScaleCtx.clearRect(0, 0, this._cropper.width, this._cropper.height);
            this._previewScaleCtx.putImageData(cropperData_1.imageData, cropperData_1.offsetX, cropperData_1.offsetY);
            //渲染preivew区域
            this._previewList.forEach(function (p) {
                var previewCanvas = p.canvas;
                var previewCtx = p.ctx;
                previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
                //判断缩放比例后填充
                if (p.scale !== 1) {
                    previewCtx.scale(p.scale, p.scale);
                    previewCtx.drawImage(_this._previewScaleCanvas, 0, 0);
                    previewCtx.setTransform(1, 0, 0, 1, 0, 0);
                }
                else {
                    previewCtx.putImageData(cropperData_1.imageData, cropperData_1.offsetX, cropperData_1.offsetY);
                }
            });
        }
    };
    //根据裁剪框和图片的位置关系，选择要裁剪的区域并返回图片数据
    Cropper.prototype.getCropperData = function () {
        var cropper = this._cropper;
        var image = this._image;
        var _a = [cropper.x, cropper.y, cropper.width, cropper.height], realX = _a[0], realY = _a[1], realW = _a[2], realH = _a[3];
        var _b = [0, 0], offsetX = _b[0], offsetY = _b[1];
        //裁剪框的左边超出边界
        if (realX < image.x) {
            offsetX = image.x - realX;
            realX = image.x;
            realW -= offsetX;
        }
        //裁剪框的上边超出边界
        if (realY < image.y) {
            offsetY = image.y - realY;
            realY = image.y;
            realH -= offsetY;
        }
        //裁剪框的右边超出边界
        if (image.x + image.width < realX + realW) {
            offsetX = (realX + realW) - (image.x + image.width);
            realW -= offsetX;
        }
        //裁剪框的下边超出边界
        if (image.y + image.height < realY + realH) {
            offsetY = (realY + realH) - (image.y + image.height);
            realH -= offsetY;
        }
        //若裁剪框不在图像上，则返回
        if (realW < 0 || realH < 0) {
            return;
        }
        return {
            x: realX,
            y: realY,
            h: realH,
            w: realW,
            offsetX: offsetX,
            offsetY: offsetY,
            imageData: this._ctx.getImageData(realX, realY, realW, realH)
        };
    };
    Cropper.prototype.fillBackground = function () {
        var ctx = this._ctx;
        var width = this._width;
        var height = this._height;
        var side = width / 40; //横向用40个小方块来填充
        var x = Math.ceil(width / side);
        var y = Math.ceil(height / side);
        var k = 0;
        ctx.save(); //保存画笔此时的透明状态
        ctx.fillStyle = '#ccc';
        for (var i = 0; i < y; i++) {
            for (var j = 0; j < x; j++) {
                if ((k + i) % 2 === 0) {
                    ctx.fillRect(j * side, i * side, side, side);
                }
                k++;
            }
        }
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(0, 0, width, height);
        ctx.restore(); //将画布清零，回到初始透明的状态
    };
    //画出裁剪框的边线
    Cropper.prototype.fillCropper = function () {
        var image = this._image;
        if (image.element) {
            var ctx = this._ctx;
            var cropper = this._cropper;
            ctx.save();
            ctx.strokeStyle = '#ea1515';
            ctx.lineWidth = this._lineWidth;
            //画裁剪框的边线
            ctx.strokeRect(cropper.x, cropper.y, cropper.width, cropper.height);
            ctx.fillStyle = '#ea1515';
            var point = this.getPoint();
            //画右下角的缩放点
            ctx.fillRect(point.x, point.y, point.width, point.height);
            ctx.restore();
        }
    };
    //获取裁剪点的位置
    Cropper.prototype.getPoint = function () {
        var cropper = this._cropper;
        var w = this._pointWidth;
        var h = this._pointHeight;
        var x = cropper.x + cropper.width - w / 2;
        var y = cropper.y + cropper.height - h / 2;
        return {
            width: w,
            height: h,
            x: x,
            y: y
        };
    };
    //获取输入的图片
    Cropper.prototype.setImage = function (image) {
        var _this = this;
        if (image instanceof HTMLImageElement) {
            this.resetImage(image);
        }
        else if (image instanceof File) {
            if (!image.type.match(/^image\/.+$/)) {
                console.error('请选择正确的图片文件');
            }
            var reader = new FileReader();
            this._image = {};
            reader.onload = function (e) {
                var _image = new Image();
                _image.src = e.target.result;
                _image.onload = function () {
                    _this.resetImage(_image);
                };
            };
            reader.readAsDataURL(image);
        }
        else {
            return;
        }
    };
    //根据输入的图片的尺寸，将其放入到大的画布中，不至于出现溢出
    Cropper.prototype.resetImage = function (image) {
        if (!image) {
            if (!this._image.element) {
                return;
            }
            image = this._image.element;
        }
        if (!image.src)
            return;
        var iW = image.width, iH = image.height, w = this._width, h = this._height, cW = w / 3, //裁剪框的大小为画布的1/3
        cH = h / 3;
        var currentW = iW, currentH = iH, k = 1; // 包裹住图片时的缩放比例
        if (iW > w) {
            currentW = w;
            k = currentW / iW;
            currentH = k * iH;
        }
        if (currentH > h) {
            currentH = h;
            k = currentH / iH;
            currentW = k * iW;
        }
        Object.assign(this._image, {
            element: image,
            width: currentW,
            height: currentH,
            x: (w - currentW) / 2,
            y: (h - currentH) / 2
        });
        this._scale = k;
        this.setCropper(cW, cH);
    };
    Cropper.prototype.setPreview = function (resetCoordinate) {
        if (resetCoordinate === void 0) { resetCoordinate = true; }
        var cropper = this._cropper;
        //判断是否已经有了预览区
        if (this._hasPreview) {
            var _a = [this._width, this._height], w = _a[0], h = _a[1];
            if (resetCoordinate) {
                cropper.x = w / 2 - cropper.width / 2;
                cropper.y = h / 2 - cropper.height / 2;
            }
            if (this._previewScaleCanvas) {
                Object.assign(this._previewScaleCanvas, {
                    width: cropper.width,
                    height: cropper.height
                });
            }
            this._previewList.forEach(function (p) {
                Object.assign(p.canvas, {
                    width: cropper.width * p.scale,
                    height: cropper.height * p.scale
                });
            });
        }
    };
    Cropper.prototype.setCropper = function (width, height, resetCoordinate) {
        if (resetCoordinate === void 0) { resetCoordinate = true; }
        Object.assign(this._cropper, {
            width: width,
            height: height
        });
        this.setPreview(resetCoordinate);
        this.draw();
    };
    //
    Cropper.prototype.crop = function () {
        if (!this._image.element) {
            console.error('请添加一张图片');
            return;
        }
        this._ctx.clearRect(0, 0, this._width, this._height);
        this.fillImage();
        var data = this.getCropperData();
        if (data) {
            var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
            Object.assign(canvas, {
                width: this._cropper.width,
                height: this._cropper.height
            });
            ctx.putImageData(data.imageData, data.offsetX, data.offsetY);
            this.draw();
            return canvas;
        }
    };
    return Cropper;
}());
exports.Cropper = Cropper;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbWFpbi50cyIsInNyYy9teV9jcm9wcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSwyQ0FBdUM7QUFFdkMsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDO0FBRXRCLElBQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFnQixDQUFDO0FBQ3BFLElBQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN2RCxJQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBcUIsQ0FBQztBQUN0RSxJQUFNLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBZ0IsQ0FBQztBQUNqRSxJQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBZ0IsQ0FBQztBQUN6RSxJQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFxQixDQUFDO0FBQ2xGLElBQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQXFCLENBQUM7QUFDcEYsSUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNsRCxJQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3BELElBQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7QUFFN0MsZUFBZTtBQUNmLElBQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNkLElBQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUVkLElBQU0sT0FBTyxHQUFHLElBQUksb0JBQU8sQ0FBQyxTQUFTLEVBQUU7SUFDckMsUUFBUSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FB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LEdBQVg7UUFDRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN6QixPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sQ0FBQztRQUNULENBQUM7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXJELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUVqQixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDbkMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNULElBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEVBQzdDLEdBQUcsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO2dCQUNwQixLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLO2dCQUMxQixNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNO2FBQzdCLENBQUMsQ0FBQztZQUNILEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3RCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDWixNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ2hCLENBQUM7SUFDSCxDQUFDO0lBQ0gsY0FBQztBQUFELENBN2lCQSxBQTZpQkMsSUFBQTtBQTdpQlksMEJBQU8iLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHsgQ3JvcHBlciB9IGZyb20gJy4vbXlfY3JvcHBlcic7XHJcblxyXG5sZXQgZG93bmxvYWRDb3VudCA9IDA7XHJcblxyXG5jb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY3JvcHBlcicpIGFzIEhUTUxFbGVtZW50O1xyXG5jb25zdCBwcmV2aWV3cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5wcmV2aWV3Jyk7XHJcbmNvbnN0IGZpbGVJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmaWxlJykgYXMgSFRNTElucHV0RWxlbWVudDtcclxuY29uc3QgcGljayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwaWNrLWZpbGUnKSBhcyBIVE1MRWxlbWVudDtcclxuY29uc3Qgc2V0Q3JvcHBlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzZXQtY3JvcHBlcicpIGFzIEhUTUxFbGVtZW50O1xyXG5jb25zdCB3aWR0aElucHV0ID0gc2V0Q3JvcHBlci5xdWVyeVNlbGVjdG9yKCdbbmFtZT1cIndpZHRoXCJdJykgYXMgSFRNTElucHV0RWxlbWVudDtcclxuY29uc3QgaGVpZ2h0SW5wdXQgPSBzZXRDcm9wcGVyLnF1ZXJ5U2VsZWN0b3IoJ1tuYW1lPVwiaGVpZ2h0XCJdJykgYXMgSFRNTElucHV0RWxlbWVudDtcclxuY29uc3Qgc2V0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NldC1idG4nKTtcclxuY29uc3QgY3JvcEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjcm9wLWJ0bicpO1xyXG5jb25zdCBkb3dubG9hZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuXHJcbi8vY2FudmFz55S75biD55qE5Yid5aeL5a696auYXHJcbmNvbnN0IHcgPSA3MDA7XHJcbmNvbnN0IGggPSA0NTA7XHJcblxyXG5jb25zdCBjcm9wcGVyID0gbmV3IENyb3BwZXIoY29udGFpbmVyLCB7XHJcbiAgcHJldmlld3M6IEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChwcmV2aWV3cywgKGVsOiBIVE1MRWxlbWVudCwgaW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29udGFpbmVyOiBlbCxcclxuICAgICAgc2NhbGU6IDAuNyArIGluZGV4ICogMC4zXHJcbiAgICB9O1xyXG4gIH0pLFxyXG4gIHdpZHRoOiB3LFxyXG4gIGhlaWdodDogaFxyXG59KTtcclxuXHJcblxyXG4vLyDorr7nva5tYXjlsZ7mgKcs5LiN6IO95aSn5LqO55S75biD55qE5a696auYXHJcbndpZHRoSW5wdXQuc2V0QXR0cmlidXRlKCdtYXgnLCAnJyArIHcpO1xyXG5oZWlnaHRJbnB1dC5zZXRBdHRyaWJ1dGUoJ21heCcsICcnICsgaCk7XHJcblxyXG4vL+WkhOeQhui+k+WFpeeahOWbvueJh1xyXG5maWxlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcclxuICBjb25zdCBlbCA9IGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgaWYgKGVsLmZpbGVzLmxlbmd0aCA8IDEgfHwgZWwudmFsdWUgPT09ICcnKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBjb25zdCBmaWxlID0gZWwuZmlsZXNbMF1cclxuICBpZiAoZmlsZS50eXBlLm1hdGNoKC9eaW1hZ2VcXC8uKy8pKSB7XHJcbiAgICBjcm9wcGVyLnNldEltYWdlKGZpbGUpO1xyXG4gICAgcGljay5pbm5lckhUTUwgPSBmaWxlLm5hbWU7XHJcbiAgfSBlbHNlIHtcclxuICAgIHdpbmRvdy5hbGVydCgn6K+36YCJ5oup5q2j56Gu55qE5Zu+54mHIScpO1xyXG4gIH1cclxufSk7XHJcblxyXG4vLyDnuqDmraPnlKjmiLfovpPlhaVcclxuc2V0Q3JvcHBlci5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xyXG4gIGNvbnN0IGVsID0gZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICBpZiAoZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnaW5wdXQnKSB7XHJcbiAgICBjb25zdCB2YWwgPSArZWwudmFsdWU7XHJcbiAgICBjb25zdCBtYXggPSArZWwuZ2V0QXR0cmlidXRlKCdtYXgnKTtcclxuICAgIGNvbnN0IG1pbiA9ICtlbC5nZXRBdHRyaWJ1dGUoJ21peCcpO1xyXG5cclxuICAgIGlmICh2YWwgPiBtYXgpIHtcclxuICAgICAgZWwudmFsdWUgPSAnJyArIG1heDtcclxuICAgIH0gZWxzZSBpZiAodmFsIDwgbWluKSB7XHJcbiAgICAgIGVsLnZhbHVlID0gJycgKyBtaW47XHJcbiAgICB9IGVsc2UgaWYgKHZhbCA9PT0gMCkge1xyXG4gICAgICBlbC52YWx1ZSA9ICcnO1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxyXG5cclxuLy8g54K55Ye76K6+572u5oyJ6ZKuXHJcbnNldEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICBjb25zdCB3aWR0aCA9ICt3aWR0aElucHV0LnZhbHVlLFxyXG4gICAgaGVpZ2h0ID0gK2hlaWdodElucHV0LnZhbHVlO1xyXG4gIGlmICghd2lkdGggfHwgIWhlaWdodCkge1xyXG4gICAgcmV0dXJuIGFsZXJ0KCfor7fovpPlhaXmraPnoa7nmoTlrr3pq5ghJyk7XHJcbiAgfVxyXG4gIGNyb3BwZXIuc2V0Q3JvcHBlcih3aWR0aCwgaGVpZ2h0KTtcclxufSk7XHJcblxyXG5cclxuLy8g54K55Ye76KOB5Ymq5oyJ6ZKuXHJcbmNyb3BCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGNhbnZhcyA9IGNyb3BwZXIuY3JvcCgpO1xyXG4gICAgZG93bmxvYWQuaHJlZiA9IGNhbnZhcy50b0RhdGFVUkwoKTtcclxuICAgIGRvd25sb2FkLmRvd25sb2FkID0gYGNyb3BwZXItJHsrK2Rvd25sb2FkQ291bnR9LnBuZ2A7XHJcbiAgICBkb3dubG9hZC5jbGljaygpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICBhbGVydCgn5LiN5pSv5oyBSFRNTDUhJyk7XHJcbiAgfVxyXG59KTsiLCJpbnRlcmZhY2UgQ3JvcHBlck9wdGlvbnMge1xyXG4gIHByZXZpZXdzID8gOiB7XHJcbiAgICBjb250YWluZXI6IEhUTUxFbGVtZW50LFxyXG4gICAgc2NhbGUgPyA6IG51bWJlciAvL+S7o+ihqOe8qeaUvuavlOWIl1xyXG4gIH1bXTtcclxuICB3aWR0aCA/IDogbnVtYmVyO1xyXG4gIGhlaWdodCA/IDogbnVtYmVyO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgVHlwZSB7XHJcbiAgY3Vyc29yOiBzdHJpbmc7XHJcbiAgaGFuZGxlID8gKGU6IE1vdXNlRXZlbnQpIDogdm9pZDsgLy/lpITnkIbpvKDmoIfnmoTnp7vliqjkuovku7ZcclxufVxyXG5cclxuaW50ZXJmYWNlIFR5cGVJbmZvIHtcclxuICB0eXBlID8gOiBUeXBlcztcclxuICBvZmZzZXRYID8gOiBudW1iZXI7XHJcbiAgb2Zmc2V0WSA/IDogbnVtYmVyO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgUHJldmlldyB7XHJcbiAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcclxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcclxuICBzY2FsZTogbnVtYmVyO1xyXG59XHJcblxyXG5lbnVtIFR5cGVzIHtcclxuICBpbWFnZSxcclxuICBwb2ludFJELCAvL+S7o+ihqOijgeWJquahhuWPs+S4i+inkueahOe8qeaUvuaMiemSrlxyXG4gIGJhY2tncm91bmQsXHJcbiAgY3JvcHBlclxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQ3JvcHBlciB7XHJcbiAgcHJpdmF0ZSBfY29udGFpbmVyOiBIVE1MRWxlbWVudDtcclxuICBwcml2YXRlIF9vcHRpb25zOiBDcm9wcGVyT3B0aW9ucztcclxuICBwcml2YXRlIF9jdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcclxuICBwcml2YXRlIF9jYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xyXG4gIHByaXZhdGUgX3dpZHRoOiBudW1iZXI7XHJcbiAgcHJpdmF0ZSBfaGVpZ2h0OiBudW1iZXI7XHJcblxyXG4gIHByaXZhdGUgX2ltYWdlOiB7XHJcbiAgICBlbGVtZW50ID8gOiBIVE1MSW1hZ2VFbGVtZW50O1xyXG4gICAgd2lkdGggPyA6IG51bWJlcjtcclxuICAgIGhlaWdodCA/IDogbnVtYmVyO1xyXG4gICAgeCA/IDogbnVtYmVyO1xyXG4gICAgeSA/IDogbnVtYmVyO1xyXG4gIH0gPSB7fTtcclxuXHJcbiAgcHJpdmF0ZSBfY3JvcHBlcjoge1xyXG4gICAgd2lkdGggPyA6IG51bWJlcjtcclxuICAgIGhlaWdodCA/IDogbnVtYmVyO1xyXG4gICAgeCA/IDogbnVtYmVyO1xyXG4gICAgeSA/IDogbnVtYmVyO1xyXG4gIH0gPSB7fTtcclxuXHJcbiAgcHJpdmF0ZSBfc2NhbGU6IG51bWJlciA9IDE7XHJcbiAgcHJpdmF0ZSBfeE9mZnNldDogbnVtYmVyO1xyXG4gIHByaXZhdGUgX3lPZmZzZXQ6IG51bWJlcjtcclxuICBwcml2YXRlIF9jdXJyZW50VHlwZTogVHlwZXM7XHJcbiAgcHJpdmF0ZSBfdHlwZXM6IHtcclxuICAgIFtrZXk6IG51bWJlcl06IFR5cGU7XHJcbiAgfTtcclxuICBwcml2YXRlIF9tb3Zpbmc6IGJvb2xlYW47IC8vIOihqOaYjuaYr+WQpuaYr+WQpuato+WcqOenu+WKqFxyXG4gIHByaXZhdGUgX2hhc1ByZXZpZXc6IGJvb2xlYW4gPSBmYWxzZTsgLy8g5piv5ZCm6ZyA6KaB6aKE6KeI5Yqf6IO977yM6buY6K6k5piv5ZCmXHJcbiAgcHJpdmF0ZSBfcHJldmlld0xpc3Q6IFByZXZpZXdbXSA9IFtdO1xyXG4gIHByaXZhdGUgX3ByZXZpZXdTY2FsZUNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgcHJpdmF0ZSBfcHJldmlld1NjYWxlQ3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XHJcblxyXG4gIHByaXZhdGUgX2xpbmVXaWR0aDogbnVtYmVyID0gMTtcclxuICBwcml2YXRlIF9wb2ludFdpZHRoOiBudW1iZXIgPSA4O1xyXG4gIHByaXZhdGUgX3BvaW50SGVpZ2h0OiBudW1iZXIgPSA4O1xyXG5cclxuICBjb25zdHJ1Y3Rvcihjb250YWluZXI6IEhUTUxFbGVtZW50LCBvcHRpb25zID8gOiBDcm9wcGVyT3B0aW9ucykge1xyXG4gICAgY29uc3Qgb3B0aW9uID0ge1xyXG4gICAgICB3aWR0aDogY29udGFpbmVyLm9mZnNldFdpZHRoLFxyXG4gICAgICBoZWlnaHQ6IGNvbnRhaW5lci5vZmZzZXRIZWlnaHRcclxuICAgIH1cclxuICAgIE9iamVjdC5hc3NpZ24ob3B0aW9uLCBvcHRpb25zKTtcclxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICB0aGlzLl9jYW52YXMgPSBjYW52YXM7XHJcbiAgICB0aGlzLl9jdHggPSBjdHg7XHJcbiAgICB0aGlzLl9vcHRpb25zID0gb3B0aW9uO1xyXG4gICAgdGhpcy5fY29udGFpbmVyID0gY29udGFpbmVyO1xyXG4gICAgdGhpcy5fd2lkdGggPSBvcHRpb24ud2lkdGg7XHJcbiAgICB0aGlzLl9oZWlnaHQgPSBvcHRpb24uaGVpZ2h0O1xyXG4gICAgdGhpcy5fdHlwZXMgPSB7XHJcbiAgICAgIFtUeXBlcy5wb2ludFJEXToge1xyXG4gICAgICAgIGN1cnNvcjogJ253c2UtcmVzaXplJyxcclxuICAgICAgICBoYW5kbGU6IHRoaXMuaGFuZGxlUG9pbnRNb3ZlXHJcbiAgICAgIH0sXHJcbiAgICAgIFtUeXBlcy5pbWFnZV06IHtcclxuICAgICAgICBjdXJzb3I6ICdkZWZhdWx0JyxcclxuICAgICAgICBoYW5kbGU6IHRoaXMuaGFuZGxlSW1hZ2VNb3ZlXHJcbiAgICAgIH0sXHJcbiAgICAgIFtUeXBlcy5jcm9wcGVyXToge1xyXG4gICAgICAgIGN1cnNvcjogJ2FsbC1zY3JvbGwnLFxyXG4gICAgICAgIGhhbmRsZTogdGhpcy5oYW5kbGVDcm9wcGVyTW92ZVxyXG4gICAgICB9LFxyXG4gICAgICBbVHlwZXMuYmFja2dyb3VuZF06IHtcclxuICAgICAgICBjdXJzb3I6ICdkZWZhdWx0JyxcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBhbGVydChcIlRoZXJlIGlzIG5vIENhbnZhc1wiKTtcclxuICAgICAgY29uc29sZS5lcnJvcihlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaW5pdCgpIHtcclxuICAgIC8v5Yid5aeL5YyW6KOB5Ymq5qGGXHJcbiAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9vcHRpb25zO1xyXG4gICAgY29uc3QgY3JvcHBlckNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgY29uc3QgY3JvcHBlckN0eCA9IGNyb3BwZXJDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIE9iamVjdC5hc3NpZ24oY3JvcHBlckNhbnZhcywge1xyXG4gICAgICB3aWR0aDogb3B0aW9uLndpZHRoLFxyXG4gICAgICBoZWlnaHQ6IG9wdGlvbi5oZWlnaHRcclxuICAgIH0pO1xyXG4gICAgdGhpcy5fY2FudmFzID0gY3JvcHBlckNhbnZhcztcclxuICAgIHRoaXMuX2N0eCA9IGNyb3BwZXJDdHg7XHJcbiAgICB0aGlzLl9jb250YWluZXIuYXBwZW5kQ2hpbGQoY3JvcHBlckNhbnZhcyk7XHJcblxyXG4gICAgLy/liJ3lp4vljJbpooTop4jmoYZcclxuICAgIGlmIChvcHRpb24ucHJldmlld3MgJiYgQXJyYXkuaXNBcnJheShvcHRpb24ucHJldmlld3MpICYmIG9wdGlvbi5wcmV2aWV3cy5sZW5ndGgpIHtcclxuICAgICAgLy/pgY3ljobmiYDmnInnmoRwcmV2aWV35bm25Yib5bu6Y2FudmFzXHJcbiAgICAgIG9wdGlvbi5wcmV2aWV3cy5mb3JFYWNoKHAgPT4ge1xyXG4gICAgICAgIGNvbnN0IHByZXZpZXdDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgICAgICBjb25zdCBwcmV2aWV3Q3R4ID0gcHJldmlld0NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgIGNvbnN0IHNjYWxlID0gcC5zY2FsZTtcclxuICAgICAgICBjb25zdCBlbCA9IHAuY29udGFpbmVyO1xyXG4gICAgICAgIGNvbnN0IHByZXZpZXc6IFByZXZpZXcgPSB7XHJcbiAgICAgICAgICBjYW52YXM6IHByZXZpZXdDYW52YXMsXHJcbiAgICAgICAgICBjdHg6IHByZXZpZXdDdHgsXHJcbiAgICAgICAgICBzY2FsZTogc2NhbGUgPiAwID8gc2NhbGUgOiAxXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsLmFwcGVuZENoaWxkKHByZXZpZXdDYW52YXMpOyAvL+WwhmNhbnZhc+WKoOWFpeWvueW6lOeahGVsZW1lbnTkuK1cclxuICAgICAgICB0aGlzLl9wcmV2aWV3TGlzdC5wdXNoKHByZXZpZXcpO1xyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy5fcHJldmlld1NjYWxlQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICAgIHRoaXMuX3ByZXZpZXdTY2FsZUN0eCA9IHRoaXMuX3ByZXZpZXdTY2FsZUNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICB0aGlzLl9oYXNQcmV2aWV3ID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyDmoLnmja7ngrnlh7vml7bnmoTljLrln5/mnaXnp7vliqjlr7nlupTnmoTnlLvluIPlhYPntKDvvIzkuJTlm6DkuLrlrp7lnKhjYW52YXPnlLvluIPkuIrnu5HlrprvvIxcclxuICAgIC8vIOaJgOS7pSBtb3VzZWV2ZW50Lm9mZnNldFjmjIfnmoTmmK/ngrnlh7vkvY3nva7nm7jlr7nkuo7nlLvluIPlt6bovrnnvJjnmoTlgY/np7tcclxuICAgIGNyb3BwZXJDYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZSA9PiB7XHJcbiAgICAgIGlmIChlLndoaWNoID09PSAxKSB7XHJcbiAgICAgICAgY29uc3QgdHlwZUluZm8gPSB0aGlzLmdldFR5cGVJbmZvKGUpO1xyXG4gICAgICAgIGlmICh0eXBlSW5mby50eXBlID09PSBUeXBlcy5iYWNrZ3JvdW5kKSB7XHJcbiAgICAgICAgICB0aGlzLl9tb3ZpbmcgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5fbW92aW5nID0gdHJ1ZTtcclxuICAgICAgICAgIHRoaXMuX2N1cnJlbnRUeXBlID0gdHlwZUluZm8udHlwZTtcclxuICAgICAgICAgIHRoaXMuX3hPZmZzZXQgPSB0eXBlSW5mby5vZmZzZXRYO1xyXG4gICAgICAgICAgdGhpcy5feU9mZnNldCA9IHR5cGVJbmZvLm9mZnNldFk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGUgPT4ge1xyXG4gICAgICBpZiAoZS53aGljaCA9PT0gMSkge1xyXG4gICAgICAgIHRoaXMuX21vdmluZyA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBjcm9wcGVyQ2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGUgPT4ge1xyXG4gICAgICBjb25zdCBpbmZvID0gdGhpcy5nZXRUeXBlSW5mbyhlKSxcclxuICAgICAgICBtb3ZlVHlwZSA9IHRoaXMuX3R5cGVzW2luZm8udHlwZV0sXHJcbiAgICAgICAgY3VycmVudFR5cGUgPSB0aGlzLl90eXBlc1t0aGlzLl9jdXJyZW50VHlwZV07XHJcblxyXG4gICAgICBpZiAodGhpcy5fbW92aW5nICYmIGN1cnJlbnRUeXBlLmhhbmRsZSkge1xyXG4gICAgICAgIGN1cnJlbnRUeXBlLmhhbmRsZShlKTtcclxuICAgICAgICB0aGlzLmRyYXcoKTtcclxuICAgICAgfSBlbHNlIGlmIChtb3ZlVHlwZS5jdXJzb3IpIHtcclxuICAgICAgICBjb25zdCBvbGRDdXJzb3IgPSB0aGlzLl9jb250YWluZXIuc3R5bGUuY3Vyc29yO1xyXG4gICAgICAgIGlmIChvbGRDdXJzb3IgIT09IG1vdmVUeXBlLmN1cnNvcikge1xyXG4gICAgICAgICAgdGhpcy5fY29udGFpbmVyLnN0eWxlLmN1cnNvciA9IG1vdmVUeXBlLmN1cnNvcjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8v5aSE55CG57yp5pS+5LqL5Lu277yI5LuF5pyJZmlyZWZveOS4jeaUr+aMgW1vdXNld2hlZWzkuovku7bvvIzmiYDku6Xoi6Xmg7PlnKhmaXJlZm945Lit55yL5Yiw57yp5pS+77yM6ZyA6KaB5Y+m5aSW5aSE55CG77yJXHJcbiAgICBjcm9wcGVyQ2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCBlID0+IHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgY29uc3QgaW1hZ2UgPSB0aGlzLl9pbWFnZTtcclxuXHJcbiAgICAgIGlmIChpbWFnZS5lbGVtZW50KSB7XHJcbiAgICAgICAgLy8g5LiN5Y+Y55qE5Zu+54mH5Y6f5aeL5a696auYXHJcbiAgICAgICAgbGV0IHdpZHRoID0gaW1hZ2UuZWxlbWVudC53aWR0aDtcclxuICAgICAgICBsZXQgaGVpZ2h0ID0gaW1hZ2UuZWxlbWVudC5oZWlnaHQ7XHJcbiAgICAgICAgbGV0IGs7IC8vIOacgOe7iOeahOe8qeaUvuezu+aVsFxyXG4gICAgICAgIGNvbnN0IHNjYWxlID0gdGhpcy5fc2NhbGU7XHJcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gZS5kZWx0YVkgLyA4MDA7IC8vZGVsdGHku6Pooajkuobmu5HliqjpgJ/luqZcclxuXHJcbiAgICAgICAgaWYgKG9mZnNldCA+IDApIHtcclxuICAgICAgICAgIGsgPSAxIC8gKDEgKyBvZmZzZXQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBrID0gKDEgKyBNYXRoLmFicyhvZmZzZXQpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGsgKj0gc2NhbGU7XHJcbiAgICAgICAgdGhpcy5fc2NhbGUgPSBrO1xyXG4gICAgICAgIHdpZHRoICo9IGs7XHJcbiAgICAgICAgaGVpZ2h0ICo9IGs7XHJcbiAgICAgICAgaW1hZ2UueCArPSAoaW1hZ2Uud2lkdGggLSB3aWR0aCkgLyAyO1xyXG4gICAgICAgIGltYWdlLnkgKz0gKGltYWdlLmhlaWdodCAtIGhlaWdodCkgLyAyO1xyXG5cclxuICAgICAgICBpbWFnZS53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIGltYWdlLmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICB0aGlzLmRyYXcoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvL+agueaNrueCueWHu+S9jee9rueahOS4jeWQjO+8jOi/lOWbnuWvueW6lOeahOWAvFxyXG4gIHByaXZhdGUgZ2V0VHlwZUluZm8oZTogTW91c2VFdmVudCk6IFR5cGVJbmZvIHtcclxuICAgIGNvbnN0IFt4LCB5XSA9IFtlLm9mZnNldFgsIGUub2Zmc2V0WV07XHJcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0UG9pbnQoKTtcclxuICAgIGNvbnN0IGNyb3BwZXIgPSB0aGlzLl9jcm9wcGVyO1xyXG4gICAgY29uc3QgaW1hZ2UgPSB0aGlzLl9pbWFnZTtcclxuICAgIGNvbnN0IGluZm86IFR5cGVJbmZvID0ge307XHJcblxyXG4gICAgaWYgKHggPiBwb2ludC54ICYmIHggPCBwb2ludC54ICsgcG9pbnQud2lkdGggJiYgeSA+IHBvaW50LnkgJiYgeSA8IHBvaW50LnkgKyBwb2ludC5oZWlnaHQpIHtcclxuICAgICAgLy/ngrnlh7vnmoTkvY3nva7lnKjnvKnmlL7plJrngrnkuIpcclxuICAgICAgaW5mby5vZmZzZXRYID0geCAtIHBvaW50Lng7IC8v6KGo56S654K55Ye75L2N572u55u45a+55LqO6ZSa54K555qE5YGP56e7XHJcbiAgICAgIGluZm8ub2Zmc2V0WSA9IHkgLSBwb2ludC55O1xyXG4gICAgICBpbmZvLnR5cGUgPSBUeXBlcy5wb2ludFJEO1xyXG4gICAgfSBlbHNlIGlmICh4ID4gY3JvcHBlci54ICYmIHggPCBjcm9wcGVyLnggKyBjcm9wcGVyLndpZHRoICYmIHkgPiBjcm9wcGVyLnkgJiYgeSA8IGNyb3BwZXIueSArIGNyb3BwZXIuaGVpZ2h0KSB7XHJcbiAgICAgIC8v54K55Ye75L2N572u5Zyo6KOB5Ymq5qGG6YeM6Z2iXHJcbiAgICAgIGluZm8ub2Zmc2V0WCA9IHggLSBjcm9wcGVyLng7IC8v6KGo56S654K55Ye75L2N572u55u45a+55LqO6KOB5Ymq5qGG55qE5YGP56e7XHJcbiAgICAgIGluZm8ub2Zmc2V0WSA9IHkgLSBjcm9wcGVyLnk7XHJcbiAgICAgIGluZm8udHlwZSA9IFR5cGVzLmNyb3BwZXI7XHJcbiAgICB9IGVsc2UgaWYgKHggPiBpbWFnZS54ICYmIHggPCBpbWFnZS54ICsgaW1hZ2Uud2lkdGggJiYgeSA+IGltYWdlLnkgJiYgeSA8IGltYWdlLnkgKyBpbWFnZS5oZWlnaHQpIHtcclxuICAgICAgLy/ngrnlh7vnmoTkvY3nva7lnKjlm77niYfkuIpcclxuICAgICAgaW5mby5vZmZzZXRYID0geCAtIGltYWdlLng7IC8v6KGo56S654K55Ye75L2N572u55u45a+55LqO5Zu+54mH55qE5YGP56e7XHJcbiAgICAgIGluZm8ub2Zmc2V0WSA9IHkgLSBpbWFnZS55O1xyXG4gICAgICBpbmZvLnR5cGUgPSBUeXBlcy5pbWFnZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGluZm8udHlwZSA9IFR5cGVzLmJhY2tncm91bmQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW5mbztcclxuICB9XHJcblxyXG5cclxuICBwcml2YXRlIGhhbmRsZVBvaW50TW92ZSA9IChlOiBNb3VzZUV2ZW50KSA9PiB7XHJcbiAgICBjb25zdCBbeCwgeV0gPSBbZS5vZmZzZXRYLCBlLm9mZnNldFldO1xyXG4gICAgY29uc3QgdyA9IHggLSB0aGlzLl9jcm9wcGVyLnggLSB0aGlzLl94T2Zmc2V0ICsgdGhpcy5fcG9pbnRXaWR0aCAvIDIsXHJcbiAgICAgIGggPSB5IC0gdGhpcy5fY3JvcHBlci55IC0gdGhpcy5feU9mZnNldCArIHRoaXMuX3BvaW50SGVpZ2h0IC8gMjtcclxuXHJcbiAgICBpZiAodyA8PSAwIHx8IGggPD0gMCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zZXRDcm9wcGVyKHcsIGgsIGZhbHNlKTtcclxuICB9XHJcblxyXG5cclxuICBwcml2YXRlIGhhbmRsZUNyb3BwZXJNb3ZlID0gKGU6IE1vdXNlRXZlbnQpID0+IHtcclxuICAgIGNvbnN0IFt4LCB5XSA9IFtlLm9mZnNldFgsIGUub2Zmc2V0WV07XHJcbiAgICBjb25zdCBbb1gsIG9ZLCBjVywgY0gsIHcsIGhdID0gW3RoaXMuX3hPZmZzZXQsIHRoaXMuX3lPZmZzZXQsIHRoaXMuX2Nyb3BwZXIud2lkdGgsIHRoaXMuX2Nyb3BwZXIuaGVpZ2h0LCB0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0XTtcclxuXHJcbiAgICBsZXQgY3VycmVudFggPSB4IC0gb1gsXHJcbiAgICAgIGN1cnJlbnRZID0geSAtIG9ZO1xyXG5cclxuICAgIC8vIOWIpOaWrei+ueeVjFxyXG4gICAgaWYgKHggPCBvWCkge1xyXG4gICAgICBjdXJyZW50WCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHggPiB3IC0gY1cgKyBvWCkge1xyXG4gICAgICBjdXJyZW50WCA9IHcgLSBjVztcclxuICAgIH1cclxuXHJcbiAgICBpZiAoeSA8IG9ZKSB7XHJcbiAgICAgIGN1cnJlbnRZID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoeSA+IGggLSBjSCArIG9ZKSB7XHJcbiAgICAgIGN1cnJlbnRZID0gaCAtIGNIO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2Nyb3BwZXIueCA9IGN1cnJlbnRYO1xyXG4gICAgdGhpcy5fY3JvcHBlci55ID0gY3VycmVudFk7XHJcbiAgfVxyXG5cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVJbWFnZU1vdmUgPSAoZTogTW91c2VFdmVudCkgPT4ge1xyXG4gICAgY29uc3QgW3gsIHldID0gW2Uub2Zmc2V0WCwgZS5vZmZzZXRZXTtcclxuICAgIGNvbnN0IFtvWCwgb1ldID0gW3RoaXMuX3hPZmZzZXQsIHRoaXMuX3lPZmZzZXRdO1xyXG5cclxuICAgIHRoaXMuX2ltYWdlLnggPSB4IC0gb1g7XHJcbiAgICB0aGlzLl9pbWFnZS55ID0geSAtIG9ZO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICog55S75Zu+5Ye95pWwXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBkcmF3KCkge1xyXG4gICAgdGhpcy5fY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0KTtcclxuICAgIHRoaXMuZmlsbEltYWdlKCk7IC8v5bCGaW1hZ2Xkv6Hmga/loavlhYXliLBjYW52YXPkuK1cclxuICAgIHRoaXMucHJldmlldygpOyAvL+a4suafk+mihOiniOWMuueahGNhbnZhc1xyXG5cclxuICAgIC8v5Li65LqG6YG/5YWN6aKE6KeI5Yy65Ye6546w6buR55m955u46Ze055qE6IOM5pmv77yM5YaN5qyhY2xlYXJcclxuICAgIHRoaXMuX2N0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCk7XHJcbiAgICB0aGlzLmZpbGxCYWNrZ3JvdW5kKCk7XHJcbiAgICB0aGlzLmZpbGxJbWFnZSgpO1xyXG4gICAgdGhpcy5maWxsQ3JvcHBlcigpO1xyXG5cclxuICB9XHJcblxyXG4gIC8v5bCG5Zu+54mH5aGr5YWF5YiwY2FudmFz5LitXHJcbiAgcHJpdmF0ZSBmaWxsSW1hZ2UoKSB7XHJcbiAgICBjb25zdCBjdHggPSB0aGlzLl9jdHg7XHJcbiAgICBjb25zdCBpbWFnZSA9IHRoaXMuX2ltYWdlO1xyXG4gICAgaWYgKGltYWdlKSB7XHJcbiAgICAgIGN0eC5kcmF3SW1hZ2UoaW1hZ2UuZWxlbWVudCwgaW1hZ2UueCwgaW1hZ2UueSwgaW1hZ2Uud2lkdGgsIGltYWdlLmhlaWdodCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHByZXZpZXcoKSB7XHJcbiAgICBpZiAodGhpcy5faW1hZ2UuZWxlbWVudCAmJiB0aGlzLl9oYXNQcmV2aWV3KSB7XHJcbiAgICAgIGNvbnN0IGNyb3BwZXJEYXRhID0gdGhpcy5nZXRDcm9wcGVyRGF0YSgpO1xyXG4gICAgICB0aGlzLl9wcmV2aWV3U2NhbGVDdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuX2Nyb3BwZXIud2lkdGgsIHRoaXMuX2Nyb3BwZXIuaGVpZ2h0KTtcclxuICAgICAgdGhpcy5fcHJldmlld1NjYWxlQ3R4LnB1dEltYWdlRGF0YShjcm9wcGVyRGF0YS5pbWFnZURhdGEsIGNyb3BwZXJEYXRhLm9mZnNldFgsIGNyb3BwZXJEYXRhLm9mZnNldFkpO1xyXG4gICAgICAvL+a4suafk3ByZWl2ZXfljLrln59cclxuICAgICAgdGhpcy5fcHJldmlld0xpc3QuZm9yRWFjaChwID0+IHtcclxuICAgICAgICBjb25zdCBwcmV2aWV3Q2FudmFzID0gcC5jYW52YXM7XHJcbiAgICAgICAgY29uc3QgcHJldmlld0N0eCA9IHAuY3R4O1xyXG4gICAgICAgIHByZXZpZXdDdHguY2xlYXJSZWN0KDAsIDAsIHByZXZpZXdDYW52YXMud2lkdGgsIHByZXZpZXdDYW52YXMuaGVpZ2h0KTtcclxuICAgICAgICAvL+WIpOaWree8qeaUvuavlOS+i+WQjuWhq+WFhVxyXG4gICAgICAgIGlmIChwLnNjYWxlICE9PSAxKSB7XHJcbiAgICAgICAgICBwcmV2aWV3Q3R4LnNjYWxlKHAuc2NhbGUsIHAuc2NhbGUpO1xyXG4gICAgICAgICAgcHJldmlld0N0eC5kcmF3SW1hZ2UodGhpcy5fcHJldmlld1NjYWxlQ2FudmFzLCAwLCAwKTtcclxuICAgICAgICAgIHByZXZpZXdDdHguc2V0VHJhbnNmb3JtKDEsIDAsIDAsIDEsIDAsIDApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwcmV2aWV3Q3R4LnB1dEltYWdlRGF0YShjcm9wcGVyRGF0YS5pbWFnZURhdGEsIGNyb3BwZXJEYXRhLm9mZnNldFgsIGNyb3BwZXJEYXRhLm9mZnNldFkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvL+agueaNruijgeWJquahhuWSjOWbvueJh+eahOS9jee9ruWFs+ezu++8jOmAieaLqeimgeijgeWJqueahOWMuuWfn+W5tui/lOWbnuWbvueJh+aVsOaNrlxyXG4gIHByaXZhdGUgZ2V0Q3JvcHBlckRhdGEoKSB7XHJcbiAgICBjb25zdCBjcm9wcGVyID0gdGhpcy5fY3JvcHBlcjtcclxuICAgIGNvbnN0IGltYWdlID0gdGhpcy5faW1hZ2U7XHJcbiAgICBsZXQgW3JlYWxYLCByZWFsWSwgcmVhbFcsIHJlYWxIXSA9IFtjcm9wcGVyLngsIGNyb3BwZXIueSwgY3JvcHBlci53aWR0aCwgY3JvcHBlci5oZWlnaHRdO1xyXG4gICAgbGV0IFtvZmZzZXRYLCBvZmZzZXRZXSA9IFswLCAwXTtcclxuXHJcbiAgICAvL+ijgeWJquahhueahOW3pui+uei2heWHuui+ueeVjFxyXG4gICAgaWYgKHJlYWxYIDwgaW1hZ2UueCkge1xyXG4gICAgICBvZmZzZXRYID0gaW1hZ2UueCAtIHJlYWxYO1xyXG4gICAgICByZWFsWCA9IGltYWdlLng7XHJcbiAgICAgIHJlYWxXIC09IG9mZnNldFg7XHJcbiAgICB9XHJcblxyXG4gICAgLy/oo4HliarmoYbnmoTkuIrovrnotoXlh7rovrnnlYxcclxuICAgIGlmIChyZWFsWSA8IGltYWdlLnkpIHtcclxuICAgICAgb2Zmc2V0WSA9IGltYWdlLnkgLSByZWFsWTtcclxuICAgICAgcmVhbFkgPSBpbWFnZS55O1xyXG4gICAgICByZWFsSCAtPSBvZmZzZXRZO1xyXG4gICAgfVxyXG5cclxuICAgIC8v6KOB5Ymq5qGG55qE5Y+z6L656LaF5Ye66L6555WMXHJcbiAgICBpZiAoaW1hZ2UueCArIGltYWdlLndpZHRoIDwgcmVhbFggKyByZWFsVykge1xyXG4gICAgICBvZmZzZXRYID0gKHJlYWxYICsgcmVhbFcpIC0gKGltYWdlLnggKyBpbWFnZS53aWR0aCk7XHJcbiAgICAgIHJlYWxXIC09IG9mZnNldFg7XHJcbiAgICB9XHJcblxyXG4gICAgLy/oo4HliarmoYbnmoTkuIvovrnotoXlh7rovrnnlYxcclxuICAgIGlmIChpbWFnZS55ICsgaW1hZ2UuaGVpZ2h0IDwgcmVhbFkgKyByZWFsSCkge1xyXG4gICAgICBvZmZzZXRZID0gKHJlYWxZICsgcmVhbEgpIC0gKGltYWdlLnkgKyBpbWFnZS5oZWlnaHQpO1xyXG4gICAgICByZWFsSCAtPSBvZmZzZXRZO1xyXG4gICAgfVxyXG5cclxuICAgIC8v6Iul6KOB5Ymq5qGG5LiN5Zyo5Zu+5YOP5LiK77yM5YiZ6L+U5ZueXHJcbiAgICBpZiAocmVhbFcgPCAwIHx8IHJlYWxIIDwgMCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgeDogcmVhbFgsXHJcbiAgICAgIHk6IHJlYWxZLFxyXG4gICAgICBoOiByZWFsSCxcclxuICAgICAgdzogcmVhbFcsXHJcbiAgICAgIG9mZnNldFg6IG9mZnNldFgsXHJcbiAgICAgIG9mZnNldFk6IG9mZnNldFksXHJcbiAgICAgIGltYWdlRGF0YTogdGhpcy5fY3R4LmdldEltYWdlRGF0YShyZWFsWCwgcmVhbFksIHJlYWxXLCByZWFsSClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZmlsbEJhY2tncm91bmQoKSB7XHJcbiAgICBjb25zdCBjdHggPSB0aGlzLl9jdHg7XHJcbiAgICBjb25zdCB3aWR0aCA9IHRoaXMuX3dpZHRoO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5faGVpZ2h0O1xyXG4gICAgY29uc3Qgc2lkZSA9IHdpZHRoIC8gNDA7IC8v5qiq5ZCR55SoNDDkuKrlsI/mlrnlnZfmnaXloavlhYVcclxuICAgIGNvbnN0IHggPSBNYXRoLmNlaWwod2lkdGggLyBzaWRlKTtcclxuICAgIGNvbnN0IHkgPSBNYXRoLmNlaWwoaGVpZ2h0IC8gc2lkZSk7XHJcbiAgICBsZXQgayA9IDA7XHJcblxyXG4gICAgY3R4LnNhdmUoKTsgLy/kv53lrZjnlLvnrJTmraTml7bnmoTpgI/mmI7nirbmgIFcclxuICAgIGN0eC5maWxsU3R5bGUgPSAnI2NjYyc7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB5OyBpKyspIHtcclxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB4OyBqKyspIHtcclxuICAgICAgICBpZiAoKGsgKyBpKSAlIDIgPT09IDApIHtcclxuICAgICAgICAgIGN0eC5maWxsUmVjdChqICogc2lkZSwgaSAqIHNpZGUsIHNpZGUsIHNpZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBrKys7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMCwwLDAsMC4xKSc7XHJcbiAgICBjdHguZmlsbFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICBjdHgucmVzdG9yZSgpOyAvL+WwhueUu+W4g+a4hembtu+8jOWbnuWIsOWIneWni+mAj+aYjueahOeKtuaAgVxyXG4gIH1cclxuXHJcbiAgLy/nlLvlh7roo4HliarmoYbnmoTovrnnur9cclxuICBwcml2YXRlIGZpbGxDcm9wcGVyKCkge1xyXG4gICAgY29uc3QgaW1hZ2UgPSB0aGlzLl9pbWFnZTtcclxuICAgIGlmIChpbWFnZS5lbGVtZW50KSB7XHJcbiAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2N0eDtcclxuICAgICAgY29uc3QgY3JvcHBlciA9IHRoaXMuX2Nyb3BwZXI7XHJcblxyXG4gICAgICBjdHguc2F2ZSgpO1xyXG5cclxuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJyNlYTE1MTUnO1xyXG4gICAgICBjdHgubGluZVdpZHRoID0gdGhpcy5fbGluZVdpZHRoO1xyXG4gICAgICAvL+eUu+ijgeWJquahhueahOi+uee6v1xyXG4gICAgICBjdHguc3Ryb2tlUmVjdChjcm9wcGVyLngsIGNyb3BwZXIueSwgY3JvcHBlci53aWR0aCwgY3JvcHBlci5oZWlnaHQpO1xyXG5cclxuICAgICAgY3R4LmZpbGxTdHlsZSA9ICcjZWExNTE1JztcclxuICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KCk7XHJcbiAgICAgIC8v55S75Y+z5LiL6KeS55qE57yp5pS+54K5XHJcbiAgICAgIGN0eC5maWxsUmVjdChwb2ludC54LCBwb2ludC55LCBwb2ludC53aWR0aCwgcG9pbnQuaGVpZ2h0KTtcclxuICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8v6I635Y+W6KOB5Ymq54K555qE5L2N572uXHJcbiAgcHJpdmF0ZSBnZXRQb2ludCgpIHtcclxuICAgIGNvbnN0IGNyb3BwZXIgPSB0aGlzLl9jcm9wcGVyO1xyXG4gICAgY29uc3QgdyA9IHRoaXMuX3BvaW50V2lkdGg7XHJcbiAgICBjb25zdCBoID0gdGhpcy5fcG9pbnRIZWlnaHQ7XHJcbiAgICBjb25zdCB4ID0gY3JvcHBlci54ICsgY3JvcHBlci53aWR0aCAtIHcgLyAyO1xyXG4gICAgY29uc3QgeSA9IGNyb3BwZXIueSArIGNyb3BwZXIuaGVpZ2h0IC0gaCAvIDI7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB3aWR0aDogdyxcclxuICAgICAgaGVpZ2h0OiBoLFxyXG4gICAgICB4OiB4LFxyXG4gICAgICB5OiB5XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy/ojrflj5bovpPlhaXnmoTlm77niYdcclxuICBwdWJsaWMgc2V0SW1hZ2UoaW1hZ2U6IEZpbGUgfCBIVE1MSW1hZ2VFbGVtZW50KSB7XHJcbiAgICBpZiAoaW1hZ2UgaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50KSB7XHJcbiAgICAgIHRoaXMucmVzZXRJbWFnZShpbWFnZSk7XHJcbiAgICB9IGVsc2UgaWYgKGltYWdlIGluc3RhbmNlb2YgRmlsZSkge1xyXG4gICAgICBpZiAoIWltYWdlLnR5cGUubWF0Y2goL15pbWFnZVxcLy4rJC8pKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcign6K+36YCJ5oup5q2j56Gu55qE5Zu+54mH5paH5Lu2Jyk7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuXHJcbiAgICAgIHRoaXMuX2ltYWdlID0ge307XHJcblxyXG4gICAgICByZWFkZXIub25sb2FkID0gKGU6IGFueSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IF9pbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgIF9pbWFnZS5zcmMgPSBlLnRhcmdldC5yZXN1bHQ7XHJcbiAgICAgICAgX2ltYWdlLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMucmVzZXRJbWFnZShfaW1hZ2UpO1xyXG4gICAgICAgIH07XHJcbiAgICAgIH07XHJcblxyXG4gICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChpbWFnZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvL+agueaNrui+k+WFpeeahOWbvueJh+eahOWwuuWvuO+8jOWwhuWFtuaUvuWFpeWIsOWkp+eahOeUu+W4g+S4re+8jOS4jeiHs+S6juWHuueOsOa6ouWHulxyXG4gIHByaXZhdGUgcmVzZXRJbWFnZShpbWFnZSA/IDogSFRNTEltYWdlRWxlbWVudCkge1xyXG4gICAgaWYgKCFpbWFnZSkge1xyXG4gICAgICBpZiAoIXRoaXMuX2ltYWdlLmVsZW1lbnQpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgaW1hZ2UgPSB0aGlzLl9pbWFnZS5lbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaW1hZ2Uuc3JjKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgaVcgPSBpbWFnZS53aWR0aCxcclxuICAgICAgaUggPSBpbWFnZS5oZWlnaHQsXHJcbiAgICAgIHcgPSB0aGlzLl93aWR0aCxcclxuICAgICAgaCA9IHRoaXMuX2hlaWdodCxcclxuICAgICAgY1cgPSB3IC8gMywgLy/oo4HliarmoYbnmoTlpKflsI/kuLrnlLvluIPnmoQxLzNcclxuICAgICAgY0ggPSBoIC8gMztcclxuXHJcbiAgICBsZXQgY3VycmVudFcgPSBpVyxcclxuICAgICAgY3VycmVudEggPSBpSCxcclxuICAgICAgayA9IDE7IC8vIOWMheijueS9j+WbvueJh+aXtueahOe8qeaUvuavlOS+i1xyXG5cclxuICAgIGlmIChpVyA+IHcpIHtcclxuICAgICAgY3VycmVudFcgPSB3O1xyXG4gICAgICBrID0gY3VycmVudFcgLyBpVztcclxuICAgICAgY3VycmVudEggPSBrICogaUg7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGN1cnJlbnRIID4gaCkge1xyXG4gICAgICBjdXJyZW50SCA9IGg7XHJcbiAgICAgIGsgPSBjdXJyZW50SCAvIGlIO1xyXG4gICAgICBjdXJyZW50VyA9IGsgKiBpVztcclxuICAgIH1cclxuXHJcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuX2ltYWdlLCB7XHJcbiAgICAgIGVsZW1lbnQ6IGltYWdlLFxyXG4gICAgICB3aWR0aDogY3VycmVudFcsXHJcbiAgICAgIGhlaWdodDogY3VycmVudEgsXHJcbiAgICAgIHg6ICh3IC0gY3VycmVudFcpIC8gMixcclxuICAgICAgeTogKGggLSBjdXJyZW50SCkgLyAyXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLl9zY2FsZSA9IGs7XHJcbiAgICB0aGlzLnNldENyb3BwZXIoY1csIGNIKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2V0UHJldmlldyhyZXNldENvb3JkaW5hdGU6IGJvb2xlYW4gPSB0cnVlKSB7XHJcbiAgICBjb25zdCBjcm9wcGVyID0gdGhpcy5fY3JvcHBlcjtcclxuICAgIC8v5Yik5pat5piv5ZCm5bey57uP5pyJ5LqG6aKE6KeI5Yy6XHJcbiAgICBpZiAodGhpcy5faGFzUHJldmlldykge1xyXG4gICAgICBjb25zdCBbdywgaF0gPSBbdGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodF07XHJcblxyXG4gICAgICBpZiAocmVzZXRDb29yZGluYXRlKSB7XHJcbiAgICAgICAgY3JvcHBlci54ID0gdyAvIDIgLSBjcm9wcGVyLndpZHRoIC8gMjtcclxuICAgICAgICBjcm9wcGVyLnkgPSBoIC8gMiAtIGNyb3BwZXIuaGVpZ2h0IC8gMjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMuX3ByZXZpZXdTY2FsZUNhbnZhcykge1xyXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5fcHJldmlld1NjYWxlQ2FudmFzLCB7XHJcbiAgICAgICAgICB3aWR0aDogY3JvcHBlci53aWR0aCxcclxuICAgICAgICAgIGhlaWdodDogY3JvcHBlci5oZWlnaHRcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5fcHJldmlld0xpc3QuZm9yRWFjaChwID0+IHtcclxuICAgICAgICBPYmplY3QuYXNzaWduKHAuY2FudmFzLCB7XHJcbiAgICAgICAgICB3aWR0aDogY3JvcHBlci53aWR0aCAqIHAuc2NhbGUsXHJcbiAgICAgICAgICBoZWlnaHQ6IGNyb3BwZXIuaGVpZ2h0ICogcC5zY2FsZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRDcm9wcGVyKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCByZXNldENvb3JkaW5hdGU6IGJvb2xlYW4gPSB0cnVlKSB7XHJcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuX2Nyb3BwZXIsIHtcclxuICAgICAgd2lkdGg6IHdpZHRoLFxyXG4gICAgICBoZWlnaHQ6IGhlaWdodFxyXG4gICAgfSk7XHJcbiAgICB0aGlzLnNldFByZXZpZXcocmVzZXRDb29yZGluYXRlKTtcclxuICAgIHRoaXMuZHJhdygpO1xyXG4gIH1cclxuXHJcbiAgLy9cclxuICBwdWJsaWMgY3JvcCgpOiBIVE1MQ2FudmFzRWxlbWVudCB7XHJcbiAgICBpZiAoIXRoaXMuX2ltYWdlLmVsZW1lbnQpIHtcclxuICAgICAgY29uc29sZS5lcnJvcign6K+35re75Yqg5LiA5byg5Zu+54mHJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQpO1xyXG5cclxuICAgIHRoaXMuZmlsbEltYWdlKCk7XHJcblxyXG4gICAgY29uc3QgZGF0YSA9IHRoaXMuZ2V0Q3JvcHBlckRhdGEoKTtcclxuICAgIGlmIChkYXRhKSB7XHJcbiAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLFxyXG4gICAgICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICBPYmplY3QuYXNzaWduKGNhbnZhcywge1xyXG4gICAgICAgIHdpZHRoOiB0aGlzLl9jcm9wcGVyLndpZHRoLFxyXG4gICAgICAgIGhlaWdodDogdGhpcy5fY3JvcHBlci5oZWlnaHRcclxuICAgICAgfSk7XHJcbiAgICAgIGN0eC5wdXRJbWFnZURhdGEoZGF0YS5pbWFnZURhdGEsIGRhdGEub2Zmc2V0WCwgZGF0YS5vZmZzZXRZKTtcclxuICAgICAgdGhpcy5kcmF3KCk7XHJcbiAgICAgIHJldHVybiBjYW52YXM7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==
