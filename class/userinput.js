"use strict";

$(window).on('load',function(){
	window.kickingoff=false;
	var kickoff=function(readurl=false) {
		if(window.kickingoff) { return;}
		window.kickingoff=true;
		//lets create a characterset.
		var dataset={};
		dataset.ActiveClass = $("input.classname").val();
		dataset.ActiveBackground = $("select.background").val();
		dataset.ActiveTemplate = $("select.template").val();
		dataset.ActiveSkills = [];
		
		
		$("div.skillset").each(function(idx,elem){
			var idx = $(elem).data('idx');
			var Skill = [
				$("div.SKILL select.SKILLGROUP",elem).val(),
				$("div.SKILL select.SKILL",elem).val()
			];
			if(Skill[0] != 'null' && Skill[1] != 'null') {
				dataset.ActiveSkills[idx] = {Skill:Skill};				
			}
		});
		
		if(readurl) {
			var url = new URL(window.location.href);
			var encoded = url.searchParams.get('class');
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
			var url = "?class="+encoded;
			$("a.save").attr('href',url);
		}

		if(readurl) {
			//some values have been updated. we have to reapply them to the corresponding inputs.
			$("div.skillset").each(function(idx,elem){
				var tmp = $(elem).data('idx');
				if(dataset.ActiveSkills.length>tmp) {
					$("select.SKILLGROUP",elem).val(dataset.ActiveSkills[$(elem).data('idx')].Skill[0]);
					$("select.SKILLGROUP",elem).trigger('change');
					$("select.SKILL",elem).val(dataset.ActiveSkills[$(elem).data('idx')].Skill[1]);
					$("select.SKILL",elem).trigger('change');
				}
			});
			$("select.background").val(dataset.ActiveBackground);
			$("select.background").trigger('change');
			$("select.template").val(dataset.ActiveTemplate);
			$("select.template").trigger('change');
			$("input.classname").val(dataset.ActiveClass);
			//we need to fire our label updating logic.
		}
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
		
	//we have everything we need so lets fill out the dropdowns first.
	var groups=Object.keys(window.renderer.skills);
	groups.forEach(function(elem){
		$("div.SKILL select.SKILLGROUP").append("<option value=\""+elem+"\">"+elem+"</option>");
	});
	
	//time to set up the default view
	$("div.SKILL select.SKILL").hide();
		
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
			$("select.SKILL",$(this).parent()).hide();
		}
	});
	
	//now the logic to show and hide the corresponding sliders.
	$("div.SKILL select.SKILL").on('change',function(){
		//i'm not sure if i need that anymore...
	});
	//next up: we need a validation step, which should fire after all changes.
	//if validation succeeds we need the point calculator and afterwards a rendering step.
	//so... time for some business logic!
	$("input, select").on('change',function(){
		kickoff();
	});
	$("select.template").on('change',function(){
		var template = $("select.template").val();
		if(template == 'mech') {
			//mechs have one slot less.
			$("div.skillset[data-idx=5]").hide();
		} else {
			$("div.skillset[data-idx=5]").show();
		}
	});
	//finally: when everything is loaded, one kickoff to get everything in sync.
	if(renderer.fontLoaded == true) {
		kickoff(true);
	}
	$("#canvas").on('fontLoaded',function(){
		kickoff(true);
	});

});
