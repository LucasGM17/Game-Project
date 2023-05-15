const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

addEventListener('resize', _ => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    healthBar.x = canvas.width / 2 - healthBar.width / 2;
});

const game = {
    isPlayerDead: false,
    score: 0
}

const defaultValues = {
    player: {
        projectile: {
            damage: 1,
            health: 1,
            radius: 5,
            speed: 3,
            color: 'gray',
        },
        damage: 0,
        health: 200,
        radius: 30,
        speed: 3,
        color: 'pink',
    },
    zombie: {
        damage: 1,
        health: 3,
        radius: 30,
        speed: 1,
        color: 'green',
        points: 1
    },
    mini: {
        damage: 1,
        health: 1,
        radius: 15,
        speed: 3,
        color: 'lightgreen',
        points: 2
    },
    soldier: {
        projectile: {
            damage: 10,
            health: 1,
            radius: 5,
            speed: 5,
            color: 'blue'
        },
        damage: 1,
        health: 5,
        radius: 20,
        speed: 1,
        color: 'darkgreen',
        points: 5
    },
    tank: {
        damage: 3,
        health: 50,
        radius: 90,
        speed: 0.5,
        color: 'purple',
        points: 25
    }
}

class GameObject {
    constructor(x, y, radius, color, speed, health, damage) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.health = health;
        this.damage = damage;
    }
    collidesWith(other) {
        const distance = Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
        return distance < this.radius + other.radius;
    }
    draw() {
        c.beginPath();
        c.fillStyle = this.color;
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fill();
        c.stroke();
    }
    update() {
        this.draw();
    }
}

class Player extends GameObject { };

class Projectile extends GameObject {
    constructor(x, y, radius, color, speed, health, damage, velocity) {
        super(x, y, radius, color, speed, health, damage);
        this.velocity = velocity;
    }
    update() {
        super.update();
        this.x += this.velocity.x * this.speed;
        this.y += this.velocity.y * this.speed;
    }
};

class Enemy extends GameObject {
    constructor(x, y, radius, color, speed, health, damage, points, velocity) {
        super(x, y, radius, color, speed, health, damage);
        this.velocity = velocity;
        this.points = points;
    }
    update() {
        super.update();
        this.x += this.velocity.x * this.speed;
        this.y += this.velocity.y * this.speed;
    }
};

class Zombie extends Enemy { };

class Mini extends Enemy { };

class Soldier extends Enemy { };

class Tank extends Enemy { };

class Healthbar {
    constructor(x, y, width, height, maxWidth, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.maxWidth = maxWidth;
        this.color = color;
    }
    draw() {
        c.save();
        c.beginPath();
        c.rect(this.x, this.y, this.maxWidth, this.height);
        c.lineWidth = 5; // specify the line width here
        c.strokeStyle = 'black'; // specify the line color here
        c.stroke(); // draw the rectangle outline
        c.fillStyle = this.color;
        c.fillRect(this.x, this.y, this.width, this.height);
        c.restore();
    }
    update() {
        this.draw(); 
        if(this.width <= 0) {
            this.width = 0;
            return;
        }
        this.width = player.health;
    }
}

class Text {
    constructor(x, y, text, fontSize, fontFamily, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
        this.color = color;
    }
    draw() {
        c.font = `${this.fontSize} ${this.fontFamily}`;
        c.fillStyle = this.color;
        c.textAlign = "center";
        c.fillText(this.text, this.x, this.y); 
    }
    update() {
        this.draw();
    }
}

let player;
let enemies = [];
let soldiers = [];
let playerProjectiles = [];
let soldierProjectiles = [];
let healthBar;
let scoreText;

init();
function init() {
    spawnPlayer();
    spawnHealthBar();
    spawnText();
}

function updates() {
    player.update();
    healthBar.update();
    scoreText.update();
    scoreText.text = `Score: ${game.score}`;
}

function spawnPlayer() {
    const x = canvas.width/2;
    const y = canvas.height/2;

    player = new Player(x, y, defaultValues.player.radius, defaultValues.player.color, defaultValues.player.speed, defaultValues.player.health);
}

function spawnHealthBar() {
    const x = canvas.width / 2 - player.health / 2;
    const y = 800;
    const health = player.health;
    const height = 20;
    const maxHealth = player.health;
    const color = 'green'
    healthBar = new Healthbar(x, y, health, height, maxHealth, color);
}

function spawnText() {
    scoreText = new Text(canvas.width / 2, 100,`Score: ${game.score}`, '64px', 'Comic Sans MS', 'black');
}

const keysPressed = {};

function keyDownHandler() {
    addEventListener('keydown', e => {
        keysPressed[e.key] = true;
    })
}

