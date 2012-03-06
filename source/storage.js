window.storage=(function(){
	/*
	 * 事件
	 */
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
	
	/*
	 * 抽象数据存储媒介
	 */
	function AbsMedium(options){
		var instance={};
		var config={
			agentFile:""
		}
		for(var key in options){ config[key] = options[key]; }
		
		
		instance.getConfig=function(){
			return config;
		}
		
		instance.getAgent=function(){;}
		
		instance.isAvailable=function(){
			var agent=instance.getAgent();
			if(agent&& agent.callAS()){
				return true;
			}
			return false;	
		}
		
		instance.collection={
			keys:function(){
				var agent=instance.getAgent();
				if(agent&& agent.callAS()){
					return agent.keys();	
				}
			},
			clear:function(){ 
				var agent=instance.getAgent();
				if(agent&& agent.callAS()){
					return agent.clear(); 
				}
			},
			getItem:function(key){ 
				var agent=instance.getAgent();
				if(agent&& agent.callAS()){
					return agent.getItem(key);
				}
			},
			setItem:function(key,value){ 
				var agent=instance.getAgent();
				if(agent&& agent.callAS()){
					return agent.setItem(key,value);  
				}
			},
			removeItem:function(key){ 
				var agent=instance.getAgent();
				if(agent&& agent.callAS()){
					return agent.removeItem(key); 
				}
			}
		}
		
		for(var key in instance){ this[key] = instance[key]; }
		
		return instance;
	}
	
	/*
	 * FLASH存储媒介
	 */
	function SWFMedium(options,manager){
		if(storage["SWF"]){ 
			var instance=storage["SWF"];
			if(instance.isAvailable()){
				return instance;
			}
		}
		//this
		var instance=storage["SWF"]=AbsMedium.apply({},arguments);
		var config=instance.getConfig()
		
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
		
		instance.ready=function(){
			var retry=0;
			var available=false
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
	
	
	/*
	 * localStorage->cookie 存储媒介，获不支持则使用cookie存储.
	 */
	function H5LMedium(options,manager){
		if(storage["H5L"]){ 
			var instance=storage["H5L"];
			if(instance.isAvailable()){
				return instance;
			}
		}
		//this
		var instance=storage["H5L"]=AbsMedium.apply({},arguments);
		var config=instance.getConfig();
		
		instance.getAgent=function(){
			var iframe=document.getElementById("H5L-STORAGE");
			return iframe.contentWindow.H5LAgent;
		}
		
		instance.ready=function(){
			var retry=0;
			var available=false;
			(function(){
				try{ available=instance.getAgent().callAS(); }catch(e){ }
				if(available){
					if(manager){ 
						manager.emit("medium-done",instance); 
					}
					console.info("[medium-h5l]己成功安装！");
				}else{
					if(retry<3){
						setTimeout(arguments.callee,15);
						retry++;
						return;
					}
					if(manager){ 
						manager.emit("medium-fail",instance); 
					}
					console.warn("[medium-h5l]安装失败，可能禁止跨域访问！");
				}
			})();
		}
		
		
		
		var ifrContent=document.createElement("div");
			ifrContent.style.cssText="position:absolute;zIndex:-1;height:1px;overflow:hidden;";
		
		var pdomain=window.document.domain;
		var cdomain=(function(){var m=/^([^/]+\/\/)([^/\?]+)/.exec(config.agentFile.toLowerCase()); return m?m[2]:"none"})();
		
		var tag="?";
		function getTag(){
			if(tag==="?"){
				tag="&";
				return "?";
			}
			return tag;
		}
		
		//如果代理文件是使用相对路径则同域,使用绝对路径，如果不是同域，则修正document.domain属性到同一根域。
		if("none" !== cdomain && pdomain !== cdomain){
			var pArr=pdomain.split('.');cArr=cdomain.split('.');
			var p=pArr.length,c=cArr.length;
			var res=[];
			while(p>=0 && c >= 0){
				if(pArr[p-1] === cArr[c-1]){
					res.push(pArr[p-1]);
					p--;
					c--;
				}else{
					break;
				}
			}
			
			if(res.length>=2){
				var olddomain=document.domain;
				var newdomain=res.reverse().join(".");
				config.agentFile=(config.agentFile + getTag()+ "domain=" +newdomain);
				document.domain=newdomain;
				console.warn("修改DOMAIN(原:"+olddomain+" 新:"+newdomain+")");
			}else{
				throw new Error("代理文件不在同域。");
			}
		}
		
		//如果指定cookie存储优先
		if("cookie" === config.prior){
			config.agentFile=(config.agentFile + getTag()+ "prior=cookie");
		}
		
		(function(){
			if(document.body){
				ifrContent.innerHTML='<iframe src="'+config.agentFile+'" id="H5L-STORAGE" height="1" />';
				document.body.insertBefore(ifrContent,document.body.firstChild);
			}else{
				setTimeout(arguments.callee,15);
			}
		})();
		
		return instance;
	}
	
	
	
	
	
	
	
	function FailMedium(manager){
		var instance={};
		manager.emit("fail");
		return instance;
	}
	
	
	
	/*
	 * 媒介管理器
	 */
	function Manager(){
		var instance=Emiter.apply({})		//继承事件
		
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
		
		
		instance.setMedium=function(medium){
			if(medium.isAvailable()){
				_medium=medium;
			}
		}
		
		instance.getMedium=function(){
			return _medium;
		}
		/*
		 * 获取己存储的数据键集合
		 */
		instance.keys=function(callback){
			if(typeof(callback) === "function"){
				if(_medium && _medium.isAvailable()){
					var result=_medium.collection.keys();
					callback.call(instance,result);		
				}else{
					_tasker.pushTask("keys",callback);
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
					var result=_medium.collection.clear();
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
					var result=_medium.collection.getItem(key);
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
					var result=_medium.collection.setItem(key,value);
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
					var result=_medium.collection.removeItem(key);
					callback.call(instance,result);		
				}else{
					_tasker.pushTask("removeItem",[key],callback);
				}
			}
			return instance;
		}
		
		
		/**
		 * 处理队列中所示未处理事件
		 */
		instance.process=function(){
			if(_medium && _medium.isAvailable()){
				var task, method, args, result,callback;
				while((task=_tasker.popTask())){
					method = _medium.collection[task['action']];	
			 		args = task['arguments'];
					callback =task['callback'];
					if(typeof(callback) === "function"){
						result= method.apply(_medium.collection,args);	
						callback.call(instance,result);
					}
				}
			}
		}
		
		
		return instance
	}
	
	
	
	
	
	var singleton=null;
	var plugins={
		"SWFMedium":{type:SWFMedium,config:{agentFile:"http://s1.iisii.net/storage/source/swf-agent.html"}},
		"H5LMedium":{type:H5LMedium,config:{agentFile:"http://s1.iisii.net/storage/source/h5l-agent.html",prior:"cookie"}}
	}
	return {
		install:function(options){
			if(singleton){
				return singleton;
			}
			
			var manager=singleton=new Manager();
			var config={};
			for(var key in options){
				config[key]=options[key];
			}
			
			var initNextMedium=(function(){
				var index=0;
				var mediumOrder=[SWFMedium,H5LMedium];
				return function(){
					if(index<mediumOrder.length){
						mediumOrder[index](config,manager);
					 	index++;
					 	return true;
					}else{
						return false;
					}
				}
			})();
			
			manager.on("ready",function(){
				if(!initNextMedium()){
					manager.emit("fail");
				}
			});
			
			manager.on("medium-init-fail",function(data){
				if(!initNextMedium()){
					manager.emit("fail");
				}
			});
			
			manager.on("medium-init-done",function(medium){
				manager.setMedium(medium);
				manager.process();
				manager.emit("done",medium);
			});
			
			manager.on("done",function(medium){
				if(typeof(config.done) === "function"){
					config.done(medium);
				}
			});
			
			manager.on("fail",function(){
				if(typeof(config.fail)==="function"){
					config.fail();
				}
			});
			
			
			manager.emit("ready");
			
			return manager;
		},
		SWFMedium:SWFMedium,
		H5LMedium:H5LMedium
	}
}());







