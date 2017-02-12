var express = require('express')
var app = express();
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var faceDetector = require('./face-detection/index');

var path = require('path'),
    fs = require('fs');

//app.use(bodyParser({uploadDir:'/upload'}));
app.use(busboy());

app.use(express.static('public'))

app.get('/', function (req, res) {
    res.send('Hello World!')
});

app.post('/upload', function (req, res) {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);
        fstream = fs.createWriteStream(__dirname + '/public/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            //res.redirect('back');
            faceDetector.recognize(filename, function(response){
               console.log("response recieved from karios: ", response);
            })
        });
    });
    // ...
});

// app.listen(3000, function () {
//     console.log('Example app listening on port 3000!')
// });

app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

