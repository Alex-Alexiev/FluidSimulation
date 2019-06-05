/*
convert (x, y) coordinates into an index of a 1D array
*/
function IX(x, y) {
    x = Math.trunc(x);
    y = Math.trunc(y);
    return x + y * (gridWidth+2);
}

/*
diffuse using a given rate
uses the linear solve method below to approximate the value at each cell after diffusion
the constant for diffusion is calculated here based on the diffusion rate specified

the diffusion rate for velocity and dye is different
*/
function diffuse(b, x, x0, rate, timeStep) {
    let a = timeStep * rate * gridWidth * gridWidth;
    linearSolve(b, x, x0, a, 1 + 4 * a)
}

/*
This function diffuses the values in each cell to its neighbours 

This function uses the guass-siedel linear equation solution approximation method
https://www.youtube.com/watch?v=F6J3ZmXkMj0
The video above walks through a simple example.

In this method, the form of the equation being solved is
x = x0 + a(x1 + x2 + x3 + x4 - 4*x)
where x0 is the previous value, x is the current cell value, and its value is equal to the sum
of all the cells adjacent to it (x1, x2, x3, x4) minus 4 times the value of itself because
it gives its value to those adjacent cells aswell. a is a constant of diffusion 

isolating x yields
x = (x0 + a(x1 + x2 + x3 + x4))/(1+4a)

according to the gauss-siedel method, by iterating over this, each time calculating this value
for each cell, and its cooresponding neighbours, we will eventually reach an approximate solution 
for each cell (x)
*/
function linearSolve(b, x, x0, a, c) {
    for (let k = 0; k < linearSolveIterations; k++) {
        for (let j = 1; j <= gridWidth; j++) {
            for (let i = 1; i <= gridWidth; i++) {
                x[IX(i, j)] = (x0[IX(i, j)] + a * (x[IX(i + 1, j)] + x[IX(i - 1, j)] + x[IX(i, j + 1)] + x[IX(i, j - 1)])) / c;
            }
        }
    }
    setBounds(b, x);
}

/*
After all the advection and diffusion steps it is very unlikely that the approximations followed conservation of mass

To do this i use a Hodge Decomposition. It states that every field is the sum of a field that conserves mass and 
(in our case) the gradient field of the current velocities (shows the slope of the velocity at a given point)

Therefore the mass conserving field is equal to the current velocity field minus the gradient field of the current velocities
*/
function project(velocX, velocY, p, div) {
    //div is a normalized velocity field with values between 0 and 1 
    for (let j = 1; j <= gridWidth; j++) {
        for (let i = 1; i <= gridWidth; i++) {
            div[IX(i, j)] = -0.5 * (velocX[IX(i + 1, j)] - velocX[IX(i - 1, j)] + velocY[IX(i, j + 1)] - velocY[IX(i, j - 1)]) / gridWidth;
            p[IX(i, j)] = 0;
        }
    }
    setBounds(0, div);
    setBounds(0, p);
    //the same solve method used above can be used to calculate the gradient field p 
    linearSolve(0, p, div, 1, 4);
    //subtract the gradient field p from the current velocity field and assign that to the current velocity field 
    for (let j = 1; j <= gridWidth; j++) {
        for (let i = 1; i <= gridWidth; i++) {
            velocX[IX(i, j)] -= 0.5 * (p[IX(i + 1, j)] - p[IX(i - 1, j)]) * gridWidth;
            velocY[IX(i, j)] -= 0.5 * (p[IX(i, j + 1)] - p[IX(i, j - 1)]) * gridWidth;
        }
    }
    setBounds(1, velocX);
    setBounds(2, velocY);
}

