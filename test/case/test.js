var storage= storage.install({
	order:[
		{name:"SWFMedium",config:{agentFile:"http://s1.iisii.net/storage/source/swf-agent.html"}},
		{name:"H5LMedium",config:{agentFile:"http://s1.iisii.net/storage/source/h5l-agent.html",prior:"cookie"}},
	],
	done: function(medium) {
		
	},
	fail: function() {
	}
});



/*
asyncTest("storage.setItem", function() {
  	
  	storage.setItem("KEY","[String]",function(result){
		var collection=storage.getMedium().collection;
		equal(collection.getItem("KEY"),"[String]","设置[String]值正常")
		start();
  	});
  	
  	storage.setItem("KEY",{a:1,b:"b",c:true},function(result){
  		var collection=storage.getMedium().collection;
		deepEqual(collection.getItem("KEY"),{a:1,b:"b",c:true},"设置[Object]值正常")
		start();
  	});
  	
  	storage.setItem("KEY",[1,2,3],function(result){
  		var collection=storage.getMedium().collection;
		deepEqual(collection.getItem("KEY"),[1,2,3],"设置[Array]值正常")
		start();
  	});
  	
  	storage.setItem("KEY",true,function(result){
  		var collection=storage.getMedium().collection;
		equal(collection.getItem("KEY"),true,"设置[Boolean]值正常");
		start();
  	});
  	
  	storage.setItem("KEY",1.5,function(result){
  		var collection=storage.getMedium().collection;
		equal(collection.getItem("KEY"),1.5,"设置[Number]值正常");
		start();
  	});
  	
  	storage.setItem("KEY",undefined,function(result){
  		var collection=storage.getMedium().collection;
		equal(collection.getItem("KEY"),undefined,"设置[Undefined]值正常");
		start();
  	});
});




asyncTest("storage", function() {
	
	storage.clear(function(){
		
		this.setItem("KEY_A",1,function(oldData){
			equal(oldData,null,"设置数据[KEY_A]");
			
			this.setItem("KEY_A",2,function(old2Data){
				equal(old2Data,1,"设置数据[KEY_A]");
			
				this.getItem("KEY_A",function(newdata){
					equal(newdata,2,"获取数据[KEY_A]");
				
					this.keys(function(keysData){
						deepEqual(keysData,["KEY_A"],"数据KEYS");
					
						this.removeItem("KEY_A",function(removedData){
							equal(removedData,2,"删除数据");
							start();
						})	
					});
				
				});
				
			});
			
		});	
	
	});

});

*/





