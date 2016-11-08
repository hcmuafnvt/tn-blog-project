function generateSpin(text){
      var result = text;
    var pattern = /{([^{}]*)}/g;
    match = pattern.exec(text);
    while (match != null){
      result = result.replace(match[0], select(match[1]));
      match = pattern.exec(text);
    }
    console.log(result);
}

function select(m){
    var choices = m.split('|');
    var index = getRandomInt(0, choices.length - 1);
    return choices[index];
}

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

var str = "{Hello|What's Up|Howdy} {world|planet} | {Goodbye|Later} {people|citizens|inhabitants}";
generateSpin(str);

////////////////////////
//create map Obj
function replaceTextByPhrase() {
  var arrPhrases = $('#txt1').val().split(',');
  var listResult = [];
  for(var i=0; i < arrPhrases.length; i++) {
    var onePhrase = arrPhrases[i].trim();
    var start = onePhrase.indexOf('{');
    var end = onePhrase.lastIndexOf('}');
    var onePhraseRemovedBrace = onePhrase.substring(start+1, end);
    var arrOnePhrase = onePhraseRemovedBrace.split('|');
    for(var j=0; j < arrOnePhrase.length; j++) {
      listResult.push({
        key: arrOnePhrase[j],
        phrase: onePhrase
      });
    }
  }
  console.log(listResult);
  listResult.forEach(function(obj, idx) {
    console.log(obj.key + ': ' + obj.phrase);
  });
}

////////////////////////
//replace text by Map Obj
var str = "Facebook đã gặp phải những vấn đề khó khăn gần đây, FB đã vấp phải các vấn nạn khó khăn không xa";
var mapObj = {
  "gặp phải":"{gặp phải|vấp phải}",
  "vấp phải":"{gặp phải|vấp phải}",
  "những": "{các|những}",
  "các": "{các|những}",
  "không xa": "{gần đây|không xa}",
  "gần đây": "{gần đây|không xa}"
};

function replaceAll(str,mapObj){
    var re = new RegExp(Object.keys(mapObj).join("|"),"gi");

    return str.replace(re, function(matched){
        return mapObj[matched.toLowerCase()];
    });
}

var div = document.getElementById('txt1');
div.innerHTML = replaceAll(str, mapObj);
