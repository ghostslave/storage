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
				var isCross=ExternalInterface.call("Storage['SWF'].isCross");
				if(isCross){
					var loader:URLLoader=new URLLoader();
					loader.addEventListener(Event.COMPLETE,getPolicy);
					loader.load(new URLRequest((/.*\//i).exec(this.loaderInfo.url)[0]+"policy.txt"));
				}else{
					ExternalInterface.call("Storage['SWF'].ready")
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
			ExternalInterface.call("console.warn","Check CROSS DOMAIN Policy file");
			var domains:Array=e.target.data.split(/\s+/);
			for(var i=0,l=domains.length;i<l;i++){
				flash.system.Security.allowDomain(domains[i]);
			}
			ExternalInterface.call("Storage['SWF'].ready")
		}
		
		
		private function callAS():Boolean{
			return true;
		}
	}
}

import flash.net.SharedObject;
import flash.external.ExternalInterface;
class Cookie{
	private var so:SharedObject;
	private var soName:String;
	
	public function Cookie() {
		
	}
	
	public function keys_cookie(){
		so=SharedObject.getLocal("all_keys","/");
		var oldKeys=so.data["stoarge_keys"] || [];
		var newKeys=[];
		if(so.size > 0){ 
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
				newKeys.push(key);
			}
		}
		so.data["stoarge_keys"]=newKeys;
		return newKeys
	}
	
	public function clear_cookie(){
		so=SharedObject.getLocal("all_keys","/");
		var oldKeys=so.data["stoarge_keys"] || [];
		if(so.size > 0){ 
			for(var key in oldKeys){
				var soItem=SharedObject.getLocal(key,"/");
				soItem.clear();
			}
		}
		so.data["stoarge_keys"]=[];
		return oldKeys;
	}
	
	
	public function setItem_cookie(key:String,sValue,config:Object=null){
		so=SharedObject.getLocal(key,"/");
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
		if(config.crossBrowser==false){
			cookieValue+=ExternalInterface.call("Storage['SWF'].getBrowser");
		}
		
		var oldVal=so.data[cookieValue] || null;
		so.data[cookieValue]=sValue;
		so.data.crossBrowser=config.crossBrowser;
		so.data.expire=config.expire;
		so.data.createTime=new Date().getTime();
		so.flush();
		
		var sooKeys =SharedObject.getLocal("all_keys","/");
		var oldKeys =sooKeys.data["stoarge_keys"] || [];
		oldKeys.push(key);
		sooKeys.data["stoarge_keys"]=oldKeys;
		sooKeys.flush();
		
		return oldVal;
	}
	
	public function getItem_cookie(key:String){
		var cookieValue:String="stoarge_";
		so=SharedObject.getLocal(key,"/");
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
		if(so.data.crossBrowser==false){ cookieValue+=ExternalInterface.call("Storage['SWF'].getBrowser"); }
		return so.data[cookieValue];
	}
	
	public function removeItem_cookie(key:String){
		var oldVal=null;
		var cookieValue:String="stoarge_";
		so=SharedObject.getLocal(key,"/");
		if(so.size>0){
			if(so.data.crossBrowser==false){ cookieValue+=ExternalInterface.call("Storage['SWF'].getBrowser"); }
			oldVal=so.data[cookieValue];
		}
		so.clear();
		return oldVal;
	}
	
}