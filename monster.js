const playerDragon = new Image()
playerDragon.src = './img/dragon.png';

const bikaqiu = new Image()
bikaqiu.src = './img/bikaqiu.png';

const dahuolong = new Image()
dahuolong.src = './img/dahuolong.png';

const monsters = {
    Dragon: {
        position: {
            x: 790,
            y: 120
        },
        frames: {
            max: 9,
        },
        scale: 2,
        animate: true,
        image: playerDragon,
        name: 'Dragon',
        attacks: [attacks.Attack1]
    },
    Bikaqiu: {
        position: {
            x: 150,
            y: 160
        },
        frames: {
            max: 1,
        },
        scale: 2,
        image: bikaqiu,
        name: 'Bikaqiu',
        attacks: [attacks.Attack1, attacks.Attack2]
    },
    Dahuolong: {
        position: {
            x: 660,
            y: -20
        },
        frames: {
            max: 1,
        },
        scale: 2,
        image: dahuolong,
        name: 'Dahuolong',
        isEnemy: true,
        attacks: [attacks.Attack1, attacks.Attack2]
    }
}