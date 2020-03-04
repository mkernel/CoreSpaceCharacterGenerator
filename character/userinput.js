"use strict";

$(window).on('load',function(){
	window.kickingoff=false;
	var kickoff=function(readurl=false) {
		if(window.kickingoff) { return;}
		window.kickingoff=true;
		//lets create a characterset.
		var dataset={};
		dataset.maxHealth = parseInt($("#max_health").val());
		dataset.availHealth = parseInt($("#avail_health").val());
		dataset.maxActions = parseInt($("#max_actions").val());
		dataset.availActions = Math.min(dataset.maxActions,2);
		dataset.maxSkills = parseInt($("#max_skills").val());
		dataset.availSkills = parseInt($("#avail_skills").val());
		dataset.maxCareer = [parseInt($("#max_career_1").val()),parseInt($("#max_career_2").val()),parseInt($("#max_career_3").val())];
		dataset.availCareer = [Math.ceil(dataset.maxCareer[0]/2)];
		dataset.CharacterRace = $("#character_race").val().toUpperCase();
		dataset.CharacterName = $("#character_name").val().toUpperCase();
		dataset.CharacterType = $("#character_type").val().toUpperCase();
		
		dataset.SpecialSkills = { };
		dataset.SpecialSkills.Primary = { };
		dataset.SpecialSkills.Primary.Type = 'NONE';
		dataset.SpecialSkills.Primary.Skill = null;
		dataset.SpecialSkills.Primary.ValueX = null;
		dataset.SpecialSkills.Primary.ValueY = null;

		dataset.SpecialSkills.Secondary = { };
		dataset.SpecialSkills.Secondary.Type = 'NONE';
		dataset.SpecialSkills.Secondary.Skill = null;
		dataset.SpecialSkills.Secondary.ValueX = null;
		dataset.SpecialSkills.Secondary.ValueY = null;

		dataset.SpecialSkills.Tertiary = { };
		dataset.SpecialSkills.Tertiary.Type = 'NONE';
		dataset.SpecialSkills.Tertiary.Skill = null;
		dataset.SpecialSkills.Tertiary.ValueX = null;
		dataset.SpecialSkills.Tertiary.ValueY = null;
		
		['Primary','Secondary','Tertiary'].forEach(function(elem){
			var type=$("div.skillset."+elem+" div.type select.type").val();
			dataset.SpecialSkills[elem].Type=type;
			if(type == 'GENERIC') {
				dataset.SpecialSkills[elem].Skill = $("div.skillset."+elem+" div.GENERIC select").val();
			} else if(type == 'SKILL') {
				dataset.SpecialSkills[elem].Skill = [
					$("div.skillset."+elem+" div.SKILL select.SKILLGROUP").val(),
					$("div.skillset."+elem+" div.SKILL select.SKILL").val()
				];
			}
			dataset.SpecialSkills[elem].ValueX = parseInt($("div.skillset."+elem+" div.valueX input.valueX").val());
			dataset.SpecialSkills[elem].ValueY = parseInt($("div.skillset."+elem+" div.valueY input.valueY").val());
		});
		
		if(readurl) {
			var url = new URL(window.location.href);
			if (typeof url.searchParams !== 'undefined') {
				var encoded = url.searchParams.get('character');
				if(typeof encoded !== 'undefined' && encoded !== '' && encoded !== null) {
					encoded = atob(encoded);
					dataset=JSON.parse(encoded);				
				}
			}
		}

		
		dataset = window.businesslogic.validate(dataset);
		if(dataset.valid == false) {
			$("#validation_errors").empty();
			$("#validation_errors").show();
			$("#validation_errors").append("<h3>This configuration is not allowed</h3>");
			dataset.validation_errors.forEach(function(error){
				$("#validation_errors").append("<p>"+error.msg+"</p>");
				//todo: we have an auto-fix we should provide to the user.
			});
			$("p.save").hide();
		}
		else {
			$("#validation_errors").empty();
			$("#validation_errors").hide();
			$("p.save").show();
			//lets prepare everything for storage.
			var encoded=JSON.stringify(dataset);
			encoded = btoa(encoded);
			var url = "?character="+encoded;
			$("a.save").attr('href',url);
		}
		if(dataset.updated || readurl) {
			//some values have been updated. we have to reapply them to the corresponding inputs.
			if(readurl) {
				$("#character_race").val(dataset.CharacterRace);
				$("#character_name").val(dataset.CharacterName);
				$("#character_type").val(dataset.CharacterType);
			}
			$("#max_health").val(dataset.maxHealth);
			$("#avail_health").val(dataset.availHealth);
			$("#max_actions").val(dataset.maxActions);
			$("#max_skills").val(dataset.maxSkills);
			$("#avail_skills").val(dataset.availSkills);
			$("#max_career_1").val(dataset.maxCareer[0]);
			$("#max_career_2").val(dataset.maxCareer[1]);
			$("#max_career_3").val(dataset.maxCareer[2]);
			["Primary","Secondary","Tertiary"].forEach(function(elem){
				if(readurl) {
					$("div.skillset."+elem+" select.type").val(dataset.SpecialSkills[elem].Type);
					//when we switch selects we need to trigger the corresponding events before going further
					$("div.skillset."+elem+" select.type").trigger('change');
					if(dataset.SpecialSkills[elem].Skill instanceof Array) {
						$("div.skillset."+elem+" select.SKILLGROUP").val(dataset.SpecialSkills[elem].Skill[0]);
						$("div.skillset."+elem+" select.SKILLGROUP").trigger('change');
						$("div.skillset."+elem+" select.SKILL").val(dataset.SpecialSkills[elem].Skill[1]);
						$("div.skillset."+elem+" select.SKILL").trigger('change');
					} else {
						$("div.skillset."+elem+" select.GENERIC").val(dataset.SpecialSkills[elem].Skill);
						$("div.skillset."+elem+" select.GENERIC").trigger('change');
					}					
				}

				$("div.skillset."+elem+" input.valueX").val(dataset.SpecialSkills[elem].ValueX);
				$("div.skillset."+elem+" input.valueY").val(dataset.SpecialSkills[elem].ValueY);
			});
			//we need to fire our label updating logic.
			$("input.number").trigger('change');
		}
		dataset = window.businesslogic.calculatePoints(dataset);
		Object.keys(dataset).forEach(function(key){
			if(key == "valid" || key == "updated" || key == "validation_errors") {
				return;
			}
			window.renderer[key]=dataset[key];
		});
		var result = window.renderer.render();
		$("a.download").attr('href',result);
		window.kickingoff=false;
	}
	
	$("#character_image").on('change',function() {
		var file = $("#character_image")[0].files[0];
		var reader = new FileReader();
		reader.onload = function(e) {
			$("#layer1").attr("src",e.target.result);
			kickoff(false);
		}
		reader.readAsDataURL(file);
		$("#character_image").hide();
		$("#remove_image").show();
	});
	$("#remove_image").on('click',function(){
		$("#layer1").attr('src','');
		$("#character_image").val('');
		$("#remove_image").hide();
		$("#character_image").show();
		kickoff();
		
	});
	$("#layer1").on('load',function(){
		window.renderer.render();
	});
	
	//we have everything we need so lets fill out the dropdowns first.
	var abilities=Object.keys(window.renderer.generic_skills);
	abilities.forEach(function(elem){
		$("div.GENERIC select.GENERIC").append("<option value=\""+elem+"\">"+elem+"</option>");
	});
	var groups=Object.keys(window.renderer.skills);
	groups.forEach(function(elem){
		$("div.SKILL select.SKILLGROUP").append("<option value=\""+elem+"\">"+elem+"</option>");
	});
	
	//time to set up the default view
	$("input.number").spinner();
	$("div.GENERIC").hide();
	$("div.SKILL").hide();
	$("div.SKILL select.SKILL").hide();
	$("div.valueX").hide();
	$("div.valueY").hide();
	
	//generic logic to switch visibilities.
	$("div.skillset div.type select.type").on('change',function(){
		var val = $(this).val();
		$("div.GENERIC",$(this).parents("div.skillset")).hide();
		$("div.SKILL",$(this).parents("div.skillset")).hide();
		if( val != 'NONE') {
			$("div."+val,$(this).parents("div.skillset")).show();
		}
	});
	
	//now the generic logic to fill the second dropdown based on the first one.
	$("div.SKILL select.SKILLGROUP").on('change',function(){
		var val = $(this).val();
		$("select.SKILL",$(this).parent()).empty();
		if(val != "null") {
			var obj = window.renderer.skills[val];
			var keys = Object.keys(obj);
			$("select.SKILL",$(this).parent()).append("<option value=\"null\">Choose</option>");
			keys.forEach((function(elem){
				$("select.SKILL",$(this).parent()).append("<option value=\""+elem+"\">"+elem+"</option>");
			}).bind(this));
			$("select.SKILL",$(this).parent()).show();
		} else {
			$("select.SKILL",$(this.parent())).hide();
		}
	});
	
	//now the logic to show and hide the corresponding sliders.
	$("div.GENERIC select").on('change',function(){
		var val=$(this).val();
		$("div.valueX",$(this).parents("div.skillset")).hide();
		$("div.valueY",$(this).parents("div.skillset")).hide();
		if(val == 'null' || val == '' || val == null) {
			return;
		}
		if(val != "Move and close combat") {
			$("div.valueX",$(this).parents("div.skillset")).show();
		}
		if(val == "Climb and jump") {
			$("div.valueY",$(this).parents("div.skillset")).show();
		}
	});
	$("div.SKILL select.SKILL").on('change',function(){
		if($(this).val() == 'null') {
			$("div.valueX",$(this).parents("div.skillset")).hide();
			$("div.valueY",$(this).parents("div.skillset")).hide();
			return;
		}
		$("div.valueX",$(this).parents("div.skillset")).show();
		$("div.valueY",$(this).parents("div.skillset")).hide();
	});
	//next up: we need a validation step, which should fire after all changes.
	//if validation succeeds we need the point calculator and afterwards a rendering step.
	//so... time for some business logic!
	$("input, select").on('change',function(){
		kickoff();
	});
	$("input.number").on('spinstop',function(){
		kickoff();
	});
	//finally: when everything is loaded, one kickoff to get everything in sync.
	if(renderer.fontLoaded == true) {
		kickoff(true);
	}
	$("#canvas").on('fontLoaded',function(){
		kickoff(true);
	});

});
