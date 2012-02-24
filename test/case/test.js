
var storage= Storage.install({
	done: function(medium) {
		equal(1,1,"aaa");
	
	},
	fail: function() {

	}
});



asyncTest("storage.setItem", function() {
  	
  	storage.setItem("KEY","[String]",function(result){
		var medium=storage.getMedium();
		equal(medium.data.getItem("KEY"),"[String]","设置[String]值正常")
		start();
  	});
  	
  	storage.setItem("KEY",{a:1,b:"b"},function(result){
  		var medium=storage.getMedium();
		deepEqual(medium.data.getItem("KEY"),{a:1,b:"b"},"设置[Object]值正常")
		start();
  	});
  	
  	storage.setItem("KEY",[1,2,3],function(result){
  		var medium=storage.getMedium();
		deepEqual(medium.data.getItem("KEY"),[1,2,3],"设置[Array]值正常")
		start();
  	});
  	
  	storage.setItem("KEY",true,function(result){
  		var medium=storage.getMedium();
		equal(medium.data.getItem("KEY"),true,"设置[Boolean]值正常");
		start();
  	});
  	
  	storage.setItem("KEY",1.5,function(result){
  		var medium=storage.getMedium();
		equal(medium.data.getItem("KEY"),1.5,"设置[Number]值正常");
		start();
  	});
  	
  	storage.setItem("KEY",undefined,function(result){
  		var medium=storage.getMedium();
		equal(medium.data.getItem("KEY"),undefined,"设置[Undefined]值正常");
		start();
  	});
});