function keyUpHandler() {
    addEventListener('keyup', e => {
        keysPressed[e.key] = false;
    })
}

function movePlayer() {
    if(keysPressed["w"] === true || keysPressed["ArrowUp"] === true) {
        player.y -= player.speed;
    }
    else if(keysPressed["s"] === true || keysPressed["ArrowDown"] === true) {
        player.y += player.speed;
    }
    if(keysPressed["a"] === true || keysPressed["ArrowLeft"] === true) {
        player.x -= player.speed;
    }
    else if(keysPressed["d"] === true || keysPressed["ArrowRight"] === true) {
        player.x += player.speed;
    }
}

keyDownHandler();
keyUpHandler();

function createEnemies() {
    let delay = 3; //seconds
    setInterval(_ => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const spawnRate = Math.random();
        let newEnemy;
            switch(true) {
                case spawnRate <= .15:
                    newEnemy = new Mini(x, y, defaultValues.mini.radius, defaultValues.mini.color, defaultValues.mini.speed, defaultValues.mini.health, defaultValues.mini.damage,defaultValues.mini.points, {x: 0, y: 0});
                break;
                case spawnRate <= .20:
                    newEnemy = new Soldier(x, y, defaultValues.soldier.radius, defaultValues.soldier.color, defaultValues.soldier.speed, defaultValues.soldier.health, defaultValues.soldier.damage,defaultValues.soldier.points, {x: 0, y: 0});
                break;
                case spawnRate <= 0.21:
                    newEnemy = new Tank(x, y, defaultValues.tank.radius, defaultValues.tank.color, defaultValues.tank.speed, defaultValues.tank.health, defaultValues.tank.damage,defaultValues.tank.points, {x: 0, y: 0});
                break;
                default:
                    newEnemy = new Zombie(x, y, defaultValues.zombie.radius, defaultValues.zombie.color, defaultValues.zombie.speed, defaultValues.zombie.health, defaultValues.zombie.damage,
                    defaultValues.zombie.points, {x: 0, y: 0});
                break;
            }
        
        while (enemies.some(enemy => enemy.collidesWith(newEnemy)) && enemies.length < 20 && !newEnemy.collidesWith(player)) {
            // change the enemies.length conditional later
            newEnemy.x = Math.random() * canvas.width / 2;
            newEnemy.y = Math.random() * canvas.width / 2;
        }
        enemies.push(newEnemy);
        // console.log(enemies)
    }, delay * 1000);
}

function spawnEnemies() {
    enemies.forEach(enemy => {
        enemy.velocity = getAngle(enemy, player);
        enemy.update();
    })
}

function spawnProjectiles() {
    playerProjectiles.forEach(projectile => {
        projectile.update();
    })
    soldierProjectiles.forEach(projectile => {
        projectile.update();
    })
}

const mouse = {
    x: null,
    y: null,
    down: false
}

function getAngle(obj1, obj2) {
    const angle = Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);

    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }
    return velocity;
}

function isColliding(obj1, obj2) {
    const radii = obj2.radius + obj1.radius;
    const dx = obj2.x - obj1.x;
    const dy = obj2.y - obj1.y;
    return Math.sqrt(dx**2 + dy**2) < radii;
}

// function preventEnemyOverlap() {
//     for(let i = 0; i < enemies.length; i++) {
//         for(let j = i + 1; j < enemies.length; j++) {
//             const enemy1 = enemies[i];
//             const enemy2 = enemies[j];
//             const distance = Math.max(enemy1.radius, enemy2.radius);

//             if(isColliding(enemy1, enemy2) && enemy1 !== enemy2) {

//             }
//         }
//     }
// }

function preventEnemyOverlap() {
    for (let i = 0; i < enemies.length; i++) {
      for (let j = i + 1; j < enemies.length; j++) {
        const enemy1 = enemies[i];
        const enemy2 = enemies[j];
        if (isColliding(enemy1, enemy2)) {
          const dx = enemy2.x - enemy1.x;
          const dy = enemy2.y - enemy1.y;
          const angle = Math.atan2(dy, dx);
          const overlap = enemy1.radius + enemy2.radius - Math.sqrt(dx * dx + dy * dy);
          const halfOverlap = overlap / 2;
          enemy1.x -= halfOverlap * Math.cos(angle);
          enemy1.y -= halfOverlap * Math.sin(angle);
          enemy2.x += halfOverlap * Math.cos(angle);
          enemy2.y += halfOverlap * Math.sin(angle);
          const dotProd1 = enemy1.vx * Math.cos(angle) + enemy1.vy * Math.sin(angle);
          const dotProd2 = enemy2.vx * Math.cos(angle) + enemy2.vy * Math.sin(angle);
          if (dotProd1 > 0 || dotProd2 < 0) {
            // Enemies are moving away from each other or not moving towards each other, do nothing
          } else {
            // Enemies are moving towards each other, adjust their velocities
            const v1x = (dotProd1 * Math.cos(angle)) - (dotProd2 * Math.sin(angle));
            const v1y = (dotProd1 * Math.sin(angle)) + (dotProd2 * Math.cos(angle));
            const v2x = (dotProd2 * Math.cos(angle)) - (dotProd1 * Math.sin(angle));
            const v2y = (dotProd2 * Math.sin(angle)) + (dotProd1 * Math.cos(angle));
            enemy1.vx = v1x;
            enemy1.vy = v1y;
            enemy2.vx = v2x;
            enemy2.vy = v2y;
          }
        }
      }
    }
  }


