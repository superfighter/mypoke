const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 1024;
canvas.height = 576;

const collisionsMap = []
for (let i = 0; i< collisions.length; i+=70) {
    collisionsMap.push(collisions.slice(i, 70 + i));
}

const battlesMap = []
for (let i = 0; i< battles.length; i+=70) {
    battlesMap.push(battles.slice(i, 70 + i));
}

ctx.fillStyle = 'white'
ctx.fillRect(0, 0, canvas.width, canvas.height);

const STEP = 1;
// 是否是因为和NPC对话导致了失去掌控，停止执行具体动画事件
let loseControl = false;

const image = new Image()
image.src = './img/map1.png'

const playerImage = new Image()
playerImage.src = './img/playerDown.png'

const playerUpImage = new Image()
playerUpImage.src = './img/pokemanUp.png'

const playerDownImage = new Image()
playerDownImage.src = './img/playerDown.png'

const playerLeftImage = new Image()
playerLeftImage.src = './img/pokemanLeft.png'

const playerRightImage = new Image()
playerRightImage.src = './img/pokemanRight.png'

const npc1 = new Image()
npc1.src = './img/02msk.png'

// image.onload = () => {
//     ctx.drawImage(image, -20, -10)
//     ctx.drawImage(playerImage, 
//         0,
//         0,
//         playerImage.width / 4,
//         playerImage.height,
//         212 - (playerImage.width / 4) / 2, 
//         canvas.height / 2 + 40,
//         playerImage.width / 4,
//         playerImage.height)
// }
const offset = {
    x: 16,
    y: -110
}

class Boundary {
    static width = 24 // 这里要乘以地图缩放倍数
    static height = 24
    constructor({
        position,
    }) {
        this.position = position;
        this.width = 24;
        this.height = 24;
    }

    draw() {
        ctx.fillStyle = 'rgba(0, 0 , 0, 0.5)'
        ctx.strokeStyle = 'yellow'
        ctx.fillRect(
            this.position.x,
            this.position.y,
            this.width,
            this.height
        )
        
        // 边界
        // ctx.strokeRect(
        //     this.position.x,
        //     this.position.y,
        //     this.width,
        //     this.height
        // )
    }
}
// 墙边界
const boundaries = []
const battlesZones = []
// npc边界
const npcBoundaries = []

collisionsMap.forEach(
    (row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025) {
            boundaries.push( 
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
        } else if (symbol === 518) {
            if (symbol === 518) {
                npcBoundaries.push( 
                    new Boundary({
                        position: {
                            x: j * Boundary.width + offset.x,
                            y: i * Boundary.height + offset.y
                        }
                    })
                )
            }
        }
    })
});

