function TechDiversityGender() {

  // Name for the visualisation to appear in the menu bar.
  this.name = 'Tech Diversity: Gender';

  // Each visualisation must have a unique ID with no special
  // characters.
  this.id = 'tech-diversity-gender';

  // Layout object to store all common plot layout parameters and
  // methods.
  this.layout = {
    // Locations of margin positions. Left and bottom have double margin
    // size due to axis and tick labels.
    leftMargin: 130,
    rightMargin: width,
    topMargin: 30,
    bottomMargin: height,
    pad: 5,

    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },

    // Boolean to enable/disable background grid.
    grid: true,

    // Number of axis tick labels to draw so that they are not drawn on
    // top of one another.
    numXTickLabels: 10,
    numYTickLabels: 8,
  };

  // Middle of the plot: for 50% line.
  this.midX = (this.layout.plotWidth() / 2) + this.layout.leftMargin;

  // Default visualisation colours.
  this.femaleColour = color(255, 0, 0);
  this.maleColour = color(0, 255, 0);

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Preload the data. This function is called automatically by the
  // gallery when a visualisation is added.
  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/tech-diversity/gender-2018.csv', 'csv', 'header',
      // Callback function to set the value
      // this.loaded to true.
      function(table) {
        self.loaded = true;
      });

  };

  this.setup = function() {
    // Font defaults.
    textSize(16);
  };

  this.destroy = function() {
  };

  this.draw = function() {

    // Draw Female/Male labels at the top of the plot.
    this.drawCategoryLabels();

    var lineHeight = (height - this.layout.topMargin) /
        this.data.getRowCount();

    let hoveredCompany = null;

    // Check which company is hovered
    for (var i = 0; i < this.data.getRowCount(); i++) {
      var lineY = (lineHeight * i) + this.layout.topMargin;

      var company = {
        'name': this.data.getString(i, 'company'),
        'female': this.data.getNum(i, 'female'),
        'male': this.data.getNum(i, 'male'),
      };

      if (mouseX >= this.layout.leftMargin &&
          mouseX <= this.layout.leftMargin + this.mapPercentToWidth(company.female) + this.mapPercentToWidth(company.male) &&
          mouseY >= lineY &&
          mouseY <= lineY + lineHeight) {
        hoveredCompany = i;
      }
    }

    // Draw each company with the appropriate fill color
    for (var i = 0; i < this.data.getRowCount(); i++) {
      var lineY = (lineHeight * i) + this.layout.topMargin;

      var company = {
        'name': this.data.getString(i, 'company'),
        'female': this.data.getNum(i, 'female'),
        'male': this.data.getNum(i, 'male'),
      };

      // Draw the company name in the left margin.
      fill(0);
      noStroke();
      textAlign('right', 'top');
      text(company.name,
           this.layout.leftMargin - this.layout.pad,
           lineY);

      // Determine fill colors based on hover state
      if (hoveredCompany === null || hoveredCompany === i) {
        fill(this.femaleColour);
      } else {
        fill(255, 0, 0, 100); // Dimming effect
      }
      rect(this.layout.leftMargin,
           lineY,
           this.mapPercentToWidth(company.female),
           lineHeight - this.layout.pad);

      if (hoveredCompany === null || hoveredCompany === i) {
        fill(this.maleColour);
      } else {
        fill(0, 255, 0, 100); // Dimming effect
      }
      rect(this.layout.leftMargin + this.mapPercentToWidth(company.female),
           lineY,
           this.mapPercentToWidth(company.male),
           lineHeight - this.layout.pad);
        
      // Display text with gender numbers if hovered
      if (hoveredCompany === i) {
        fill(0);
        textAlign('center', 'center');
        text('Female: ' + company.female + '||' + 'Male: ' + company.male,
             mouseX,
             mouseY);
      }
    }

    // Draw 50% line
    stroke(150);
    strokeWeight(1);
    line(this.midX,
         this.layout.topMargin,
         this.midX,
         this.layout.bottomMargin);

  };

  this.drawCategoryLabels = function() {
    fill(0);
    noStroke();
    textAlign('left', 'top');
    text('Female',
         this.layout.leftMargin,
         this.layout.pad);
    textAlign('center', 'top');
    text('50%',
         this.midX,
         this.layout.pad);
    textAlign('right', 'top');
    text('Male',
         this.layout.rightMargin,
         this.layout.pad);
  };

  this.mapPercentToWidth = function(percent) {
    return map(percent,
               0,
               100,
               0,
               this.layout.plotWidth());
  };
}
