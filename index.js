var express = require('express')
var app = express();
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var ejs = require('ejs');
var faceDetector = require('./face-detection/index');
var googleTTS = require('google-tts-api');
var Afplay = require('afplay');
var download = require('download-file');

var player = new Afplay;
var options = {
    directory: ".",
    filename: "voice.mp3"
}

var path = require('path'),
    fs = require('fs');

//app.use(bodyParser({uploadDir:'/upload'}));
app.use(busboy());

app.use(express.static('public'))

// app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'html');

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.send('Hello World!')
});

app.post('/enroll', function(req, res){
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);
        fstream = fs.createWriteStream(__dirname + '/public/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            //res.redirect('back');
            faceDetector.enroll(filename, filename.substring(0,filename.indexOf('.')), function(response){
                console.log("response recieved from karios: ", response);
                //res.send(response);
            })
            res.send("successfully enrolled");
        });

        // console.log('filname: ' , filename);
        // var temp = filename.substring(0,filename.indexOf('.'));
        // console.log('filname substrng: ' , temp);
        //
        // faceDetector.enroll(filename, temp, function(response){
        //     console.log("response recieved from karios: ", response);
        //     //res.send(response);
        // })
    });

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
                var status = response.images[0].transaction.status;


                if(status === 'success') {
                    var nameOfPerson = response.images[0].candidates[0].subject_id;
                    googleTTS('Welcome Home' + nameOfPerson, 'en', 1)   // speed normal = 1 (default), slow = 0.24
                        .then(function (url) {
                            res.render('home.ejs', {msg: nameOfPerson, audioFile: url});

                        })

                        .catch(function (err) {
                            console.error(err.stack);
                        });
                   // res.send("Welcome Home " + nameOfPerson + " !");
                    //res.render('home.ejs', {msg: nameOfPerson, audioFile: });

                } else {
                    res.render('home.ejs', {msg: "Access Denied !"});
                }

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

