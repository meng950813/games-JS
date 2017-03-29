// 定义Cell类型描述每个格子的数据结构
// 三个属性，r，c,src
// r ==> row 行，当前分20行
// c ==> cell 列，当前分 10列 
function Cell(r,c,src){
	this.r = r;
	this.c = c;
	this.src = src;
}
/*
	定义父类型Shape描述所有图形类型的共同属性和方法
	一个属性：cells
*/
function Shape(cells,src){
	this.cells = cells;

	// 设置cell元素的src属性
	for (var i = 0; i < this.cells.length; i++) {
	 	this.cells[i].src = src;
	 } 
}

// 定义父类型Shape 描述所有图形类型共同属性和方法
// states 数组，存储图形的所有可用形态
function Shape(cells,src,states,orgi){
	this.cells = cells;
	// 设置cell元素的src属性
	for (var i = 0; i < this.cells.length; i++) {
	 	this.cells[i].src = src;
	}

	// 保存圆形方块 ==>  将第 orig 个元素设为中心元素，绕它旋转
	this.orgCell = cells[orgi];
	
	// 保存图形的所有可用状态
	this.states = states;

	// 保存当前变形状态
	this.statei = 0;
}

Shape.prototype = {
	constructor:Shape,
	IMGS:{
		// 统一保存所有图形中图片的路径
		T:"img/T.png",
		I:"img/I.png",
		O:"img/O.png",
		J:"img/J.png",
		L:"img/L.png",
		S:"img/S.png",
		Z:"img/Z.png"
	},

	// 左移函数
	moveLeft : function(){
		//  遍历当前图像中的每个 cell ==> 调用 moveLeft 的对象是图形对象
		for (var i = 0; i < this.cells.length; i++) {
			// 将当前cell 中的 c - 1
			this.cells[i].c--;
		}
	},

	// 右移函数
	moveRight : function(){
		//  遍历当前图像中的每个 cell ==> 调用 moveLeft 的对象是图形对象
		for (var i = 0; i < this.cells.length; i++) {
			// 将当前cell 中的 c - 1
			this.cells[i].c++;
		}
	},

	// 下移函数
	moveDown : function(){
		//  遍历当前图像中的每个 cell ==> 调用 moveLeft 的对象是图形对象
		for (var i = 0; i < this.cells.length; i++) {
			// 将当前cell 中的 c - 1
			this.cells[i].r++;
		}
	},

	// 按顺时针旋转
	rotateR : function(){
		// 将当前对象的 statei + 1,跟长度比较，保证不会越界
		this.statei++;
		(this.statei == this.states.length) && (this.statei = 0);

		this.rotate();
	},

	// 按逆时针旋转
	rotateL : function(){
		this.statei--;
		(this.statei == -1) && (this.statei = this.states.length-1);
		
		this.rotate();
	},

	//  变形函数
	rotate : function(){
		// 获取对应statei 的状态  ==> states[statei]
		var state = this.states[this.statei];
		// 遍历cell，
		for (var i = 0; i < this.cells.length; i++) {
			// 设置 r  = （参照格）orgCell.r + state 的 ri(i=0,1,2,3)
			this.cells[i].r = this.orgCell.r +  state["r"+i];
			//设置 c  = （参照格）orgCell.c + state 的 ci(i=0,1,2,3)
			this.cells[i].c = this.orgCell.c +  state["c"+i];
		}
	}
}

//  描述图形的旋转状态
function States(){
	// arguments => 1 2		3  4		5  6		7  8
	//              r0 c0	r1 c1		r2 c2		r3 c3

	// 给r0~r4,c0~c4 赋值
	for (var i = 0; i < 4; i++) {
		this["r"+i] = arguments[2*i];
		this["c"+i] = arguments[2*i+1];
	}
}

