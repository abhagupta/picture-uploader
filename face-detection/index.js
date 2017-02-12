const request = require("request");
const constants = require("./constants");

var URL = 'https://picture-uploader-hackathon.herokuapp.com/';
var KAIROS_URL = 'https://api.kairos.com/'

module.exports = {

    doPost: function(body, callback){
        request(body, function (err, res, body) {
            if (err) {
                console.log(err);
            }

            callback(body);
        })
    },

    enroll: function(img, subjectId, gallery, callback){  // has to be form "abha.jpg"
        var body = {
            "image": URL + img,
            "subject_id": subjectId,
            "gallery_name": constants.gallery_name
        };
        var options = {
            method: 'post',
            body: body,
            json: true,
            url: KAIROS_URL + 'enroll',
            headers: {
                'app_id': constants.app_id,
                'app_key' : constants.app_key
            }
        };

        this.doPost(options, function(response){
            console.log(JSON.stringify(response));
            callback(response);
        });

    },

    recognize: function(img, callback){
        var body = {
            "image": URL + img,
            "gallery_name":constants.gallery_name,
            "threshold": constants.threshold
        };
        var options = {
            method: 'post',
            body: body,
            json: true,
            url:  KAIROS_URL + 'recognize',
            headers: {
                'app_id': constants.app_id,
                'app_key' : constants.app_key
            }
        };

        console.log('debug: ', options);

        this.doPost(options, function(response){
            console.log(JSON.stringify(response));
            callback(response);
        });
    },

    viewAll: function(gallery){
        var body = {
            "gallery_name": gallery
        }
        var options = {
            method: 'post',
            body: body,
            json: true,
            url: KAIROS_URL + 'gallery/view',
            headers: {
                'app_id': constants.app_id,
                'app_key' : constants.app_key
            }
        };

        this.doPost(options, function(response){
            console.log(JSON.stringify(response));
        });

    }

}




