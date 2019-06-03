var N = 64;
var scaleFactor = 10;
var linearSolveIterations = 4;

function Fluid(dt, diff, visc) {
    this.size = N;
    this.dt = dt;
    this.diff = diff;
    this.visc = visc;

    this.currDensity = new Array(N * N);
    this.nextDensity = new Array(N * N);

    this.nextVelocityX = new Array(N * N);
    this.nextVelocityY = new Array(N * N);

    this.currVelocityX = new Array(N * N);
    this.currVelocityY = new Array(N * N);

    for (let i = 0; i < N*N; i++){
        this.currDensity[i] = 0;
        this.nextDensity[i] = 0;
        this.nextVelocityX[i] = 0;
        this.nextVelocityY[i] = 0;
        this.currVelocityX[i] = 0;
        this.currVelocityY[i] = 0;
    }
}

Fluid.prototype.timeStep = function () {
    let visc = this.visc;
    let diff = this.diff;
    let dt = this.dt;
    let nextVelocityX = this.nextVelocityX;
    let nextVelocityY = this.nextVelocityY;
    let currVelocityX = this.currVelocityX;
    let currVelocityY = this.currVelocityY;
    let currDensity = this.currDensity;
    let nextDensity = this.nextDensity;

    diffuse(1, currVelocityX, nextVelocityX, visc, dt);
    diffuse(2, currVelocityY, nextVelocityY, visc, dt);

    project(currVelocityX, currVelocityY, nextVelocityX, nextVelocityY);

    advect(1, nextVelocityX, currVelocityX, currVelocityX, currVelocityY, dt);
    advect(2, nextVelocityY, currVelocityY, currVelocityX, currVelocityY, dt);

    project(nextVelocityX, nextVelocityY, currVelocityX, currVelocityY);

    diffuse(0, currDensity, nextDensity, diff, dt);
    advect(0, nextDensity, currDensity, nextVelocityX, nextVelocityY, dt);
}

Fluid.prototype.addDensity = function (x, y, amount) {
    this.nextDensity[IX(x, y)] += amount;
}

Fluid.prototype.addVelocity = function (x, y, amountX, amountY) {
    this.nextVelocityX[IX(x, y)] += amountX;
    this.nextVelocityY[IX(x, y)] += amountY;
}

Fluid.prototype.renderDensity = function () {
    for (let i = 0; i < N; i++){
        for (let j = 0; j < N; j++){
            let x = i*scaleFactor;
            let y = j*scaleFactor;
            let d = this.nextDensity[IX(i, j)]
            fill(10,255,10, d);
            noStroke();
            square(x, y, scaleFactor);
        }
    }
}

Fluid.prototype.renderVelocity = function () {
    for (let i = 0; i < N; i++){
        for (let j = 0; j < N; j++){
            let x = i*scaleFactor+scaleFactor/2;
            let y = j*scaleFactor+scaleFactor/2;
            let vScale = 300;
            let nextVelocityX = this.nextVelocityX[IX(i, j)]*vScale;
            let nextVelocityY = this.nextVelocityY[IX(i, j)]*vScale;
            stroke(255,0,0);
            line(x, y, x+nextVelocityX, y+nextVelocityY);
        }
    }
}