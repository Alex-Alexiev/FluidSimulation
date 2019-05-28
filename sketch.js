function setup() {
    createCanvas(N * scaleFactor, N * scaleFactor);
    fluid = new Fluid(0.1, 0, 0);
}

function draw() {
    background(10,10,255);
    fluid.timeStep();
    fluid.renderDensity();
}

function mouseDragged() {
    fluid.addDensity(mouseX / scaleFactor, mouseY / scaleFactor, 300);
    fluid.addVelocity(mouseX / scaleFactor, mouseY / scaleFactor, Math.random(), Math.random());

}