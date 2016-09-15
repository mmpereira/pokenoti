(function() {
    'use strict';
    
    angular
        .module('pokeApp', [])
        .controller('Ctrl', Ctrl);
        
        
        
    function Ctrl($scope, $http) {
        
        $http.get('https://pokenoti-mmpereira1.c9users.io/names')
            .then(function(response) {
                $scope.names = response.data;
            });
            
       $http.get('https://pokenoti-mmpereira1.c9users.io/rarities')
            .then(function(response) {
                $scope.rarities = response.data;
            });
            
            
      $http.get('https://pokenoti-mmpereira1.c9users.io/wanted')
            .then(function(response) {
                $scope.wanted = response.data;
            });
            
        $scope.addName = function() {
            console.log('add name: ', $scope.selectedName);
            $scope.wanted.name.push($scope.selectedName);
        }
        
        $scope.addRarity = function() {
            $scope.wanted.rarity.push($scope.selectedRarity);
        }
        
        $scope.removeName = function(name) {
            $scope.wanted.name = _.without($scope.wanted.name, name);
        }
        
        $scope.removeRarity = function(rarity) {
            $scope.wanted.rarity = _.without($scope.wanted.rarity, rarity);
        }
        
        $scope.save = function() {
          console.log('save')  ;
        };
    }
    
})();