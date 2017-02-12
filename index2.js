var express = require("express");
var app = express();

app.use(express.static('views'))

var fs = require("fs");

var multer = require("multer");
var faceDetector = require('./face-detection/index');
var upload = multer({dest: "./uploads"});

var uri = process.env.MONGOLAB_URI;
//var mongoURI = 'mongodb://127.0.0.1:27017/images';
var mongoURI = 'mongodb://heroku_3xhdvlx6:vvtk112pobhg67vkd59vmcktht@ds149049.mlab.com:49049/heroku_3xhdvlx6';
var mongoose = require("mongoose");
mongoose.connect(process.env.MONGOLAB_URI || mongoURI);

var conn = mongoose.connection;

var gfs;

var Grid = require("gridfs-stream");
Grid.mongo = mongoose.mongo;

conn.once("open", function(){
    gfs = Grid(conn.db);
    app.get("/", function(req,res){
        //renders a multipart/form-data form
        res.render("home");
    });

    app.post("/upload", upload.single("avatar"), function(req, res, next){
        var writestream = gfs.createWriteStream({
            filename: req.file.originalname
        });
        //
        fs.createReadStream("./uploads/" + req.file.filename)
            .on("end", function(){
                fs.unlink("./uploads/"+ req.file.filename,function(err){
                    //res.send("success")
                })
            })
            .on("err", function(){res.send("Error uploading image")})
            .pipe(writestream);
            writestream.on('finish', function () {
                faceDetector.recognize(req.file.originalname, function(response){
                console.log("response recieved from karios: ", response);
                res.send(response);
            }) });
    });

    // sends the image we saved by filename.
    app.get("/:filename", function(req, res){
        var readstream = gfs.createReadStream({filename: req.params.filename});
        readstream.on("error", function(err){
            res.send("No image found with that title");
        });
        readstream.pipe(res);
    });

    //delete the image
    app.get("/delete/:filename", function(req, res){
        gfs.exist({filename: req.params.filename}, function(err, found){
            if(err) return res.send("Error occured");
            if(found){
                gfs.remove({filename: req.params.filename}, function(err){
                    if(err) return res.send("Error occured");
                    res.send("Image deleted!");
                });
            } else{
                res.send("No image found with that title");
            }
        });
    });
});

app.set("view engine", "ejs");
app.set("views", "./views");

app.listen(process.env.PORT || 3001, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});