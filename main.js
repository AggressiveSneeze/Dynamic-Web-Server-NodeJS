var element = document.getElementById('potato');
var potato=0

function callback() {
  alert('Hello' + potato);
  potato+=1;
}

// Add listener
element.addEventListener('click', callback);