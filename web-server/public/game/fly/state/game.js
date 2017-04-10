var GameState = function () {
    this.player;
    this.aliens;
    this.bullets;
    this.bulletTime = 0;
    this.cursors;
    this.fireButton;
    this.explosions;
    this.starfield;
    this.score = 0;
    this.scoreString = '';
    this.scoreText;
    this.lives;
    this.enemyBullet;
    this.firingTimer = 0;
    this.stateText;
    this.livingEnemies = [];
    this.joystick;

};

GameState.prototype = {
    init: function () {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignVertically = true;
        game.scale.pageAlignHorizontally = true;
        game.scale.maxWidth = maxWidth;
        game.scale.maxHeight = maxHeight;
        //game.scale.startFullScreen(false);
    },

    preload: function () {
        var preloadSprite = game.add.sprite((game.width - 220) / 2, game.height / 2, 'loading');
        game.load.setPreloadSprite(preloadSprite);
        game.load.image('bullet', '/assets/fly/bullet.png');                         //飞机子弹
        game.load.image('this.enemyBullet', '/assets/fly/enemy-bullet.png');              //怪物子弹
        game.load.spritesheet('invader', '/assets/fly/invader32x32x4.png', 32, 32);  //怪物
        game.load.image('ship', '/assets/fly/thrust.png');                           //飞机
        game.load.image('bg', '/assets/fly/starfield.png');                         //背景图
        game.load.spritesheet('kaboom', '/assets/fly/explode.png', 128, 128);        //爆炸动画效果
        game.load.atlas('gamepad', '/assets/generic-joystick/generic-joystick.png', '/assets/generic-joystick/generic-joystick.json');

    },

    create: function () {
        //开启物理引擎
        game.physics.startSystem(Phaser.Physics.ARCADE);

        //创建背景图
        bg = game.add.tileSprite(0, 0, game.width, game.height, 'bg');
        bg.autoScroll(0, 100);

        //创建子弹30个
        this.bullets = game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(30, 'bullet');
        this.bullets.setAll('anchor.x', 0.5);
        this.bullets.setAll('anchor.y', 1);
        this.bullets.setAll('outOfBoundsKill', true);
        this.bullets.setAll('checkWorldBounds', true);

        //创建子弹
        this.enemyBullets = game.add.group();
        this.enemyBullets.enableBody = true;
        this.enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemyBullets.createMultiple(10, 'this.enemyBullet');
        this.enemyBullets.setAll('anchor.x', 0.5);
        this.enemyBullets.setAll('anchor.y', 1);
        //检测边界，超出摧毁
        this.enemyBullets.setAll('outOfBoundsKill', true);
        this.enemyBullets.setAll('checkWorldBounds', true);

        // 飞机
        this.player = game.add.sprite(game.width / 2, game.height / 2 + 150, 'ship');
        //设置纹理
        this.player.texture.baseTexture.scaleMode = PIXI.NEAREST;
        //放大两倍
        this.player.scale.set(2);
        this.player.lastAngle = -90;
        this.player.anchor.setTo(0.5, 0.5);
        game.physics.enable(this.player, Phaser.Physics.ARCADE);

        //放置控制杆
        var gamepad = game.plugins.add(Phaser.Plugin.VirtualGamepad);
        this.joystick = gamepad.addJoystick(150, game.height - 150, 1, 'gamepad');
        this.fireButton = gamepad.addButton(game.width - 150, game.height - 150, 1.0, 'gamepad');

        //怪物
        this.aliens = game.add.group();
        this.aliens.enableBody = true;
        this.aliens.physicsBodyType = Phaser.Physics.ARCADE;
        this.createAliens();

        //分数字符
        this.scoreString = '分数 : ';
        this.scoreText = game.add.text(10, 10, this.scoreString + this.score, {font: '34px Arial', fill: '#fff'});

        //生命字符
        this.lives = game.add.group();
        game.add.text(game.world.width - 100, 10, '生命 : ', {font: '34px Arial', fill: '#fff'});

        //start字符
        this.stateText = game.add.text(game.world.centerX, game.world.centerY, ' ', {font: '84px Arial', fill: '#fff'});
        this.stateText.anchor.setTo(0.5, 0.5);
        //不可见
        this.stateText.visible = false;
        //生命值
        for (var i = 0; i < 3; i++) {
            var ship = this.lives.create(game.world.width - 100 + (30 * i), 60, 'ship');
            ship.anchor.setTo(0.5, 0.5);
            ship.angle = 90;
            ship.alpha = 0.4;
        }

        //爆炸
        this.explosions = game.add.group();
        this.explosions.createMultiple(30, 'kaboom');
        this.explosions.forEach(setupInvader, this);

        //键盘控制
        //this.cursors = game.input.keyboard.createCursorKeys();
        //空格键添加
        //this.fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    },

    update: function () {
        if (this.player.alive) {
            this.player.body.velocity.setTo(0, 0);
            //手机屏幕操作
            if (this.joystick.properties.inUse) {
                this.player.angle = this.joystick.properties.angle;
                this.player.lastAngle = this.player.angle;
            } else {
                this.player.angle = this.player.lastAngle;
            }
            this.player.body.velocity.x = 4 * this.joystick.properties.x;
            this.player.body.velocity.y = 4 * this.joystick.properties.y;

            if (this.fireButton.isDown) {
                this.fireBullet();
            }
            /*电脑键盘操作
             //上下左右键监听
             if (this.cursors.left.isDown) {
             this.player.body.velocity.x = -200;
             }
             else if (this.cursors.right.isDown) {
             this.player.body.velocity.x = 200;
             }
             if (this.cursors.up.isDown) {
             this.player.body.velocity.y = -200;
             }
             else if (this.cursors.down.isDown) {
             this.player.body.velocity.y = 200;
             }

             //开火
             if (this.fireButton.isDown) {
             fireBullet();
             }
             */
            //敌人开火
            if (game.time.now > this.firingTimer) {
                this.enemyFires();
            }

            //子弹和外星人碰撞回调
            game.physics.arcade.overlap(this.player, this.aliens, this.HitsHandler, null, this);
            game.physics.arcade.overlap(this.bullets, this.aliens, this.collisionHandler, null, this);
            //子弹和飞机碰撞回调
            game.physics.arcade.overlap(this.enemyBullets, this.player, this.enemyHitsPlayer, null, this);
        }
    },

    render: function () {

        // for (var i = 0; i < this.aliens.length; i++)
        // {
        //     game.debug.body(this.aliens.children[i]);
        // }

    },
    createAliens: function () { //创建怪物
        //40个排列
        for (var y = 0; y < 4; y++) {
            for (var x = 0; x < 10; x++) {
                var alien = this.aliens.create(x * 48, y * 50, 'invader');
                alien.anchor.setTo(0.5, 0.5);
                alien.animations.add('fly', [0, 1, 2, 3], 20, true);
                alien.play('fly');
                alien.body.moves = false;
            }
        }

        this.aliens.x = 100;
        this.aliens.y = 50;

        //this.aliens group线性动画
        var tween = game.add.tween(this.aliens).to({x: 200}, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

        //loop事件激活回调
        tween.onLoop.add(this.descend, this);
    },

    collisionHandler: function (bullet, alien) {

        //当子弹撞击外星人，删除子弹和外星人
        bullet.kill();
        alien.kill();

        //增加分数
        this.score += 20;
        this.scoreText.text = this.scoreString + this.score;

        //加入爆照动画
        var explosion = this.explosions.getFirstExists(false);
        explosion.reset(alien.body.x, alien.body.y);
        explosion.play('kaboom', 30, false, true);

        //检测有几个没被删除，如果都被删除，增加分数，删除所有子弹，显示胜利字符串
        if (this.aliens.countLiving() == 0)
        {
            this.score += 1000;
            this.scoreText.text = this.scoreString + this.score;

            this.enemyBullets.callAll('kill',this);
            this.stateText.text = "重新开始 \n    click";
            this.stateText.visible = true;

            //点击重新开始时间
            game.input.onTap.addOnce(this.restart,this);
        }

    },

    HitsHandler: function (player, aliens) {
        //当飞机撞击外星人，删除飞机和外星人
        aliens.kill();
        //干掉最外面的生命值
        live = this.lives.getFirstAlive();
        if (live) { //如果还有命
            live.kill();
        } else {
            player.kill();
        }
        //加入爆照动画
        var explosion = this.explosions.getFirstExists(false);
        explosion.reset(aliens.body.x, aliens.body.y);
        explosion.play('kaboom', 30, false, true);

        //增加分数
        this.score += 20;
        this.scoreText.text = this.scoreString + this.score;

        //如果挂掉了
        if (this.lives.countLiving() < 1) {
            this.enemyBullets.callAll('kill');

            this.stateText.text = "重新开始 \n    click";
            this.stateText.visible = true;

            //重新开始点击监听
            game.input.onTap.addOnce(this.restart, this);
        }

    },
    enemyHitsPlayer: function (player,bullet) {

        bullet.kill();
        //干掉最外面的生命值
        live = this.lives.getFirstAlive();

        if (live)
        {
            live.kill();
        }

        //爆炸动画
        var explosion = this.explosions.getFirstExists(false);
        explosion.reset(player.body.x, player.body.y);
        explosion.play('kaboom', 30, false, true);

        //如果挂掉了
        if (this.lives.countLiving() < 1) {
            player.kill();
            this.enemyBullets.callAll('kill');

            this.stateText.text=" GAME OVER \n Click to restart";
            this.stateText.visible = true;

            //重新开始点击监听
            game.input.onTap.addOnce(this.restart,this);
        }

    },

    enemyFires: function () {

        //从弹库中取出子弹
        this.enemyBullet = this.enemyBullets.getFirstExists(false);
        //存活敌人数组重置为0
        this.livingEnemies.length=0;
        var livingEnemies = this.livingEnemies;
        this.aliens.forEachAlive(function(alien){
            //把存活敌人放进数组
            livingEnemies.push(alien);
        });
        this.livingEnemies = livingEnemies;

        if (this.enemyBullet && this.livingEnemies.length > 0)
        {

            var random=game.rnd.integerInRange(0,this.livingEnemies.length-1);

            //随机一个敌人并进行攻击
            var shooter=this.livingEnemies[random];
            this.enemyBullet.reset(shooter.body.x, shooter.body.y);

            game.physics.arcade.moveToObject(this.enemyBullet,this.player,120);
            this.firingTimer = game.time.now + 2000;
        }

    },

    fireBullet: function() {
        if (game.time.now > this.bulletTime)
        {
            //从弹库中取出子弹
            bullet = this.bullets.getFirstExists(false);

            if (bullet)
            {

                var tany = Math.sin(((this.player.angle)/360) * 2 * Math.PI);
                var tanx = Math.cos(((this.player.angle)/360) * 2 * Math.PI);
                var angle = bullet.angle;
                //设置坐标
                bullet.reset(this.player.x + tanx * 8, this.player.y + tany * 8);
                //设置速度
                bullet.angle = this.player.angle + 90;

                bullet.body.velocity.y = tany * 400;
                bullet.body.velocity.x = tanx * 400;
                //攻击间隔
                this.bulletTime = game.time.now + 200;
            }
        }

    },

    restart: function() {
        //重置生命
        this.lives.callAll('revive');
        //重新生成敌人
        this.aliens.removeAll();
        this.createAliens();

        //重置飞机
        this.player.revive();
        this.player.reset(game.width/2, game.height/2 + 150);
        //隐藏字符串
        this.stateText.visible = false;

    },
    descend: function() {
        this.aliens.y += 10;

    },

}

function setupInvader (invader) {

    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');

}

function resetBullet (bullet) {
    //干掉子弹
    bullet.kill();

}

