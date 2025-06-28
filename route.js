var express = require('express')  
var app = express()  
  
app.get('/', function (req, res) {  
res.send('<h1>Hello World!</h1>')  
});  
app.get('/login', function (req, res) {  
    res.send('login!')  
});  
app.get('/Goodbye', function (req, res) {  
    res.send('Bye bye!')  
});  
              
app.listen(3000, function () {  
console.log('Example!')  
})