msa = angular.module("msApp", ["ngResource"]);

msa.controller("MunterSystemCtrl", ["$scope", "MunterTrip",
    function($scope, MunterTrip) {
		// Munter System units		
        
		$scope.elevationUnits = {
            m: "m",
            ft: "ft"
        };
		
		$scope.distanceUnits = {
			mi: "mi",
			km: "km"
		};
		
        // balling out of control with a model!
        // default selected...
        $scope.munterTrip = new MunterTrip({
            elevationUnit: $scope.elevationUnits.ft,
            distanceUnit: $scope.distanceUnits.mi,
        });

		
		// calculates travel time in seconds using specified mode of calculation (munter / chauvin / techical)
		$scope.time = function(mode) {
			var dist = (!$scope.munterTrip.distance || $scope.munterTrip.distance==".")  ? 0 : $scope.munterTrip.distance;
			var elev = (!$scope.munterTrip.elevation || $scope.munterTrip.elevation=="." || $scope.munterTrip.elevation=="-")  ? 0 : $scope.munterTrip.elevation;
			var pit = (!$scope.munterTrip.pitches || $scope.munterTrip.pitches==".")  ? 0 : $scope.munterTrip.pitches;
			var time;
			var units;
			
			switch(mode) {
				case "munter":
					units = normalize(dist, $scope.munterTrip.distanceUnit)/1000 + Math.abs(normalize(elev, $scope.munterTrip.elevationUnit))/100;
					time =  units / ($scope.munterTrip.rate/3600);
					break;
				case "chauvin":
					units = (normalize(dist, $scope.munterTrip.distanceUnit) + Math.abs(normalize(elev, $scope.munterTrip.elevationUnit)))/60;
					time = units * ($scope.munterTrip.rate * 60);
					break;
				case "technical":
					time = pit * ($scope.munterTrip.rate * 60);
					break;
			}
			
			return time;
		};
		
		
		// --------------------------------------------------
		//  Data validation
		// --------------------------------------------------
		
		var maxRate = 300;
		var maxDistance = 50000;			
		var maxElevation = 50000;			
		var maxPitches = 100;				

		
		// test if inputs is valid
		$scope.isValidRate = function(val) {
			return !val || val=="." || (isNumber(val) && val>0 && val<=maxRate);
		};
		
		$scope.isValidDistance = function(val) {
            return !val || val=="." ||  (isNumber(val) && val>=0 && val<=maxDistance);
        };
		
		$scope.isValidElevation = function(val) {
            return !val || val=="."  || val=="-" ||  (isNumber(val) && val<=maxElevation);
        };
		
		$scope.isValidPitches = function(val) {
            return !val || val=="." ||  (isNumber(val) && val>=0 && val<=maxPitches);
        };		

		$scope.isValidEverything = function(){
			return $scope.isValidRate($scope.munterTrip.rate) && $scope.isValidDistance($scope.munterTrip.distance) && $scope.isValidElevation($scope.munterTrip.elevation) && $scope.isValidPitches($scope.munterTrip.pitches);
		};

		
		// compose error message based on which inputs are not valid
		$scope.errorMessage = function() {
			var errorText = "invalid ";
			var errorPresent = false;
			
			if (!$scope.isValidRate($scope.munterTrip.rate)) {
				errorPresent = true;
				errorText = errorText + "rate";
			}
			
			if (!$scope.isValidDistance($scope.munterTrip.distance)) {
				errorText = (errorPresent == true) ? (errorText + ", "):errorText;
				errorPresent = true;
				errorText = errorText + "distance";
			}
	
			if (!$scope.isValidElevation($scope.munterTrip.elevation)) {
				errorText = (errorPresent == true) ? (errorText + ", "):errorText;
				errorPresent = true;
				errorText = errorText + "elevation";
			}
			
			if (!$scope.isValidPitches($scope.munterTrip.pitches)) {
				errorText = (errorPresent == true) ? (errorText + ", "):errorText;
				errorPresent = true;
				errorText = errorText + "pitches";
			}
			
			return errorText;
		};

		
		// true if all necessary inputs are present and valid
		$scope.showTime = function() {
			return ($scope.munterTrip.elevation || $scope.munterTrip.distance || $scope.munterTrip.pitches) && $scope.munterTrip.rate 
                && $scope.isValidElevation($scope.munterTrip.elevation) && $scope.isValidDistance($scope.munterTrip.distance) && $scope.isValidPitches($scope.munterTrip.pitches) && $scope.isValidRate($scope.munterTrip.rate);
		};
    }
]);

// --------------------------------------------------
//  Angular Models
// --------------------------------------------------
// Ok, so here's where things get a bit more complicated...
// Earlier (above) I was touting the importance of MVC (Model-View-Controller) or MVVM (Model-View-View-Model) architectures. Cool.
// So far we've only dealt with Views and Controllers; so what about Models? We've sort of hacked a model in place by using $scope,
//  which is fine, but that doesn't scale. In essence, we want to encapsulate all of the parameters that define a time calculation
//  into some sort of MunterTrip model, or something like that. We've already defined the components above (elevation, units, distance, etc.)
//  and now we need to add some structure. Even though this is going to get confusing, its utility will become apparent when we start
//  doing things like creating lists of MunterTrips, saving them to a database, loading them from a database (lookup CRUD), editing them,
//  etc.
// For the time being, don't worry about "$resource"...that will come up later when we integrate this with a database for persistence
msa.factory("MunterTrip", ["$resource",
    function($resource) {
        return $resource("some/RESTful/url/:id", {id: "@id"});
    }
]);

// --------------------------------------------------
//  Angular Filters
// --------------------------------------------------
// Sweet! A simple display function for time! Notice that despite the fancy declaration as an AngularJS Filter, this is really just a function!
// Also note that, because we've "jammed" this filter onto our "msa" object (i.e. our AngularJS Module/Application), it is available anywhere
//  within our application and can be reused.
msa.filter("prettyTime", function(){
    return function(time) {
        var h = Math.floor(time/3600);
        var m = Math.round((time - 3600*h)/60);
        // returns a string of the format: hh:mm:ss
        // the "join(<delimiter>)" function is a sweet native JS function on Arrays (things liek [el0, el1, ..., elN])
        //   that concats the Array elements separated by the <delimiter> string that you can specify (in this case, a colon ":")
        return h<(7*24) ? [h + " hr ", (m < 10 ? "0" : "") + m + "  min"].join("") : "way too much...";
    };
});

// --------------------------------------------------
//  Utils
// --------------------------------------------------
// a function to convert from miles/kilometers/feet to meters
function normalize(value, units) {
	switch(units) {
		case "mi":
			return value * 1609;
		case "km":
			return value * 1000;
		case "ft":
			return value / 3.281;
		case "m":
			return value;
	}
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n) ;
}

// --------------------------------------------------
//  Mucking Around!
// --------------------------------------------------
msa.controller("BurkCtrl", ["$scope",
    function($scope) {
        $scope.mOptions = {
            1: "blue",
            2: "red",
            3: "green"
        };
    }
]);