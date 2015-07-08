var oldstart = console.time
var oldend = console.timeEnd

var map = {}
console.time = function() {
  var args = [].slice.call(arguments)

  if (map[args[0]] === undefined)
  map[args[0]] = 1

  else map[args[0]] += 1

  oldstart(args)
}

console.timeEnd = function() {
  var args = [].slice.call(arguments)
  
  if (map[args[0]] === undefined)
  map[args[0]] = 1

  else map[args[0]] += 1

  oldend(args)
}


var testArr = []
console.time('uno')
for(var i = 0; i < 1000000; i++) {
  testArr.push(1)
}
console.timeEnd('uno')


console.log(map)
