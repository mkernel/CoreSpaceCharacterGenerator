"use strict";

class BusinessLogic {
	constructor() {
		
	}
		
	validate(dataset) {
		//console.log(JSON.stringify(dataset));
		dataset.valid = true;
		dataset.validation_errors = [];
		var countset={};
		for(var i=0;i<dataset.ActiveSkills.length;i++) {
			if(typeof(dataset.ActiveSkills[i].Skill[0]) !== 'undefined') {
				if(typeof(countset[dataset.ActiveSkills[i].Skill[0]]) === 'undefined' ) {
					countset[dataset.ActiveSkills[i].Skill[0]]=0;
				}
				countset[dataset.ActiveSkills[i].Skill[0]]++;
			}
		}
		var keys = Object.keys(countset);
		if (keys.length>3) {
			dataset.valid = false;
			dataset.validation_errors.push({msg:"You can choose up to three different categories. You selected Skills from "+keys.length+"."});
		}
		else {
			var moreThanTwo = 0;
			var equalsTwo = 0;
			var equalsOne = 0;
			for(var i=0;i<keys.length;i++) {
				var key = keys[i];
				if(countset[key]>2) {
					moreThanTwo ++;
				}
				if(countset[key]==2) {
					equalsTwo ++;
				}
				if(countset[key]==1) {
					equalsOne ++;
				}
			}
			if (moreThanTwo > 1) {
				dataset.valid = false;
				dataset.validation_errors.push({msg:"You can have only one skill type with more than two skills selected."});
			}
			if (!(equalsTwo == 2 && moreThanTwo==0 || equalsTwo == 1 || equalsTwo == 0)) {
				dataset.valid = false;
				dataset.validation_errors.push({msg:"You can have only one skill type with two skills."});
			}
		}
		return dataset;
	}
}

$(window).on('load',function(){
	window.businesslogic = new BusinessLogic();	
});