/* 定义 T 类型描述 T 类型的数据结构 */
function T(){
	// 借用Shape类型构造函数
	Shape.call(this,
		[
			new Cell(0,3),
			new Cell(0,4),
			new Cell(0,5),
			new Cell(1,4)
		],
		/* this 指当前初始化的 T 对象，通过原型链可以找到 Shape 中的 IMGS 对象 */
		this.IMGS.T,
		/* T形 方块的所有变形状态 */
		[	
			/* 初始状态：凸起在下 */
			new States(0,-1,	0,0,	0,1,	1,0),
			/* 旋转 90 度，凸起在左 */
			new States(-1,0,	0,0,	0,-1,	1,0),
			/* 旋转180 度，凸起在上 */
			new States(0,1,		0,0,	0,-1,	-1,0),
			/* 旋转270度，凸起在右 */
			new States(1,0,		0,0,	-1,0,	0,1 )
		],
		/* 原点坐标 */
		1
	);
}

/* 定义 O 类型描述 O 类型的数据结构 */
function O(){
	// 借用Shape类型构造函数
	Shape.call(this,
		[new Cell(0,4),new Cell(0,5),new Cell(1,4),new Cell(1,5)],
		this.IMGS.O,
		/* O 形 方块的所有变形状态 */
		[
			new States(0,-1,	0,0,	1,-1,	1,0)
		],
		/* 原点坐标 */
		1
	);
}

/* 定义 I 类型描述 I 类型的数据结构 */
function I(){
	// 借用Shape类型构造函数
	Shape.call(this, 
		[new Cell(0,3),new Cell(0,4),new Cell(0,5),new Cell(0,6)], 
		this.IMGS.I,
		/* I 形 方块的所有变形状态 */
		[
			new States(0,-1,	0,0,	0,1,	0,2 ),
			new States(-1,0,	0,0,	1,0,	2,0)
		],
		/* 原点坐标 */
		1
	);
}

/* 定义 S 类型描述 S 类型的数据结构 */
function S(){
	// 借用Shape类型构造函数
	Shape.call(this, 
		[new Cell(0,5),new Cell(0,4),new Cell(1,4),new Cell(1,3)], 
		this.IMGS.S,
		/* S 形 方块的所有变形状态 */
		[ // 初始状态
			new States(0,1, 	0,0,	 1,0,	 1,-1),
			new States(1,0, 	0,0,	 0,-1,-1,-1)
		],
		/* 原点坐标 */
		1
	);
}

function Z(){
	Shape.call(this,
		[new Cell(0,3),new Cell(0,4),new Cell(1,4),new Cell(1,5)],
		this.IMGS.Z,
		/* Z 形 方块的所有变形状态 */
		[	//初始状态
			new States(0,-1,  0,0,   1,0,   1,1),
			new States(-1,0,  0,0,   0,-1,  1,-1)
		],
		1
	);
}

function L(){
	Shape.call(this,
		[new Cell(1,3),new Cell(1,4),new Cell(1,5),new Cell(0,5)],
		this.IMGS.L,
		/* L 形方块所有可变形态*/
		[
			// 初始状态
			new States(0,-1,  0,0,  0,1,  -1,1),
			new States(-1,0,  0,0,  1,0,   1,1),
			new States(0,1,   0,0,  0,-1,  1,-1),
			new States(1,0,   0,0,  -1,0, -1,-1)
		],
		1
	);
}

function J(){
	Shape.call(this,
		[new Cell(1,3), new Cell(1,4), new Cell(1,5), new Cell(0,3)],
		this.IMGS.J,
		[
			new States(0,1,  0,0,  0,-1,  -1,-1),
			new States(1,0,  0,0,  -1,0,  -1,1),
			new States(0,-1, 0,0,   0,1,   1,1 ),
			new States(-1,0, 0,0,   1,0,   1,-1)
		],
		1
	);
}

// 继承 父类 Shape 原型
Object.setPrototypeOf(T.prototype,Shape.prototype);
// Object.setPrototypeOf(O.prototype,Shape.prototype);
O.prototype.__proto__ = Shape.prototype;
Object.setPrototypeOf(I.prototype,Shape.prototype);
// I.prototype = new Shape();
Object.setPrototypeOf(S.prototype,Shape.prototype);
Object.setPrototypeOf(Z.prototype,Shape.prototype);
Object.setPrototypeOf(L.prototype,Shape.prototype);
Object.setPrototypeOf(J.prototype,Shape.prototype);


// 初始化
var t = new T();
var o = new O();
var i = new I();
var s = new S();
var z = new Z();
var l = new L();
var j = new J();
