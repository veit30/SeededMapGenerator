function Controls() {

  customElements.define("canvas-controls",
    class extends HTMLElement {
      constructor() {
        super();

        const shadowRoot = this.attachShadow({mode: 'open'});

        const contend = document.createElement('div');
	      contend.className = "controls";
        shadowRoot.appendChild(contend);

        // TODO: extend styles
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

Controls.prototype.addDropdown = function(name, options) {
  this._parameters[name] = {
    type: "dropdown",
    props: {
      options,
    },
    value: options[0],
  }
}

Controls.prototype.addRange = function(name, {min, max, step, defaultValue, tickmarks}) {
  //TODO: step as function
  min = min ?? 0;
  max = max ?? 0;
  defaultValue = defaultValue >= min || defaultValue <= max ? defaultValue : min;

  this._parameters[name] = {
    type: "range",
    props: {
      min,
      max,
      step: step ?? 1,
      defaultValue,
      tickmarks,
    },
    value: defaultValue,

  }
}

Controls.prototype.addBoolean = function(name, defaultValue = false) {
  this._parameters[name] = {
    type: "boolean",
    props: {
      defaultValue: defaultValue,
    },
    value: defaultValue,
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
        this.generateDropdown(param, this._parameters[param].props);
        break;
      case "range":
        this.generateRange(param, this._parameters[param].props);
        break;
      case "boolean":
        this.generateCheckbox(param, this._parameters[param].props);
        break;
    }
  }
}

Controls.prototype.generateDropdown = function(name, {options}) {
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
    this._parameters[name].value = event.path[0].value;
    this.valueChangeCallback(name, event.path[0].value);
  }, false);

  let label = document.createElement("label");
  label.innerHTML = "Dropdown: "
  label.htmlFor = name;
  this.controlsContainer.appendChild(label);
  this.controlsContainer.appendChild(select);
}

Controls.prototype.generateRange = function(name, {min, max, step, defaultValue, tickmarks}) {
  let range = document.createElement("input");
  range.type = "range";
  range.id = name;
  if (tickmarks) {
    range.list = `${name}-tickmarks`;
  } else {
    range.min = min;
    range.max = max;
    range.step = step;
  }

  range.value = defaultValue;

  range.addEventListener("change", event => {
    this._parameters[name].value = event.path[0].value;
    this.valueChangeCallback(name, event.path[0].value);
  }, false)

  let label = document.createElement("label");
  label.innerHTML = "Range: "
  label.htmlFor = name;
  this.controlsContainer.appendChild(label);
  this.controlsContainer.appendChild(range);
}

Controls.prototype.generateCheckbox = function(name, {defaultValue}) {
  let checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = name;

  checkbox.addEventListener("change", event => {
    this._parameters[name].value = event.path[0].checked;
    this.valueChangeCallback(name, event.path[0].checked);
  });

  let label = document.createElement("label");
  label.innerHTML = "Checkbox: ";
  label.htmlFor = name;

  this.controlsContainer.appendChild(label);
  this.controlsContainer.appendChild(checkbox);
}

Controls.prototype.setValueChangeCallback = function(callback) {
  this.valueChangeCallback = callback;
}

Object.defineProperties(Controls.prototype, {
  'valueMap': {
    get: function() {
      return Object.keys(this._parameters).reduce((a,c) => {
        a[c] = this._parameters[c].value;
        return a;
      }, {});
    }
  }
});
