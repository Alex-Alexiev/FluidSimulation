function setup() {
    createCanvas(N * scaleFactor, N * scaleFactor);
    fluid = new Fluid(0.4, 0, 0);
}

function draw() {
    background(10, 10, 255);
    fluid.timeStep();
    fluid.renderDensity();
    if (document.querySelectorAll("#velocityCheckbox")[0].checked) {
        fluid.renderVelocity();
    }
}

function mouseDragged() {
    fluid.addDensity(mouseX / scaleFactor, mouseY / scaleFactor, 500);
    let vScale = 0.03;
    fluid.addVelocity(mouseX / scaleFactor, mouseY / scaleFactor, (mouseX - pmouseX) * vScale, (mouseY - pmouseY) * vScale);
}
