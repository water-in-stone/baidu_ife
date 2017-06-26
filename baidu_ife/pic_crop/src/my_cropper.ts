interface CropperOptions {
  previews ? : {
    container: HTMLElement,
    scale ? : number //代表缩放比列
  }[];
  width ? : number;
  height ? : number;
}

interface Type {
  cursor: string;
  handle ? (e: MouseEvent) : void; //处理鼠标的移动事件
}

interface TypeInfo {
  type ? : Types;
  offsetX ? : number;
  offsetY ? : number;
}

interface Preview {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  scale: number;
}

enum Types {
  image,
  pointRD, //代表裁剪框右下角的缩放按钮
  background,
  cropper
}

export class Cropper {
  private _container: HTMLElement;
  private _options: CropperOptions;
  private _ctx: CanvasRenderingContext2D;
  private _canvas: HTMLCanvasElement;
  private _width: number;
  private _height: number;

  private _image: {
    element ? : HTMLImageElement;
    width ? : number;
    height ? : number;
    x ? : number;
    y ? : number;
  } = {};

  private _cropper: {
    width ? : number;
    height ? : number;
    x ? : number;
    y ? : number;
  } = {};

  private _scale: number = 1;
  private _xOffset: number;
  private _yOffset: number;
  private _currentType: Types;
  private _types: {
    [key: number]: Type;
  };
  private _moving: boolean; // 表明是否是否正在移动
  private _hasPreview: boolean = false; // 是否需要预览功能，默认是否
  private _previewList: Preview[] = [];
  private _previewScaleCanvas: HTMLCanvasElement;
  private _previewScaleCtx: CanvasRenderingContext2D;

  private _lineWidth: number = 1;
  private _pointWidth: number = 8;
  private _pointHeight: number = 8;

  constructor(container: HTMLElement, options ? : CropperOptions) {
    const option = {
      width: container.offsetWidth,
      height: container.offsetHeight
    }
    Object.assign(option, options);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    this._canvas = canvas;
    this._ctx = ctx;
    this._options = option;
    this._container = container;
    this._width = option.width;
    this._height = option.height;
    this._types = {
      [Types.pointRD]: {
        cursor: 'nwse-resize',
        handle: this.handlePointMove
      },
      [Types.image]: {
        cursor: 'default',
        handle: this.handleImageMove
      },
      [Types.cropper]: {
        cursor: 'all-scroll',
        handle: this.handleCropperMove
      },
      [Types.background]: {
        cursor: 'default',
      }
    }

    try {
      this.init();
    } catch (e) {
      alert("There is no Canvas");
      console.error(e);
    }
  }

  private init() {
    //初始化裁剪框
    const option = this._options;
    const cropperCanvas = document.createElement('canvas');
    const cropperCtx = cropperCanvas.getContext('2d');
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
      option.previews.forEach(p => {
        const previewCanvas = document.createElement('canvas');
        const previewCtx = previewCanvas.getContext('2d');
        const scale = p.scale;
        const el = p.container;
        const preview: Preview = {
          canvas: previewCanvas,
          ctx: previewCtx,
          scale: scale > 0 ? scale : 1
        }
        el.appendChild(previewCanvas); //将canvas加入对应的element中
        this._previewList.push(preview);
      });
      this._previewScaleCanvas = document.createElement('canvas');
      this._previewScaleCtx = this._previewScaleCanvas.getContext('2d');
      this._hasPreview = true;
    }

    // 根据点击时的区域来移动对应的画布元素，且因为实在canvas画布上绑定，
    // 所以 mouseevent.offsetX指的是点击位置相对于画布左边缘的偏移
    cropperCanvas.addEventListener('mousedown', e => {
      if (e.which === 1) {
        const typeInfo = this.getTypeInfo(e);
        if (typeInfo.type === Types.background) {
          this._moving = false;
        } else {
          this._moving = true;
          this._currentType = typeInfo.type;
          this._xOffset = typeInfo.offsetX;
          this._yOffset = typeInfo.offsetY;
        }
      }
    });

    window.addEventListener('mouseup', e => {
      if (e.which === 1) {
        this._moving = false;
      }
    });

    cropperCanvas.addEventListener('mousemove', e => {
      const info = this.getTypeInfo(e),
        moveType = this._types[info.type],
        currentType = this._types[this._currentType];

      if (this._moving && currentType.handle) {
        currentType.handle(e);
        this.draw();
      } else if (moveType.cursor) {
        const oldCursor = this._container.style.cursor;
        if (oldCursor !== moveType.cursor) {
          this._container.style.cursor = moveType.cursor;
        }
      }
    });

