"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import * as defaultImage from 
var downloadCount = 0;
var container = document.querySelector('#cropper'), preview = document.querySelectorAll('.preview'), fileInput = document.querySelector('#file'), pick = document.querySelector('#pick-file'), setCropper = document.querySelector('#set-cropper'), widthInput = setCropper.querySelector('[name="width"]'), heightInput = setCropper.querySelector('[name="height"]'), setBtn = document.querySelector('#set-btn'), cropBtn = document.querySelector('#crop-btn'), download = document.createElement('a');
var w = 700, h = 450;

