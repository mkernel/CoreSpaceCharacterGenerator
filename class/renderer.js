"use strict";

class ClassRenderer {
	
	
	constructor(canvas) {
		this.canvas = canvas;
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
		
		this.backgrounds = {};
		this.backgrounds['red'] = $("#background_red")[0];
		this.backgrounds['green'] = $("#background_green")[0];
		this.backgrounds['blue'] = $("#background_blue")[0];
		this.backgrounds['yellow'] = $("#background_yellow")[0];
		this.backgrounds['purple'] = $("#background_purple")[0];
		this.artwork = $("#artwork")[0];
		this.templates = {};
		this.templates['normal']=$("#template_normal")[0];
		this.templates['mech']=$("#template_mech")[0];
		
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
		
		this.Positions = {};
		this.Positions['normal'] = [
			{x:100,y:180},
			{x:230,y:150},
			{x:360,y:178},
			{x:500,y:200},
			{x:460,y:63},
			{x:590,y:100},
			{x:690,y:165},
		];
		
		this.Positions['mech']  = [
			{x:100,y:165},
			{x:255,y:150},
			{x:395,y:155},
			{x:590,y:195},
			{x:545,y:68},
			{x:695,y:125},
		];
		
		this.ActiveClass="TEMP";
		this.ActiveBackground='blue';
		this.ActiveTemplate='normal';
		this.ActiveSkills=[];
	}
			
	drawRegularSkill(skill) {
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
	}
	
	drawSkill(centerX, centerY, skill) {
		var context = this.context;
		context.save();
		context.translate(centerX,centerY);
		context.scale(0.8,0.8);
		
		this.drawRegularSkill(skill);
		context.restore();
	}

	
	render() {
		
		var context = this.context;

		context.fillStyle='white';
		context.fillRect(0,0,canvas.width,canvas.height);
		context.drawImage(this.backgrounds[this.ActiveBackground],0,0);
		context.drawImage(this.artwork,0,0);
		context.drawImage(this.templates[this.ActiveTemplate],0,0);
		for(var i=0;i<this.ActiveSkills.length;i++) {
			if (i < this.Positions[this.ActiveTemplate].length) {
				this.drawSkill(this.Positions[this.ActiveTemplate][i].x,this.Positions[this.ActiveTemplate][i].y,this.ActiveSkills[i]);
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
		context.fillText(this.ActiveClass,22,59);
		context.strokeText(this.ActiveClass,22,59);

		return this.canvas.toDataURL('image/png');
	}
}

$(window).on('load',function(){
	window.renderer = new ClassRenderer($('#canvas')[0]);
	$("a.download").attr('href',window.renderer.render());
});
