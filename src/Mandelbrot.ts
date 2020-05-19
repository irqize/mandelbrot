import * as dat from 'dat.gui';
import RenderWorker from "worker-loader?name=dist/[name].js!./RenderWorker";

const scrollInRatio = .90;
const scrollOutRatio = 1.1

interface MousePos {
    x: number,
    y: number
}

export class Mandelbrot {
    canvas: HTMLCanvasElement;
    loadingScreen: HTMLElement;

    cords: {
        xFrom: number,
        xTo: number,
        yFrom: number,
        yTo: number
    } = {
            xFrom: -2,
            xTo: 1,
            yFrom: -1,
            yTo: 1
        };

    mousePos: MousePos = {
        x: 0,
        y: 0
    };

    wheelTimeoutId: number = 0;

    iterations: number = 5000;

    isDragging: boolean = false;
    draggedFromPos: MousePos = {
        x: 0,
        y: 0
    };

    constructor(canvas: HTMLCanvasElement, loadingScreeen: HTMLElement) {
        this.canvas = canvas;
        this.loadingScreen = loadingScreeen;

        this.initEventHandlers();

        const gui: dat.GUI = new dat.GUI();
        gui.add(this, 'iterations', 0, 20000)

    }


    applyAspectRatio() {
        const ratio: number = window.innerHeight / window.innerWidth;

        const oldHeight: number = this.cords.yTo - this.cords.yFrom;
        const newHeight: number = (this.cords.xTo - this.cords.xFrom) * ratio;

        this.cords.yFrom -= (newHeight - oldHeight) / 2;
        this.cords.yTo += (newHeight - oldHeight) / 2;
    }


    private initEventHandlers() {
        this.canvas.onmousemove = (event: MouseEvent) => {
            this.mousePos.x = event.offsetX;
            this.mousePos.y = event.offsetY;
        }

        this.canvas.onwheel = (event: WheelEvent) => {
            if (event.deltaY < 0) {
                this.scrollUp();
            } else {
                this.scrollDown();
            }
        }

        this.canvas.onmousedown = (event: MouseEvent) => {
            this.isDragging = true;
            this.draggedFromPos.x = event.offsetX;
            this.draggedFromPos.y = event.offsetY;
        }

        this.canvas.onmouseup = (event: MouseEvent) => {
            if (!this.isDragging) return;

            this.drag((event.offsetX - this.draggedFromPos.x) / window.innerWidth, (event.offsetY - this.draggedFromPos.y) / window.innerHeight);
        }

        this.canvas.onmouseleave = (_) => {
            this.isDragging = false;
        }
    }

    private drag(deltaX: number, deltaY: number) {
        const width: number = this.cords.xTo - this.cords.xFrom;
        const height: number = this.cords.yTo - this.cords.yFrom;

        this.cords.xFrom -= width * deltaX;
        this.cords.xTo -= width * deltaX;

        this.cords.yFrom -= height * deltaY;
        this.cords.yTo -= height * deltaY;

        this.render();
    }

    private scrollUp() {
        const oldWidth: number = this.cords.xTo - this.cords.xFrom;
        const newWidth: number = (this.cords.xTo - this.cords.xFrom) * scrollInRatio;

        const mouseXPos = this.mousePos.x / this.canvas.width;

        this.cords.xFrom -= (newWidth - oldWidth) * mouseXPos;
        this.cords.xTo += (newWidth - oldWidth) * (1 - mouseXPos);

        const ratio: number = window.innerHeight / window.innerWidth;

        const oldHeight: number = this.cords.yTo - this.cords.yFrom;
        const newHeight: number = (this.cords.xTo - this.cords.xFrom) * ratio;

        const mouseYPos = this.mousePos.y / this.canvas.height;

        this.cords.yFrom -= (newHeight - oldHeight) * mouseYPos;
        this.cords.yTo += (newHeight - oldHeight) * (1 - mouseYPos);



        if (this.wheelTimeoutId) {
            clearTimeout(this.wheelTimeoutId);
        }

        this.wheelTimeoutId = window.setTimeout(() => {
            this.render();
            this.wheelTimeoutId = 0;
        }, 300);
    }

    private scrollDown() {
        const oldWidth: number = this.cords.xTo - this.cords.xFrom;
        const newWidth: number = (this.cords.xTo - this.cords.xFrom) * scrollOutRatio;

        const mouseXPos = this.mousePos.x / this.canvas.width;

        this.cords.xFrom -= (newWidth - oldWidth) * mouseXPos;
        this.cords.xTo += (newWidth - oldWidth) / 2;

        this.applyAspectRatio();

        this.render();

        if (this.wheelTimeoutId) {
            clearTimeout(this.wheelTimeoutId);
        }

        this.wheelTimeoutId = window.setTimeout(() => {
            this.render();
            this.wheelTimeoutId = 0;
        }, 150);
    }


    resize(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.applyAspectRatio();
        this.render();

    }

    render() {
        this.loadingScreen.style.display = 'flex';
        console.log('Started rendering..')

        const width: number = this.canvas.width;
        const height: number = this.canvas.height;

        const ctx: CanvasRenderingContext2D = this.canvas.getContext('2d');
        const imageData: ImageData = ctx.getImageData(0, 0, width, height);
        const imageDataArray: Uint8ClampedArray = imageData.data;

        const workersNumber: number = window.navigator.hardwareConcurrency;
        let doneWorkers = 0;

        let startY: number = 0, endY: number = 0;


        for (let i = 0; i < workersNumber; i++) {
            const worker = new RenderWorker();

            startY = endY;
            endY = startY + Math.floor(height / workersNumber);
            if (i + 1 == workersNumber) endY = height + 1;

            worker.postMessage({
                cords: this.cords,
                startY,
                endY,
                width,
                height,
                iterations: this.iterations
            });
            let arrayBasePos: number = startY * width * 4;

            worker.onmessage = (event) => {
                doneWorkers++;

                for (let i = 0; i < event.data.length; i++) {
                    imageDataArray[arrayBasePos + i] = event.data[i];
                }
                worker.terminate();

                if (doneWorkers == workersNumber) {
                    ctx.putImageData(imageData, 0, 0);
                    console.log('Rendering finished..');
                    this.loadingScreen.style.display = 'none';
                }
            }
        }
    }
}