    //处理缩放事件（仅有firefox不支持mousewheel事件，所以若想在firefox中看到缩放，需要另外处理）
    cropperCanvas.addEventListener('mousewheel', e => {
      e.preventDefault();

      const image = this._image;

      if (image.element) {
        // 不变的图片原始宽高
        let width = image.element.width;
        let height = image.element.height;
        let k; // 最终的缩放系数
        const scale = this._scale;
        const offset = e.deltaY / 800; //delta代表了滑动速度

        if (offset > 0) {
          k = 1 / (1 + offset);
        } else {
          k = (1 + Math.abs(offset));
        }

        k *= scale;
        this._scale = k;
        width *= k;
        height *= k;
        image.x += (image.width - width) / 2;
        image.y += (image.height - height) / 2;

        image.width = width;
        image.height = height;
        this.draw();
      }
    });
  }

  //根据点击位置的不同，返回对应的值
  private getTypeInfo(e: MouseEvent): TypeInfo {
    const [x, y] = [e.offsetX, e.offsetY];
    const point = this.getPoint();
    const cropper = this._cropper;
    const image = this._image;
    const info: TypeInfo = {};

    if (x > point.x && x < point.x + point.width && y > point.y && y < point.y + point.height) {
      //点击的位置在缩放锚点上
      info.offsetX = x - point.x; //表示点击位置相对于锚点的偏移
      info.offsetY = y - point.y;
      info.type = Types.pointRD;
    } else if (x > cropper.x && x < cropper.x + cropper.width && y > cropper.y && y < cropper.y + cropper.height) {
      //点击位置在裁剪框里面
      info.offsetX = x - cropper.x; //表示点击位置相对于裁剪框的偏移
      info.offsetY = y - cropper.y;
      info.type = Types.cropper;
    } else if (x > image.x && x < image.x + image.width && y > image.y && y < image.y + image.height) {
      //点击的位置在图片上
      info.offsetX = x - image.x; //表示点击位置相对于图片的偏移
      info.offsetY = y - image.y;
      info.type = Types.image;
    } else {
      info.type = Types.background;
    }
    return info;
  }


  private handlePointMove = (e: MouseEvent) => {
    const [x, y] = [e.offsetX, e.offsetY];
    const w = x - this._cropper.x - this._xOffset + this._pointWidth / 2,
      h = y - this._cropper.y - this._yOffset + this._pointHeight / 2;

    if (w <= 0 || h <= 0) {
      return;
    }

    this.setCropper(w, h, false);
  }


  private handleCropperMove = (e: MouseEvent) => {
    const [x, y] = [e.offsetX, e.offsetY];
    const [oX, oY, cW, cH, w, h] = [this._xOffset, this._yOffset, this._cropper.width, this._cropper.height, this._width, this._height];

    let currentX = x - oX,
      currentY = y - oY;

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

    this._cropper.x = currentX;
    this._cropper.y = currentY;
  }


  private handleImageMove = (e: MouseEvent) => {
    const [x, y] = [e.offsetX, e.offsetY];
    const [oX, oY] = [this._xOffset, this._yOffset];

    this._image.x = x - oX;
    this._image.y = y - oY;
  }

  /**
   * 画图函数
   */
  private draw() {
    this._ctx.clearRect(0, 0, this._width, this._height);
    this.fillImage(); //将image信息填充到canvas中
    this.preview(); //渲染预览区的canvas

    //为了避免预览区出现黑白相间的背景，再次clear
    this._ctx.clearRect(0, 0, this._width, this._height);
    this.fillBackground();
    this.fillImage();
    this.fillCropper();

  }

  //将图片填充到canvas中
  private fillImage() {
    const ctx = this._ctx;
    const image = this._image;
    if (image) {
      ctx.drawImage(image.element, image.x, image.y, image.width, image.height);
    }
  }

  private preview() {
    if (this._image.element && this._hasPreview) {
      const cropperData = this.getCropperData();
      this._previewScaleCtx.clearRect(0, 0, this._cropper.width, this._cropper.height);
      this._previewScaleCtx.putImageData(cropperData.imageData, cropperData.offsetX, cropperData.offsetY);
      //渲染preivew区域
      this._previewList.forEach(p => {
        const previewCanvas = p.canvas;
        const previewCtx = p.ctx;
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        //判断缩放比例后填充
        if (p.scale !== 1) {
          previewCtx.scale(p.scale, p.scale);
          previewCtx.drawImage(this._previewScaleCanvas, 0, 0);
          previewCtx.setTransform(1, 0, 0, 1, 0, 0);
        } else {
          previewCtx.putImageData(cropperData.imageData, cropperData.offsetX, cropperData.offsetY);
        }
      });
    }
  }

  //根据裁剪框和图片的位置关系，选择要裁剪的区域并返回图片数据
  private getCropperData() {
    const cropper = this._cropper;
    const image = this._image;
    let [realX, realY, realW, realH] = [cropper.x, cropper.y, cropper.width, cropper.height];
    let [offsetX, offsetY] = [0, 0];

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
    }
  }

  private fillBackground() {
    const ctx = this._ctx;
    const width = this._width;
    const height = this._height;
    const side = width / 40; //横向用40个小方块来填充
    const x = Math.ceil(width / side);
    const y = Math.ceil(height / side);
    let k = 0;

    ctx.save(); //保存画笔此时的透明状态
    ctx.fillStyle = '#ccc';

    for (let i = 0; i < y; i++) {
      for (let j = 0; j < x; j++) {
        if ((k + i) % 2 === 0) {
          ctx.fillRect(j * side, i * side, side, side);
        }
        k++;
      }
    }

    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(0, 0, width, height);
    ctx.restore(); //将画布清零，回到初始透明的状态
  }

  //画出裁剪框的边线
  private fillCropper() {
    const image = this._image;
    if (image.element) {
      const ctx = this._ctx;
      const cropper = this._cropper;

      ctx.save();

      ctx.strokeStyle = '#ea1515';
      ctx.lineWidth = this._lineWidth;
      //画裁剪框的边线
      ctx.strokeRect(cropper.x, cropper.y, cropper.width, cropper.height);

      ctx.fillStyle = '#ea1515';
      const point = this.getPoint();
      //画右下角的缩放点
      ctx.fillRect(point.x, point.y, point.width, point.height);
      ctx.restore();
    }
  }

  //获取裁剪点的位置
  private getPoint() {
    const cropper = this._cropper;
    const w = this._pointWidth;
    const h = this._pointHeight;
    const x = cropper.x + cropper.width - w / 2;
    const y = cropper.y + cropper.height - h / 2;
    return {
      width: w,
      height: h,
      x: x,
      y: y
    };
  }

  //获取输入的图片
  public setImage(image: File | HTMLImageElement) {
    if (image instanceof HTMLImageElement) {
      this.resetImage(image);
    } else if (image instanceof File) {
      if (!image.type.match(/^image\/.+$/)) {
        console.error('请选择正确的图片文件');
      }
      const reader = new FileReader();

      this._image = {};

      reader.onload = (e: any) => {
        const _image = new Image();
        _image.src = e.target.result;
        _image.onload = () => {
          this.resetImage(_image);
        };
      };

      reader.readAsDataURL(image);
    } else {
      return;
    }
  }

  //根据输入的图片的尺寸，将其放入到大的画布中，不至于出现溢出
  private resetImage(image ? : HTMLImageElement) {
    if (!image) {
      if (!this._image.element) {
        return;
      }
      image = this._image.element;
    }

    if (!image.src) return;

    const iW = image.width,
      iH = image.height,
      w = this._width,
      h = this._height,
      cW = w / 3, //裁剪框的大小为画布的1/3
      cH = h / 3;

    let currentW = iW,
      currentH = iH,
      k = 1; // 包裹住图片时的缩放比例

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
  }

  private setPreview(resetCoordinate: boolean = true) {
    const cropper = this._cropper;
    //判断是否已经有了预览区
    if (this._hasPreview) {
      const [w, h] = [this._width, this._height];

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

      this._previewList.forEach(p => {
        Object.assign(p.canvas, {
          width: cropper.width * p.scale,
          height: cropper.height * p.scale
        });
      });
    }
  }

  public setCropper(width: number, height: number, resetCoordinate: boolean = true) {
    Object.assign(this._cropper, {
      width: width,
      height: height
    });
    this.setPreview(resetCoordinate);
    this.draw();
  }

  //
  public crop(): HTMLCanvasElement {
    if (!this._image.element) {
      console.error('请添加一张图片');
      return;
    }

    this._ctx.clearRect(0, 0, this._width, this._height);

    this.fillImage();

    const data = this.getCropperData();
    if (data) {
      const canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
      Object.assign(canvas, {
        width: this._cropper.width,
        height: this._cropper.height
      });
      ctx.putImageData(data.imageData, data.offsetX, data.offsetY);
      this.draw();
      return canvas;
    }
  }
}