battlesMap.forEach(
    (row, i) => { 
    row.forEach((symbol, j) => {
        if (symbol !== 0) {
            battlesZones.push( 
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
        }
    })
});

class Dialog {
    constructor({
        entity,
        position
    }) {
        this.entity = entity
        if (entity && entity.position) {
            this.entity = entity
            this.position = entity.position
        } else if (position) {
            this.position = position
        } else {
            this.position = {
                x: 100,
                y: 100
            }
        }
        
    }
    draw(type) {
        switch (type) {
            case '!':
                ctx.save()
                ctx.fillStyle = "white"
                ctx.fillRect(this.position.x + this.entity.width / 5 , this.position.y - 17, 14, 14)
                ctx.restore()
                ctx.save()
                ctx.font = 'bold 12px MicrosoftYAHEI'
                ctx.textAlign = 'center'
                ctx.fillText('!', this.position.x + this.entity.width / 5 + 7, this.position.y - 6)
                ctx.restore()
                break;
        }
        
    }
}

class Sprite {
        constructor({
        position, velocity,
        image, frames = {max: 1},
        scale = 1,
        holds = 10,
        sprites,
        animate = false,
    }) {
        this.position = position
        this.image = image
        this.frames = frames
        this.scale = scale
        this.holds = holds
        this.opacity = 1
        this.image.onload = () => {
            this.width = this.image.width / this.frames.max * this.scale
            this.height = this.image.height * this.scale
        }
        this.animate = animate
        this.sprites = sprites
        this.frames = {...frames, val: 0, elapsed: 0}
    }

    draw() {
        ctx.save()
        ctx.globalAlpha = this.opacity
        // ctx.drawImage(this.image, this.position.x, this.position.y)
        ctx.drawImage(this.image,
            this.frames.val * this.image.width / this.frames.max,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max * this.scale,
            this.image.height * this.scale
        )
        ctx.restore()
        
        ctx.strokeStyle = 'yellow'

        // 边界
        // ctx.strokeRect(
        //     this.position.x,
        //     this.position.y,
        //     this.image.width / this.frames.max * this.scale,
        //     this.image.height * this.scale
        // )

        if (!this.animate) return;
        if (this.frames.max > 1) {
            if (this.frames.max > 1) {
                this.frames.elapsed++
            }

            if (this.frames.elapsed % this.holds === 0) {
                if (this.frames.val < this.frames.max - 1) {
                    this.frames.val++
                } else {
                    this.frames.val = 0
                }
                this.frames.elapsed = 0
            }
        }
    }
}

class Monster extends Sprite {
    constructor({
        position, velocity,
        image, frames = {max: 1},
        scale = 1,
        holds = 10,
        sprites,
        animate = false,
        isEnemy = false,
        name,
        attacks
    }) {
        super({
            position,
            image,
            frames,
            scale,
            holds,
            sprites,
            animate
        })
        this.name = name
        this.isEnemy = isEnemy
        this.health = 100
        this.attacks = attacks
        this._rebirthPosition = Object.assign({}, this.position);
    }
    faint() {
        document.querySelector('#J_DIALOG').innerHTML = this.name + ' fainted!';
        toggleDialog(true)

        gsap.to(this.position, {
            y: this.position.y + 40
        })
        gsap.to(this, {
            opacity: 0
        })
        console.log('faint')
    }
    rebirth() {
        gsap.to(this.position, {
            y: this._rebirthPosition.y
        })
        gsap.to(this, {
            opacity: 1
        })
    }
    attack({
        attack, recipient, renderedSprites
    }) {
        if (!attack?.name) return
        const tl = gsap.timeline();

        let moveDist = 20;
        let targetDom = '#J_PLAYRE1_BLOOD_LINE2'
        if (this.isEnemy) {
            moveDist = -20;
            targetDom = '#J_PLAYRE2_BLOOD_LINE2'
        }

        switch (attack.name) {
            case 'Attack2': 
                const fireballImage = new Image();
                fireballImage.src = './img/fireBallRs.png'
                const fireball = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y
                    },
                    image: fireballImage,
                    frames: {
                        max: 6
                    },
                    scale: 4,
                    animate: true
                })

                renderedSprites.push(fireball)

                gsap.to(fireball.position, {
                    x: recipient.position.x + 110,
                    y: recipient.position.y,
                    duration: 0.3,
                    onComplete: () => {
                        gsap.to(fireball, {
                            opacity: 0,
                            duration: 0.02
                        })
                        recipient.health = recipient.health - attack.damage;
                        if (recipient.health <= 0) recipient.health = 0
                        gsap.to(targetDom, {
                            width: recipient.health  + '%',
                            duration: 0.08,
                            onComplete: () => {
                            }
                        })
    
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08,
                            // onComplete() {
                            //     gsap.to(recipient, {
                            //         opacity: 0,
                            //         duration: 0.5
                            //     })
                            // }
                        })
                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.08
                        })

                        document.querySelector('#J_DIALOG').innerHTML = this.name + ' used [' + attack.name + '] '
                        toggleDialog(true)

                        renderedSprites.pop()
                    }
                })
            break;
            case 'Attack1':
                tl.to(this.position, {
                    x: this.position.x - moveDist
                })
                    .to(this.position, {
                        x: this.position.x + moveDist * 2,
                        duration: 0.1,
                        onComplete: () => {
                            recipient.health = recipient.health - attack.damage;
                            if (recipient.health <= 0) recipient.health = 0
                            gsap.to(targetDom, {
                                width: recipient.health  + '%',
                                duration: 0.08,
                                onComplete: () => {
                                }
                            })
        
                            gsap.to(recipient.position, {
                                x: recipient.position.x + 10,
                                yoyo: true,
                                repeat: 5,
                                duration: 0.08,
                                // onComplete() {
                                //     gsap.to(recipient, {
                                //         opacity: 0,
                                //         duration: 0.5
                                //     })
                                // }
                            })
                            gsap.to(recipient, {
                                opacity: 0,
                                repeat: 5,
                                yoyo: true,
                                duration: 0.08
                            })

                            document.querySelector('#J_DIALOG').innerHTML = this.name + ' used [' + attack.name + '] '
                            toggleDialog(true)
                        }
                    })
                        .to(this.position, {
                            x: this.position.x - 0,
                            onComplete: () => {
                            }
                        })
            break;
        }
    }
}


