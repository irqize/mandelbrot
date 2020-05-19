const worker: Worker = self as any;

// Respond to message from parent thread
worker.onmessage = (ev: MessageEvent) => {
    const {cords, startY, endY, width, height, iterations} = ev.data;

    worker.postMessage(
        mandelbrot(cords, startY, endY, width, height, iterations)
    );
};

interface Cords{
    xFrom: number,
    xTo: number,
    yFrom: number,
    yTo: number
}

function mandelbrot(cords: Cords, startY: number, endY: number, width: number, height: number, iterations: number){
    const array: Uint8ClampedArray = new Uint8ClampedArray(width * 4 * (endY - startY));
    
    for (let iy = startY; iy < endY; ++iy) {
        for (let ix = 0; ix < width; ++ix) {
            const x = cords.xFrom + (cords.xTo - cords.xFrom) * ix / (width - 1);
            const y = cords.yFrom + (cords.yTo - cords.yFrom) * iy / (height - 1);
            const i = mandelbrotIteration(x, y, iterations);
            const arrayPos = 4 * (width * (iy - startY) + ix);
    
            if (i > iterations) {
                array[arrayPos] = 0;
                array[arrayPos + 1] = 0;
                array[arrayPos + 2] = 0;
            } else {
                var c = 3 * Math.log(i) / Math.log(iterations - 1.0);
    
                if (c < 1) {
                    array[arrayPos] = 255 * c;
                    array[arrayPos + 1] = 0;
                    array[arrayPos + 2] = 0;
                }
                else if (c < 2) {
                    array[arrayPos] = 255;
                    array[arrayPos + 1] = 255 * (c - 1);
                    array[arrayPos + 2] = 0;
                } else {
                    array[arrayPos] = 255;
                    array[arrayPos + 1] = 255;
                    array[arrayPos + 2] = 255 * (c - 2);
                }
            }
            array[arrayPos + 3] = 255;
        } 
    }

    return array;
}


function mandelbrotIteration(cx: number, cy: number, iterations: number){
    let x = 0.0;
    let y = 0.0;
    let xx = 0;
    let yy = 0;
    let xy = 0;
   
    let i = iterations;
    while (i-- && (4 >= xx + yy)){
      xy = x * y;
      xx = x * x;
      yy = y * y;
      x = xx - yy + cx;
      y = xy + xy + cy;
    }

    return iterations - i;
}