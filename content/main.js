(function(){
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};


var request = new XMLHttpRequest();
request.overrideMimeType("application/json");  //TODO: make async
request.open('GET', 'chrome://SEE/content/manifest.json', false);  // `false` makes the request synchronous
request.send(null);
var json = JSON.parse(request.responseText);

var myExtension = {
  init: function() {
    var appcontent = document.getElementById("appcontent");   // browser
    if(appcontent){
      appcontent.addEventListener("DOMContentLoaded", myExtension.onPageLoad, true);
    }
  },

  onPageLoad: function(aEvent){
    var doc = aEvent.originalTarget; // doc is document that triggered "onload" event
    for(let i = 0; i<json.content_scripts.length; i++) {
      let content_script = json.content_scripts[i];
      for(let i = 0; i<content_script.matches.length; i++) {
        let match = content_script.matches[i];
        var regmatch = match.replaceAll("\\.","\\.").replaceAll("\\/","\\/").replaceAll("\\*",".*");
        var regexMatch = new RegExp(regmatch);
        if (doc.location.href.match(regexMatch)!=null) {
          var exec = true;
          if (content_script.exclude_matches) {
            for(let i = 0; i<content_script.exclude_matches.length; i++) {          
              let exclude = content_script.exclude_matches[i];
              var regExclude = exclude.replaceAll("\\.","\\.").replaceAll("\\/","\\/").replaceAll("\\*",".*");
              var regexExclude = new RegExp(regExclude);	
              if (doc.location.href.match(regexExclude)!=null) {
                exec = false;
                break;
              }
            }
          }
          if (exec) {
            let sandbox = Components.utils.Sandbox(doc.defaultView.wrappedJSObject, {
              "sandboxPrototype": doc.defaultView.wrappedJSObject,
              "wantGlobalProperties":["fetch"],
              "wantXrays": false
            });
            Components.utils.evalInSandbox("var unsafeWindow = window",sandbox,"latest","chrome://SEE/content/main.js",51);
            if (content_script.js) {
              for(let i = 0; i<content_script.js.length; i++) {          
                let script = content_script.js[i];
                let xmlhttp = new XMLHttpRequest();    //TODO: make async
                xmlhttp.overrideMimeType("text/plain");
                xmlhttp.open("GET", "chrome://SEE/content/"+script, false);
                xmlhttp.send();
                let scriptContent = xmlhttp.responseText;
                Components.utils.evalInSandbox(scriptContent,sandbox,"latest","chrome://SEE/content/"+script,1);
              }
            }
          }
        }	
      }
    }
  }
};


window.addEventListener("load", function load(event){
  window.removeEventListener("load", load, false); //remove listener, no longer needed
  myExtension.init();  
},false);

})();