const player = new Sprite({
    position: {
        x: Math.floor(canvas.width / 3) - (playerImage.width / 4) / 2 - offset.x + 128,
        y: canvas.height / 2 - 48 - offset.y - 2,
    },
    image: playerUpImage,
    scale: 1.3,
    frames: {
        max: 4
    },
    sprites: {
        up: playerUpImage,
        down: playerImage,
        left: playerLeftImage,
        right: playerRightImage
    }
})
player.dialogMessage = '!'

const npc = new Sprite({
    position: {
        x: Math.floor(canvas.width / 2) - offset.x,
        y: canvas.height / 2 - 30 - offset.y,
    },
    image: npc1,
    scale: 0.08,
    frames: {
        max: 1
    },
    sprites: {}
})


const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image
})


const foregroundImage = new Image()
foregroundImage.src = './img/map1-2.png'

const foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: foregroundImage
})

// const player = new Sprite({
//     position: {
//         x: offset.x,
//         y: offset.y
//     },
//     image: playerImage
// })

const keys = {
    w: {
        pressed: false,
    },
    a: {
        pressed: false,
    },
    s: {
        pressed: false,
    },
    d: {
        pressed: false,
    }
}

const testBoundary = new Boundary ({
    position: {
        x: 330,
        y: 380
    }
})

// 相对静止的元素，跟着移动而移动
const moveAbles = [background, testBoundary, ...boundaries, ...npcBoundaries, foreground, ...battlesZones, npc]

function rectangularCollision({rect1, rect2}) {
    // console.log('x: ', rect1.position.x, rect1.width, rect2.position.x, rect2.width)
    // console.log('y: ', rect1.position.y, rect1.height, rect2.position.y, rect2.height)
    // console.log('1：', rect1.position.x + rect1.width >= rect2.position.x)
    // console.log('2：', rect1.position.x <= rect2.position.x + rect2.width)
    // console.log('3：', rect1.position.y <= rect2.position.y + rect2.height)
    // console.log('4：', rect1.position.y + rect1.height >= rect2.position.y)
    return rect1.position.x + rect1.width >= rect2.position.x
    && rect1.position.x <= rect2.position.x + rect2.width
    && rect1.position.y <= rect2.position.y + rect2.height
    && rect1.position.y + rect1.height >= rect2.position.y
}

class Bat {
    constructor() {
        this.initiated = false;
    }
    init() {
        // 重置战斗初始状态
        battledahuolong.health = 100
        battlebikaqiu.health = 100
        document.querySelector('#J_PLAYRE1_BLOOD_LINE2').style.width = '100%';
        document.querySelector('#J_PLAYRE2_BLOOD_LINE2').style.width = '100%';
        document.querySelector('#J_TOOLBAR #J_DIALOG').style.display = 'none';
        battledahuolong.rebirth();
        battlebikaqiu.rebirth();
        
        this.initiated = true;
        console.log('initiated')
        gsap.to('#J_BAT', {
            opacity: 1,
            yoyo: true,
            repeat: 1,
            duration: 0.4,
            onComplete() {
                gsap.to('#J_BAT', {
                    opacity: 1,
                    duration: 0.4,
                    onComplete() {
                        animationBattle();
                        gsap.to('#J_BAT', {
                            opacity: 0,
                            duration: 0.4,
                            onComplete() {

                            }
                        })
                    }
                })
            }
        })
    }
    destroy() {
        this.initiated = false;
    }
}

const BAT = new Bat();