/*
Advection is the process that actually moves the smoke particles through the velociy field
To calculate the density at a given cell, i will look at where that cell would be 
if it was traced back in time for one timeStep

to do this I multiply the timeStep by the negative velocity at that cell then add it to 
the cells current location

The density of the given cell is then assigned the value of the density of the backtraced cell
*/
function advect(b, nextDensity, currDensity, velocX, velocY, timeStep) {
    let backTraceXCoord0, backTraceXCoord1, backTraceYCoord0, backTraceYCoord1;

    let timeStepx = timeStep * gridWidth;
    let timeStepy = timeStep * gridWidth;

    let xOffsetRight, xOffsetLeft, yOffsetBottom, yOffsetTop;
    let backTraceXCoord, backTraceYCoord;

    for (let j = 1; j <= gridWidth; j++) {
        for (let i = 1; i <= gridWidth; i++) {
            backTraceXCoord = i - timeStepx * velocX[IX(i, j)];
            backTraceYCoord = j - timeStepy * velocY[IX(i, j)];

            //boundary checking
            if (backTraceXCoord < 0.5) backTraceXCoord = 0.5;
            if (backTraceXCoord > gridWidth + 0.5) backTraceXCoord = gridWidth + 0.5;

            backTraceXCoord0 = Math.floor(backTraceXCoord);
            backTraceXCoord1 = backTraceXCoord0 + 1.0;

            //boundary checking
            if (backTraceYCoord < 0.5) backTraceYCoord = 0.5;
            if (backTraceYCoord > gridWidth + 0.5) backTraceYCoord = gridWidth + 0.5;

            backTraceYCoord0 = Math.floor(backTraceYCoord);
            backTraceYCoord1 = backTraceYCoord0 + 1.0;

            /*
            this calculates how much the floating point backtraced point is away
            from its two nearest neighbours on the left and right, and top and bottom
            this will be used later to find the average of the densities of the 4 nearest cells
            to the exact backtraced coordinates
            */
            xOffsetLeft = backTraceXCoord - backTraceXCoord0;
            xOffsetRight = 1.0 - xOffsetLeft;
            yOffsetTop = backTraceYCoord - backTraceYCoord0;
            yOffsetBottom = 1.0 - yOffsetTop;

            /*
            assign the density at the current spot to the density at the spot that was backtraced in the time step
            since the backtracing calculates a floating point value, use the offsets to find the weighted average 
            of the 4 adjacent cells to the actual backtrace coordinates then assign that to the current cell
            */
            nextDensity[IX(i, j)] =
                xOffsetRight * (yOffsetBottom * currDensity[IX(backTraceXCoord0, backTraceYCoord0)] + yOffsetTop * currDensity[IX(backTraceXCoord0, backTraceYCoord1)]) +
                xOffsetLeft * (yOffsetBottom * currDensity[IX(backTraceXCoord1, backTraceYCoord0)] + yOffsetTop * currDensity[IX(backTraceXCoord1, backTraceYCoord1)]);
        }
    }
    setBounds(b, nextDensity);
}

/*
an arbitrary boudary condition which treates the boundaries as solid walls
if b == 1 then we are dealing with x values and they will be reflected 
if b == 2 then we are dealing with y values and they will be reflected 

otherwise just set the outer layer to each cell's inward adjacent cell 

*/
function setBounds(b, x) {
    for (let i = 1; i <= gridWidth; i++) {
        //deal with x values
        x[IX(0, i)] = b == 1 ? -x[IX(1, i)] : x[IX(1, i)];
        x[IX(gridWidth + 1, i)] = b == 1 ? -x[IX(gridWidth, i)] : x[IX(gridWidth, i)];
        //deal with y values 
        x[IX(i, 0)] = b == 2 ? -x[IX(i, 1)] : x[IX(i, 1)];
        x[IX(i, gridWidth + 1)] = b == 2 ? -x[IX(i, gridWidth)] : x[IX(i, gridWidth)];
    }

    //make the corner values the average of the two adjacent cells 
    x[IX(0, 0)] = 0.5 * (x[IX(1, 0)] + x[IX(0, 1)]);
    x[IX(0, gridWidth - 1)] = 0.5 * (x[IX(1, gridWidth - 1)] + x[IX(0, gridWidth - 1)]);
    x[IX(gridWidth - 1, 0)] = 0.5 * (x[IX(gridWidth - 1, 0)] + x[IX(gridWidth - 1, 1)]);
    x[IX(gridWidth - 1, gridWidth - 1)] = 0.5 * (x[IX(gridWidth - 1, gridWidth - 1)] + x[IX(gridWidth - 1, gridWidth - 1)]);
}