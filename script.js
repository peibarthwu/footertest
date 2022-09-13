class DeviceOrientationControls {

	constructor() {

		if ( window.isSecureContext === false ) {

			console.error( 'DeviceOrientationEvent is only available in secure contexts (https)' );

		}

		const scope = this;


		// this.object.rotation.reorder( 'YXZ' );

		this.enabled = true;

		this.deviceOrientation = {};
		this.screenOrientation = 0;

        this.alpha = 0.0;
        this.beta = 0.0;
        this.gamma = 0.0;



		const onDeviceOrientationChangeEvent = function ( event ) {

			scope.deviceOrientation = event;

		};

		const onScreenOrientationChangeEvent = function () {

			scope.screenOrientation = window.orientation || 0;

		};

		this.connect = function () {

			onScreenOrientationChangeEvent(); // run once on load

			// iOS 13+

			if ( window.DeviceOrientationEvent !== undefined && typeof window.DeviceOrientationEvent.requestPermission === 'function' ) {

				window.DeviceOrientationEvent.requestPermission().then( function ( response ) {

					if ( response == 'granted' ) {

						window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent );
						window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent );

					}

				} ).catch( function ( error ) {

					console.error( 'THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:', error );

				} );

			} else {

				window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent );
				window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent );

			}

			scope.enabled = true;

		};

		this.disconnect = function () {

			window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent );
			window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent );

			scope.enabled = false;

		};

		this.update = function () {

			if ( scope.enabled === false ) return;

			const device = scope.deviceOrientation;

			if ( device ) {
				this.alpha = device.alpha ? device.alpha : 0; // Z

				this.beta = device.beta ? device.beta : 0; // X'

				this.gamma = device.gamma ? device.gamma : 0; // Y''
        console.log(this.alpha);
			}

		};

		this.dispose = function () {

			scope.disconnect();

		};

		this.connect();

	}

}
  
var controls = new DeviceOrientationControls();
controls.disconnect();
controls.enabled = false;
console.log(controls);
  
