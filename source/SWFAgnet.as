package  {
	import flash.external.ExternalInterface;
	import flash.display.Sprite;
	import flash.system.Security;
	import flash.net.URLRequest;
	import flash.net.URLLoader;
	import flash.events.Event;
	import flash.system.ApplicationDomain;
	
	public class SWFAgnet extends Sprite{
		private var co:Cookie;
		public function SWFAgnet() {
			co=new Cookie();
			if(ExternalInterface.available){
				var isCross=ExternalInterface.call("storage['SWF'].isCross");
				if(isCross){
					var loader:URLLoader=new URLLoader();
					loader.addEventListener(Event.COMPLETE,getPolicy);
					loader.load(new URLRequest((/.*\//i).exec(this.loaderInfo.url)[0]+"policy.txt"));
				}else{
					ExternalInterface.call("storage['SWF'].ready")
				}
				ExternalInterface.addCallback("keys",co.keys_cookie);
				ExternalInterface.addCallback("clear",co.clear_cookie);
				ExternalInterface.addCallback("setItem",co.setItem_cookie);
				ExternalInterface.addCallback("getItem" ,co.getItem_cookie);
				ExternalInterface.addCallback("removeItem",co.removeItem_cookie);
				ExternalInterface.addCallback("callAS",callAS);
			}
		}
		
		
		private function getPolicy(e:Event):void{
			var domains:Array=e.target.data.split(/\s+/);
			for(var i=0,l=domains.length;i<l;i++){
				flash.system.Security.allowDomain(domains[i]);
			}
			ExternalInterface.call("storage['SWF'].ready")
		}
		
		
		private function callAS():Boolean{
			return true;
		}
	}
}

import flash.net.SharedObject;
import flash.external.ExternalInterface;
class Cookie{
	
	public function Cookie() {
		
	}
	
	
	public function keys_cookie(){
		var allSo=SharedObject.getLocal("storage_all_keys","/");
		var oldKeys=allSo.data["storage_keys"] || {};
		var newKeys={};
		var newResu=[];
		if(allSo.size > 0){ 
			for(var key in oldKeys){
				var soItem=SharedObject.getLocal(key,"/");
				if(soItem.size == 0){
					continue;
				}else{
					if((soItem.data.expire!=0) &&  (soItem.data.createTime+soItem.data.expire*1000*60*60*24 < new Date().getTime())){
						soItem.clear();
						continue;
					}
				}
				newKeys[key]=true;
				newResu.push(key);
			}
		}
		allSo.data["storage_keys"]=newKeys;
		allSo.flush();
		return newResu;
	}
	
	public function clear_cookie(){
		var allSo=SharedObject.getLocal("storage_all_keys","/");
		var oldKeys=allSo.data["storage_keys"];
		if(allSo.size > 0){ 
			for(var key in oldKeys){
				var soItem=SharedObject.getLocal(key,"/");
				soItem.clear();
			}
		}
		allSo.data["storage_keys"]={};
		allSo.flush();
	}
	
	
	public function setItem_cookie(key:String,sValue,config:Object=null){
		var so=SharedObject.getLocal(key,"/");
		var cookieValue:String="stoarge_";
		if(config==null){
			config={expire:0,crossBrowser:true};
		}else{
			if(!config.hasOwnProperty("expire")){
				config.expire=0;
			}
			if(!config.hasOwnProperty("crossBrowser")){
				config.crossBrowser=true;
			}
		}
		if(config.crossBrowser==false){ cookieValue+=ExternalInterface.call("storage['SWF'].getBrowser"); }
		
		var oldVal=so.data[cookieValue] || null;
		so.data[cookieValue]=sValue;
		so.data.crossBrowser=config.crossBrowser;
		so.data.expire=config.expire;
		so.data.createTime=new Date().getTime();
		so.flush();
		
		var allSo =SharedObject.getLocal("storage_all_keys","/");
		var oldKeys =allSo.data["storage_keys"] || {};
			oldKeys[key]=true;
		allSo.data["storage_keys"]=oldKeys;
		allSo.flush();
		
		return oldVal;
	}
	
	public function getItem_cookie(key:String){
		var so=SharedObject.getLocal(key,"/");
		var cookieValue:String="stoarge_";
		if(so.size==0){
			return null;
		}else{
			if(so.data.expire!=0){
				if(so.data.createTime+so.data.expire*1000*60*60*24<new Date().getTime()){
					so.clear();
					return null;
				}
			}
		}
		if(so.data.crossBrowser==false){ cookieValue+=ExternalInterface.call("storage['SWF'].getBrowser"); }
		return so.data[cookieValue];
	}
	
	public function removeItem_cookie(key:String){
		var oldVal=null;
		var so=SharedObject.getLocal(key,"/");
		var cookieValue:String="stoarge_";
		if(so.size>0){
			if(so.data.crossBrowser==false){ cookieValue+=ExternalInterface.call("storage['SWF'].getBrowser"); }
			oldVal=so.data[cookieValue];
		}
		so.clear();
		return oldVal;
	}
}