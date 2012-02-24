window.Storage=(function(){
	
	function Emiter(){
		var instance={};
		var quque={};
		
		instance.on=function(ev,callback){
			if(typeof(ev)==="string" && typeof(callback) === "function" ){
				var handlers=quque[ev] || (quque[ev]=[]);
				handlers.push(callback);
				return true;
			}
			return false;
		}
		
		instance.emit=function(ev,data){
			if(typeof(ev)==="string"){
				var handlers=quque[ev] || [];
				for(var i=0;i<handlers.length;i++){
					handlers[i].call(this,data);	
				}
				return true;
			} 
		}
		
		for(var key in instance){ this[key] = instance[key]; }
		
		return instance;
	}
	
	
	
	function SWFMedium(manager,options){
		if(Storage["SWF"]){
			return Storage["SWF"];
		}
		//this
		var instance=Storage["SWF"]={};
		
		//private
		var config={swfFile:"/storage/source/swf-agent.swf"};
		var available=false;
		
		//init config
		for(var key in options){ config[key] = options[key]; }
		
		//public
		instance.isCross=((/http:\/\//i).test(config.swfFile) && config.swfFile.indexOf(window.location.host)==-1);
		
		instance.getBrowser=function(){
			var ua = navigator.userAgent.toLowerCase();
			if(window.ActiveXObject){return "ie"};
			if(/firefox/i.test(ua)){return "firefox"};
			if(/chrome/i.test(ua) && /webkit/i.test(ua) && /mozilla/i.test(ua)){return "chrome"};
			if(window.opera){return "opera"};
			if(window.openDatabase){return "safari"};
			return "other";
		}
		
		instance.getAgent=function(){
			var movieName="swf_agent";
			if (window.document[movieName]){
				return window.document[movieName];
			}else{
				return document.getElementById(movieName);
			}
		}
		
		instance.isAvailable=function(){
			return available;
		}
		
		instance.ready=function(){
			var retry=0;
			(function(){
				try{ available=instance.getAgent().callAS(); }catch(e){ }
				if(available){
					if(manager){ 
						manager.emit("medium-done",instance); 
					}
					console.info("[medium-swf]己成功安装！");
					
				}else{
					if(retry<3){
						setTimeout(arguments.callee,15);
						retry++;
						return;
					}
					if(manager){ 
						manager.emit("medium-fail",instance); 
					}
					console.warn("[medium-swf]安装失败，可能禁止跨域访问！");
				}
			})();
		}
		
		instance.data={
			keys:function(){
				return instance.getAgent().keys();
			},
			clear:function(){
				return instance.getAgent().clear();
			},
			getItem:function(key){
				return instance.getAgent().getItem(key);
			},
			setItem:function(key,value){
				return instance.getAgent().setItem(key,value);
			},
			removeItem:function(key){
				return instance.getAgent().removeItem(key);
			}
		}
		
		
		
		var flash='<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="1" height="1" id="swf_agent"><param name="movie" value="'+config.swfFile+'" /><param name="allowScriptAccess" value="always" /><embed src="'+config.swfFile+'" width="1" height="1" name="swf_agent" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" /></object>';
		var flashCont=document.createElement("div");
			flashCont.style.cssText="position:absolute;zIndex:-1;height:1px";
		(function(){
			if(document.body){
				flashCont.innerHTML=flash;  
				document.body.insertBefore(flashCont,document.body.firstChild);
			}else{
				setTimeout(arguments.callee,15);
			}
		})();
		
		
		return instance;
	}
	
	//html5 localstorage
	function H5LMedium(manager){
		var instance={};
		manager.emit("next","h5l");
		return instance;
	}
	
	//cookie
	function CKEMedium(manager){
		var instance={};
		manager.emit("next","cke");
		return instance;
	}
	
	//服务器端存储
	function SERMedium(){
		
	}
	
	//
	function FailMedium(manager){
		var instance={};
		manager.emit("fail");
		return instance;
	}
	
	
	
	function Manager(){
		var instance={};
		Emiter.apply(instance)	//继承事件
		
		
		var _medium=null;
		var _tasker=[];
			_tasker.pushTask=function(action,args,callback){
				var act=action
					,arg=args
					,cbk=callback;
				if(typeof(args)==="function"){
					arg=[];
					cbk=args;
				}
				_tasker.push({"action":act,"arguments":args,"callback":cbk})
			}
			_tasker.popTask=function(){
				return	_tasker.pop();
			}
		
		/*
		 * 获取己存储的数据键集合
		 */
		instance.key=function(callback){
			if(typeof(callback) === "function"){
				if(_medium && _medium.isAvailable()){
					var result=_medium.data.key();
					callback.call(instance,result);		
				}else{
					_tasker.pushTask("key",callback);
				}
			}
			return instance;
		}
		/*
		 * 清除所有存储数据
		 */
		instance.clear=function(callback){
			if(typeof(callback) === "function"){
				if(_medium && _medium.isAvailable()){
					var result=_medium.data.clear();
					callback.call(instance,result);		
				}else{
					_tasker.pushTask("clear",callback);
				}
			}
			return instance;
		}
		
		/*
		 * 获取指定键数据
		 */
		instance.getItem=function(key,callback){
			if(typeof(callback) === "function"){
				if(_medium && _medium.isAvailable()){
					var result=_medium.data.getItem(key);
					callback.call(instance,result);		
				}else{
					_tasker.pushTask("getItem",[key],callback);
				}
			}
			return instance;
		}
		
		/*
		 * 设置指定键数据
		 */
		instance.setItem=function(key,value,callback){
			if( typeof(callback) === "function"){
				if(_medium && _medium.isAvailable()){
					var result=_medium.data.setItem(key,value);
					callback.call(instance,result);		
				}else{
					_tasker.pushTask("setItem",[key,value],callback);
				}
			}
			return instance;
		}
		
		/*
		 * 删除指定键数据
		 */
		instance.removeItem=function(key,callback){
			if(typeof(callback) === "function"){
				if(_medium && _medium.isAvailable()){
					var result=_medium.data.removeItem(key);
					callback.call(instance,result);		
				}else{
					_tasker.pushTask("removeItem",[key],callback);
				}
			}
			return instance;
		}
		
		
		instance.setMedium=function(medium){
			if(medium.isAvailable()){
				_medium=medium;
			}
		}
		
		instance.getMedium=function(){
			return _medium;
		}
		
		
		instance.process=function(){
			if(_medium && _medium.isAvailable()){
				var task, method, args, result,callback;
				while((task=_tasker.popTask())){
					method = _medium.data[task['action']];	
			 		args = task['arguments'];
					callback =task['callback'];
					if(typeof(callback) === "function"){
						result= method.apply(_medium.data,args);	
						callback.call(instance,result);
					}
				}
			}
		}
		
		
		return instance
	}
	
	
	
	
	
	var singleton=null;
	var mediumOrder=[SWFMedium,H5LMedium,CKEMedium,FailMedium];
	
	return {
		install:function(options){
			var config={
				
			};
			var manager=new Manager();
			var index=0;
			var medium=null;
			
			for(var key in options){ config[key] = options[key]; }
			
			manager.on("ready",function(){
				medium=new mediumOrder[index](manager);
			})
			
			manager.on("medium-done",function(data){
				manager.setMedium(data);
				manager.process();
				if(typeof(config.done) === "function"){
					config.done(data);
				}
			});
			
			manager.on("medium-fail",function(data){
				medium=new mediumOrder[++index](manager);
			});
			
			manager.on("complete",function(){ });
			
			manager.on("fail",function(){
				
			})
			
			manager.emit("ready");
			
			return manager;
		}
		
	}
	
		

}());







