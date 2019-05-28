function setup() {
    createCanvas(N * scaleFactor, N * scaleFactor);
    fluid = new Fluid(0.4, 0, 0);
}

function draw() {
    background(10,10,255);
    fluid.timeStep();
    fluid.renderDensity();
    fluid.renderVelocity();
    if (keyIsPressed && key == 'd') {
        fluid.addDensity(mouseX / scaleFactor, mouseY / scaleFactor, 1000);
    }
}

function mouseDragged() {
    fluid.addDensity(mouseX / scaleFactor, mouseY / scaleFactor, 1000);
    let vScale = 0.03;
    fluid.addVelocity(mouseX / scaleFactor, mouseY / scaleFactor, (mouseX-pmouseX)*vScale, (mouseY - pmouseY)*vScale);
}

function keyTyped() {
    if (keyCode === 68) {
        fluid.addDensity(mouseX / scaleFactor, mouseY / scaleFactor, 1000);
    }
  }
