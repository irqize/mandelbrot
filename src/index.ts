import { Mandelbrot } from './Mandelbrot';

const canvas: HTMLCanvasElement = document.createElement('canvas');
const loadingScreen: HTMLElement = document.getElementById('loadingScreenBackground');

const mandelbrot : Mandelbrot = new Mandelbrot(canvas, loadingScreen);
mandelbrot.resize(window.innerWidth, window.innerHeight);

window.onresize = () => {
    mandelbrot.resize(window.innerWidth, window.innerHeight);
};

document.body.appendChild(canvas);