var script = {
  data() {
    return {
      dashCount: 40,
      lineCount: 23,
      radiance: 9,
      mouse: {
        x: undefined,
        y: undefined
      },
      rad: 150,
    };
  },
  mounted() {
   window.addEventListener("mousemove", (e) => {
      this.mouse.x = event.x;
      this.mouse.y = event.y;
    });
     window.addEventListener("deviceorientation", (e) => {
       console.log("orientations change");
      if(controls.enabled){
        console.log(controls.alpha);
        controls.update();
        this.mouse.x = Math.sin(controls.alpha);

      }
    });
  },
  methods: {
    clamp(num, min, max) {
      return num <= min ? min : num >= max ? max : num;
    },
    enablecontrols(){
      controls.connect();
      controls.enabled = true;
      console.log(controls);
    },
    move(e) {
      const x = e.clientX;
      const y = e.clientY;

      const dashes = this.$refs.dash;
      const activeDash = e.target;
      const lines = this.$refs.line;
      const lineIndex = lines.indexOf(activeDash.parentElement);
      lineIndex > -1
          ? [...lines[lineIndex].children].indexOf(activeDash)
          : null;

      const spread = (this.radiance - 1) / 2;

      lines.slice(lineIndex - spread, lineIndex + 1 + spread);


      dashes.forEach((dash) => {
        dash.className = "dash";

        const box = dash.getBoundingClientRect();
        const dashx = (box.left + box.right) / 2;
        const dashy = (box.top + box.bottom) / 2;
        //distance between mouse and dash
        const dist = Math.sqrt(Math.pow(dashx-x,2) + Math.pow(dashy-y,2));
        //weight based on distance from radius
        const weight = 1 + (Math.abs(this.rad - dist)/this.rad);
        const rot = 90 * weight;
        const rotString = rot.toString();
        if (Math.abs(dist-this.rad)<this.rad){
          
          dash.style.transform ='rotate(' + rotString + 'deg)';
        } else {
          dash.style.transform ='rotate(0deg)';

        }

        if (dash === activeDash) {
   dash.classList.add("dash-active");
        } 

                
      });
      

    }
  }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

const isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return (id, style) => addStyle(id, style);
}
let HEAD;
const styles = {};
function addStyle(id, css) {
    const group = isOldIE ? css.media || 'default' : id;
    const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        let code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                style.element.setAttribute('media', css.media);
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            const index = style.ids.size - 1;
            const textNode = document.createTextNode(code);
            const nodes = style.element.childNodes;
            if (nodes[index])
                style.element.removeChild(nodes[index]);
            if (nodes.length)
                style.element.insertBefore(textNode, nodes[index]);
            else
                style.element.appendChild(textNode);
        }
    }
}

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { attrs: { id: "app" } }, [
    _c("button", { on: { click: _vm.enablecontrols } }, [
      _vm._v(" enable controls ")
    ]),
    _vm._v(" "),
    _c(
      "div",
      { staticClass: "lines", on: { mousemove: _vm.move } },
      [
        _vm._l(_vm.lineCount + 1, function(index) {
          return [
            _c(
              "div",
              {
                ref: "line",
                refInFor: true,
                class: "line line-" + index,
                style:
                  "margin-top:" +
                  (index > 1
                    ? _vm.lineCount - (_vm.lineCount - index) - 1
                    : 0) +
                  "px;height:" +
                  (_vm.lineCount + 1 - index) +
                  "px",
                on: { mousemove: _vm.move }
              },
              [
                _vm._l(_vm.dashCount + 1, function(index) {
                  return [
                    _c("div", {
                      ref: "dash",
                      refInFor: true,
                      staticClass: "dash"
                    })
                  ]
                })
              ],
              2
            )
          ]
        })
      ],
      2
    )
  ])
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  const __vue_inject_styles__ = function (inject) {
    if (!inject) return
    inject("data-v-231bd309_0", { source: "body {\n  margin: 0;\n  padding: 0;\n}\n#app {\n  margin-top: 60px;\n  padding: 20px;\n}\n.line {\n  width: 100%;\n  display: flex;\n  flex-flow: row;\n}\n.dash {\n  background: black;\n  height: 100%;\n  flex: 1;\n  position: relative;\n}\n.dash-active {\n  background: red;\n}\n.dash-test {\n  background: green;\n}\n\n/*# sourceMappingURL=pen.vue.map */", map: {"version":3,"sources":["/tmp/codepen/vuejs/src/pen.vue","pen.vue"],"names":[],"mappings":"AAuPA;EACA,SAAA;EACA,UAAA;ACtPA;ADyPA;EACA,gBAAA;EAEA,aAAA;ACvPA;AD0PA;EACA,WAAA;EACA,aAAA;EACA,cAAA;ACvPA;AD0PA;EACA,iBAAA;EACA,YAAA;EACA,OAAA;EACA,kBAAA;ACvPA;AD0PA;EACA,eAAA;ACvPA;AD0PA;EACA,iBAAA;ACvPA;;AAEA,kCAAkC","file":"pen.vue","sourcesContent":["<template>\n  <div id=\"app\">\n    <button @click=\"enablecontrols\"> enable controls </button>\n    <div class=\"lines\" @mousemove=\"move\">\n      <template v-for=\"index in lineCount + 1\">\n        <div\n          :class=\"`line line-${index}`\"\n          :style=\"`margin-top:${\n            index > 1 ? lineCount - (lineCount - index) - 1 : 0\n          }px;height:${lineCount + 1 - index}px`\"\n          @mousemove=\"move\"\n          ref=\"line\"\n        >\n          <template v-for=\"index in dashCount + 1\">\n            <div class=\"dash\" ref=\"dash\"></div>\n          </template>\n        </div>\n      </template>\n    </div>\n\n    <!--     <template v-for=\"index in lineCount + 1\">\n      <template v-if=\"index > 0 && index < lineCount + 1\">\n        <svg\n          :viewBox=\"`0 0 1368 ${index}`\"\n          fill=\"none\"\n          xmlns=\"http://www.w3.org/2000/svg\"\n          :style=\"`margin-top:${lineCount + 1 - index}px`\"\n        >\n          <line\n            x1=\"0\"\n            :y1=\"index / 2\"\n            x2=\"1368\"\n            :y2=\"index / 2\"\n            stroke=\"black\"\n            :stroke-width=\"index\"\n          />\n        </svg>\n      </template>\n    </template> -->\n  </div>\n</template>\n\n<script>\n  \nclass DeviceOrientationControls {\n\n\tconstructor() {\n\n\t\tif ( window.isSecureContext === false ) {\n\n\t\t\tconsole.error( 'DeviceOrientationEvent is only available in secure contexts (https)' );\n\n\t\t}\n\n\t\tconst scope = this;\n\n\n\t\t// this.object.rotation.reorder( 'YXZ' );\n\n\t\tthis.enabled = true;\n\n\t\tthis.deviceOrientation = {};\n\t\tthis.screenOrientation = 0;\n\n        this.alpha = 0.0;\n        this.beta = 0.0;\n        this.gamma = 0.0;\n\n\n\n\t\tconst onDeviceOrientationChangeEvent = function ( event ) {\n\n\t\t\tscope.deviceOrientation = event;\n\n\t\t};\n\n\t\tconst onScreenOrientationChangeEvent = function () {\n\n\t\t\tscope.screenOrientation = window.orientation || 0;\n\n\t\t};\n\n\t\tthis.connect = function () {\n\n\t\t\tonScreenOrientationChangeEvent(); // run once on load\n\n\t\t\t// iOS 13+\n\n\t\t\tif ( window.DeviceOrientationEvent !== undefined && typeof window.DeviceOrientationEvent.requestPermission === 'function' ) {\n\n\t\t\t\twindow.DeviceOrientationEvent.requestPermission().then( function ( response ) {\n\n\t\t\t\t\tif ( response == 'granted' ) {\n\n\t\t\t\t\t\twindow.addEventListener( 'orientationchange', onScreenOrientationChangeEvent );\n\t\t\t\t\t\twindow.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent );\n\n\t\t\t\t\t}\n\n\t\t\t\t} ).catch( function ( error ) {\n\n\t\t\t\t\tconsole.error( 'THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:', error );\n\n\t\t\t\t} );\n\n\t\t\t} else {\n\n\t\t\t\twindow.addEventListener( 'orientationchange', onScreenOrientationChangeEvent );\n\t\t\t\twindow.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent );\n\n\t\t\t}\n\n\t\t\tscope.enabled = true;\n\n\t\t};\n\n\t\tthis.disconnect = function () {\n\n\t\t\twindow.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent );\n\t\t\twindow.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent );\n\n\t\t\tscope.enabled = false;\n\n\t\t};\n\n\t\tthis.update = function () {\n\n\t\t\tif ( scope.enabled === false ) return;\n\n\t\t\tconst device = scope.deviceOrientation;\n\n\t\t\tif ( device ) {\n\t\t\t\tthis.alpha = device.alpha ? device.alpha : 0; // Z\n\n\t\t\t\tthis.beta = device.beta ? device.beta : 0; // X'\n\n\t\t\t\tthis.gamma = device.gamma ? device.gamma : 0; // Y''\n        console.log(this.alpha);\n\t\t\t}\n\n\t\t};\n\n\t\tthis.dispose = function () {\n\n\t\t\tscope.disconnect();\n\n\t\t};\n\n\t\tthis.connect();\n\n\t}\n\n}\n  \nvar controls = new DeviceOrientationControls();\ncontrols.disconnect();\ncontrols.enabled = false;\nconsole.log(controls)\n  \nexport default {\n  data() {\n    return {\n      dashCount: 40,\n      lineCount: 23,\n      radiance: 9,\n      mouse: {\n        x: undefined,\n        y: undefined\n      },\n      rad: 150,\n    };\n  },\n  mounted() {\n   window.addEventListener(\"mousemove\", (e) => {\n      this.mouse.x = event.x;\n      this.mouse.y = event.y;\n    });\n     window.addEventListener(\"deviceorientation\", (e) => {\n       console.log(\"orientations change\")\n      if(controls.enabled){\n        console.log(controls.alpha);\n        controls.update();\n        this.mouse.x = Math.sin(controls.alpha);\n\n      }\n    });\n  },\n  methods: {\n    clamp(num, min, max) {\n      return num <= min ? min : num >= max ? max : num;\n    },\n    enablecontrols(){\n      controls.connect();\n      controls.enabled = true;\n      console.log(controls)\n    },\n    move(e) {\n      const x = e.clientX;\n      const y = e.clientY;\n\n      const dashes = this.$refs.dash;\n      const activeDash = e.target;\n      const lines = this.$refs.line;\n      const lineIndex = lines.indexOf(activeDash.parentElement);\n      lineIndex > -1\n          ? [...lines[lineIndex].children].indexOf(activeDash)\n          : null;\n\n      const spread = (this.radiance - 1) / 2;\n\n      lines.slice(lineIndex - spread, lineIndex + 1 + spread);\n\n\n      dashes.forEach((dash) => {\n        dash.className = \"dash\";\n\n        const box = dash.getBoundingClientRect()\n        const dashx = (box.left + box.right) / 2\n        const dashy = (box.top + box.bottom) / 2\n        //distance between mouse and dash\n        const dist = Math.sqrt(Math.pow(dashx-x,2) + Math.pow(dashy-y,2));\n        //weight based on distance from radius\n        const weight = 1 + (Math.abs(this.rad - dist)/this.rad);\n        const rot = 90 * weight;\n        const rotString = rot.toString();\n        if (Math.abs(dist-this.rad)<this.rad){\n          \n          dash.style.transform ='rotate(' + rotString + 'deg)';\n        } else {\n          dash.style.transform ='rotate(0deg)';\n\n        }\n\n        if (dash === activeDash) {\n   dash.classList.add(\"dash-active\");\n        } \n\n                \n      });\n      \n\n    }\n  }\n};\n</script>\n\n<style lang=\"scss\">\nbody {\n  margin: 0;\n  padding: 0;\n}\n\n#app {\n  margin-top: 60px;\n\n  padding: 20px;\n}\n\n.line {\n  width: 100%;\n  display: flex;\n  flex-flow: row;\n}\n\n.dash {\n  background: black;\n  height: 100%;\n  flex: 1;\n  position: relative;\n}\n\n.dash-active {\n  background: red;\n}\n\n.dash-test {\n  background: green;\n}\n</style>\n","body {\n  margin: 0;\n  padding: 0;\n}\n\n#app {\n  margin-top: 60px;\n  padding: 20px;\n}\n\n.line {\n  width: 100%;\n  display: flex;\n  flex-flow: row;\n}\n\n.dash {\n  background: black;\n  height: 100%;\n  flex: 1;\n  position: relative;\n}\n\n.dash-active {\n  background: red;\n}\n\n.dash-test {\n  background: green;\n}\n\n/*# sourceMappingURL=pen.vue.map */"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__ = undefined;
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    createInjector,
    undefined,
    undefined
  );

export default __vue_component__;