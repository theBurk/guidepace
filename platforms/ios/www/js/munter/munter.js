msa = angular.module("msApp", ["ngResource", "ngTouch"]);

msa.controller("MunterSystemCtrl", ["$scope", "MunterTrip",
    function($scope, MunterTrip) {
		
                                    
        // units for distance & elevation
		$scope.elevationUnits = {
            m: "m",
            ft: "ft"
        };
		
		$scope.distanceUnits = {
			mi: "mi",
			km: "km"
		};
		
                                    
        // defaults selected
        $scope.munterTrip = new MunterTrip({
            elevationUnit: $scope.elevationUnits.ft,
            distanceUnit: $scope.distanceUnits.mi,
        });
                                    
        $scope.munterTrip.view = "home";                // current view (initialize as home)
        $scope.munterTrip.targetInput = "rate";         // form control selected to recieve user input (initialize as rate)
        $scope.munterTrip.showRateInfo = false;         // initializes show rate info to false
        $scope.munterTrip.showWelcome = true;           // shows welcome screen on first visit
         
        // --------------------------------------------------
        //  User input intperpretation & validation
        // --------------------------------------------------
                                    
                                    
        // interprets keyboard input
        $scope.keyboardAction = function(key) {
                                    
            var input;
                            
            switch ($scope.munterTrip.targetInput) {
                case "rate":
                    input = $scope.munterTrip.rate;
                    break;
                case "distance":
                    input = $scope.munterTrip.distance;
                    break;
                case "elevation":
                    input = $scope.munterTrip.elevation;
                    break;
                case "pitches":
                    input = $scope.munterTrip.pitches;
                    break;
            }
                                    
                            
            if (!input) {
                input =  (key==".") ? "0." : key;
            }
                                    
            else if (input && input==0 && input.toString().length==1 && key!="bksp") {
                input =  (key==".") ? "0." : key;
            }
                            
            else if (key=="bksp") {
                input = (input.toString.length==1) ? null : input.substring(0, input.length-1);
            }
                                    
            else {
                input = "" + input + key;
            }
                                
                                    
            switch ($scope.munterTrip.targetInput) {
                case "rate":
                    $scope.munterTrip.rate = input;
                    break;
                case "distance":
                    $scope.munterTrip.distance = input;
                    break;
                case "elevation":
                    $scope.munterTrip.elevation = input;
                    break;
                case "pitches":
                    $scope.munterTrip.pitches = input;
                    break;
            }
                                    
        };
                                    
                                    
                                    
        // data validation - disables keyboard keys when appropriate
        $scope.isDisabled = function (key) {
            
            // maximum number of characters allowed for each input type
            var maxRateChar = 4;
            var maxDistanceChar = 6;
            var maxElevationChar = 6;
            var maxPitchesChar = 4;
                                    
            var input;
                                    
            switch ($scope.munterTrip.targetInput) {
                case "rate":
                    input = $scope.munterTrip.rate;
                    break;
                case "distance":
                    input = $scope.munterTrip.distance;
                    break;
                case "elevation":
                    input = $scope.munterTrip.elevation;
                    break;
                case "pitches":
                    input = $scope.munterTrip.pitches;
                    break;
            }

                                    
            switch (key) {
                case ".":
                    return  $scope.munterTrip.targetInput=="elevation"
                        ||  $scope.munterTrip.targetInput=="pitches"
                        ||  (input && input.toString().indexOf('.') != -1)
                        ||  (input && $scope.munterTrip.targetInput=="rate" && input.toString().length==maxRateChar)
                        ||  (input && $scope.munterTrip.targetInput=="distance" && input.toString().length==maxDistanceChar)
                        ||  (input && $scope.munterTrip.targetInput=="elevation" && input.toString().length==maxElevationChar)
                        ||  (input && $scope.munterTrip.targetInput=="pitches" && input.toString().length==maxPitchesChar);
                    
                case "-":
                   return   $scope.munterTrip.targetInput=="rate"
                        ||  $scope.munterTrip.targetInput=="distance"
                        ||  $scope.munterTrip.targetInput=="pitches"
                        ||  input
                        ||  (input && input.toString().indexOf('-') != -1)
                        ||  (input && $scope.munterTrip.targetInput=="rate" && input.toString().length==maxRateChar)
                        ||  (input && $scope.munterTrip.targetInput=="distance" && input.toString().length==maxDistanceChar)
                        ||  (input && $scope.munterTrip.targetInput=="elevation" && input.toString().length==maxElevationChar)
                        ||  (input && $scope.munterTrip.targetInput=="pitches" && input.toString().length==maxPitchesChar);
                                    
                case "bksp":
                    return  !input;
                                    
                case "d":
                    return  (input && $scope.munterTrip.targetInput=="rate" && input.toString().length==maxRateChar)
                        ||  (input && $scope.munterTrip.targetInput=="distance" && input.toString().length==maxDistanceChar)
                        ||  (input && $scope.munterTrip.targetInput=="elevation" && input.toString().length==maxElevationChar)
                        ||  (input && $scope.munterTrip.targetInput=="pitches" && input.toString().length==maxPitchesChar);

            }
            
            return false;
        };                                   
               
                                    
        // switches distance unit
        $scope.switchDistanceUnit = function() {
            if($scope.munterTrip.distanceUnit == "mi") {
                $scope.munterTrip.distanceUnit = "km";
            }
            else {
                $scope.munterTrip.distanceUnit = "mi";
            }
        };
           
                                    
        // switches elevation unit
        $scope.switchElevationUnit = function() {
            if($scope.munterTrip.elevationUnit == "ft") {
                $scope.munterTrip.elevationUnit = "m";
            }
            else {
                $scope.munterTrip.elevationUnit = "ft";
            }
        };
            
                                    

        // --------------------------------------------------
        //  Time output calculation
        // --------------------------------------------------
        
		// calculates travel time in seconds using specified mode of calculation (munter / chauvin / technical)
		$scope.time = function(mode) {
			var dist = (!$scope.munterTrip.distance || $scope.munterTrip.distance==".")  ? 0 : $scope.munterTrip.distance;
			var elev = (!$scope.munterTrip.elevation || $scope.munterTrip.elevation=="." || $scope.munterTrip.elevation=="-")  ? 0 : $scope.munterTrip.elevation;
			var pit = (!$scope.munterTrip.pitches || $scope.munterTrip.pitches==".")  ? 0 : $scope.munterTrip.pitches;
			var time;
			var units;
			
			switch($scope.munterTrip.view) {
				case "munterCalc":
					units = normalize(dist, $scope.munterTrip.distanceUnit)/1000 + Math.abs(normalize(elev, $scope.munterTrip.elevationUnit))/100;
					time =  units / ($scope.munterTrip.rate/3600);
					break;
				case "chauvinCalc":
					units = (normalize(dist, $scope.munterTrip.distanceUnit) + Math.abs(normalize(elev, $scope.munterTrip.elevationUnit)))/60;
					time = units * ($scope.munterTrip.rate * 60);
					break;
				case "techCalc":
					time = pit * ($scope.munterTrip.rate * 60);
					break;
			}
			
			return time;
		};
		                      
                                    
        // true if all necessary inputs are present
        $scope.showTime = function() {
            var bool;
            bool = ($scope.munterTrip.elevation || $scope.munterTrip.distance || $scope.munterTrip.pitches) && $scope.munterTrip.rate;
            bool = bool && $scope.munterTrip.rate != 0 && $scope.munterTrip.rate != ".";
            return bool;
        };
                    
		
                                    
        // --------------------------------------------------
        //  Other functions
        // --------------------------------------------------
                                
        // define swipe left navigation
        $scope.swipeLeft = function() {
            switch ($scope.munterTrip.view) {
                case "munterCalc":
                    $scope.munterTrip.view="chauvinCalc";
                    break;
                case "chauvinCalc":
                    $scope.munterTrip.view="techCalc";
                    break;
                case "munterAbout":
                    $scope.munterTrip.view="chauvinAbout";
                    break;
                case "chauvinAbout":
                    $scope.munterTrip.view="techAbout";
                    break;
            }
        };
              
                                    
        // define swipe right navigation
        $scope.swipeRight = function() {
            switch ($scope.munterTrip.view) {
                case "techCalc":
                    $scope.munterTrip.view="chauvinCalc";
                    break;
                case "chauvinCalc":
                    $scope.munterTrip.view="munterCalc";
                    break;
                case "techAbout":
                    $scope.munterTrip.view="chauvinAbout";
                    break;
                case "chauvinAbout":
                    $scope.munterTrip.view="munterAbout";
                    break;
            }
        };

                                    
        // applies special fomatting if target equals targetInput
        $scope.inputStyle = function (target) {
            if(target == $scope.munterTrip.targetInput) {
                return { borderColor: "#66afe9",   borderWidth: "2px" } ;
            }
        };
                                    
                                    
        // adjusts display to fit on 3.5" devices
        $scope.timeStyle = function () {
        
            if (screen.height==480) {
                return { height: "60px", top: "235px", paddingTop: "12px" } ;
            }
            else {
                return { height: "70px", top:"250px", paddingTop: "15px" };
            }
            
        };
                
                                    
        // resets contents of inputs & units
        $scope.clearInputs = function() {
            $scope.munterTrip.targetInput = "rate";
            $scope.munterTrip.distanceUnit = "mi";
            $scope.munterTrip.elevationUnit = "ft";
            $scope.munterTrip.rate = null;
            $scope.munterTrip.distance = null;
            $scope.munterTrip.elevation = null;
            $scope.munterTrip.pitches = null;
            $scope.munterTrip.showRateInfo = false;
            $scope.munterTrip.showWelcome = false;
        }
        
    }
]);


// --------------------------------------------------
//  Angular Models
// --------------------------------------------------

msa.factory("MunterTrip", ["$resource",
    function($resource) {
        return $resource("some/RESTful/url/:id", {id: "@id"});
    }
]);


// --------------------------------------------------
//  Angular Filters
// --------------------------------------------------

msa.filter("prettyTime", function(){
    return function(time) {
        var h = Math.floor(time/3600);
        var m = Math.round((time - 3600*h)/60);

           return h<(7*24) ? [h + " hr ", (m < 10 ? "0" : "") + m + "  min"].join("") : "...forever";
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