class Npc {
    constructor() {
        this.initiated = false;
    }
    init() {
        this.initiated = true;
        console.log('Npc initiated')
        gsap.to('#J_BAT', {
            opacity: 1,
            yoyo: true,
            repeat: 1,
            duration: 0.4,
            onComplete() {
                gsap.to('#J_BAT', {
                    opacity: 1,
                    duration: 0.4,
                    onComplete() {
                        animationBattle();
                        gsap.to('#J_BAT', {
                            opacity: 0,
                            duration: 0.4,
                            onComplete() {

                            }
                        })
                    }
                })
            }
        })
    }
    destroy() {
        this.initiated = false;
    }
}

const battleBackgroundImage = new Image()
battleBackgroundImage.src = './img/battle.png';
const battleBackground = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    image: battleBackgroundImage
})


const battlePlayerDragon = new Monster(monsters.Dragon)

const battlebikaqiu = new Monster(monsters.Bikaqiu)

const battledahuolong = new Monster(monsters.Dahuolong)

battlebikaqiu.attacks.forEach(attack => {    
    const button = document.createElement('button')
    button.innerHTML = attack.name
    document.querySelector('#J_TOOLBAR_BTN').appendChild(button)
})

const renderedSprites = []
// const renderedSprites = [battledahuolong, battlebikaqiu]

let battleAnimationId;
function animationBattle() {
    battleAnimationId = window.requestAnimationFrame(animationBattle);
    console.log('battle is begin')
    battleBackground.draw();
    // battlePlayerDragon.draw();
    battledahuolong.draw();
    battlebikaqiu.draw();

    renderedSprites.forEach(sprite => {
        sprite.draw();
    })

    document.querySelector('#J_USERINTERFACE').style.display = 'block'
}

