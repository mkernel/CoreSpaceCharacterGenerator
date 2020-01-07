"use strict";

class BusinessLogic {
	constructor() {
		
	}
	
	validate(dataset) {
		dataset.valid = true;
		dataset.updated = false;
		dataset.validation_errors = [];
		if(dataset.SpecialSkills.Primary.Skill == "Move") {
			if( dataset.SpecialSkills.Primary.ValueX <1) {
				dataset.updated = true;
				dataset.SpecialSkills.Primary.ValueX = 1;
			}
			if( dataset.SpecialSkills.Primary.ValueX >2) {
				dataset.updated = true;
				dataset.SpecialSkills.Primary.ValueX = 2;
			}
		} else if(dataset.SpecialSkills.Primary.Skill == "Climb and jump") {
			var val = dataset.SpecialSkills.Primary.ValueX + dataset.SpecialSkills.Primary.ValueY;
			if (val > 9) {
				dataset.valid = false;
				dataset.validation_errors.push({msg:"Climb and jump values may not exceed 9."});
			}			
		} else if(dataset.SpecialSkills.Primary.Skill == "Huge") {
			if (dataset.SpecialSkills.Primary.ValueX != 1) {
				dataset.SpecialSkills.Primary.ValueX = 1;
				dataset.updated = true;
			}
		}
		return dataset;
	}
	
	calculateRank(dataset) {
		var points = dataset.CloseAssault + dataset.RangedAssault + dataset.Armour + dataset.Persuasion + dataset.Actions*2;
		if (dataset.SpecialSkills.Primary.Skill == "Move") {
			points += dataset.SpecialSkills.Primary.ValueX;
		}
		if (dataset.SpecialSkills.Primary.Skill == "Climb and jump") {
			var val = dataset.SpecialSkills.Primary.ValueX + dataset.SpecialSkills.Primary.ValueY;
			if (val <= 4) {
				points += 1;
			} else if(val <= 6) {
				points += 2;
			} else if(val <= 9) {
				points += 3;
			}
		}
		if(dataset.SpecialSkills.Primary.Skill == "Huge") {
			points += 1;
		}
		if (points <= 8) {
			dataset.Rank = 1;
		} else if(points <= 11) {
			dataset.Rank = 2;
		} else {
			dataset.Rank = 3;
		}
		return dataset;
	}
}

$(window).on('load',function(){
	window.businesslogic = new BusinessLogic();	
});