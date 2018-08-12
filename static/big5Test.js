(function(window){
  'use strict';

  if(typeof(window.big5Test) === 'undefined'){

    window.big5Test = function(){
      var _lib = {};
      var _opts = {};
      var latestData = {};
      var tempContainer = null;
      var contentHeight = 0;
      var contentWidth = 0;

      var defaultOptions = {
        container: "", // id of wrapping element
        styleSheetUrl: "", // style sheet url
        data: null, // test data used to resume progress, equal to data provided by progress event
        autoHeight: true, // when true, iframe scrolling is disabled and iframe height will be automatically adjusted to match content
        onProgress: function(data){},
        onResize: function(height, width){},
        onLoad: function(instance){},
        onComplete: function(data){}
      };


      var scripts = document.getElementsByTagName('script');
      var tmp = document.createElement('a');
      tmp.href   = scripts[scripts.length - 1].src;
      _opts.origin = tmp.origin;

      function onFrameLoad(){
        if(_opts.styleSheetUrl) sendMessage("style", _opts.styleSheetUrl);
        sendMessage("init", _opts.data);
        _opts.element.setAttribute("data-loading", "false");
      }

      function initOpts(options){
        for (var key in defaultOptions) {
          if (defaultOptions.hasOwnProperty(key)) _opts[key] = (options || {})[key] || defaultOptions[key];
        }
      }

      function publishOptions(){
        _lib.options = {};
        for (var key in _opts) {
          if (_opts.hasOwnProperty(key)) _lib.options[key] = _opts[key];
        }
      }

      function initFrame(options){
        latestData = _opts.data || {};
        var container = document.getElementById(_opts.container);
        if(!container){
          container = tempContainer = document.createElement('div');
          container.id = "big5Test-" + guid();
          document.body.appendChild(container);
        }

        if(container.nodeName == "IFRAME"){
          _opts.element = container;
        }

        if(container.nodeName == "DIV"){
          _opts.element = container.children[0];
          if(!_opts.children){
            _opts.element = document.createElement('iframe');
            _opts.element.id = container.id + "-iframe";
            container.appendChild(_opts.element);
          }
        }

        if(_opts.autoHeight) _opts.element.setAttribute("scrolling","no");

        if(_opts.element.addEventListener) {
          _opts.element.addEventListener("load", onFrameLoad, false);
        } else {
          _opts.element.attachEvent("onload", onFrameLoad);
        }

        _opts.element.setAttribute("data-loading", "true");
        _opts.element.src = _opts.origin + "/test";

        return _opts.element;
      }

      function guid() {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
      }

      function receiveMessage(e){
        if(e.source !== _opts.element.contentWindow) return;
        var event = e.data["event"];
        var data = e.data["data"];

        switch(event){
          case "progress":
            latestData = data;
            if(typeof _opts.onProgress === "function") _opts.onProgress(_lib); 
            if(latestData.results && latestData.results.length && typeof _opts.onComplete === "function") _opts.onComplete(_lib);    
            break;
          case "resize":
            contentHeight = data.Height;
            contentWidth = data.Width;
            if(_opts.autoHeight){
              _opts.element.height = data.height; 
            }
            if(typeof _opts.onResize === "function") _opts.onResize(_lib);   
            break;
          case "loaded":
            if(typeof _opts.onLoad === "function") _opts.onLoad(_lib); 
          break;
        }
      }

      function sendMessage(event, data){
        _opts.element.contentWindow.postMessage({event:event,data:data}, _opts.origin);
      }

      // Public functions
      _lib.init = function (options){
        if(_opts.element) _opts.element.remove();
        if(tempContainer) tempContainer.remove();
        initOpts(options);
        initFrame();
        if(_opts.styleSheetUrl) _lib.style(styleSheetUrl);
        publishOptions();
      }
      _lib.onLoad = function(callback){ _opts.onLoad = callback; }
      _lib.onResize = function(callback){ _opts.onResize = callback; }
      _lib.onProgress = function(callback) { _opts.onProgress = callback; }
      _lib.onComplete = function(callback){ _opts.onSubmit = callback; }
      _lib.getData = function(){ return latestData; }
      _lib.setData = function(data){ 
        _opts.data = data;
        _lib.init(_opts); 
      }
      _lib.getResults = function(){ return latestData.results || []; }
      _lib.setResults = function(results){ 
        _opts.data = _opts.data || {};
        _opts.data.results = results;
        _lib.init(_opts);
      }
      _lib.getContentHeight = function() { return contentHeight; }
      _lib.getContentWidth = function() { return contentWidth; }
      _lib.style = function(styleSheetUrl) { sendMessage("style", _lib.options.styleSheetUrl = _opts.styleSheetUrl = styleSheetUrl) }
      _lib.isComplete = function(){ return !!(latestData.results && latestData.results.length); }
      _lib.inProgress = function(){ return !!(_opts.element && !_lib.isComplete()); }

      window.addEventListener("message", receiveMessage, false);

      initOpts();
      publishOptions();

      return _lib;
    }();
  }
})(window); // We send the window variable withing our function