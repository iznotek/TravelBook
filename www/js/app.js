
(function(){   

var app = angular.module('travelbook', ['ionic', 'ngCordova', 'travelbook.notestore']);

app.config(function($stateProvider, $urlRouterProvider){
    
    $stateProvider.state('list', {
        url: '/list',
        templateUrl: 'templates/list.html'
    });
    
    $stateProvider.state('edit', {
        url: '/edit/:noteId',
        templateUrl: 'templates/edit.html',
        controller: 'EditCtrl',
    });
    
    $stateProvider.state('add', {
        url: '/add',
        templateUrl: 'templates/edit.html',
        controller: 'AddCtrl'
    });
    
    
        $stateProvider.state('geolocation', {
        url: '/geolocation',
        templateUrl: 'templates/geolocation.html',
        controller: 'LocationCtrl'
    });
    
        $stateProvider.state('settings', {
        url: '/settings',
        templateUrl: 'templates/settings.html',
        //controller: 'settingsCtrl'
    });
    
    $urlRouterProvider.otherwise('/list');
});


app.controller('ListCtrl', function($scope, NoteStore) {
    
    $scope.reordering = false;
    $scope.notes = NoteStore.list();
    $scope.remove = function(noteId){
        NoteStore.remove(noteId);
    };
    $scope.move = function(note, fromIndex, toIndex){
        NoteStore.move(note, fromIndex, toIndex);      
    };
    $scope.toggleReordering = function(){
        $scope.reordering = !$scope.reordering;
    };

});
    
app.controller('ShareCtrl', function($scope, $cordovaSocialSharing) {
   
    $scope.shareAnywhere = function() {
        $cordovaSocialSharing.share("This is your message", "This is your subject", "www/imagefile.png", "https://www.thepolyglotdeveloper.com");
    }
 
    $scope.shareViaTwitter = function(message, image) {
        $cordovaSocialSharing.canShareVia("twitter", message, image).then(function(result) {
            $cordovaSocialSharing.shareViaTwitter(message, image);
        }, function(error) {
            alert("Cannot share on Twitter");
        });
    }

});
    
app.controller('FontCtrl', function($scope, $ionicModal){
    alert($scope.choice);
});    
    

app.controller('EditCtrl', function($scope, $state, $rootScope, $cordovaCamera, NoteStore, $cordovaDevice, $cordovaFile, $ionicPlatform, $ionicActionSheet){
    
    $scope.note = angular.copy(NoteStore.get($state.params.noteId));
    
    $scope.save = function(){
        NoteStore.update($scope.note);
        $state.go('list');
         };
		 
		 
    $scope.takePicture = function (){
        var options = {
			destinationType: Camera.DestinationType.DATA_URL,
			encodingType: Camera.EncodingType.JPEG,
			saveToPhotoAlbum: true,
            quality: 50,
			correctOrientation:true    
        };
		
		$cordovaCamera.getPicture(options).then(function(data){
			$scope.note.fotos.push("data:image/jpeg;base64," + data);
		}, function(error){
			// console.log('camera error: ' + angular.toJson(data));
		});
		
	};
    
/*var onPhotoSuccess = function(FILE_URI) {
    alert(FILE_URI);  
    $scope.note.images.push("file:image/jpeg;base64," + data);   
    $scope.apply();
};*/

    $scope.selectPhoto = function(){
     var options= {
        destinationType: Camera.DestinationType.DATA_URL,
        saveToPhotoAlbum: false,
        sourceType: 0,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
        encodingType: 0
    };
    
    $cordovaCamera.getPicture(options).then(function(imageData){
        
        var image = document.getElementById('myImage');
        $rootScope.imgURI.note.fotos.push = ("data:image/jpeg;base64," + imageData);
        alert(images);
        alert(imgURI);
        alert(imageData);
    }, function(error){
    });
};

});
    
app.controller('AddCtrl', function($scope, $state, $cordovaCamera, NoteStore){
    var _id = new Date();
	
    $scope.note = {
        Id: _id.getTime().toString(),
		date: _id.getDate()+'.'+( (_id.getMonth()<9? '0':'') + (_id.getMonth()+1) )+'.'+_id.getFullYear()+' '+_id.getHours()+':'+_id.getMinutes(),
        title: '',
        description: '',
		fotos: [],
        images: []
    };
    
    $scope.save = function(){
        NoteStore.create($scope.note);
        $state.go('list');
    };

    $scope.takePicture = function (){
        var options = {
			destinationType: Camera.DestinationType.DATA_URL,
			encodingType: 0,
			saveToPhotoAlbum: true,
			correctOrientation:true    
        };
		
		$cordovaCamera.getPicture(options).then(function(data){
			$scope.note.fotos.push("data:image/jpeg;base64," + data);
        }, function(error){
            // console.log('camera error: ' + angular.toJson(data));
		});
    };
    
});
    
app.controller('LocationCtrl', function($scope, $cordovaGeolocation, $ionicPlatform){
    
    $scope.dropdown = function(){
        document.getElementById('mapview').style.display='none;';
    };
    
    function showMap(coords) {
    map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: coords.latitude, lng: coords.longitude},
    zoom: 17
  });
        
}

	$ionicPlatform.ready(function() {
		
		var posOptions = {
            enableHighAccuracy: false,
            timeout: 20000,
            maximumAge: 0
        };
		$cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
            var lat  = position.coords.latitude
            var long = position.coords.longitude
			$scope.coords = position.coords;
			showMap(position.coords);
		}, function(err) {
			console.log('getCurrentPosition error: ' + angular.toJson(err));
			// document.getElementById('myError').innerHTML = err;
			var txt = '';
			for (x in err) {
				txt += x+': '+err[x]+';';
			}
			document.getElementById('myError').innerHTML = txt;
			
		});
        
        var watchOptions = {
            timeout : 3000,
            enableHighAccuracy: false // may cause errors if true
        };

        var watch = $cordovaGeolocation.watchPosition(watchOptions);
        watch.then(null,
            function(err) {
              // error
            },
            function(position) {
              var lat  = position.coords.latitude
              var long = position.coords.longitude
          });
          //watch.clearWatch();

    });
});

    
app.run(function($ionicPlatform) {
	$ionicPlatform.ready(function() {
	if(window.cordova && window.cordova.plugins.Keyboard) {

		cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		
		cordova.plugins.Keyboard.disableScroll(true);
        
	}
	if(window.StatusBar) {
		StatusBar.styleDefault();
	}

	});
});
}());