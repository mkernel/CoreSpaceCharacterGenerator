"use strict";

class BusinessLogic {
	constructor() {
		
	}
	
	career_levels(dataset) {
		var career_levels = 0;
		if(dataset.maxCareer[0]>0) {
			career_levels = 1;
			if(dataset.maxCareer[1]>0) {
				career_levels = 2;
				
				if(dataset.maxCareer[2]>0) {
					career_levels = 3;
				}
			}
		}
		return career_levels;
	}
	
	guardborder(min,value,max,dataset) {
		if(value < min) {
			dataset.updated=true;
			return min;
		}
		if(value > max) {
			dataset.updated=true;
			return max;
		}
		return value;
	}
	
	validate(dataset) {
		//console.log(JSON.stringify(dataset));
		dataset.valid = true;
		dataset.updated = false;
		dataset.validation_errors = [];
		var career_levels = this.career_levels(dataset);
		if(dataset.maxActions > 2 && career_levels < 3) {
			dataset.valid = false;
			dataset.validation_errors.push({
				'msg':'To get more than 2 Actions 3 career levels are needed',
				'fix':{maxActions: 2}
			});
		}
		if(dataset.availHealth < dataset.maxHealth-career_levels) {
			dataset.availHealth = dataset.maxHealth - career_levels;
			dataset.updated = true;
		}
		if(dataset.availHealth > dataset.maxHealth) {
			dataset.availHealth = dataset.maxHealth;
			dataset.updated = true;
		}
		if(dataset.availSkills < dataset.maxSkills - career_levels) {
			dataset.availSkills = dataset.maxSkills - career_levels;
			dataset.updated = true;
		}
		//now we have to calculate the career stuff. First things first: sum them up.
		var sum = 0;
		dataset.maxCareer.forEach(function(elem){
			sum += elem;
		});
		if(sum < 5) {
			dataset.valid = false;
			dataset.validation_errors.push({
				'msg':'You need to put at least 5 points into career.',
				'fix':null
			});
		}
		//now lets ensure that every level is smaller than the one below.
		if(dataset.maxCareer[1] > 0) {
			if(dataset.maxCareer[0] <= dataset.maxCareer[1]) {
				dataset.valid = false;
				dataset.validation_errors.push({
					'msg':'Career Level 1 needs more points than Career level 2.',
					'fix':null
				});
			}
		}
		if(dataset.maxCareer[2] > 0) {
			if(dataset.maxCareer[1] <= dataset.maxCareer[2]) {
				dataset.valid = false;
				dataset.validation_errors.push({
					'msg':'Career Level 2 needs more points than Career level 3.',
					'fix':null
				});
			}
		}
		//check generic skills and skills for value limits!
		["Primary","Secondary","Tertiary"].forEach((function(elem){
			var set = dataset.SpecialSkills[elem];
			if(set.Type=="SKILL") {
				if(set.ValueX < 1) {
					set.ValueX = 1;
					dataset.updated = true;
				}
				if(set.ValueX > 3) {
					set.ValueX = 3;
					dataset.updated = true;
				}
			}
			if(set.Type=="GENERIC") {
				if(set.Skill == "Close combat") {
					set.ValueX = this.guardborder(1,set.ValueX,3,dataset);
				}
				if(set.Skill == "Ranged attack") {
					set.ValueX = this.guardborder(1,set.ValueX,2,dataset);
				}
				if(set.Skill == "Armour") {
					set.ValueX = this.guardborder(1,set.ValueX,3,dataset);
				}
				if(set.Skill == "Move") {
					set.ValueX = this.guardborder(1,set.ValueX,3,dataset);
				}
				if(set.Skill == "Climb and jump") {
					if(set.ValueX + set.ValueY > 9) {
						dataset.valid=false;
						dataset.validation_errors.push({
							'msg':'Climb and jump value is not allowed to exceed 9.',
							'fix':null
						});
					}
				}
				if(set.Skill == "Resurrect") {
					set.ValueX = this.guardborder(1,set.ValueX,2,dataset);
				}
				if(set.Skill == "Huge") {
					set.ValueX = this.guardborder(1,set.ValueX,2,dataset);
				}
			}
		}).bind(this));
		return dataset;
	}
	
	calculatePoints(dataset) {
		if(dataset.valid == false) {
			dataset.CharacterPoints = -1;
		} else {
			var points = 0;
			points += dataset.maxHealth*2;
			points += dataset.maxActions*4;
			points += dataset.maxSkills*2;
			dataset.maxCareer.forEach(function(elem){points += elem});
			var career_levels=this.career_levels(dataset);
			var diffHealth = dataset.availHealth-(dataset.maxHealth - career_levels);
			points += diffHealth*3;
			
			var diffSkills = dataset.availSkills - (dataset.maxSkills - career_levels);
			points += diffSkills*3;
			
			["Primary","Secondary","Tertiary"].forEach(function(elem){
				var set = dataset.SpecialSkills[elem];
				if(set.Type=="SKILL") {
					points += set.ValueX*2;
				}
				if(set.Type=="GENERIC") {
					if(set.Skill == "Close combat") {
						if(set.ValueX == 1) { points +=2;}
						if(set.ValueX == 2) { points +=5;}
						if(set.ValueX == 3) { points +=10;}
					}
					if(set.Skill == "Ranged attack") {
						if(set.ValueX == 1) {points += 3;}
						if(set.ValueX == 2) {points += 5;}
					}
					if(set.Skill == "Armour") {
						if(set.ValueX == 1) {points += 4;}
						if(set.ValueX == 2) {points += 8;}
						if(set.ValueX == 3) {points += 20;}
					}
					if(set.Skill == "Move") {
						if(set.ValueX == 1) {points += 2;}
						if(set.ValueX == 2) {points += 4;}
						if(set.ValueX == 3) {points += 10;}
					}
					if(set.Skill == "Climb and jump") {
						var sum = set.ValueX+set.ValueY;
						if(sum <= 4) { points += 4;}
						if(sum <= 6) { points += 8;}
						if(sum <= 9) { points += 14;}
					}
					if(set.Skill == "Resurrect") {
						if(set.ValueX == 1) { points += 4;}
						if(set.ValueX == 2) { points += 7;}
					}
					if(set.Skill == "Move and close combat") {
						points += 4;
					}
					if(set.Skill == "Huge") {
						if(set.ValueX == 1) { points += 4;}
						if(set.ValueX == 2) { points += 10;}
					}
				}
			});
			dataset.CharacterPoints = points;
		}
		return dataset;
	}
}

$(window).on('load',function(){
	window.businesslogic = new BusinessLogic();	
});