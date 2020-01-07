"use strict";

class CivilianRenderer {
	
	
	constructor(canvas) {
		this.canvas = canvas
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
		];
		
		this.assetActions = $("#asset_actions")[0];
		this.assetArmour = $("#asset_armour")[0];
		this.assetCloseAssault = $("#asset_close_assault")[0];
		this.assetPersuasion = $("#asset_persuasion")[0];
		this.assetRangedAssault = $("#asset_ranged_assault")[0];
		this.assetRank = [];
		$("#resources .rank").each((function(idx,elem){
			this.assetRank.push(elem);
		}).bind(this));

		//we need the generic skill images as well
		
		this.generic_skills = {};
		$("div.skills-general img").each((function(idx,obj){
			var skillname=$(obj).data("name");
			this.generic_skills[skillname]=obj;
		}).bind(this));

		this.CivilianName = "Ben";
		this.CivilianQuote = "Koennte klappen, koennte klappen."
		this.CloseAssault = 1;
		this.RangedAssault = 1;
		this.Armour = 1;
		this.Persuasion = 1;
		this.Actions = 2;
		this.Rank = 4;
		
		this.SpecialSkills = { };
		this.SpecialSkills.Primary = { };
		this.SpecialSkills.Primary.Skill = "Climb and jump";
		this.SpecialSkills.Primary.ValueX = 1;
		this.SpecialSkills.Primary.ValueY = 2;
	}
	
	drawItem(bg,active,position,offset) {
		this.context.drawImage(bg,position.x,position.y);
		if(active) {
			this.context.drawImage(this.active,position.x+offset.x,position.y+offset.y);
		}
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
		context.scale(0.8,0.8);
		if(typeof(FontFace) =='undefined') {
			context.font = "37px Terminat";
		} else {
			context.font = "37px terminator";
		}
		context.strokeStyle="black";
		context.fillStyle="black";
		context.textAlign="center";
		
		this.drawGenericSkill(skill);
		context.restore();
	}
	
	printAtWordWrap( context , text, x, y, lineHeight, fitWidth)
	{
	    fitWidth = fitWidth || 0;
	    
	    if (fitWidth <= 0)
	    {
	        context.fillText( text, x, y );
	        return;
	    }
	    var words = text.split(' ');
	    var currentLine = 0;
	    var idx = 1;
	    while (words.length > 0 && idx <= words.length)
	    {
	        var str = words.slice(0,idx).join(' ');
	        var w = context.measureText(str).width;
	        if ( w > fitWidth )
	        {
	            if (idx==1)
	            {
	                idx=2;
	            }
	            context.fillText( words.slice(0,idx-1).join(' '), x, y + (lineHeight*currentLine) );
	            context.strokeText( words.slice(0,idx-1).join(' '), x, y + (lineHeight*currentLine) );
	            currentLine++;
	            words = words.splice(idx-1);
	            idx = 1;
	        }
	        else
	        {idx++;}
	    }
	    if  (idx > 0) {
	        context.fillText( words.join(' '), x, y + (lineHeight*currentLine) );
	        context.strokeText( words.join(' '), x, y + (lineHeight*currentLine) );
	    }
	}
	
	render() {
		
		var context = this.context;
		var layers = this.layers;
		var assetActions = this.assetActions;
		var assetArmour = this.assetArmour;
		var assetCloseAssault = this.assetCloseAssault;
		var assetPersuasion = this.assetPersuasion;
		var assetRangedAssault = this.assetRangedAssault;
		var assetRank = this.assetRank[this.Rank-1];
		
		context.fillStyle='white';
		context.fillRect(0,0,canvas.width,canvas.height);
		context.drawImage(layers[0],0,0);
		context.drawImage(layers[1],0,0);
		context.drawImage(layers[2],0,0);
		//layer 1 needs to be scaled.
		var width = layers[3].width;
		var height = layers[3].height;
		var wfactor = canvas.width/width;
		var hfactor = canvas.height/height;
		var factor = (wfactor < hfactor ? wfactor : hfactor);
		width = factor * width;
		height = factor * height;
		var x = canvas.width - width;
		var y = canvas.height - height;
		context.drawImage(layers[3],x,y,width,height);
		context.drawImage(layers[4],0,0);
		context.lineWidth = 1.5;

		
		if(typeof(FontFace) =='undefined') {
			context.font = "49px Terminat";
		} else {
			context.font = "49px terminator";
		}
		context.fillStyle = "#eee";
		context.strokeStyle = "black";
		context.textAlign = "end";
		context.fillText(this.CivilianName,709,69);
		context.strokeText(this.CivilianName,709,69);
		context.textAlign = "start";
		

		this.drawSkill(140, 430, this.SpecialSkills.Primary);
		
		if(typeof(FontFace) =='undefined') {
			context.font = "37px Terminat";
		} else {
			context.font = "37px terminator";
		}
		if(this.CivilianQuote != "") {
			this.printAtWordWrap(context,'"'+this.CivilianQuote+'"',50,140,37,500);
		}
		
		context.save();
		context.fillStyle = "black";
		context.strokeStyle = "black";
		context.textAlign = "center";
		context.translate(685,503);
		if(this.Persuasion > 0) {
			context.drawImage(assetPersuasion,-assetPersuasion.width/2,-assetPersuasion.height/2);
			context.fillText(this.Persuasion+"",0,0);
			context.strokeText(this.Persuasion+"",0,0);
		}
		context.translate(0,-120);
		if(this.Armour > 0) {
			context.drawImage(assetArmour,-assetArmour.width/2,-assetArmour.height/2);
			context.fillText(this.Armour+"",0,10);
			context.strokeText(this.Armour+"",0,10);
		}
		
		context.translate(0,-120);
		if(this.RangedAssault > 0) {
			context.drawImage(assetRangedAssault,-assetRangedAssault.width/2,-assetRangedAssault.height/2);
			context.fillText(this.RangedAssault+"",0,10);
			context.strokeText(this.RangedAssault+"",0,10);
		}
		
		context.translate(0,-120);
		if(this.CloseAssault > 0) {
			context.drawImage(assetCloseAssault,-assetCloseAssault.width/2,-assetCloseAssault.height/2);
			context.fillText(this.CloseAssault+"",0,10);
			context.strokeText(this.CloseAssault+"",0,10);
		}
		
		context.restore();
		context.save();
				if(typeof(FontFace) =='undefined') {
			context.font = "52px Terminat";
		} else {
			context.font = "52px terminator";
		}

		context.translate(685,503);
		context.translate(-120,-10);
		context.drawImage(assetActions,-assetActions.width/2,-assetActions.height/2);
		context.fillStyle = "white";
		context.strokeStyle = "black";
		context.lineWidth = 2.5;
		context.fillText(this.Actions+"",0,58);
		context.strokeText(this.Actions+"",0,58);
		context.restore();
		
		context.save();
		context.translate(685,503);
		context.translate(-200,10);
		context.drawImage(assetRank,-assetRank.width/2,-assetRank.height/2);
		context.restore();
		
		return this.canvas.toDataURL('image/png');
	}
}

$(window).on('load',function(){
	window.renderer = new CivilianRenderer($('#canvas')[0]);
	$("#canvas").on('fontLoaded',function(){
		window.renderer.render();
	});
});
