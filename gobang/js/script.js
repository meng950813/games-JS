;
console.warn("welcome to play my game --cm");
var gobang = {

	emptyChess : 0, //棋盘中的空位子
	myChess : 1, // 我方棋子
	computerChess : 2,// 计算机棋子

	chessCanvas: null, // 保存canvas对象

	restartBtn : null,

	chess : null,// 保存canvas2d棋盘对象
	chessWidth : 0, // 棋盘宽高

	lineNum : 15, // 行数
	lineHeight : 30, // 行高
	chessRadius : 12,// 棋子半径，小于 行高的一半 

	padding : 15, // 线 与 边缘距离
	
	sumCount : 0,//最多落子数
	nowCount : 0,// 当前落子数
	me : true,//标注落子颜色
	
	chessBoard : [],//存储落子情况，防止棋子覆盖，二维数组
	wins : [], //赢法数组。记录所有赢的可能情况

	//赢法统计数组
	myWin : [],
	computerWin : [],

	count : 0, //记录赢法数量

	over : false, // 判断当前是否结束

	start:function(){
		this.init();

		this.drawChessBoard();

		this.setEvent();
	},

	// 初始化函数
	init : function(){   this.restartBtn = document.getElementById("restart");
		// 初始化对象
		this.chessCanvas = document.getElementById('chess');
		this.chess = this.chessCanvas.getContext('2d');

		// 获取屏幕宽高
		var clientWidth = document.body.clientWidth || document.documentElement.clientWidth;
		var clientHeight = document.body.clientHeight || document.documentElement.clientHeight;

		// 取其中较小值作为参考
		this.chessWidth = Math.min(clientWidth,clientHeight);
		
		// 如果屏幕跨度比预设的小
		if(this.chessWidth < 450){
			// 重置canvas图像宽高等信息
			this.resetChess();
		}else{
			this.chessWidth = 450;
		}

		// 初始化最多落子数  
		this.sumCount = this.lineNum * this.lineNum;
		// 初始化赢法数组
		this.initWinsArray();
	},

	//重置棋盘宽高等数据
	resetChess : function(){
		// 重置canvas宽高
		// console.log(this.chessWidth);
		this.chessCanvas.width = this.chessWidth;
		this.chessCanvas.height = this.chessWidth;
		// this.chessCanvas.width = 360;
		// this.chessCanvas.height = 360;

		// 居中定位
		this.chessCanvas.style.margin="-"+(this.chessWidth / 2)+"px -"+(this.chessWidth / 2)+"px";

		// 保证行数不变，设置行高
		this.lineHeight = Math.floor(this.chessWidth / this.lineNum);
		// 根据行高，设置棋子宽度
		this.chessRadius = Math.floor(this.lineHeight / 2 - this.lineHeight / 10);
		// 根据行高，计算剩余高度，平分，设为内边距
		this.padding = (this.chessWidth - this.lineHeight * (this.lineNum - 1)) / 2;

		// console.log(this.padding,this.lineHeight);
	},

	// 初始化赢法数组
	initWinsArray : function(){
		var i,j;
		//初始化落子数组
		for ( i = 0; i < this.lineNum; i++) {
			this.chessBoard[i] = [];
			for(j = 0; j < this.lineNum; j++){
				this.chessBoard[i][j] = 0;
			}
		}

		//赢法数组，记录所有可能的赢法，三维数组
		//初始化赢法数组
		for(i = 0; i < this.lineNum; i++){
			this.wins[i] = [];
			for(j = 0; j < this.lineNum; j++){
				this.wins[i][j] = [];
			}
		}

		//五子在一条横线
		for (i = 0; i < this.lineNum; i++) {
			for(j = 0;j < this.lineNum-4; j++){
				for(k = 0; k < 5; k++){
					this.wins[i][j+k][this.count] = true;
				}
				this.count++;
			}
		}
		//五子在一条竖线
		for (i = 0; i < this.lineNum; i++) {
			for(j = 0;j < this.lineNum-4; j++){
				for(k = 0; k < 5; k++){
					this.wins[j+k][i][this.count] = true;
				}
				this.count++;
			}
		}
		//五子在一条斜线
		for (i = 0; i < this.lineNum-4; i++) {
			for(j = 0; j < this.lineNum-4; j++){
				for(k = 0; k < 5; k++){
					this.wins[i+k][j+k][this.count] = true;
				}
				this.count++;
			}
		}
		//五子在一条反斜线
		for (i = 0; i < this.lineNum-4; i++) {
			for(j = this.lineNum-1; j > this.lineNum-12; j--){
				for(k = 0; k < 5; k++){
					this.wins[i+k][j-k][this.count] = true;
				}
				this.count++;
			}
		}
		
		// 初始化赢法统计数组
		for(i = 0; i < this.count; i++){
			this.myWin[i] = 0;
			this.computerWin[i] = 0;
		}
	},

	// 绘制棋盘线
	drawChessBoard : function(){
		// console.log("draw chess board line");

		// console.log(this.chessWidth,this.padding);
		// 设置线的颜色
		this.chess.strokeStyle = "#000";
		
		for(var i=0; i < this.lineNum; i++){
			//纵线
			this.chess.moveTo(this.padding + i*this.lineHeight, this.padding);

			this.chess.lineTo(this.padding + i*this.lineHeight, this.chessWidth - this.padding);
			this.chess.stroke();

			// 横线
			this.chess.moveTo(this.padding,this.padding+i*this.lineHeight);

			this.chess.lineTo(this.chessWidth - this.padding, this.padding + i * this.lineHeight);
			
			this.chess.stroke();
		}
	},

	// 落子
	oneStep : function(x, y, me){
		this.chess.beginPath();

		// 圆形棋子圆心坐标
		var circleX = this.padding + x * this.lineHeight;
		var circleY = this.padding + y * this.lineHeight;

		this.chess.arc(circleX,circleY,this.chessRadius,0,2*Math.PI);

		//颜色渐变， +2 ,-2 表示渐变向右下方偏移
		var gradient = this.chess.createRadialGradient(circleX, circleY, this.chessRadius,
																									circleX + 2, circleY - 2, 0);
		if(!me){
			//黑棋
			gradient.addColorStop(0,"#0A0A0A");
			gradient.addColorStop(1,"#636766");
		}
		else{
			//白棋
			gradient.addColorStop(0,"#d1d1d1");
			gradient.addColorStop(1,"#f9f9f9");
		}
		this.chess.closePath();

		this.chess.fillStyle=gradient;
		this.chess.fill();
		//当前棋盘总棋子数 +1
		this.nowCount++;
	},

	setEvent : function(){
		this.chessCanvas.onclick = function(event){
			var e = event || window.event;
			// console.log(this.over);
			if(!this.over && this.me){
				// 获取相对于 canvas 的坐标
				var x = e.offsetX;
				var y = e.offsetY;
				// console.log(x+"  "+y);

				//向下取整,获取行数
				var i = Math.floor( x / this.lineHeight);
				var j = Math.floor( y / this.lineHeight);
				var k;
				// console.log(i+"  "+j);

				if(this.chessBoard[i][j]==0){
					// 我方落子
					this.oneStep(i,j,this.me);
					this.chessBoard[i][j] = this.myChess;
					// 判断输赢
					for(k = 0; k < this.count; k++){
						if(this.wins[i][j][k]){
							this.myWin[k]++;
							//表示这种赢法机器不可能做到
							this.computerWin[k]=6;
							if(this.myWin[k]==5){
								this.over =true;
								this.showResult(this.myChess);
							}
						}
					}
					if(!this.over){
						this.me = !this.me;
						// 计算机落子
						this.computerAI();
					}
				}
			}				
		}.bind(this);

		this.restartBtn.onclick = function(){
			location.reload();
		}
	},

	//计算机落子
	computerAI : function(){
		// 二维数组,表示我所有的落子的权值 ==> 重要程度
		var myScore = [];
		// 表示计算机落子的权值
		var computerScore = [];
		// 当前最大权值
		var max = 0;
		// 最大权值点的坐标
		var maxX = 0,maxY = 0;
		var i,j,k;

		// 初始化权值数组
		for(i = 0; i < this.lineNum; i++){
			myScore[i] =[];
			computerScore[i] =[];
			for(j = 0; j < this.lineNum; j++){
				myScore[i][j]=0;
				computerScore[i][j]=0;
			}
		}

		// 遍历棋盘每个点
		for(i = 0; i < this.lineNum; i++){
			for(j = 0; j < this.lineNum; j++){

				// 如果当前点没有棋子
				if(this.chessBoard[i][j] == this.emptyChess){
					
					// 遍历赢法数组
					for(k = 0; k < this.count; k++){

						// 如果在这个点落子之后，有赢的可能
						if(this.wins[i][j][k]){
							//拦截 ： 
							//判断对手在该点落子后，能有多少棋子连成线
							//不同棋子数量有不同的权重
							switch(this.myWin[k]){
								case 1:
									myScore[i][j] += 200;
									break;
								case 2:
									myScore[i][j] += 400;
									break;
								case 3:
									myScore[i][j] += 1000;
									break;
								case 4:
									myScore[i][j] += 10000;
									break;
								default:
									break;
							}
							//计算机落子
							//判断自己在该点落子后，能有多少棋子连成线
							//相同棋子数量：落子权重比拦截权重高
							// ==> 进攻型AI
							switch(this.computerWin[k]){
								case 1:
									computerScore[i][j] += 220;
									break;
								case 2:
									computerScore[i][j] += 420;
									break;
								case 3:
									computerScore[i][j] += 2000;
									break;
								case 4:
									computerScore[i][j] += 20000;
									break;
								default:
									break;
							}
						}
						
					}
					//判断该点是否是当前最大权值点
					if(myScore[i][j] > max){
						max = myScore[i][j];
						maxX = i;
						maxY = j;
					}
					else if(myScore[i][j] == max){
						if(computerScore[i][j] > computerScore[maxX][maxY]){
							maxX = i;
							maxY = j;
						}
					}

					if(computerScore[i][j] > max){
						max = computerScore[i][j];
						maxX = i;
						maxY = j;
					}else if(computerScore[i][j] == max){
						if(myScore[i][j] > myScore[maxX][maxY]){
							maxX = i;
							maxY = j;
						}
					}
				}
			}
		}
		this.oneStep(maxX,maxY,false);
		this.chessBoard[maxX][maxY] = 2;
		for(k = 0; k < this.count; k++){
			if(this.wins[maxX][maxY][k]){
				this.computerWin[k]++;
				//表示这种赢法不可能
				this.myWin[k]=6;
				if(this.computerWin[k] == 5){
					this.over = true;
					// alert("计算机赢了！");
					this.showResult(this.computerChess);

						// var successCanvas = document.getElementById("success");
						// successCanvas.style.display = "block";

						// var stopFireWorks = fireworks(successCanvas);

						// this.restartBtn.className="active";

					// console.log("计算机赢了！");
				}else if(this.nowCount == this.sumCount){
					this.over = true;
					alert("平局");
				}
			}
		}
		if(!this.over){
			this.me=!this.me;
		}
	},

	showResult : function(winer){
		if(this.over){
			var result = document.createElement("canvas");

			this.chessCanvas.style.background = "rgba(0,0,0,0)";
			// console.log(this.chessCanvas);

			if(winer === this.computerChess){
				result.id ="fail";
				fail.init(result);
				document.getElementById("img-fail").style.display = "block";
			}
			else if(winer === this.myChess){
				result.id = "success";
				// fail.init(result);
				fireworks(result);
				document.getElementById("img-success").style.display = "block";
			}
			else{
				result.id = "draw";
				document.getElementById("img-draw").style.display = "block";
			}
			result.style.display = "block";
			this.restartBtn.className = "active";
			
			document.body.appendChild(result);

		}
	}
};

