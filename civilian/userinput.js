"use strict";

$(window).on('load',function(){
	window.kickingoff=false;
	var kickoff=function(readurl=false) {
		if(window.kickingoff) { return;}
		window.kickingoff=true;
		//lets create a characterset.
		var dataset={};
		dataset.CivilianName = $("#character_name").val();
		dataset.CivilianQuote = $("#character_quote").val();
		dataset.CloseAssault = parseInt($("#close_assault").val());
		dataset.RangedAssault = parseInt($("#ranged_assault").val());
		dataset.Armour = parseInt($("#armour").val());
		dataset.Persuasion = parseInt($("#persuade").val());
		dataset.Actions = parseInt($("#actions").val());
				
		dataset.SpecialSkills = { };
		dataset.SpecialSkills.Primary = { };
		dataset.SpecialSkills.Primary.Skill = null;
		dataset.SpecialSkills.Primary.ValueX = null;
		dataset.SpecialSkills.Primary.ValueY = null;

		['Primary'].forEach(function(elem){
			dataset.SpecialSkills[elem].Skill = $("div.skillset."+elem+" div.GENERIC select").val();
			dataset.SpecialSkills[elem].ValueX = parseInt($("div.skillset."+elem+" div.valueX input.valueX").val());
			dataset.SpecialSkills[elem].ValueY = parseInt($("div.skillset."+elem+" div.valueY input.valueY").val());
		});
		
		if(readurl) {
			var url = new URL(window.location.href);
			var encoded = url.searchParams.get('character');
			if(typeof encoded !== 'undefined' && encoded !== '' && encoded !== null) {
				encoded = atob(encoded);
				dataset=JSON.parse(encoded);				
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
				$("#character_name").val(dataset.CivilianName);
				$("#character_quote").val(dataset.CivilianQuote);
			}
			$("#close_assault").val(dataset.CloseAssault);
			$("#ranged_assault").val(dataset.RangedAssault);
			$("#armour").val(dataset.Armour);
			$("#persuade").val(dataset.Persuasion);
			$("#actions").val(dataset.Actions);
			
			["Primary"].forEach(function(elem){
				if(readurl) {
					$("div.skillset."+elem+" select.GENERIC").val(dataset.SpecialSkills[elem].Skill);
					$("div.skillset."+elem+" select.GENERIC").trigger('change');
				}

				$("div.skillset."+elem+" input.valueX").val(dataset.SpecialSkills[elem].ValueX);
				$("div.skillset."+elem+" input.valueY").val(dataset.SpecialSkills[elem].ValueY);
			});
			//we need to fire our label updating logic.
			$("input.number").trigger('change');
		}
		dataset = window.businesslogic.calculateRank(dataset);
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
			$("#layer3").attr("src",e.target.result);
		}
		reader.readAsDataURL(file);
		$("#character_image").hide();
		$("#remove_image").show();
	});
	$("#remove_image").on('click',function(){
		$("#layer3").attr('src','');
		$("#character_image").val('');
		$("#remove_image").hide();
		$("#character_image").show();
		kickoff();
		
	});
	$("#layer3").on('load',function(){
		window.renderer.render();
	});
	
	//we have everything we need so lets fill out the dropdowns first.
	var abilities=Object.keys(window.renderer.generic_skills);
	abilities.forEach(function(elem){
		$("div.GENERIC select.GENERIC").append("<option value=\""+elem+"\">"+elem+"</option>");
	});
	
	//time to set up the default view
	$("input.number").spinner();
	
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
