(function () {
    'use strict';

    var spinDataObject;

    // get data from window.dataspin then add to json object
    function makeSpinDataObject() {        
        if(typeof spinDataObject !== 'undefined') {
            return;
        }
        spinDataObject = {};

        var result = '';
        var pattern = /{([^{}]*)}/g;
        var match = pattern.exec(window.dataspin);
        while (match != null) {
            addToSpinDataObject(match[1], match[0]);
            match = pattern.exec(window.dataspin);
        }       
    }

    function addToSpinDataObject (listkeys, value) {
        var keys = listkeys.split('|'); 
        for(var i = 0; i < keys.length; i++) {
            spinDataObject[keys[i]] = value;
        }
    }

    // replace all text are matched with curly brackets content
    function updateContentWithCurlyBrackets(content) {
        makeSpinDataObject();        
        var re = new RegExp(Object.keys(spinDataObject).join("|"),"gi");

        return content.replace(re, function(matched){
            return spinDataObject[matched];
        });
    }

    window.spinDataUtil = {
        updateContentWithCurlyBrackets: updateContentWithCurlyBrackets
    }    
})();