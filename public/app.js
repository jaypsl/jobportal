var app = angular.module('myapp', ['ngRoute', 'ngCookies']);
// angular.module('myapp', [
//     'ui.bootstrap'
// ])

app.config(function($routeProvider){
    $routeProvider.when('/' , {
        template : `
        <h1>Welcome to Job Portal</h1>
        <button type="button", ng-click="signUp()" class="btn btn-primary">Sign Up Please</button>
        `,
        controller: 'initialCtrl'
    })
    .when('/registration', {
        templateUrl: '/registration.html',
        controller: 'registrationCtrl'
    })
    .when('/login',{
        templateUrl:  '/login.html',
        controller: 'loginCtrl'
    })
    .when('/home', {
        templateUrl: '/home.html',
        controller: 'homeCtrl',
        resolve: ['authService', function(authService){
            return authService.checkuserstatus();
        }]
    })
    .when('/postJob', {
        templateUrl: '/postJob.html',
        controller: 'postJobCtrl',
        resolve: ['authService', function(authService){
            return authService.checkuserstatus();
        }]
    })
    .when('/searchJob', {
        templateUrl: '/searchJobs.html',
        controller: 'searchJobCtrl',
        resolve: ['authService', function(authService){
            return authService.checkuserstatus();
        }]
    })
    .when('/usersave', {
        templateUrl: '/search.html',
        controller: 'usersaveCtrl',
        resolve: ['authService', function(authService){
            return authService.checkuserstatus();
        }]
    })
    .otherwise('/');
   
});

app.service('MyService', function () {
    var userName;
    var category;
    this.setUserName = (name)=>{
        this.userName = name;
    }
    this.getUserName = ()=>{
        return this.userName; 
    }
    this.setCategory = (cat)=>{
        this.category = cat;
    }
    this.getCategory = ()=>{
        return this.category;
    }
});


app.factory('authService', function($location, $http, $cookieStore, $q){
            return {
                'checkuserstatus': function(){
                    let userObj = $cookieStore.get('userObj');
                    var defer = $q.defer();
                    if(userObj){
                        if(userObj.data.isLoggedIn){
                            console.log(userObj.data.isLoggedIn);
                            defer.resolve("Valid user session");
                        }
                        else{
                            defer.reject();
                            $location.path('/login');
                        }
                    } 
                    else{
                        defer.reject("Invalid user session!");
                        $location.path('/login');
                    }
                    return defer.promise;  
            }
        }; 
});

app.controller('loginCtrl', function($scope, $http, $location, MyService, $cookieStore){
     $scope.login = function(loginform) {
        //console.log("In the login then cookie");
        //console.log(category);
        $http.post('http://localhost:3000/loginuser', $scope.loginform).then(function(resp){
            //console.log(resp.data);
            if(resp.data.isLoggedIn == true){
                $scope.resp = resp.data
                authusername = $scope.resp.data.username;
                MyService.setUserName(authusername);

               
                $cookieStore.put('userObj', resp);
                $cookieStore.put('category', resp.data.data.category);
                //console.log(resp.data.data.category);
                console.log($cookieStore.get('userObj'));
                $location.path('/home');
            } else {
                $location.path('/registration');
            }
        });
     };
});

app.controller('homeCtrl', function($scope, $location, $cookieStore){

    var category = $cookieStore.get('category');
    console.log(category);

    $scope.category = category;

    $scope.postJob = function() {
       $location.path('/postJob');
    }

   $scope.searchJob = function(){
        $location.path('/searchJob');
    }

    $scope.logout = function(){
        $location.path('/login');
        $cookieStore.remove("userObj");
        $cookieStore.remove('category');
    }
});

app.controller("postJobCtrl", function($scope, $location, $http){
    $scope.postJob1 = function(pjf){
        $http.post('http://localhost:3000/postjobs', $scope.pjf).then(function(resp){
            console.log(resp);
        });
        alert("Job posted successfully");

    };

    $scope.reset = function(pjf){
        $scope.pjf = null;
    };

    $scope.GoBack = function(){
        $location.path('/login');
    }

});

app.controller('initialCtrl', function($scope, $location){
    $scope.signUp =  function() {
        $location.path('/registration');
    }
});


app.controller('registrationCtrl', function($scope, $location, $http, $cookieStore){
    $scope.register = function(regform){
        //console.log(regform);
        $cookieStore.put('category', regform.selectCategory);
        //console.log(MyService.savedJobsArray);
        $http.post('http://localhost:3000/register', $scope.regform).then(function(resp){
            localStorage.ruser = JSON.stringify(resp.data);
            $location.path('/login');   
         });  
         alert("Registered successfully"); 
    }

    $scope.category = ["Company", "Job Seeker"];

});

app.controller('searchJobCtrl',function($scope, $location, $http, MyService, $cookieStore){
    // $scope.reset = function(searchform){
    //     $scope.searchform = null;
    // }

    $scope.GoBack = function(){
        $location.path('/home');
    }


    $scope.reset = function(searchform) {
        $scope.searchform = null;
        var userObj = $cookieStore.get('userObj');
        $http.post('http://localhost:3000/reset', userObj).then(function(resp){
            $scope.savedJobData = resp.data.data.array;
            $scope.appliedJobData = resp.data.data.appliedjobs;
            $scope.searchdata = "";
        });
    }

    $scope.search = function(searchform){
        $http.post('http://localhost:3000/search', $scope.searchform).then(function(resp){
                $scope.searchdata = resp.data;
                //var r = $cookieStore.put('userObj', resp);
        });
       
    }

    $scope.savedJobsArray = [];
    var appliedJobsArray = [];
    $scope.savedJobData = "";
    $scope.savedJobs = function(index){
        var userObj = $cookieStore.get('userObj');
        $scope.savejob = {
            jobtitle: $scope.searchdata[index].jobtitle,
            jobDescription: $scope.searchdata[index].jobDescription,
            location: $scope.searchdata[index].location
        };
        var obj = {
            newData : $scope.savejob,
            user : userObj.data.data.username
        }
        $http.post('http://localhost:3000/savedjobs', obj).then(function(resp){
                //console.log(resp.data);
                //$scope.savedJobData = resp.data;
                console.log($scope.savedJobData);
        });        
    }

    $scope.appliedJobs = function(index){
        var userObj = $cookieStore.get('userObj');
        $scope.applyjob = {
            jobtitle: $scope.searchdata[index].jobtitle,
            jobDescription: $scope.searchdata[index].jobDescription,
            location: $scope.searchdata[index].location
        };
        var obj = {
            newData : $scope.applyjob,
            user : userObj.data.data.username
        }
        $http.post('http://localhost:3000/appliedjobs', obj).then(function(resp){
                console.log(resp.data);
                // $scope.savedJobData = resp.data;
                // console.log($scope.savedJobData);
        });        
    }

    $scope.sjobs = function(){
        var userObj = $cookieStore.get('userObj');

        console.log(userObj.data.isRegistered);
        $http.post('http://localhost:3000/getsavejobs', userObj).then(function(resp){
            console.log("In the client saved jobs function");
                console.log(resp.data.data.array);
                $scope.savedJobData = resp.data.data.array;
        });  
    }

    $scope.ajobs = function(){
        var userObj = $cookieStore.get('userObj');
        $http.post('http://localhost:3000/getappliedjobs', userObj).then(function(resp){
            console.log("In the client applied jobs function");
                console.log(resp.data.data.appliedjobs);
                $scope.appliedJobData = resp.data.data.appliedjobs;
        }); 
    }

});


