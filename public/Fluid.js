var N = 64;
var scaleFactor = 10;
var linearSolveIterations = 4;

function Fluid(dt, diff, visc) {
    this.size = N;
    this.dt = dt;
    this.diff = diff;
    this.visc = visc;

    this.s = new Array(N * N);
    this.density = new Array(N * N);

    this.Vx = new Array(N * N);
    this.Vy = new Array(N * N);

    this.Vx0 = new Array(N * N);
    this.Vy0 = new Array(N * N);

    for (let i = 0; i < N*N; i++){
        this.s[i] = 0;
        this.density[i] = 0;
        this.Vx[i] = 0;
        this.Vy[i] = 0;
        this.Vx0[i] = 0;
        this.Vy0[i] = 0;
    }
}

Fluid.prototype.timeStep = function () {
    let visc = this.visc;
    let diff = this.diff;
    let dt = this.dt;
    let Vx = this.Vx;
    let Vy = this.Vy;
    let Vx0 = this.Vx0;
    let Vy0 = this.Vy0;
    let s = this.s;
    let density = this.density;

    diffuse(1, Vx0, Vx, visc, dt);
    diffuse(2, Vy0, Vy, visc, dt);

    project(Vx0, Vy0, Vx, Vy);

    advect(1, Vx, Vx0, Vx0, Vy0, dt);
    advect(2, Vy, Vy0, Vx0, Vy0, dt);

    project(Vx, Vy, Vx0, Vy0);

    diffuse(0, s, density, diff, dt);
    advect(0, density, s, Vx, Vy, dt);
}

Fluid.prototype.addDensity = function (x, y, amount) {
    this.density[IX(x, y)] += amount;
}

Fluid.prototype.addVelocity = function (x, y, amountX, amountY) {
    this.Vx[IX(x, y)] += amountX;
    this.Vy[IX(x, y)] += amountY;
}

Fluid.prototype.renderDensity = function () {
    for (let i = 0; i < N; i++){
        for (let j = 0; j < N; j++){
            let x = i*scaleFactor;
            let y = j*scaleFactor;
            let d = this.density[IX(i, j)]
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
            let Vx = this.Vx[IX(i, j)]*vScale;
            let Vy = this.Vy[IX(i, j)]*vScale;
            stroke(255,0,0);
            line(x, y, x+Vx, y+Vy);
        }
    }
}