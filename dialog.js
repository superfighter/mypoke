const npcDialog = {
    // 518: {
    //     N: 0,
    //     U: 0,
    //     NPC: [['nihao'], ['go', 'fast'], ['ok']],
    //     USER: [['nihao!'], ['u_ok1','u_ok2'], ['u_ok3']],
    //     NPC_Over: [[0], [0, 0], [0]],
    //     USER_Over: [[0], [0, 0], [0]]
    // },
    518: [{
        'seq': 1,
        'speaker': 'npc',
        'message': 'hello~',
        'done': false,
        'recircle': 'nothing here',
        'time': 0
    },{
        'seq': 2,
        'speaker': 'user',
        'message': 'go,',
        'done': false
    },{
        'seq': 3,
        'speaker': 'npc',
        'message': 'run!',
        'done': false
    },{
        'seq': 4,
        'speaker': 'user',
        'message': 'ok...',
        'done': false
    }]
}
var dialoged = 0;
var handleC = (player, x, y, fk, index = 0) => {
    const element = npcDialog[518][index];
    const mes = element && element.message
    const recircle = element && element.recircle
    console.log('???? handleC dialoged')
    if (element && element.time && element.time % 2 !== 0) {
        // 访问过
        console.log('???? if dialoged')
        document.querySelector('#J_USERMESSAGE').style.display = 'block'
        document.querySelector('#J_USER').style.display = 'none'
        document.querySelector('#J_NPC').style.display = 'block'
        document.querySelector('#J_NPC_message').innerHTML = recircle
        npcDialog[518][dialoged].time++;
        dialoged = 0;
    } else if (element && element.time && element.time != 0 && element.time % 2 === 0) {
        console.log('dialog over')
        document.querySelector('#J_USERMESSAGE').style.display = 'none'
        dialoged = 0;
        npcDialog[518][dialoged].time++;
        reControl()
    } else {
        // 没访问过
        if (dialoged >= npcDialog[518].length) {
            console.log('dialog over')
            document.querySelector('#J_USERMESSAGE').style.display = 'none'
            dialoged = 0;
            npcDialog[518][dialoged].time++;
            reControl()
        } else {
            document.querySelector('#J_USERMESSAGE').style.display = 'block'
            if (element.speaker == 'npc') {
                document.querySelector('#J_USER').style.display = 'none'
                document.querySelector('#J_NPC').style.display = 'block'
                document.querySelector('#J_NPC_message').innerHTML = mes
    
            } else {
                document.querySelector('#J_USER').style.display = 'block'
                document.querySelector('#J_NPC').style.display = 'none'
                document.querySelector('#J_USER_message').innerHTML = mes
            }
            dialoged++
        }
    }
}
document.querySelector('#J_Next').addEventListener('click', () => {
    handleC(undefined, undefined, undefined, undefined, dialoged)
}, false)


// document.querySelector('#J_USERMESSAGE_OK').addEventListener('click', () => {
//     document.querySelector('#J_USER').style.display = 'block'
//     var N = npcDialog[518]['N']
//     document.querySelector('#J_USER_message').innerHTML = npcDialog[518]['NPC'][N]
//     document.querySelector('#J_NPC').style.display = 'none'
//     npcDialog[518]['N']++
//     if (npcDialog[518]['N'] >= npcDialog[518]['NPC'].length) {
//         npcDialog[518]['N'] = 0;
//         player.animate = true
//         loseControl = false
//         // 对话窗口展示
//         document.querySelector('#J_USERMESSAGE').style.display = 'none'
//     }
// })
// const npcDialog2 = JSON.parse(JSON.stringify(npcDialog))
// const dc = document.cloneNode(document.querySelector('#J_USERMESSAGE'))
// const handleC = (player, xStep, yStep, show) => {
//     // debugger;
//     document.querySelector('#J_USER').style.display = 'block'
//     document.querySelector('#J_NPC').style.display = 'none'
//     var N = npcDialog[518]['N']
//     // console.log('~~~handleC ', npcDialog[518]['N'], npcDialog[518]['NPC'].length)
//     // console.log('player, xStep, yStep', player, xStep, yStep);
//     if (npcDialog[518]['N'] >= npcDialog[518]['NPC'].length) {
//         npcDialog[518] = JSON.parse(JSON.stringify(npcDialog2[518]));
//         // 这里要重置控制权限
//         reControl()
        
//     } else {
//         console.log('wangyic', '??', show)
//         if (show == 1) {
//             // 对话窗口展示
//             console.log('??????????????????????????????????????????????')
//             document.querySelector('#J_USERMESSAGE').classList.add('show');
//             // document.querySelector('#J_USERMESSAGE').remove();
//             // dc.querySelector('#J_USERMESSAGE').classList.add('show');
//             // document.querySelector('#J_Wrapper').append(dc.querySelector('#J_USERMESSAGE'))
//         }
//         for (let i=0;i<npcDialog[518]['NPC'][N].length;i++) {
//             let mesN = npcDialog[518]['NPC'][N][i]
//             if (npcDialog[518]['USER_Over'][N][i] == 0) {
//                 document.querySelector('#J_USER_message').innerHTML = mesN
//                 npcDialog[518]['USER_Over'][N][i] = 1
//                 break;
//             }
//         }
//         // npcDialog[518]['NPC'][N].forEach((mesN, i) => {
//         //     if (npcDialog[518]['USER_Over'][N][i] == 0) {
//         //         document.querySelector('#J_USER_message').innerHTML = mesN
//         //         npcDialog[518]['USER_Over'][N][i] = 1
//         //     }
//         // })
//         if (npcDialog[518]['USER_Over'][N].every(i => i == 1)) {
//             npcDialog[518]['N']++
//         }
//     }
// }
// const handleD = () => {
//     document.querySelector('#J_USER').style.display = 'none'
//     document.querySelector('#J_NPC').style.display = 'block'
//     var U = npcDialog[518]['U']
//     npcDialog[518]['USER'][U].forEach((mesU, i) => {
//         if (npcDialog[518]['NPC_Over'][U][i] == 0) {
//             document.querySelector('#J_NPC_message').innerHTML = mesU
//             npcDialog[518]['NPC_Over'][U][i] = 1
//         }
//     })
//     // document.querySelector('#J_NPC_message').innerHTML = npcDialog[518]['USER'][U]
//     if (npcDialog[518]['NPC_Over'][U].every(i => i == 1)) {
//         npcDialog[518]['U']++
//     }
//     // npcDialog[518]['U']++
//     console.log(npcDialog[518]['U'])
//     if (npcDialog[518]['U'] >= npcDialog[518]['USER'].length) {
//         npcDialog[518]['U'] = 0;
//     }
// }
// // document.querySelector('#J_USERMESSAGE_OK').addEventListener('click', () => {
// //     handleC()
// // }, false)

// // document.querySelector('#J_USERMESSAGE_NO').addEventListener('click', () => {
// //     handleD()
// // }, false)

// // 
// let dialogTo = 'N';
// var N = 1
// var U = 0
// document.querySelector('#J_Next').addEventListener('click', () => {
//     var tempN = npcDialog[518]['N']
//     var tempU = npcDialog[518]['U']
//     if (tempN != N) {
//         handleD()
//     } else {
//         handleC()
//     }
// }, false)

