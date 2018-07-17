var express = require('express'),
    app = express(),
    mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors')

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.Promise = require('q').Promise;

mongoose.connect('mongodb://localhost:27017/users', function(err){
    if(err){
        console.log("Connection not established");
    }
    else{
        console.log("Connection established")
    }
});

var Schema = mongoose.Schema;

var users_schema = new Schema({
    username: String,
    password: String,
    email: String,
    location: String,
    category: String,
    phone: String,
    array: [{jobtitle: String, jobDescription: String, location: String}],
    appliedjobs: [{jobtitle: String, jobDescription: String, location: String}]
});

var postJobs_schema = new Schema({
    jobtitle: String,
    jobDescription: String,
    keywords: String,
    location: String
});

var user = mongoose.model('userjobs', users_schema);
var saveJobs = mongoose.model('postJobs', postJobs_schema);

//////////////post jobs in database/////////////////////////
app.post('/postjobs', function(req, res){
    //console.log("In the postjobs server function");
    var post = new saveJobs({
        jobtitle: req.body.jobtitle,
        jobDescription: req.body.jobdesc,
        keywords: req.body.keyword,
        location: req.body.location
    });
    console.log(post);
    post.save(function(err) {
        if (!err){
           console.log("jobs are saved");
           res.send({
                jobSaved: true,
                message: 'job saved successfully'
            });
        }
        else{
            res.send({
                jobSaved:false,
                message: 'job not saved'
            });
        } 
    });
});

///////////////////// USER SAVED JOBS/////////////////////////////
app.post('/savedjobs', function(req, res){
        
        var uname = req.body.user;
        var newdata = req.body.newData;
        user.findOneAndUpdate(
            {username: uname},
            {$push : {
                array : newdata
            }
        }, function(err, user){
            if(err){
                return res.status(500).send();
            }
            if(!user){
                return res.send({
                    isSaved: false,
                    message: "not saved"
                });
            } 
            return res.send({
                isSaved: true,
                message: "data saved",
                data: user
            });
        });
});

app.post('/getsavejobs', function(req, res){
    
    var username = req.body.data.data.username;
    user.findOne({username: username}, function(err, user){
            if(err){
                return res.status(500).send();
            }
            if(!user){
                return res.send({
                    isRegistered: false,
                    message: "Not Registered"
                });
            }
            return res.send({
                isRegistered: true,
                message: "Registered",
                data: user
            });

    });
})

app.post('/appliedjobs', function(req, res){
    // console.log('I am in applied jobs');
    // console.log(req.body.newData);
    // console.log(req.body.user);

    var uname = req.body.user;
    var newdata = req.body.newData;
    user.findOneAndUpdate(
        {username: uname},
        {$push : {
            appliedjobs : newdata
        }
    }, function(err, user){
        if(err){
            return res.status(500).send();
        }
        if(!user){
            return res.send({
                isSaved: false,
                message: "not saved"
            });
        } 
        return res.send({
            isSaved: true,
            message: "data saved",
            data: user
        });
    });
});

app.post('/getappliedjobs', function(req, res){
    //console.log('In the getapplied jobs function');
    //console.log(req.body.data.data.username);
    var username = req.body.data.data.username;
    user.findOne({username: username}, function(err, user){
            if(err){
                return res.status(500).send();
            }
            if(!user){
                return res.send({
                    isRegistered: false,
                    message: "Not Registered"
                });
            }
            return res.send({
                isRegistered: true,
                message: "Registered",
                data: user
            });
    });
})

app.post('/reset', function(req, res){
        console.log("In the reset");
       
        var username = req.body.data.data.username;
        //var newdata = [];
        console.log(username);
        user.update({username: username}, {"$set": {array: [], appliedjobs:[]}}, function(err, user){
            if(err){
                return res.send({
                    reset: false,
                    message: "not reset"
                });
            }
            if(!user){
                return res.send({
                    reset: false,
                    message: "not reset"
                });
            } 
            return res.send({
                reset: true,
                message: "done reset",
                data: user
            });

        });
});

app.post('/loginuser', function(req, res){
     //console.log("In the login");
     var username =  req.body.username;
     var password = req.body.password;
     console.log("sdsd"+ username);
     
     user.findOne({username: username, password: password}, function(err, user){
        if(err){
            //console.log(err);
            return res.status(500).send();
        }
        if(!user){
            return res.send({
                isLoggedIn: false,
                message: "Not Registered"
            });
        }
        return res.send({
            isLoggedIn: true,
            message: "Registered",
            data: user
        });
     });
});

app.post('/search', function(req, res){
    //console.log(req.body);
    var searchTitle =  req.body.searchTitle;
    var searchKeyword =  req.body.searchKeyword;
    var searchLocation =  req.body.searchLocation;
   //// console.log(searchTitle);

    saveJobs.find({$or:[{jobtitle : searchTitle}, {keywords: searchKeyword}, {location: searchLocation}]}, function(err, result){
        if(err){
            console.log(err);
            return res.status(500).send();
        }
        if(!result){
            return res.send({
                isFind: false,
                message: "Not Find"
            });
        }
        return res.send(result);
     });

});

app.post('/register', function(req, res){

    var userRegistration = new user({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        location: req.body.location,
        category: req.body.selectCategory,
        phone: req.body.phone
    });
    
    userRegistration.save(function(err) {
        if (!err){
           console.log("Document saved");
           res.send({
                isRegistered: true,
                message: 'registered'
            });
        }
        else{
            res.send({
                isRegistered:false,
                message: 'Registration error'
            })
        } 
    });
});

///////////////////////////////////////////////////////////////
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(3000, function () {
    console.log('Server running at local host @3000');
});