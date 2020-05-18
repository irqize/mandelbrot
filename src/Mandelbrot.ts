import * as dat from 'dat.gui';
const scrollInRatio = .90;
const scrollOutRatio = 1.1

interface MousePos{
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

    mousePos: MousePos  = {
        x: 0,
        y: 0
    };

    wheelTimeoutId : number = 0;

    iterations: number = 1000;

    isDragging: boolean = false;
    draggedFromPos: MousePos = {
        x : 0,
        y : 0
    };

    constructor(canvas: HTMLCanvasElement, loadingScreeen: HTMLElement) {
        this.canvas = canvas;
        this.loadingScreen = loadingScreeen;

        this.initEventHandlers();

        const gui: dat.GUI = new dat.GUI();
        gui.add(this, 'iterations', 0, 10000)

    }


    applyAspectRatio() {
        const ratio: number = window.innerHeight / window.innerWidth;

        const oldHeight: number = this.cords.yTo - this.cords.yFrom;
        const newHeight: number = (this.cords.xTo - this.cords.xFrom) * ratio;

        this.cords.yFrom -= (newHeight - oldHeight) / 2;
        this.cords.yTo += (newHeight - oldHeight) / 2;
    }


    initEventHandlers() {
        this.canvas.onmousemove = (event: MouseEvent) => {
            this.mousePos.x = event.offsetX;
            this.mousePos.y = event.offsetY;
        }

        this.canvas.onwheel = (event: WheelEvent) => {
            if(event.deltaY < 0){
                this.scrollUp();
            }else{
                this.scrollDown();
            }
        }

        this.canvas.onmousedown = (event: MouseEvent) => {
            this.isDragging = true;
            this.draggedFromPos.x = event.offsetX;
            this.draggedFromPos.y = event.offsetY;
        }

        this.canvas.onmouseup = (event: MouseEvent) => {
            if(!this.isDragging) return;

            this.drag((event.offsetX - this.draggedFromPos.x)/window.innerWidth, (event.offsetY - this.draggedFromPos.y)/window.innerHeight);
        }

        this.canvas.onmouseleave = (_) => {
            this.isDragging = false;
        }
    }

    drag(deltaX: number, deltaY: number){
        const width: number = this.cords.xTo - this.cords.xFrom;
        const height: number = this.cords.yTo - this.cords.yFrom;

        this.cords.xFrom -= width * deltaX;
        this.cords.xTo -= width * deltaX;

        this.cords.yFrom -= height * deltaY;
        this.cords.yTo -= height * deltaY;

        console.log(this.cords);

        this.render();
    }

    scrollUp(){
        const oldWidth: number = this.cords.xTo - this.cords.xFrom;
        const newWidth: number = (this.cords.xTo - this.cords.xFrom) * scrollInRatio;

        const mouseXPos = this.mousePos.x / this.canvas.width;

        this.cords.xFrom -= (newWidth - oldWidth) * mouseXPos;
        this.cords.xTo += (newWidth - oldWidth) * (1 - mouseXPos);

        const ratio: number = window.innerHeight / window.innerWidth;

        const oldHeight: number = this.cords.yTo - this.cords.yFrom;
        const newHeight: number = (this.cords.xTo - this.cords.xFrom) * ratio;

        const mouseYPos = this.mousePos.y  / this.canvas.height;

        this.cords.yFrom -= (newHeight - oldHeight) * mouseYPos;
        this.cords.yTo += (newHeight - oldHeight) * (1 - mouseYPos);

        

        if(this.wheelTimeoutId){
            clearTimeout(this.wheelTimeoutId);
        }

        this.wheelTimeoutId = window.setTimeout(() => {
            console.log(this.cords);
            this.render();
            this.wheelTimeoutId = 0;
        }, 300);
    }

    scrollDown(){
        const oldWidth: number = this.cords.xTo - this.cords.xFrom;
        const newWidth: number = (this.cords.xTo - this.cords.xFrom) * scrollOutRatio;

        const mouseXPos = this.mousePos.x / this.canvas.width;

        this.cords.xFrom -= (newWidth - oldWidth) * mouseXPos;
        this.cords.xTo += (newWidth - oldWidth) / 2;

        this.applyAspectRatio();

        this.render();

        if(this.wheelTimeoutId){
            clearTimeout(this.wheelTimeoutId);
        }

        this.wheelTimeoutId = window.setTimeout(() => {
            this.render();
            this.wheelTimeoutId = 0;
        }, 150);
    }


    resize(width: number, height: number) {
        
        console.log(this.loadingScreen);
        this.canvas.width = width;
        this.canvas.height = height;
        this.applyAspectRatio();
        this.render();
        
    }

    render() {
        this.loadingScreen.style.display = 'flex';
        console.log('Started rendering..') 
        //Timeout to let dom update and show the loading screen
        setTimeout(()=>{
            const width: number = this.canvas.width;
            const height: number = this.canvas.height;
    
            const ctx : CanvasRenderingContext2D = this.canvas.getContext('2d');
            const imageData : ImageData = ctx.getImageData(0, 0, width, height);
            const imageDataArray : Uint8ClampedArray = imageData.data;
    
            for (let ix = 0; ix < width; ++ix) {
                for (let iy = 0; iy < height; ++iy) {
                    const x = this.cords.xFrom + (this.cords.xTo - this.cords.xFrom) * ix / (width - 1);
                    const y = this.cords.yFrom + (this.cords.yTo - this.cords.yFrom) * iy / (height - 1);
                    const i = this.mandelbrotIteration(x, y);
                    const arrayPos = 4 * (width * iy + ix);
    
                    if (i > this.iterations) {
                        imageDataArray[arrayPos] = 0;
                        imageDataArray[arrayPos + 1] = 0;
                        imageDataArray[arrayPos + 2] = 0;
                    } else {
                        var c = 3 * Math.log(i) / Math.log(this.iterations - 1.0);
    
                        if (c < 1) {
                            imageDataArray[arrayPos] = 255 * c;
                            imageDataArray[arrayPos + 1] = 0;
                            imageDataArray[arrayPos + 2] = 0;
                        }
                        else if (c < 2) {
                            imageDataArray[arrayPos] = 255;
                            imageDataArray[arrayPos + 1] = 255 * (c - 1);
                            imageDataArray[arrayPos + 2] = 0;
                        } else {
                            imageDataArray[arrayPos] = 255;
                            imageDataArray[arrayPos + 1] = 255;
                            imageDataArray[arrayPos + 2] = 255 * (c - 2);
                        }
                    }
                    imageDataArray[arrayPos + 3] = 255;
                }
                
            }
            
            ctx.putImageData(imageData, 0, 0);
            console.log('Rendering finished..');
            this.loadingScreen.style.display = 'none';
        }, 500);
        
        
    }

    private mandelbrotIteration(cx: number, cy: number): number{
            let x = 0.0;
            let y = 0.0;
            let xx = 0;
            let yy = 0;
            let xy = 0;
           
            let i = this.iterations;
            while (i-- && (4 >= xx + yy)){
              xy = x * y;
              xx = x * x;
              yy = y * y;
              x = xx - yy + cx;
              y = xy + xy + cy;
            }
            return this.iterations - i;
    }

}