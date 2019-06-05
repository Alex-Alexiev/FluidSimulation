function setup() {
    createCanvas(gridWidth * scaleFactor, gridWidth * scaleFactor);
    let diffusionRate = document.querySelectorAll("#diffusionRate")[0].value;
    let viscosity = document.querySelectorAll("#viscosity")[0].value
    fluid = new Fluid(0.3, diffusionRate, viscosity);
}

function draw() {
    background(10, 10, 255);
    fluid.setConstants(
        document.querySelectorAll("#diffusionRate")[0].value,
        document.querySelectorAll("#viscosity")[0].value);
    fluid.takeStep();
    fluid.renderDensity();
    if (document.querySelectorAll("#velocityCheckbox")[0].checked) {
        fluid.renderVelocity();
    }
}

/*
when the mouse is dragged add dye to the current location
and add velocity in the direction of the vector of 
the current mouse position minus the previous mouse position
*/
function mouseDragged() {
    fluid.addDye(mouseX / scaleFactor, mouseY / scaleFactor, 1000);
    let vScale = 0.03;
    fluid.addVelocity(mouseX / scaleFactor, mouseY / scaleFactor, (mouseX - pmouseX) * vScale, (mouseY - pmouseY) * vScale);
}

function setConstants() {

}