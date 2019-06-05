var gridWidth = 64;
var scaleFactor = 10;
var linearSolveIterations = 10;

function Fluid(timeStep, dyeDiffusionRate, viscosity) {
    size = (gridWidth+2)*(gridWidth+2);
    this.timeStep = timeStep;
    this.dyeDiffusionRate = dyeDiffusionRate;
    this.viscosity = viscosity;

    this.currDensity = new Array(size);
    this.nextDensity = new Array(size);

    this.nextVelocityX = new Array(size);
    this.nextVelocityY = new Array(size);

    this.currVelocityX = new Array(size);
    this.currVelocityY = new Array(size);

    for (let i = 0; i < size; i++){
        this.currDensity[i] = 0;
        this.nextDensity[i] = 0;
        this.nextVelocityX[i] = 0;
        this.nextVelocityY[i] = 0;
        this.currVelocityX[i] = 0;
        this.currVelocityY[i] = 0;
    }
}

/*
each grid in the gridWidth*gridWidth size grid has its own velocity and density. 
The velocity represents how fast the velcity of the fluid at that point, 
and is shown by the red arrows in the simulation. The density isn't the density of the fluid, 
but is the amout of dye in the fluid at that point. If there were no dye, you could not see 
the clear fluid being moved by the velocity. 

In each step, the velocity field evolves based on the current state, and force components. 
Since there are no forces acting in the fluid, i ignored that term of the equation.
The precise evolution of the velocity field is described by the Navier-Stokes partially 
differential equations 

The dye is assumed to have a near zero mass (like smoke particles), and can thus be
thought of as being pushed around by the velocity field without affecting the velocity field
The movement of the dye is also modeled by the Navier-Stokes partially differential equations

The steps to solving these equations are include diffusion, projection, and advection, 
which are described in the FluidHelpers.js file
*/
Fluid.prototype.takeStep = function () {
    /*
    diffuse the velocities
    */
    diffuse(1, this.currVelocityX, this.nextVelocityX, this.viscosity, this.timeStep);
    diffuse(2, this.currVelocityY, this.nextVelocityY, this.viscosity, this.timeStep);

    /*
    correct to satisfy conservation of mass
    */
    project(this.currVelocityX, this.currVelocityY, this.nextVelocityX, this.nextVelocityY);

    /*
    advecting the velocities is essentially saying that the velocity field move along itself
    */
    advect(1, this.nextVelocityX, this.currVelocityX, this.currVelocityX, this.currVelocityY, this.timeStep);
    advect(2, this.nextVelocityY, this.currVelocityY, this.currVelocityX, this.currVelocityY, this.timeStep);

    /*
    correct to satisfy conservation of mass
    */
    project(this.nextVelocityX, this.nextVelocityY, this.currVelocityX, this.currVelocityY);

    /*
    diffuse the dye
    */
    diffuse(0, this.currDensity, this.nextDensity, this.dyeDiffusionRate, this.timeStep);
    /*
    advect the dye, make it follow the velocity field
    */
    advect(0, this.nextDensity, this.currDensity, this.nextVelocityX, this.nextVelocityY, this.timeStep);
}

Fluid.prototype.addDye = function (x, y, amount) {
    this.nextDensity[IX(x, y)] += amount;
}

Fluid.prototype.addVelocity = function (x, y, amountX, amountY) {
    this.nextVelocityX[IX(x, y)] += amountX;
    this.nextVelocityY[IX(x, y)] += amountY;
}

/*
make each grid square green with the transpareny determined by the density
*/
Fluid.prototype.renderDensity = function () {
    for (let i = 0; i < gridWidth; i++){
        for (let j = 0; j < gridWidth; j++){
            let x = i*scaleFactor;
            let y = j*scaleFactor;
            let d = this.nextDensity[IX(i, j)]
            fill(10,255,10, d);
            noStroke();
            square(x, y, scaleFactor);
        }
    }
}

/*
draw an arrow in each grid pointing in the direciton of the velocity of the fluid
the magnitude of the arrows shows their relative magnitudes 
*/
Fluid.prototype.renderVelocity = function () {
    for (let i = 0; i < gridWidth; i++){
        for (let j = 0; j < gridWidth; j++){
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

Fluid.prototype.setConstants = function (diffusionRate, viscosity){
    this.dyeDiffusionRate = diffusionRate;
    this.viscosity = viscosity;
}