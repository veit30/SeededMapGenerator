function Controls() {

  customElements.define("canvas-controls",
    class extends HTMLElement {
      constructor() {
        super();

        const shadowRoot = this.attachShadow({mode: 'open'});

        const contend = document.createElement('div');
	      contend.className = "controls";
        shadowRoot.appendChild(contend);


        const style = document.createElement('style');
        style.textContent = `
        .controls {
          position: absolute;
          top: 0;
          right: 0;
          background: #fff;
        }
        `
        shadowRoot.appendChild(style);
      }
    }
  )
  this._parameters = {};
  this.prepareControlsContainer();
}

Controls.prototype.addParameter = function(p,v) {
  this._parameters[p] = v;
}

Controls.prototype.addDropdown = function(name, values) {
  this._parameters[name] = {
    type: "dropdown",
    values: values,
  }
}

Controls.prototype.show = function() {
  this.placeParameters();
  document.body.append(this.canvasControls);
}

Controls.prototype.prepareControlsContainer = function() {
  this.canvasControls = document.createElement("canvas-controls");
  this.controlsContainer = this.canvasControls.shadowRoot.children[0];
}

Controls.prototype.placeParameters = function() {
  for(let param in this._parameters) {
    switch(this._parameters[param].type) {
      case "dropdown":
        let label = document.createElement("label");
        label.innerHTML = "Dropdown "
        label.htmlFor = param;
        this.controlsContainer.appendChild(label);
        this.controlsContainer.appendChild(this.generateDropdown(param, this._parameters[param].values));
    }
  }
}

Controls.prototype.generateDropdown = function(name, options) {
  let select = document.createElement("select");
  select.name = name;
  select.id = name;

  for (const val of options) {
    var option = document.createElement("option");
    option.value = val;
    option.text = val.charAt(0).toUpperCase() + val.slice(1);
    select.appendChild(option);
  }

  select.addEventListener("change", (event) => {
    console.log(name);
    console.log(event.path[0].value);
    this.valueChangeCallback("key", "value");
  }, false)
  return select;
}

Controls.prototype.setValueChangeCallback = function(callback) {
  this.valueChangeCallback = callback;
}
