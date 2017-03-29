function Task(div,stepL,stepT){
  this.div=div; this.stepL=stepL; this.stepT=stepT;
}

// 响应式
/*var Responsive = {
  gridPanel : null, // 主容器对象
  grids : null, // grid 对象
  cells : null, // cell对象
  WIDTH : 0, // 主容器宽高
  PADDING : 0, // 单元格间距
  cellWidth :0, // 单元格宽高

  init : function(){
    this.gridPanel = document.getElementById("gridPanel");
    this.grids = document.querySelectorAll(".grid");
    this.cells = document.querySelectorAll(".cell");

    this.setSize();

    window.onresize = this.setSize.bind(this);
  },

  setSize : function(){
    this.WIDTH = document.body.clientWidth || document.documentElement.clientWidth; 
    
    if(this.WIDTH < 480){
      // console.log(this.WIDTH);
      // 大概保证 padding : cellWidth = 1:5
      this.PADDING = Math.floor(this.WIDTH / 30);
      this.cellWidth = (this.WIDTH - this.PADDING * 5) / 4;

      this.gridPanel.style.width = this.WIDTH+"px";
      this.gridPanel.style.height = this.WIDTH+"px";
      
      var i = 0,length;
      for(length = this.grids.length; i < length; i++){
        this.grids[i].style.width = this.cellWidth+"px";
        this.grids[i].style.height = this.cellWidth+"px";
        this.grids[i].style.margin = this.PADDING+"px 0 0 "+this.PADDING+"px";
      }
      // 
      for(i = 0,length = this.cells.length; i < length; i++){
        var cell = this.cells[i];
        cell.style.width = this.cellWidth+"px";
        cell.style.height = this.cellWidth+"px";
        cell.style.lineHeight = this.cellWidth+"px";
        
        // 层数 ==> 第几层
        var gridNum = Math.floor(i / 4);
        //  列数 ==> 第几列
        var cellNum = Math.floor(i % 4);
            
        cell.style.top = (( gridNum+ 1) * this.PADDING + gridNum * this.cellWidth)+"px";
      // console.log("padding : "+this.PADDING);

        cell.style.left = ((cellNum+ 1)*this.PADDING + cellNum * this.cellWidth) + "px";
       
      }
    }
  },

  getCellWidth:function(){
    return this.cellWidth;
  },

  getPadding : function(){
    return this.PADDING;
  }
}

Responsive.init();*/

(function(){
 
  var LSwiperMaker = function(o){ 

    var that = this;
    this.config = o;
    this.control = false;
    this.sPos = {};
    this.mPos = {};
    this.dire;

    // this.config.bind.addEventListener('touchstart', function(){ return that.start(); } ,false);
    // 这样不对的，event对象只在事件发生的过程中才有效;
    this.config.bind.addEventListener('touchstart', function(e){ return that.start(e); } ,false);
    this.config.bind.addEventListener('touchmove', function(e){ return that.move(e); } ,false);
    this.config.bind.addEventListener('touchend', function(e){ return that.end(e); } ,false);

  }

  LSwiperMaker.prototype.start = function(e){
       
    var point = e.touches ? e.touches[0] : e;
    this.sPos.x = point.screenX;
    this.sPos.y = point.screenY;
    // console.log("in start");
  }
  LSwiperMaker.prototype.move = function(e){  

    var point = e.touches ? e.touches[0] : e;
    this.control = true;
    this.mPos.x = point.screenX;
    this.mPos.y = point.screenY;
    // console.log("this is move");
  } 

  LSwiperMaker.prototype.end = function(e){

    if(this.control){

      var differX = this.mPos.x - this.sPos.x,
          differY = this.mPos.y - this.sPos.y;

      // 横向
      if(Math.abs(differX) > Math.abs(differY)){
        differX > 0?this.dire = "R":this.dire="L";
      }
      // 纵向
      else{
        differY > 0?this.dire = "D":this.dire = "U";
      }
    }
    else{
      this.dire = null;
    }
    // console.log("end",this.control)
    this.control = false;
    this.config.backfn(this);

  }

  window.LSwiperMaker = LSwiperMaker;
  document.addEventListener('touchmove', function (e) {/* e.preventDefault();*/ }, false);// 禁止微信touchmove冲突
 
}());


var animation={
  DURATION:1000, // 单位时间,ms

  STEPS:36, // 步长：在单位时间内能移动的次数
  moved:0, // 已移动步数

  // 函数过程中，当 已移动步数 == 总步数时，结束定时器，
  // 而此时已设为1s60帧的速度，因此不需要过渡延时
  interval:0, // 移动一步的时间间隔,ms,
  timer:null, 
  CSIZE:70, OFFSET:8, // 格子宽度 + 外边距
  tasks:[],

  init:function(){
    var width = document.body.clientWidth || document.documentElement.clientWidth;
    (width >= 480)&&(this.CSIZE = 100,this.OFFSET = 16);
    // this.CSIZE = Responsive.getCellWidth();
    // this.OFFSET = Responsive.getPadding();
    // 
    // this.interval = this.DURATION / this.STEPS;
    // console.log(this.interval);
  },
  //将要移动的div和步长添加到数组
  addTask:function(startr,startc, endr,endc){
  	// 获取目标元素 -> 找到id为c+startr+startc的div;
    var div=
      document.getElementById("c"+startr+startc);
    //计算起始到目标的 每一步的距离： 横向 总距离 / 总步数
    var stepL=
      (endc-startc)*(this.CSIZE+this.OFFSET)
      /this.STEPS;

    //计算起始到目标的  每一步的距离： 纵向 总距离 / 步长
    var stepT=
      (endr-startr)*(this.CSIZE+this.OFFSET)
      /this.STEPS;
      
    this.tasks.push(new Task(div,stepL,stepT));
  },

  //  callback 函数来自 2048.js，作用是判断游戏状态，刷新页面
  play:function(callback){
    //启动周期型定时器，设置任务为playStep,同时绑定this，
    // 同时绑定参数callback，时间间隔为interval, 序号保存在timer中
    this.timer=setInterval(
      this.playStep.bind(this,callback),
      this.interval
    );
  },
  playStep:function(callback){
    // console.log("in playStep");
    // console.log();
    // debugger;
    //遍历tasks中每项task
    for(var i=0;i<this.tasks.length;i++){
      var div=this.tasks[i].div;

      //获得当前task的div计算后的样式，保存在style中
      var style=getComputedStyle(div);
      //设置当前task的div的left为style的left转为浮点数+当前task的stepL
      div.style.left=parseFloat(style.left)+this.tasks[i].stepL+"px";

      //设置当前task的div的top为style的top转为浮点数+当前task的stepT
      div.style.top=parseFloat(style.top)+this.tasks[i].stepT+"px";
    }//(遍历结束)

    this.moved++;//将moved+1

    //如果moved等于STEPS
    if(this.moved==this.STEPS){
      //停止定时器，清除timer，moved归0
      clearInterval(this.timer);
      this.timer=null;
      this.moved=0;
      //遍历tasks中每个task
      for(var i=0;i<this.tasks.length;i++){
        var div=this.tasks[i].div;
        //清除当前task的div的left
        div.style.left="";
        //清除当前task的div的top
        div.style.top="";
      }
      this.tasks=[];//重置tasks为空数组
      callback();//调用callback，刷新页面
    }
  }
}
animation.init();