gobang.start();


var fail = {
	ctx : null,
	particles : [], // 用于保存点的数组
  maxNum : 0, // 粒子总数量
  interval : 0, // 动画执行间隔
  timer : null,

  width: 0,

	init : function(canvas){
		this.ctx = canvas.getContext('2d');

		this.width = document.body.clientWidth || document.documentElement.clientWidth;
		this.height = document.body.clientHeight || document.documentElement.clientHeight;
		
		/* 设置背景宽高 */
		canvas.width = this.width;
		canvas.height = this.height;

		this.interval = 60;
		var min = Math.min(this.width,this.height);
		this.maxNum = min <= 450 ?120:(min>450&&min<=720?200:250);

		for(var i = 0;i<this.maxNum;i++){
			this.loop();
		}
		this.timer = setInterval(this.loop.bind(this),this.interval);
	},
	
	

	loop:function(){
		this.ctx.fillStyle = "#f8f8ff";
		this.ctx.fillRect(0,0,this.width,this.height);
		
		var particle = new this.Particle(Math.random()*this.width, 10);
   	this.particles.push(particle); 

    for (i=0; i<this.particles.length; i++) {
      var particle = this.particles[i]; 
      particle.render(this.ctx); // 绘制数组中的每一个粒子
      // 更新数组中的每一个粒子的位置
      particle.update(); 
    }

    if (this.particles.length > this.maxNum){//只保留200个粒子
      this.particles.shift();
    }
	},

	Particle : function(xPos,yPos){
		this.xPos = xPos;
	  this.yPos = yPos; 
	  this.yVel = 5;
	  this.radius = 8;

	  this.render = function(c){
		  c.fillStyle = "#aaa";
		  c.font ="36px Microsoft Yahei";
		  var deg = Math.PI/3;
		  c.fillText("*",this.xPos,this.yPos);
		}

		// 重置位置
	  this.update = function(){
	    this.yPos += this.yVel; 
	  }
	}
};