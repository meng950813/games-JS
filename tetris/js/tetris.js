var tetris = {
	RN:20, // 总行数
	CN:10, // 总列数
	OFFSET:15,// 上边和左边修正的边距 
	CSIZE:26, // 格子宽高
	pg: null, // 保存游戏容器 div
	shape:null, // 保存正在下落的图形
	nextShape: null, // 保存下一个图形
	timer:null, // 保存定时器序号
	interval:400, // 下落时间 
	wall:null, //方块墙，保存所有停止下落的方块
	lines:0, //	保存删除的行数
	score:0, //	保存得分
	SCORE:[0,10,30,90,250], // 保存删除行数对应的得分
	
	state:1,  // 游戏状态
	RUNNING:1, // 运行状态
	GAMEOVER:0, //	游戏结束
	PAUSE:2,  // 暂停

	// 启动游戏
	start : function(){
		this.lines = this.score = 0; //重置得分和删除行数
		this.state = this.RUNNING; // 重置游戏状态
		// 将 wall 初始化为空数组
		this.wall = [];
		for (var i = 0 ; i < this.RN; i++) {
			// wall 中有 RN*CN个空元素
			this.wall.push(new Array(this.CN));
		}

		// 获取随机图形
		this.shape = this.randomShape();
		this.nextShape = this.randomShape();


		this.pg = document.querySelector('.playground');
		this.paint();

		this.setEvent();

		// 启动定时器 
		this.timer = setInterval(this.moveDown.bind(this),this.interval);

	},


	setEvent : function(){
		//绑定键盘按下事件
		document.onkeydown = function(e){
			// 判断键盘号
			switch(e.keyCode){
				// 左键：调左移方法
				case 37: (this.state == this.RUNNING) && (this.moveLeft()); break;

				// 右键：调右移方法
				case 39: (this.state == this.RUNNING) && (this.moveRight()); break;

				// 上键：顺时针变形
				case 38: (this.state == this.RUNNING) && (this.rotateR()); break;

				// Z键：逆时针变形
				case 90: (this.state == this.RUNNING) && (this.rotateL()); break;
	
				// 下键：调下落方法
				case 40: (this.state == this.RUNNING) && (this.moveDown()); break;

				// 空格：快速下落
				case 32: (this.state == this.RUNNING) && (this.hardDrop()); break;

				// p 键，暂停/继续,80
				case 80: this.pause(); break;

				// q 键，重新开始
				case 81: break;
			}
		}.bind(this);

		// 设置图标点击事件
		// 设置事件代理
		document.getElementById("options").onclick = function(event){
			var e = event || window.event;
			var taget = e.taget || e.srcElement;
			
			switch(taget.id){
				case "upBtn": (this.state == this.RUNNING) && (this.rotateR()); break;

				case "rightBtn": (this.state == this.RUNNING) && (this.moveRight()); break;

				case "downBtn": (this.state == this.RUNNING) && (this.hardDrop()); break;

				case "leftBtn": (this.state == this.RUNNING) && (this.moveLeft()); break;

				case "pauseBtn": 
					var pauseBtn = document.getElementById("pauseBtn");
					pauseBtn.style.backgroundPosition 
					= (this.state === this.RUNNING)
						?("-120px 0")
						:("-120px -60px");
					this.pause();
					break;
			}

		}.bind(this);
	},

	// 判断能否左移
	canLeft : function(){
		for(var i = 0; i<this.shape.cells.length; i++){
			var cell = this.shape.cells[i];
			// 如果当前图形有 方块在最左边 或方块左边 已经有 方块，不准左移
			if(cell.c == 0 || this.wall[cell.r][cell.c-1] != undefined){
				return false;
			}
		}
		return true;
	},

	// 左移
	moveLeft : function(){
		// 如果可以左移
		if(this.canLeft()){
			// 调用函数将每个方块向左移一格
			this.shape.moveLeft();

			// 刷新页面
			this.paint();
		}
	},

	// 判断能否右移
	canRight : function(){
		for(var i = 0; i<this.shape.cells.length; i++){
			var cell = this.shape.cells[i];
			// 如果当前图形有 方块在最右边 或方块右边 已经有 方块，不准右移
			if(cell.c == this.CN -1 || this.wall[cell.r][cell.c+1] != undefined){
				return false;
			}
		}
		return true;
	},

	// 右移
	moveRight : function(){
		// 如果可以右移
		if(this.canRight()){
			// console.log("into moveRight");
			// 调用函数将每个方块向右移一格
			this.shape.moveRight();

			// 刷新页面
			this.paint();
		}
	},

	// 判断是否可以旋转
	// 因为预判是否能旋转很麻烦，所以先旋转，判断旋转后是否有 越界 或是与 方块墙 中的 内容重合
	// 如果 判断通过，表示不能旋转，返回false
	// 返回 true
	canRotate : function(){
		for (var i = 0; i < this.shape.cells.length; i++) {
			var cell = this.shape.cells[i];

			if(cell.r < 0 || cell.r >= this.RN || cell.c < 0 || cell.c >= this.CN || this.wall[cell.r][cell.c] !== undefined){
				return false;
			}
		}
		return true;
	},

	// 变形函数,逆时针旋转
	rotateL : function(){
		// 先旋转
		this.shape.rotateL();
		if(!this.canRotate()){
			// 不可以旋转，逆向旋转，回归原位
			// console.log("不可旋转");
			this.shape.rotateR();
		}
		// 重绘
		this.paint();
	},

	// 变形函数,顺时针旋转
	rotateR : function(){
		this.shape.rotateR();
		if(!this.canRotate()){
			// console.log("不可旋转");
			
			// 不可以旋转，逆向旋转，回归原位
			this.shape.rotateL();
		}
		// 重绘
		this.paint();
	},

	// 判断当前图形能否下落
	canDown : function(){
		// 遍历 shape 中的每个 cell
		for (var i = 0; i < this.shape.cells.length; i++) {
			// 将当前 cell 保存在临时变量 cell中
			var cell = this.shape.cells[i];
			// 如果 r == 19 或 wall中 当前 cell 的下方位置有方块
			if(cell.r == this.RN-1 || this.wall[cell.r+1][cell.c] != undefined){
				// 返回false
				return false;
			}
		}
		// 返回 true
		return true;
	},

	// 图形下落, 调用当前图形的 moveDown 函数
	moveDown : function(){
		if(this.canDown()){
			// 如果可以下落
			this.shape.moveDown();
		}
		else{
			// 放入墙中
			this.landIntoWall();
			var ln = this.deleteRows(); // 检查并删除满格行,返回本次删除的行数
			this.score += this.SCORE[ln]; // 增加得分
			this.lines += ln;
			// 重绘成绩
			this.paintScore();
			// 新建 主角图形

			if(this.isGameOver()){
				// 游戏结束,停止计时器，清空timer，修改游戏状态为gameover
				this.state = this.GAMEOVER;
				clearInterval(this.timer);
				this.timer = null;
				// this.nextShape = null;
			}
			// 游戏 未结束
			else{
				this.shape = this.nextShape;
				this.nextShape = this.randomShape();
			}
		}
		
		this.paint();
	},

	// 判读游戏结束
	isGameOver : function(){
		// 遍历下一图形中国每个 cell
		for (var i = 0; i < this.nextShape.cells.length; i++) {
			var cell = this.nextShape.cells[i];
			// 判断方块墙中相同形状的位置 不为空 ，返回 true，表示游戏结束
			if(this.wall[cell.r][cell.c] !== undefined){
				return true;
			}
		}
		// 返回false
		return false;
	},

	// 暂停游戏
	pause : function(){
		if(this.state == this.RUNNING){
			this.state = this.PAUSE;
			clearInterval(this.timer);
			this.timer = null;
			this.paint();
		}
		else if(this.state == this.PAUSE){
			this.state = this.RUNNING;
			this.timer = setInterval(this.moveDown.bind(this),this.interval);
		}
	},

	// 设置游戏状态
	paintState : function(){
		// 游戏状态为 GAMEOVER 
		if(this.state == this.GAMEOVER){
			// 新建img元素，设置src 
			var img = new Image();
			img.src = "img/game-over.png";
			this.pg.appendChild(img);
		}
		// 暂停状态
		else if(this.state == this.PAUSE){
			var img  = new  Image();
			img.src = "img/pause.png";
			this.pg.appendChild(img);
		}
	},

	// 快速下落
	hardDrop : function(){
		// 只要可以下落
		while(this.canDown()){
			// 比调用 this.moveDown 效率高
			this.shape.moveDown();
		}
		this.paint();
	},

	// 随机生成图形
	randomShape : function(){
		//  随机生成 0-7 间的整数，
		switch(Math.floor(Math.random() * 7)){
			case 0:
				return new I();
			case 1:
				return new T();
			case 2:
				return new O();
			case 3:
				return new Z();
			case 4:
				return new S();
			case 5:
				return new J();
			case 6:
				return new L();
		}
	},

	//  绘制当前图形
	paintShape:function(){
		// 创建文档片断 frag 
		var frag = document.createDocumentFragment();

		// 遍历当前图形 shape 中的cells 数组中每个cell对象
		for (var i = 0; i < this.shape.cells.length; i++) {
			this.paintCell(this.shape.cells[i],frag);
		}		
		// 将frag追加到 pg 上
		this.pg.appendChild(frag);
	},

	// 绘制下一图形 
	paintNext : function(){
		// 创建文档片断 frag 
		var frag = document.createDocumentFragment();

		// 遍历当前图形 nextShape 中的cells 数组中每个cell对象
		for (var i = 0; i < this.nextShape.cells.length; i++) {
			var img = this.paintCell(this.nextShape.cells[i],frag);
			img.style.top = parseFloat(img.style.top) + this.CSIZE +"px";
			img.style.left = parseFloat(img.style.left) + this.CSIZE*10 +"px";
		}		
		// 将frag追加到 pg 上
		this.pg.appendChild(frag);
	},

	// 绘制方块墙中的元素
 	paintWall : function(){

		// 创建文档片断 frag 
		var frag = document.createDocumentFragment();

 		// 自上而下遍历wall中每一行
 		for (var r = this.RN - 1; r >= 0; r--) {
 			// 如果当前行不是空行 => 无缝拼接 join 之后，不是空字符串
 			if(this.wall[r].join("") != ""){
	 			for (var c = this.CN - 1; c >= 0; c--) {
	 				// 如果当前 格 有效
					if(this.wall[r][c] != undefined){
	 					this.paintCell(this.wall[r][c],frag);
					}
	 			}
 			}
 			// 表示本行没有方块，则上方也不会有方块，结束循环
 			else{
 				break;
 			}
 		}

		// 将frag追加到 pg 上
		this.pg.appendChild(frag);
 	},

 	// 绘制一个方块 
 	paintCell : function(cell,frag){
		// 	创建img元素
		var img = new Image();
		// 	设置img的src 为cell的src，宽为CSIZE，
		img.src = cell.src;
		img.style.width = this.CSIZE+"px";
		
		// 	top：OFFSET+ r * CSIZE;  left: OFFSET+ c * CSIZE
		img.style.top = cell.r * this.CSIZE + this.OFFSET+"px";
		img.style.left = cell.c * this.CSIZE + this.OFFSET+"px";
		
		// 	将img加入frag
		frag.appendChild(img);

		return img;
 	},

 	// 重绘成绩
 	paintScore : function(){
 		// 获得 id 为 score 的元素，设置内容为 score 
 		document.getElementById('score').innerHTML = this.score;
 		// 获得 id 为 lines 的元素，设置内容为 lines
 		document.getElementById("lines").innerHTML = this.lines;
 	},

 	// 重绘 页面上的 所有图形
	paint : function(){
		// 利用正则 将 pg 内容中的所有 img 元素替换为 ""
		// 清除页面所有方块
		this.pg.innerHTML = this.pg.innerHTML.replace(/<img\s[^>]+>/g,"");
	
		// 重绘方块
		this.paintShape(); // 绘制主角图形
		this.paintNext();  // 绘制下一圖形
		this.paintWall(); // 绘制方块墙中的方块 
		this.paintState(); // 绘制游戏状态
	},

	// 放入数组
	landIntoWall : function(){
		// 遍历 shape中的每个cell
		for (var i = 0; i < this.shape.cells.length; i++) {
			// 将当前 cell 保存到临时变量 cell 中
			var cell =  this.shape.cells[i];
			// 设置 wall 中当前 cell 相同位置的元素值为cell
			this.wall[cell.r][cell.c] = cell;
		}
	},

	deleteRows : function(){
		// 反向遍历wall数组，
		for (var i = this.wall.length - 1,ln = 0 ; i >= 0; i--) {
			// 如果当前行为空,或一次已经消除四行（最多消除），跳出循环
			if(this.wall.join("") != "" || ln<4){
				// 如果当前行满格，删除行
				if(this.isFullRow(i)){
					this.deleteRow(i);
					// 保证 上方下落的行 也会判断
					i++;
					// 记录消除的行数，最多为4
					ln++;
				}
			}
			else{
				break;
			}
		}
		return ln;
	},

	// 判断当前行是否满格
	isFullRow : function(r){
		// 如果wall中 r 行转为字符串后，开头或结尾有 , 或有两个 连起来的 ,, 说明不满

		// 找不到，表示满行
		return !(/(^,)|(,,)|(,$)/.test(String(this.wall[r])));

	},

	// 删除当前行
	deleteRow : function(r){
		// 从 r 行开始，反向遍历wall中每一行
		for (; r >= 2; r--) {
			// 用 r-1 行 替换 r 行，将 r-1  行赋值为 CN 个空元素的数组
			this.wall[r] = this.wall[r - 1];
			this.wall[r-1] = new Array(this.CN);

			// 遍历wall中新 r 行每一格
			for (var c = this.CN - 1; c >= 0; c--) {
				// 如果当前格不是undefined，将当前格 的 r +1 
				(this.wall[r][c] !== undefined) && (this.wall[r][c].r++);
 			}
			// 如果 r -2 是空行，结束循环
 			if (this.wall[r-2].join("") == "") {
 				break;
 			}
		}
	}

}

tetris.start();