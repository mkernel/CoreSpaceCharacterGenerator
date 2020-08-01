"use strict";

class CharacterRenderer {
	
	
	constructor(canvas) {
		this.canvas = $("#canvas")[0];
		if(typeof(FontFace) != 'undefined') {
			this.font = new FontFace('terminator','url(Terminat.woff)');
			this.fontLoaded=false;
			this.font.load().then((function(font) {
				document.fonts.add(font);
				this.fontLoaded=true;
				this.canvas.dispatchEvent(new CustomEvent('fontLoaded'));
			}).bind(this));			
		} else {
			this.fontLoaded=true;
		}
		this.context = canvas.getContext('2d');
		
		this.layers = [
			$("#layer0")[0],
			$("#layer1")[0],
			$("#layer2")[0],
			$("#layer3")[0],
			$("#layer4")[0],
			$("#layer5")[0],
		];
		
		this.healthbackground = [
			$("#health0")[0],
			$("#health1")[0],
			$("#health2up")[0]
		];
		this.actionbackground = $("#actions")[0];
		this.skillsbackground = $("#skills")[0];
		this.careerbackground = $("#career")[0];
		
		this.active = $("#active")[0];
		
		//we have to fetch all skills into an ordered array.
		this.skills = {};
		
		$("div.skills img").each((function(idx,obj){
			var skillname=$(obj).data("name");
			var skillgroup=$(obj).parent().data("class");
			var image = obj;
			if(this.skills[skillgroup] == null) {
				this.skills[skillgroup]= { };			
			}
			this.skills[skillgroup][skillname]=image;
		}).bind(this));
		
		this.skill_base=$("#skill_base")[0];
		this.skill_marker=$("#skill_marker")[0];
		
		//we need the generic skill images as well
		
		this.generic_skills = {};
		$("div.skills-general img").each((function(idx,obj){
			var skillname=$(obj).data("name");
			this.generic_skills[skillname]=obj;
		}).bind(this));
		
		this.healthPositions=[
			{x:103,y:108},
			{x:156,y:108},
			{x:211,y:108},
			{x:266,y:108},
			{x:320,y:108},
			{x:375,y:108},
			{x:429,y:108},
		];
		this.healthOffset={x:8,y:8}
		
		this.actionPositions=[
			{x:101,y:178},
			{x:155,y:178},
			{x:210,y:178},
			{x:265,y:178},
		];
		this.actionOffset={x:10,y:14}
		
		this.skillsPositions=[
			{x:102,y:260},
			{x:156,y:260},
			{x:212,y:260},
			{x:267,y:260},
			{x:320,y:260},
			{x:376,y:260},
			{x:431,y:260},
		];
		this.skillsOffset={x:8,y:8}
		
		this.careerPositions=[
			[
				{x:102,y:335},
				{x:156,y:335},
				{x:211,y:335},
				{x:266,y:335},
				{x:320,y:335},
				{x:375,y:335},
				{x:429,y:335}
			],
			[
				{x:211,y:388},
				{x:266,y:388},
				{x:320,y:388},
				{x:375,y:388},
				{x:429,y:388}
			],
			[
				{x:320,y:441},
				{x:375,y:441},
				{x:429,y:441}
			]
		];
		this.careerOffset = {x:8,y:8};
		
		this.maxHealth=7;
		this.availHealth=7;
		
		this.maxActions = 4;
		this.availActions = 4;
		
		this.maxSkills = 7;
		this.availSkills = 7;
		
		this.maxCareer = [7,5,3];
		this.availCareer = [7,5,3];
		
		this.CharacterRace="RACE";
		this.CharacterName="NAME";
		this.CharacterPoints=0;
		this.CharacterType="TYPE";
		
		this.SpecialSkills = { };
		this.SpecialSkills.Primary = { };
		this.SpecialSkills.Primary.Type = "GENERIC";
		this.SpecialSkills.Primary.Skill = "Close combat";
		this.SpecialSkills.Primary.ValueX = 1;
		this.SpecialSkills.Primary.ValueY = 2;
		
		this.SpecialSkills.Secondary = { };
		this.SpecialSkills.Secondary.Type = "SKILL";
		this.SpecialSkills.Secondary.Skill = ["Stealth","Ambush"];
		this.SpecialSkills.Secondary.ValueX = 3;
		this.SpecialSkills.Secondary.ValueY = 0;
		
		this.SpecialSkills.Tertiary = { };
		this.SpecialSkills.Tertiary.Type = "GENERIC";
		this.SpecialSkills.Tertiary.Skill = "Climb and jump";
		this.SpecialSkills.Tertiary.ValueX = 3;
		this.SpecialSkills.Tertiary.ValueY = 4;
		
	}
	
	drawItem(position,offset) {
		this.context.drawImage(this.active,position.x+offset.x,position.y+offset.y);
	}
	
	drawGenericSkill(skill) {
		if(typeof this.generic_skills[skill.Skill] == 'undefined') {
			//the ability selection is incomplete, bail out!
			return;
		}
		var img = this.generic_skills[skill.Skill];
		this.context.drawImage(img,-(img.width/2),-(img.height/2));
		if(skill.Skill == "Armour") {
			this.context.fillText(skill.ValueX,4,4);
		}
		if(skill.Skill == "Close combat") {
			this.context.fillText(skill.ValueX,4,16);
		}
		if(skill.Skill == "Move") {
			this.context.fillText(skill.ValueX,4,-8);
		}
		if(skill.Skill == "Ranged attack") {
			this.context.fillText(skill.ValueX,4,8);
		}
		if(skill.Skill == "Resurrect") {
			this.context.fillText(skill.ValueX,4,20);
		}
		if(skill.Skill == "Huge") {
			this.context.fillText(skill.ValueX,4,24);
		}
		if(skill.Skill == "Climb and jump") {
			this.context.fillText(skill.ValueX,20,-28);
			this.context.fillText(skill.ValueY,-12,36);
		}
	}
	