addEventListener('mousedown', e => {
    mouse.down = true;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    playerShoot();
});

canvas.addEventListener('mouseup', e => {
    mouse.down = false;
});

// canvas.addEventListener('mousemove', e => {
//     if(mouse.down) {
//         mouse.x = e.clientY;
//         mouse.y = e.clientY;
//     }
// });

function playerShoot() {
        const x = player.x;
        const y = player.y;
        const projectile = new Projectile(x, y, defaultValues.player.projectile.radius, defaultValues.player.projectile.color, defaultValues.player.projectile.speed, defaultValues.player.projectile.health,defaultValues.player.projectile.damage, getAngle(player, mouse));
        playerProjectiles.push(projectile);
}

function soldierShoot() {
    soldiers.forEach(soldier => {
        const x = soldier.x;
        const y = soldier.y;

        const projectile = new Projectile(x, y, defaultValues.soldier.projectile.radius, defaultValues.soldier.projectile.color, defaultValues.soldier.projectile.speed, defaultValues.soldier.projectile.health,defaultValues.soldier.projectile.damage, getAngle(soldier, player));
        soldierProjectiles.push(projectile)
    });
}

const soldierCooldown = 1000;

setInterval(soldierShoot, soldierCooldown);

// fix hold down to shoot later

function damageEnemies() {
    for(let i = 0; i < playerProjectiles.length; i++) {
        const projectile = playerProjectiles[i];
        for(let j = 0; j < enemies.length; j++) {

            const enemy = enemies[j];
            if(isColliding(projectile, enemy)) {
                
                enemy.health -= projectile.damage;
                projectile.health--;
                if(projectile.health <= 0) {
                    playerProjectiles.splice(i, 1);
                }
                if(enemy.health <= 0) {
                    game.score += enemy.points;
                    enemies.splice(j, 1);
                }
            }
        }
    }
}

function damagePlayer() {
    enemies.forEach(enemy => {
        if(isColliding(enemy, player)) {
            player.health -= enemy.damage;
        }
    });
}

function soldierProjectilesDamagePlayer() {
    for(let i = 0; i < soldierProjectiles.length; i++) {
        const projectile = soldierProjectiles[i];
        if(isColliding(projectile, player)) {
            player.health -= projectile.damage;
            projectile.health--;
            if(projectile.health <= 0) {
                soldierProjectiles.splice(i, 1);
            }
        }
    }
}

function removeProjectilesOutOfBounds() {
    for(let i = 0; i < playerProjectiles.length; i++) {
        const projectile = playerProjectiles[i];
        if((projectile.x + projectile.radius > canvas.width) || (projectile.x + projectile.radius < 0) || (projectile.y + projectile.radius > canvas.height) || (projectile.y + projectile.radius < 0)) {
            playerProjectiles.splice(i, 1);
        }
    }
    for(let i = 0; i < soldierProjectiles.length; i++) {
        const projectile = soldierProjectiles[i];
        if((projectile.x + projectile.radius > canvas.width) || (projectile.x + projectile.radius < 0) || (projectile.y + projectile.radius > canvas.height) || (projectile.y + projectile.radius < 0)) {
            soldierProjectiles.splice(i, 1);
        }
    }
}
function extractEnemyClasses() {
    soldiers = enemies.filter(enemy => enemy.radius === defaultValues.soldier.radius);
    // change this if you change the radius
}

function killPlayer() {
    if(player.health <= 0) game.isPlayerDead = true;
}

createEnemies();

function animate() {
    c.clearRect(0, 0, canvas.width, canvas.height);

    // restart game;
    if(game.isPlayerDead) {
        isPlayerDead = false;
        location.reload();
        return;
    }
    updates();
    movePlayer();
    spawnEnemies();
    spawnProjectiles();
    preventEnemyOverlap()
    damageEnemies();
    damagePlayer();
    killPlayer();
    soldierProjectilesDamagePlayer();
    extractEnemyClasses();
    removeProjectilesOutOfBounds();
    requestAnimationFrame(animate);
}

animate();