const dialogCanv = new Dialog({
    entity: player
})
const reControl = () => {
    loseControl = false;
    player.animate = true;
    player.dialogMessage = 'tan guo le~';
    // 对话窗口展示
    // debugger
    document.querySelector('#J_USERMESSAGE').classList.remove('show');
    if (animationId) {
        window.cancelAnimationFrame(animationId)
    }
    animate({
        dialog: true
    })
    // NPC2BT();
}
const NPC2BT = () => {
    window.cancelAnimationFrame(animationId);

    console.log('NPC battle is collision')
    BAT.init()
}
const npcCheckBoundary = (player, xStep = 0, yStep = 0) => {
    // 校验npc碰撞检测
    if (!xStep && !yStep) {
        dialogCanv.draw(player.dialogMessage);
    }
    for (let i = 0; i < npcBoundaries.length; i++) {
        const npcBoundary = npcBoundaries[i];
        if (rectangularCollision({
            rect1: player,
            rect2: {
                ...npcBoundary,
                position: {
                    x: npcBoundary.position.x + xStep,
                    y: npcBoundary.position.y + yStep
                }
            }
        })) {
            loseControl = true;
            player.animate = false;
            dialogCanv.draw(player.dialogMessage);
            handleC(player, xStep, yStep, 1);
            break;
        }
    }
}
let animationId;
function animate(opt) {
    console.log('loseControl', loseControl)
    if (loseControl == true) {
        return;
    }
    animationId = window.requestAnimationFrame(animate)
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    background.draw();
    // boundaries.forEach(boundary => {
    //     boundary.draw();
    //     // if (rectangularCollision({
    //     //     rect1: player,
    //     //     rect2: boundary
    //     // })) {
    //     //     console.log('colliding')
    //     // }
    // })
    battlesZones.forEach(battle => {
        battle.draw();
    })
    // testBoundary.draw();
    player.draw();
    foreground.draw();
    npc.draw();
    dialogCanv.draw();

    // ctx.drawImage(playerImage, 
    //     0,
    //     0,
    //     playerImage.width / 4,
    //     playerImage.height,
    //     canvas.width / 1 - (playerImage.width / 4) / 2, 
    //     canvas.height / 2 + 48,
    //     playerImage.width / 4 * 2,
    //     playerImage.height * 2)
    // if (rectangularCollision({rect1:player, rect2:testBoundary})) {
    //         console.log('colliding')
    // }

    player.animate = false;

    if (BAT.initiated) return
    // 收集作战动作
    if (keys.s.pressed || keys.a.pressed || keys.w.pressed || keys.d.pressed) {
        for (let i = 0; i < battlesZones.length; i++) {
            const battleZone = battlesZones[i];
            const overlappingArea = 
                (
                    Math.min(
                        player.position.x + player.width,
                        battleZone.position.x + battleZone.width
                    ) - 
                    Math.max(player.position.x, battleZone.position.x)
                ) *
                (
                    Math.min(
                        player.position.y + player.height, 
                        battleZone.position.y + battleZone.height
                    ) - 
                    Math.max(player.position.y, battleZone.position.y)
                )
            const BATCHECK = 0.1
            if (rectangularCollision({
                rect1: player,
                rect2: battleZone
            }) &&
            overlappingArea > (player.width * player.height / 2) &&
            Math.random() < BATCHECK
        ) {
                window.cancelAnimationFrame(animationId);

                console.log('battle is collision')
                BAT.init()
                break;
            }
        }

    }

    if (keys.s.pressed && lastKey == 's') {
        player.animate = true;
        player.image = player.sprites.down;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (rectangularCollision({
                rect1: player,
                rect2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x,
                        y: boundary.position.y - STEP
                    }
                }
            })) {
                player.animate = false;
                break;
            }
        }

        // 校验npc碰撞检测
        npcCheckBoundary(player, 0, -STEP);
        
        //     if (rectangularCollision({
        //         rect1: {...player,
        //             position: {
        //                 x: player.position.x,
        //                 y: player.position.y
        //             }
        //         },
        //         rect2: {...testBoundary, 
        //             position: {
        //                 x: testBoundary.position.x,
        //                 y: testBoundary.position.y - 1 
        //             }
        //         }
        //     }
        // )) {
        //     player.animate = false;
        //     player.image = player.sprites.down;
        //     player.frames.val = 0;
        //     console.log('~~~')
        // }
        if (player.animate) {
            moveAbles.forEach((moveble) => {
                moveble.position.y -= STEP
            })
        }
        // background.position.y = background.position.y - 1
        // testBoundary.position.y = testBoundary.position.y - 1
    } else if(keys.w.pressed && lastKey == 'w') {
        player.animate = true;
        player.image = player.sprites.up;
        
        // if (rectangularCollision({
        //         rect1: {...player,
        //             position: {
        //                 x: player.position.x,
        //                 y: player.position.y
        //             }
        //         },
        //         rect2: {...testBoundary, 
        //             position: {
        //                 x: testBoundary.position.x,
        //                 y: testBoundary.position.y + 1
        //             }
        //         }
        //     }
        // )) {
        //     player.animate = false;
        //     player.image = player.sprites.up;
        //     player.frames.val = 0;
        //     console.log('~~~')
        // }

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (rectangularCollision({
                rect1: player,
                rect2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x,
                        y: boundary.position.y + STEP
                    }
                }
            })) {
                player.animate = false;
                break;
            }
        }
        // 校验npc碰撞检测
        npcCheckBoundary(player, 0, STEP);
        player.animate &&
        moveAbles.forEach((moveble) => {
            moveble.position.y += STEP
        })
    } else if(keys.a.pressed && lastKey == 'a') {
        player.animate = true;
        player.image = player.sprites.left;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (rectangularCollision({
                rect1: player,
                rect2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x + STEP,
                        y: boundary.position.y
                    }
                }
            })) {
                player.animate = false;
                break;
            }
        }

        // 校验npc碰撞检测
        npcCheckBoundary(player, STEP);
        //     if (rectangularCollision({
        //         rect1: {...player,
        //             position: {
        //                 x: player.position.x,
        //                 y: player.position.y
        //             }
        //         },
        //         rect2: {...testBoundary, 
        //             position: {
        //                 x: testBoundary.position.x + 1,
        //                 y: testBoundary.position.y 
        //             }
        //         }
        //     }
        // )) {
        //     player.animate = false;
        //     player.image = player.sprites.left;
        //     player.frames.val = 0;
        //     console.log('~~~')
        // }
        player.animate &&
        moveAbles.forEach((moveble) => {
            moveble.position.x += STEP
        })
    } else if(keys.d.pressed && lastKey == 'd') {
        player.animate = true;
        player.image = player.sprites.right;
        // 校验墙边碰撞
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (rectangularCollision({
                rect1: player,
                rect2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x - STEP,
                        y: boundary.position.y
                    }
                }
            })) {
                player.animate = false;
                break;
            }
        }
        // 校验npc碰撞检测
        npcCheckBoundary(player, -STEP);
        // for (let i = 0; i < npcBoundaries.length; i++) {
        //     const npcBoundary = npcBoundaries[i];
        //     if (rectangularCollision({
        //         rect1: player,
        //         rect2: {
        //             ...npcBoundary,
        //             position: {
        //                 x: npcBoundary.position.x - STEP,
        //                 y: npcBoundary.position.y
        //             }
        //         }
        //     })) {
        //         player.animate = false;
        //         break;
        //     }
        // }

    //     if (rectangularCollision({
    //         rect1: {...player,
    //             position: {
    //                 x: player.position.x,
    //                 y: player.position.y
    //             }
    //         },
    //         rect2: {...testBoundary, 
    //             position: {
    //                 x: testBoundary.position.x - 1,
    //                 y: testBoundary.position.y 
    //             }
    //         }
    //     }
    // )) {
    //     player.animate = false;
    //     player.image = player.sprites.right;
    //     player.frames.val = 0;
    //     console.log('~~~')
    // }
        if (player.animate) {
            moveAbles.forEach((moveble) => {
                moveble.position.x -= STEP
            })
        }
    } else {
        
        // console.log('animate~~~~', (new Date()).getTime())
        // console.log(opt)
        // 没有按键时间就不做碰撞检测
        // npcCheckBoundary(player);
    }
}

