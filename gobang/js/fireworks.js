;
var fireworks = function(canvas) {

  var particles = [], // 粒子
      rockets = [], // 火箭 ==> 爆炸前的烟花束
      MAX_PARTICLES = 400, // 最大粒子数
      SCREEN_WIDTH = document.body.clientWidth || document.documentElement.clientWidth, 
      SCREEN_HEIGHT = document.body.clientHeight || document.documentElement.clientHeight;

 

  // create canvas and get the context
  // var canvas = document.createElement('canvas');
  // canvas.id = "fireworksField";
  // var canvas = document.getElementById('fireworksField');
  
  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;

  var context = canvas.getContext('2d');

  // The Particles Object
  function Particle(pos) {
    //粒子位置信息
    this.pos = {
        x: pos ? pos.x : 0,
        y: pos ? pos.y : 0
    };
    // 
    this.vel = {
        x: 0,
        y: 0
    };
    
    this.shrink = 0.97;// 收缩度
    this.size = 2;

    this.resistance = 1;// 阻力
    this.gravity = 0; // 重力

    this.flick = false; // 弹

    this.alpha = 1; // 透明度
    this.fade = 0; // 褪色
    this.color = 0; //颜色
  }

  Particle.prototype.update = function() {
    // apply resistance
    this.vel.x *= this.resistance;
    this.vel.y *= this.resistance;

    // gravity down
    this.vel.y += this.gravity;

    // update position based on speed
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    // shrink
    this.size *= this.shrink;

    // fade out
    this.alpha -= this.fade;
  };

  Particle.prototype.render = function(c) {
    if (!this.exists()) {
        return;
    }

    c.save();

    // 将新图像绘制在已有图像上 ==> lighter 新旧都显示
    c.globalCompositeOperation = 'lighter';

    var x = this.pos.x,
        y = this.pos.y,
        r = this.size / 2;

    var gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
    gradient.addColorStop(0.1, "rgba(255,255,255," + this.alpha + ")");
    gradient.addColorStop(0.8, "hsla(" + this.color + ", 100%, 50%, " + this.alpha + ")");
    gradient.addColorStop(1, "hsla(" + this.color + ", 100%, 50%, 0.1)");

    c.fillStyle = gradient;

    c.beginPath();
    c.arc(this.pos.x, this.pos.y, this.flick ? Math.random() * this.size : this.size, 0, Math.PI * 2, true);
    c.closePath();
    c.fill();

    c.restore();
  };

  Particle.prototype.exists = function() {
    return this.alpha >= 0.1 && this.size >= 1;
  };

  // The Rocket Object
  function Rocket(x) {
    Particle.apply(this, [{
        x: x,
        y: SCREEN_HEIGHT}]);

    this.explosionColor = 0;
  }

  Rocket.prototype = new Particle();
  Rocket.prototype.constructor = Rocket;

  // 爆炸效果
  Rocket.prototype.explode = function() {
    // 生成爆炸粒子数
    var count = Math.random() * 10 + 80;

    for (var i = 0; i < count; i++) {
      var particle = new Particle(this.pos);
      var angle = Math.random() * Math.PI * 2;

      // emulate 3D effect by using cosine and put more particles in the middle
      var speed = Math.cos(Math.random() * Math.PI / 2) * 15;

      particle.vel.x = Math.cos(angle) * speed;
      particle.vel.y = Math.sin(angle) * speed;

      particle.size = 10;

      particle.gravity = 0.2;
      particle.resistance = 0.92;
      particle.shrink = Math.random() * 0.05 + 0.93;

      particle.flick = true;
      particle.color = this.explosionColor;

      particles.push(particle);
    }
  };

  Rocket.prototype.render = function(c) {
    if (!this.exists()) {
      return;
    }

    c.save();

    c.globalCompositeOperation = 'lighter';

    var x = this.pos.x,
        y = this.pos.y,
        r = this.size / 2;

    var gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
        gradient.addColorStop(0.1, "rgba(255, 255, 255 ," + this.alpha + ")");
        gradient.addColorStop(1, "rgba(0, 0, 0, " + this.alpha + ")");

    c.fillStyle = gradient;

    c.beginPath();
    c.arc(this.pos.x, this.pos.y, this.flick ? Math.random() * this.size / 2 + this.size / 2 : this.size, 0, Math.PI * 2, true);
    c.closePath();
    c.fill();

    c.restore();
  };

  var loop = function() {
    // console.log("on loop");
    // js控制 响应式 ==> 每次循环都判断窗口宽高
    if (SCREEN_WIDTH != window.innerWidth) {
      canvas.width = SCREEN_WIDTH = window.innerWidth;
    }
    if (SCREEN_HEIGHT != window.innerHeight) {
      canvas.height = SCREEN_HEIGHT = window.innerHeight;
    }

    // clear canvas
    context.fillStyle = "rgba(0, 0, 0, 0.05)";
    context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    var existingRockets = [];

    for (var i = 0; i < rockets.length; i++) {
      // update and render
      rockets[i].update();
      rockets[i].render(context);

      // calculate distance with Pythagoras
      var distance = Math.sqrt(Math.pow(SCREEN_WIDTH - rockets[i].pos.x, 2) + Math.pow(SCREEN_HEIGHT - rockets[i].pos.y, 2));

      // random chance of 1% if rockets is above the middle
      var randomChance = rockets[i].pos.y < (SCREEN_HEIGHT * 2 / 3) ? (Math.random() * 100 <= 1) : false;

      /* Explosion rules
          - 80% of screen
          - going down
          - close to the mouse
          - 1% chance of random explosion
      */
      if (rockets[i].pos.y < SCREEN_HEIGHT / 5 || rockets[i].vel.y >= 0 || distance < 50 || randomChance) {
        rockets[i].explode();
      } else {
        existingRockets.push(rockets[i]);
      }
    }

    rockets = existingRockets;

    var existingParticles = [];

    for (i = 0; i < particles.length; i++) {
      particles[i].update();

      // render and save particles that can be rendered
      if (particles[i].exists()) {
        particles[i].render(context);
        existingParticles.push(particles[i]);
      }
    }

    // update array with existing particles - old particles should be garbage collected（垃圾回收）
    particles = existingParticles;

    while (particles.length > MAX_PARTICLES) {
      particles.shift();
    }
  };

    var launchFrom = function(x) {
      if (rockets.length < 10) {
        var rocket = new Rocket(x);
        rocket.explosionColor = Math.floor(Math.random() * 360 / 10) * 10;
        rocket.vel.y = Math.random() * -3 - 4;
        rocket.vel.x = Math.random() * 6 - 3;
        rocket.size = 8;
        rocket.shrink = 0.999;
        rocket.gravity = 0.01;
        rockets.push(rocket);
      }
    };

    var launch = function() {
      launchFrom(SCREEN_WIDTH / 2);
    };

    // 启动循环
    setInterval(launch, 500);
    setInterval(loop, 1000 / 100);
    
  };


  // var stop = fireworks();