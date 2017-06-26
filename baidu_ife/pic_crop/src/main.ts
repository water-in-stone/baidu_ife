import { Cropper } from './my_cropper';

let downloadCount = 0;

const container = document.querySelector('#cropper') as HTMLElement;
const previews = document.querySelectorAll('.preview');
const fileInput = document.querySelector('#file') as HTMLInputElement;
const pick = document.querySelector('#pick-file') as HTMLElement;
const setCropper = document.querySelector('#set-cropper') as HTMLElement;
const widthInput = setCropper.querySelector('[name="width"]') as HTMLInputElement;
const heightInput = setCropper.querySelector('[name="height"]') as HTMLInputElement;
const setBtn = document.querySelector('#set-btn');
const cropBtn = document.querySelector('#crop-btn');
const download = document.createElement('a');

//canvas画布的初始宽高
const w = 700;
const h = 450;

const cropper = new Cropper(container, {
  previews: Array.prototype.map.call(previews, (el: HTMLElement, index: number) => {
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
fileInput.addEventListener('change', (e) => {
  const el = e.target as HTMLInputElement;
  if (el.files.length < 1 || el.value === '') {
    return;
  }

  const file = el.files[0]
  if (file.type.match(/^image\/.+/)) {
    cropper.setImage(file);
    pick.innerHTML = file.name;
  } else {
    window.alert('请选择正确的图片!');
  }
});

// 纠正用户输入
setCropper.addEventListener('change', (e) => {
  const el = e.target as HTMLInputElement;
  if (el.tagName.toLowerCase() === 'input') {
    const val = +el.value;
    const max = +el.getAttribute('max');
    const min = +el.getAttribute('mix');

    if (val > max) {
      el.value = '' + max;
    } else if (val < min) {
      el.value = '' + min;
    } else if (val === 0) {
      el.value = '';
    }
  }
});


// 点击设置按钮
setBtn.addEventListener('click', () => {
  const width = +widthInput.value,
    height = +heightInput.value;
  if (!width || !height) {
    return alert('请输入正确的宽高!');
  }
  cropper.setCropper(width, height);
});


// 点击裁剪按钮
cropBtn.addEventListener('click', () => {
  try {
    const canvas = cropper.crop();
    download.href = canvas.toDataURL();
    download.download = `cropper-${++downloadCount}.png`;
    download.click();
  } catch (e) {
    console.error(e);
    alert('不支持HTML5!');
  }
});