let lastKey = ''

animate();
// animationBattle();


window.addEventListener('keydown', (e) => {
    if (BAT.initiated) return
    switch(e.key) {
        case 'w':
        keys.w.pressed = true;
        lastKey = 'w'
            break;
        case 'a':
        keys.a.pressed = true;
        lastKey = 'a'
            break;
        case 's':
        keys.s.pressed = true;
        lastKey = 's'
            break;
        case 'd':
        keys.d.pressed = true;
        lastKey = 'd'
            break;
    }
})

window.addEventListener('keyup', (e) => {
    if (BAT.initiated) return
    switch(e.key) {
        case 'w':
        keys.w.pressed = false;
        player.image = player.sprites.up;
        player.frames.val = 0
            break;
        case 'a':
        keys.a.pressed = false;
        player.image = player.sprites.left;
        player.frames.val = 0
            break;
        case 's':
        keys.s.pressed = false;
        player.image = player.sprites.down;
        player.frames.val = 0
            break;
        case 'd':
        keys.d.pressed = false;
        player.image = player.sprites.right;
        player.frames.val = 0
            break;
    }
})

const queue = [];

document.addEventListener('click', (e) => {
    if (e.target.tagName == 'BUTTON') {
        battlebikaqiu.attack({
            attack: attacks[e.target.innerHTML], 
            recipient: battledahuolong,
            renderedSprites
        })

        
        const randomAttack = battledahuolong.attacks[Math.floor(Math.random()
            * battledahuolong.attacks.length)]
            
        // debugger;
        if (battledahuolong.health <=0 ) {
            battledahuolong.faint()

            return
        }
        queue.push(() => 
            battledahuolong.attack({
                attack: randomAttack, 
                recipient: battlebikaqiu,
                renderedSprites
            })
        )
        
    }
    document.querySelector('#J_TOOLBAR_TYPE').innerHTML = e.target.innerHTML;
})

function toggleDialog(b) {
    const d = document.querySelector('#J_DIALOG');
    if (b) {
        d.style.display = 'block'
    } else {
        d.style.display = 'none'
    }
}

document.querySelector('#J_DIALOG').addEventListener('click', (e) => {
    if (battledahuolong.health <=0 ) {
        queue.shift();

        queue.push(() => {
            battledahuolong.faint()
        })
        queue[0]();
        queue.shift();

        queue.push(() => {
            gsap.to('#J_BAT', {
                opacity: 1,
                onComplete: () => {
                    cancelAnimationFrame(battleAnimationId)
                    animate()
                    gsap.to('#J_BAT', {
                        opacity: 0
                    })
                    document.querySelector('#J_USERINTERFACE').style.display = 'none'
                    BAT.initiated = false
                }
            })
        })
        queue[0]();
        queue.shift();

        return;
    }
    if (queue.length > 0) {
        queue[0]();
        queue.shift();
    } else 
        toggleDialog(false)
})