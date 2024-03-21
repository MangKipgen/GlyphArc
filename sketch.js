let flexa, knockoutC, knockoutE, futuraB, robotoS;
let aArray;
let cg;
let pane;
let params = {
  text: "a/",
  fontSize: 350,
  sampleFactor: 0.32,
  strokeColor: "#000000",
  shapeColor: "#FFFFFF",
  bg: "#4830DA",
  strokeWeight: 1,
  strokeCap: "round",
  fontFamily: "KnockoutE.otf",
 angle: 0,
  distance: 0,
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
    .addInput(params, "text", { maxLength: 5 })
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
strokeFolder.addInput(params, "strokeWeight", { min: 0.1, max: 3, step: 0.1 });
strokeFolder.addInput(params, "strokePattern", {
  options: { Solid: "solid", Dotted: "dotted", Dashed: "dashed" },
});

const displacementFolder = strokeFolder.addFolder({ title: "Displacement" });
displacementFolder.addInput(params, "angle", {
  min: 0,
  max: 360,
  step: 1,
  description: "Controls the direction of displacement (in degrees)",
});
  
  
displacementFolder.addInput(params, "distance", {
  min: 0,
  max: 100,
  step: 1,
  description: "Controls the magnitude of displacement (in pixels)",
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
  // Limit the input to 5 letters
  params.text = params.text.slice(0, 5);

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
      let dotSpacing = 10;
      for (let i = 0; i < w; i += dotSpacing) {
        for (let j = 0; j < h; j += dotSpacing) {
          ellipse(x + i, y + j, dotSize, dotSize);
        }
      }
      break;
    case "dashed":
      // Draw dashed pattern
      let dashLength = 10;
      let dashSpacing = 5;
      for (let i = 0; i < w; i += dashLength + dashSpacing) {
        rect(x + i, y, dashLength, h);
      }
      break;
  }
}

function draw() {
  background(params.bg);

   
  
  
  for (let i = 0; i < aArray.length; i++) {
    // Calculate the width and height of the rectangle based on the mouse position
    let rectWidth = mouseX - width / 2;
    let rectHeight = mouseY - height / 2;

    // Calculate the displacement values
    let displaceX =
      params.distance * cos(params.angle + noise(i * 0.1, frameCount * 0.01));
     let displaceY =
      params.distance * sin(params.angle + noise(i * 0.1, frameCount * 0.01));

    // Calculate the position of the rectangle based on the center of the shape and displacement
    let rectX = aArray[i].x - rectWidth / 2 + displaceX;
    let rectY = aArray[i].y - rectHeight / 2 + displaceY;

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
  params.sampleFactor = 0.32;
  params.strokeColor = "#000000";
  params.shapeColor = "#FFFFFF";
  params.bg = "#4830DA";
  params.strokeWeight = 1;
  params.strokeCap = "round";
  params.fontFamily = "KnockoutE.otf";
  params.angle = 0;
  params.distance = 0;
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
