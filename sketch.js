let aArray = [];
let cg;
let pane;
let currentFont;
let clickCount = 0;
let clickTimer;
let params = {
  text: "a/",
  fontSize: 350,
  sampleFactor: 0.25,
  strokeColor: "#000000",
  shapeColor: "#FFFFFF",
  bgColor: "#4830DA",
  strokeWeight: 1,
  strokeCap: "round",
  fontFamily: "Bebas Neue",
  Scale: 0.000,
  Strength: 0,
  strokeType: "solid",
  cornerRounding: 1,
  loopDuration: 1800,
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  cg = createGraphics(windowWidth, windowHeight); // for additional layer

  text("hi", windowWidth / 4, windowHeight / 4);

  // Create Tweakpane
  pane = new Tweakpane.Pane();

  // Create folders for each group of options
  const textFolder = pane.addFolder({ title: "Text" });
  textFolder
    .addInput(params, "text", { label: "Text", maxLength: 10 })
    .on("change", updateLetter);
  textFolder
    .addInput(params, "fontFamily", {
      label: "Font",
      options: {
        "Inter": "Inter",
        "Roboto": "Roboto",
        "Montserrat": "Montserrat",
        "Work Sans": "Work Sans",
        "Open Sans": "Open Sans",
        "Poppins": "Poppins",
        "Playfair Display": "Playfair Display",
        "Merriweather": "Merriweather",
        "Lora": "Lora",
        "Crimson Text": "Crimson Text",
        "EB Garamond": "EB Garamond",
        "Bebas Neue": "Bebas Neue",
        "Oswald": "Oswald",
        "Righteous": "Righteous",
        "Alfa Slab One": "Alfa Slab One",
        "Rubik Mono One": "Rubik Mono One",
        "Roboto Mono": "Roboto Mono",
        "Source Code Pro": "Source Code Pro",
        "JetBrains Mono": "JetBrains Mono",
        "IBM Plex Mono": "IBM Plex Mono",
        "Pacifico": "Pacifico",
        "Dancing Script": "Dancing Script",
        "Great Vibes": "Great Vibes",
        "Satisfy": "Satisfy",
      },
    })
    .on("change", updateLetter);
  textFolder
    .addInput(params, "fontSize", { label: "Size", min: 100, max: 1000, step: 10 })
    .on("change", updateLetter);
  textFolder
    .addInput(params, "sampleFactor", { label: "Sample", min: 0.1, max: 1, step: 0.01 })
    .on("change", updateLetter);

  const colorFolder = pane.addFolder({ title: "Colors" });
  colorFolder.addInput(params, "strokeColor", { label: "Stroke" });
  colorFolder.addInput(params, "shapeColor", { label: "Shape" });
  colorFolder.addInput(params, "bgColor", { label: "BG" });

  const strokeFolder = pane.addFolder({ title: "Stroke" });
  strokeFolder.addInput(params, "strokeWeight", {
    label: "Weight",
    min: 0.1,
    max: 3,
    step: 0.1,
  });
  strokeFolder.addInput(params, "strokeType", {
    label: "Type",
    options: { Solid: "solid", Dotted: "dotted", Dashed: "dashed" },
  });
  strokeFolder.addInput(params, "cornerRounding", {
    label: "Corner",
    min: 1,
    max: 10,
    step: 1,
  });

  const displacementFolder = pane.addFolder({ title: "Displacement" });
  displacementFolder.addInput(params, "Scale", {
    label: "Scale",
    min: 0.001,
    max: 0.1,
    step: 0.001,
    description: "Controls the scale of the noise field",
  });

  displacementFolder.addInput(params, "Strength", {
    label: "Strength",
    min: 0,
    max: 100,
    step: 1,
    description: "Controls the strength of the displacement",
  });

  displacementFolder.addInput(params, "loopDuration", {
    label: "Loop",
    min: 300,
    max: 3600,
    step: 100,
    description: "Duration of one loop cycle in frames",
  });

  // Add a button to reset to the default state
  pane.addButton({ title: "Reset to Default" }).on("click", resetToDefault);

  // Position the Tweakpane on the right side using CSS
  const style = document.createElement("style");
  style.innerHTML = `
    .tp-dfwv {
      position: fixed;
      bottom: 10px;
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

  // Load the selected Google Font and convert to points
  // Using textFont with the font family name for rendering
  textFont(params.fontFamily);

  // For textToPoints, we need to load the font file
  // This is a workaround - load font asynchronously and update when ready
  if (!currentFont || currentFont.fontFamily !== params.fontFamily) {
    loadFont(getFontUrl(params.fontFamily), (font) => {
      currentFont = font;
      currentFont.fontFamily = params.fontFamily;
      generatePoints();
    });
  } else {
    generatePoints();
  }
}

function getFontUrl(fontName) {
  // Map Google Font names to their CDN URLs
  const fontUrls = {
    // Sans Serif
    "Inter": "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.ttf",
    "Roboto": "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fCRc4AMP6lbBP.ttf",
    "Montserrat": "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCvC73w0aXpsog.ttf",
    "Work Sans": "https://fonts.gstatic.com/s/worksans/v19/QGY_z_wNahGAdqQ43RhVcIgYT2Xz5u32K0nWNigDp6_cOyA.ttf",
    "Open Sans": "https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0C4nY1M2xLER.ttf",
    "Poppins": "https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLDD4Z1JlFc-K.ttf",
    // Serif
    "Playfair Display": "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDZbtY.ttf",
    "Merriweather": "https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l521wRZWMf6hPvhPUWH.ttf",
    "Lora": "https://fonts.gstatic.com/s/lora/v35/0QI6MX1D_JOuGQbT0gvTJPa787weuyJGmKxemMeZ.ttf",
    "Crimson Text": "https://fonts.gstatic.com/s/crimsontext/v19/wlppgwHKFkZgtmSR3NB0oRJfbwhT.ttf",
    "EB Garamond": "https://fonts.gstatic.com/s/ebgaramond/v27/SlGDmQSNjdsmc35JDF1K5E55YMjF_7DPuGi-6_RUA4V-e6yHgQ.ttf",
    // Display
    "Bebas Neue": "https://fonts.gstatic.com/s/bebasneue/v14/JTUSjIg69CK48gW7PXooxW5rygbi49c.ttf",
    "Oswald": "https://fonts.gstatic.com/s/oswald/v53/TK3_WkUHHAIjg75cFRf3bXL8LICs1_FvsUZiZQ.ttf",
    "Righteous": "https://fonts.gstatic.com/s/righteous/v17/1cXxaUPXBpj2rGoU7C9mj3uEicG01A.ttf",
    "Alfa Slab One": "https://fonts.gstatic.com/s/alfaslabone/v19/6NUQ8FmMKwSEKjnm5-4v-4Jh6dVretWvYmE.ttf",
    "Rubik Mono One": "https://fonts.gstatic.com/s/rubikmonoone/v18/UqyJK8kPP3hjw6ANTdfRk9YSN-8wRqQrc_j9.ttf",
    // Mono
    "Roboto Mono": "https://fonts.gstatic.com/s/robotomono/v23/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vqPQ--5Ip2sSQ.ttf",
    "Source Code Pro": "https://fonts.gstatic.com/s/sourcecodepro/v23/HI_diYsKILxRpg3hIP6sJ7fM7PqPMcMnZFqUwX28DMyQtMlrQA6H.ttf",
    "JetBrains Mono": "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOlOVkA.ttf",
    "IBM Plex Mono": "https://fonts.gstatic.com/s/ibmplexmono/v19/-F6pfjptAgt5VM-kVkqdyU8n3kwq0n1hj-sNFQ.ttf",
    // Script
    "Pacifico": "https://fonts.gstatic.com/s/pacifico/v22/FwZY7-Qmy14u9lezJ96A4sijpFu_.ttf",
    "Dancing Script": "https://fonts.gstatic.com/s/dancingscript/v25/If2cXTr6YS-zF4S-kcSWSVi_sxjsohD9F50Ruu7BMSoHTeB9ptDqpw.ttf",
    "Great Vibes": "https://fonts.gstatic.com/s/greatvibes/v19/RWmMoKWR9v4ksMfaWd_JN-XCg6UKDXlq.ttf",
    "Satisfy": "https://fonts.gstatic.com/s/satisfy/v21/rP2Hp2yn6lkG50LoOZSCHBeHFl0.ttf",
  };
  return fontUrls[fontName];
}

function generatePoints() {
  // Changing custom text to outlines for manipulation. sampleFactor = resolution
  aArray = currentFont.textToPoints(params.text, 0, 0, params.fontSize, {
    sampleFactor: params.sampleFactor,
  });

  // Center the letter
  centerLetter(currentFont);
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
  // Map corner rounding from 1-10 to 0-50 pixels
  let cornerRadius = map(params.cornerRounding, 1, 10, 0, 50);

  // Normalize rectangle to have positive dimensions
  let normX = w >= 0 ? x : x + w;
  let normY = h >= 0 ? y : y + h;
  let normW = abs(w);
  let normH = abs(h);

  // Adjust for stroke so it doesn't extend beyond bounds
  let sw = params.strokeWeight;
  let adjustedX = normX + sw/2;
  let adjustedY = normY + sw/2;
  let adjustedW = normW - sw;
  let adjustedH = normH - sw;

  switch (params.strokeType) {
    case "solid":
      rect(adjustedX, adjustedY, adjustedW, adjustedH, cornerRadius);
      break;

    case "dotted":
      // Draw dotted pattern
      let dotSize = 5;
      let dotSpacing = 20;

      // Calculate the starting and ending coordinates based on the sign of w and h
      let dotStartX = adjustedW >= 0 ? adjustedX : adjustedX + adjustedW;
      let dotStartY = adjustedH >= 0 ? adjustedY : adjustedY + adjustedH;
      let dotEndX = adjustedW >= 0 ? adjustedX + adjustedW : adjustedX;
      let dotEndY = adjustedH >= 0 ? adjustedY + adjustedH : adjustedY;

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
      let startX = adjustedX;
      let endX = adjustedX + adjustedW;
      let dashX = startX;

      if (adjustedW < 0) {
        startX = adjustedX + adjustedW;
        endX = adjustedX;
        dashX = startX;
      }

      while (dashX < endX) {
        let dashWidth = Math.min(dashLength, endX - dashX);
        rect(dashX, adjustedY, dashWidth, adjustedH, cornerRadius);
        dashX += dashLength + dashSpacing;
      }
      break;
  }
}

function draw() {
  background(params.bgColor);

  // Create circular sampling for seamless loop
  let loopProgress = (frameCount % params.loopDuration) / params.loopDuration;
  let noiseTimeX = cos(loopProgress * TWO_PI) * 2;
  let noiseTimeY = sin(loopProgress * TWO_PI) * 2;

  for (let i = 0; i < aArray.length; i++) {
    let point = aArray[i];

    // Calculate the displacement based on Perlin noise with circular sampling
    let noiseValue = noise(
      point.x * params.Scale,
      point.y * params.Scale,
      noiseTimeX,
      noiseTimeY
    );
    let angle = noiseValue * TWO_PI;
    let displacement = p5.Vector.fromAngle(angle).mult(params.Strength);

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

    fill(255); // Set the text color to white
    textSize(10);
    textAlign(LEFT, BOTTOM);
    text("TRIPLE CLICK TO SAVE", 10, height - 10);
  }
}

function resetToDefault() {
  // Reset all parameters to their default values
  params.text = "a/";
  params.fontSize = 350;
  params.sampleFactor = 0.25;
  params.strokeColor = "#000000";
  params.shapeColor = "#FFFFFF";
  params.bgColor = "#4830DA";
  params.strokeWeight = 1;
  params.strokeCap = "round";
  params.fontFamily = "Bebas Neue";
  params.Scale = 0.000;
  params.Strength = 0;
  params.strokeType = "solid";
  params.cornerRounding = 1;
  params.loopDuration = 1800;

  // Update the Tweakpane inputs with the default values
  pane.refresh();

  // Update the letter with the default parameters
  updateLetter();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  clickCount++;

  // Clear existing timer
  clearTimeout(clickTimer);

  // Set new timer - if no click within 400ms, reset count
  clickTimer = setTimeout(() => {
    clickCount = 0;
  }, 400);

  // If triple click detected, save canvas
  if (clickCount === 3) {
    image(cg, windowWidth, windowHeight);
    saveCanvas("GlyphArc.jpg");
    clickCount = 0;
  }
}
