# Mandelbrot Set Plotter
App generates visual representation of the Mandelbrot Set.
It uses escape time algorithm to generate value for each pixel.
It's implemented in vanilla Javascript and uses WebWorkers for multithreading.
If rendering images takes very long time consider lowering the resolution of the window or number of iterations (can be changed with slider in the top right corner). 
After zooming in a lot image may become pixelated as Javascript's floating point numbers' precision may be not enough to perform exact calculations anymore.
App can be previed here - [https://irqize.github.io/mandelbrot/](https://irqize.github.io/mandelbrot/).
## Installation
After cloning the repository run ```npm install``` to install required dependencies. Then run ```npm start``` to start development server or if you just want to compile the source type ```npm run compile``` command.