	drawRegularSkill(skill) {
		this.context.drawImage(this.skill_base,-(this.skill_base.width/2),-(this.skill_base.height/2));
		if(typeof this.skills[skill.Skill[0]] == 'undefined') {
			//the skill selection is incomplete. bail out!
			return;
		}
		if(typeof this.skills[skill.Skill[0]][skill.Skill[1]] == 'undefined') {
			//the skill selection is incomplete. bail out!
			return;
		}
		var image = this.skills[skill.Skill[0]][skill.Skill[1]];
		this.context.drawImage(image,-(image.width/2),-(image.height/2));
		this.context.save();
		this.context.rotate(-30*Math.PI/180);
		for(var i=0;i<skill.ValueX;i++) {
			this.context.drawImage(this.skill_marker,-(this.skill_marker.width/2),-(this.skill_marker.height/2)-58);
			this.context.rotate(120*Math.PI/180);
		}
		this.context.restore();
	}
	
	drawSkill(centerX, centerY, skill) {
		var context = this.context;
		context.save();
		context.translate(centerX,centerY);
		context.scale(0.60,0.60);
		if(typeof(FontFace) =='undefined') {
			context.font = "37px Terminat";
		} else {
			context.font = "37px terminator";
		}
		context.strokeStyle="black";
		context.fillStyle="black";
		context.textAlign="center";
		
		if(skill.Type=="GENERIC") {
			this.drawGenericSkill(skill);
		}
		if(skill.Type=="SKILL") {
			this.drawRegularSkill(skill);
		}
		context.restore();
	}
	
	dataURLtoBlob(dataurl) {
	    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
	        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
		while(n--){
	        u8arr[n] = bstr.charCodeAt(n);
    	}
		return new Blob([u8arr], {type:mime});
	}
	
	render() {
		
		var context = this.context;
		var layers = this.layers;
		var healthbackground = this.healthbackground;
		var actionbackground = this.actionbackground;
		var skillsbackground = this.skillsbackground;
		var careerbackground = this.careerbackground;
		var active = this.active;
		
		context.fillStyle='white';
		context.fillRect(0,0,canvas.width,canvas.height);
		context.drawImage(layers[0],0,0);
		//layer 1 needs to be scaled.
		var width = layers[1].width;
		var height = layers[1].height;
		var wfactor = canvas.width/width;
		var hfactor = canvas.height/height;
		var factor = (wfactor < hfactor ? wfactor : hfactor);
		width = factor * width;
		height = factor * height;
		var x = canvas.width - width;
		var y = canvas.height - height;
		context.drawImage(layers[1],x,y,width,height);
		context.drawImage(layers[2],0,0);
		context.drawImage(layers[3],0,0);
		var i=0;
		for(i=0;i<this.availHealth;i++) {
			this.drawItem(
				this.healthPositions[i],
				this.healthOffset
			);
		}
		
		i=0;
		for(i=0;i<this.availActions;i++) {
			this.drawItem(
				this.actionPositions[i],
				this.actionOffset
			);
		}
		
		i=0;
		for(i=0;i<this.availSkills;i++) {
			this.drawItem(
				this.skillsPositions[i],
				this.skillsOffset
			);
		}
		
		i=0;
		var j=0;
		for(j=0;j<this.availCareer.length;j++) {
			for(i=0;i<this.availCareer[j];i++) {
				this.drawItem(
					this.careerPositions[j][i],
					this.careerOffset
				);
			}
		}
		
		
		if(typeof(FontFace) =='undefined') {
			context.font = "55px Terminat";
		} else {
			context.font = "55px terminator";
		}				
		context.fillStyle = "black";
		context.strokeStyle = "white";
		context.lineWidth = 2;
		context.fillText(this.CharacterRace,22,59);
		context.strokeText(this.CharacterRace,22,59);
		
		if(typeof(FontFace) =='undefined') {
			context.font = "49px Terminat";
		} else {
			context.font = "49px terminator";
		}
		context.fillStyle = "#eee";
		context.strokeStyle = "black";
		context.fillText(this.CharacterName,292,59);
		context.strokeText(this.CharacterName,292,59);
		

		this.drawSkill(60, 470, this.SpecialSkills.Primary);
		this.drawSkill(180,540, this.SpecialSkills.Secondary);
		this.drawSkill(610,430, this.SpecialSkills.Tertiary);
		
		if(typeof(FontFace) =='undefined') {
			context.font = "37px Terminat";
		} else {
			context.font = "37px terminator";
		}
		context.lineWidth = 1.5;
		context.fillText(this.CharacterType,363,559);
		context.strokeText(this.CharacterType,363,559);
		if(typeof this.downloadUrl !== 'undefined') {
			URL.revokeObjectURL(this.downloadUrl);
		}
		
		var dataurl=this.canvas.toDataURL('image/png');
		var blob = this.dataURLtoBlob(dataurl);
		this.downloadUrl = URL.createObjectURL(blob);
		return this.downloadUrl;
	}
}

$(window).on('load',function(){
	window.renderer = new CharacterRenderer($('#canvas')[0]);
});
