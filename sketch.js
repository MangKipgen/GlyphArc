let flexa, knockoutC, knockoutE, futuraB, robotoS;
let aArray;
let cg;
let pane;
let params = {
  text: "a/",
  fontSize: 350,
  sampleFactor: 0.25,
  strokeColor: "#000000",
  shapeColor: "#FFFFFF",
  bg: "#4830DA",
  strokeWeight: 1,
  strokeCap: "round",
  fontFamily: "KnockoutE.otf",
  noiseScale: 0.005,
  noiseStrength: 0,
  strokePattern: "solid",
};

// Load custom fonts
function preload() {
  flexa = loadFont("GTFlexa.otf");
  futuraB = loadFont("Future Bold.ttf");
  knockoutC = loadFont("KnockoutC.otf");
  knockoutE = loadFont("KnockoutE.otf");
  robotoS = loadFont("RobotoSlab-Black.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  cg = createGraphics(windowWidth, windowHeight); // for additional layer

  // Create Tweakpane
  pane = new Tweakpane.Pane();

  // Create folders for each group of options
  const textFolder = pane.addFolder({ title: "Text" });
  textFolder
    .addInput(params, "text", { maxLength: 10 })
    .on("change", updateLetter);
  textFolder
    .addInput(params, "fontFamily", {
      options: {
        FuturaB: "Future Bold.ttf",
        GTFlexa: "GTFlexa.otf",
        KnockoutC: "KnockoutC.otf",
        KnockoutE: "KnockoutE.otf",
        RobotoS: "RobotoSlab-Black.ttf",
      },
    })
    .on("change", updateLetter);
  textFolder
    .addInput(params, "fontSize", { min: 100, max: 1000, step: 10 })
    .on("change", updateLetter);
  textFolder
    .addInput(params, "sampleFactor", { min: 0.1, max: 1, step: 0.01 })
    .on("change", updateLetter);

  const colorFolder = pane.addFolder({ title: "Colors" });
  colorFolder.addInput(params, "strokeColor");
  colorFolder.addInput(params, "shapeColor");
  colorFolder.addInput(params, "bg");

  const strokeFolder = pane.addFolder({ title: "Stroke" });
  strokeFolder.addInput(params, "strokeWeight", {
    min: 0.1,
    max: 3,
    step: 0.1,
  });
  strokeFolder.addInput(params, "strokePattern", {
    options: { Solid: "solid", Dotted: "dotted", Dashed: "dashed" },
  });

  const displacementFolder = strokeFolder.addFolder({ title: "Displacement" });
  displacementFolder.addInput(params, "noiseScale", {
    min: 0.001,
    max: 0.1,
    step: 0.001,
    description: "Controls the scale of the noise field",
  });

  displacementFolder.addInput(params, "noiseStrength", {
    min: 0,
    max: 100,
    step: 1,
    description: "Controls the strength of the displacement",
  });

  // Add a button to reset to the default state
  pane.addButton({ title: "Reset to Default" }).on("click", resetToDefault);

  // Position the Tweakpane on the right side using CSS
  const style = document.createElement("style");
  style.innerHTML = `
    .tp-dfwv {
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 1000;
    }
  `;

  document.head.appendChild(style);

  updateLetter();
}

function updateLetter() {
  // Limit the input to 10 letters
  params.text = params.text.slice(0, 10);

  // Update the font size
  textSize(params.fontSize);

  // Set the font based on the selected fontFamily
  let selectedFont;
  switch (params.fontFamily) {
    case "GTFlexa.otf":
      selectedFont = flexa;
      break;
    case "KnockoutC.otf":
      selectedFont = knockoutC;
      break;
    case "KnockoutE.otf":
      selectedFont = knockoutE;
      break;
    case "Future Bold.ttf":
      selectedFont = futuraB;
      break;
    case "RobotoSlab-Black.ttf":
      selectedFont = robotoS;
      break;
  }

  // Changing custom text to outlines for manipulation. sampleFactor = resolution
  aArray = selectedFont.textToPoints(params.text, 0, 0, params.fontSize, {
    sampleFactor: params.sampleFactor,
  });

  // Center the letter
  centerLetter(selectedFont);
}

function centerLetter(font) {
  // Calculate the bounding box of the letter
  let bounds = font.textBounds(params.text, 0, 0, params.fontSize);
  // Calculate the center position
  let centerX = (width - bounds.w) / 2;
  let centerY = (height + bounds.h) / 2;
  // Translate the letter points to the center position
  for (let i = 0; i < aArray.length; i++) {
    aArray[i].x += centerX;
    aArray[i].y += centerY;
  }
}

function drawStrokePattern(x, y, w, h) {
  switch (params.strokePattern) {
    case "solid":
      rect(x, y, w, h);
      break;

    case "dotted":
      // Draw dotted pattern
      let dotSize = 5;
      let dotSpacing = 20;

      // Calculate the starting and ending coordinates based on the sign of w and h
      let dotStartX = w >= 0 ? x : x + w;
      let dotStartY = h >= 0 ? y : y + h;
      let dotEndX = w >= 0 ? x + w : x;
      let dotEndY = h >= 0 ? y + h : y;

      for (let dotX = dotStartX; dotX < dotEndX; dotX += dotSpacing) {
        for (let dotY = dotStartY; dotY < dotEndY; dotY += dotSpacing) {
          ellipse(dotX, dotY, dotSize, dotSize);
        }
      }
      break;

    case "dashed":
      // Draw dashed pattern
      let dashLength = 10;
      let dashSpacing = 5;
      let startX = x;
      let endX = x + w;
      let dashX = startX;

      if (w < 0) {
        startX = x + w;
        endX = x;
        dashX = startX;
      }

      while (dashX < endX) {
        let dashWidth = Math.min(dashLength, endX - dashX);
        rect(dashX, y, dashWidth, h);
        dashX += dashLength + dashSpacing;
      }
      break;
  }
}

function draw() {
  background(params.bg);

  for (let i = 0; i < aArray.length; i++) {
    let point = aArray[i];

    // Calculate the displacement based on Perlin noise
    let noiseValue = noise(
      point.x * params.noiseScale,
      point.y * params.noiseScale,
      frameCount * 0.01
    );
    let angle = noiseValue * TWO_PI;
    let displacement = p5.Vector.fromAngle(angle).mult(params.noiseStrength);

    // Calculate the width and height of the rectangle based on the mouse position
    let rectWidth = mouseX - width / 2;
    let rectHeight = mouseY - height / 2;

    // Calculate the position of the rectangle based on the center of the shape and displacement
    let rectX = point.x - rectWidth / 2 + displacement.x;
    let rectY = point.y - rectHeight / 2 + displacement.y;

    stroke(params.strokeColor);
    strokeWeight(params.strokeWeight);
    strokeCap(params.strokeCap);
    fill(params.shapeColor);

    drawStrokePattern(rectX, rectY, rectWidth, rectHeight);
  }
}

function resetToDefault() {
  // Reset all parameters to their default values
  params.text = "a/";
  params.fontSize = 350;
  params.sampleFactor = 0.25;
  params.strokeColor = "#000000";
  params.shapeColor = "#FFFFFF";
  params.bg = "#4830DA";
  params.strokeWeight = 1;
  params.strokeCap = "round";
  params.fontFamily = "KnockoutE.otf";
  params.noiseScale = 0.005;
  params.noiseStrength = 0;
  params.strokePattern = "solid";

  // Update the Tweakpane inputs with the default values
  pane.refresh();

  // Update the letter with the default parameters
  updateLetter();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function doubleClicked() {
  image(cg, windowWidth, windowHeight);
  saveCanvas("GlyphArc.jpg");
}