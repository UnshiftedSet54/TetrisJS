let sound = new Howl({
    src: ['./resources/audio/Eggy Toast - Misunderstood.mp3'],
    autoplay: true,
    loop: true
})

const loadScreen = document.querySelector('.load-screen')

loadScreen.onclick = (e) => {
    sound.play()
    loadScreen.style.display = 'none'
}

const canvas = document.getElementById('tetris')
let ctx = canvas.getContext('2d')
ctx.scale(20, 20)
let counter = 0
let tiempoAnterior = 0
let colors = [
    null,
    "#b12509",
    "#ffb124",
    "#299223",
    "#831a00",
    "#c2c2c2",
    "#10325b",
    "#B11187"
]

let player = {
    posicion: {
        x: 0,
        y: 0
    },
    matriz: null,
    puntos: 0
}
const crearMatriz = (width, height) => {
    let matriz = []
    while (height--) {
        matriz.push(new Array(width).fill(0))
    }
    return matriz
}

const crearPieza = (type) => {
    if(type === 'I') return [ [0, 1, 0], [0, 1, 0], [0, 1, 0] ]
    if(type === 'L') return [ [0, 2, 0], [0, 2, 0], [2, 2, 2] ]
    if(type === 'J') return [ [0, 3, 0], [0, 3, 0], [3, 3, 0] ]
    if(type === 'O') return [ [0, 0, 0], [4, 4, 0], [4, 4, 0] ]
    if(type === 'S') return [ [0, 0, 0], [0, 5, 5], [5, 5, 0] ]
    if(type === 'T') return [ [0, 0, 0], [6, 6, 6], [0, 6, 0] ]
    if(type === 'Z') return [ [0, 0, 0], [7, 7, 0], [0, 7, 7] ]
}

const Mover = (dir) => { // mueve la pieza hacia los lados dependiendo de la direccion.
    player.posicion.x += dir
    if (Choque(arena, player)) return player.posicion.x -= dir
}

const Drop = () => {
    player.posicion.y++
    if (Choque(arena, player)) {
        player.posicion.y--
        Unir(arena, player)
        Reset()
        Limpiar()
        updateScore()
    }
    counter = 0
}

const Update = (tiempo = 0) => { // actualiza el canvas.
    let nTiempo = tiempo - tiempoAnterior
    tiempoAnterior = tiempo
    counter += nTiempo
    if (counter > 480) Drop()
    Draw()
    requestAnimationFrame(Update)
}

const updateScore = () => {
    document.getElementById("puntos").innerText = player.puntos
}

const Draw = () => {
    ctx.fillStyle = '#0c1019'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    drawMatriz(arena, { x: 0, y: 0 })
    drawMatriz(player.matriz, player.posicion)
}

const drawMatriz = (matriz, offset) => {
    matriz.forEach( (row, y) => {
        row.forEach( (value, x) => {
            if (value !== 0) {
                ctx.fillStyle = colors[value]
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1)
            }
        })
    })
}

const Unir = (arena, player) => {
    player.matriz.forEach(function(row, y) {
        row.forEach(function(value, x) {
            if (value !== 0) {
                arena[y + player.posicion.y][x + player.posicion.x] = value;
            }
        });
    });
}

const Limpiar = () => {
    let rows = 1;
    outer: for(let y = arena.length - 1; y > 0; y--) {
        for(let x = 0; x < arena[y].length; x++) {
            if (arena[y][x] === 0) continue outer
        }
        let row = arena.splice(y, 1)[0].fill(0)
        arena.unshift(row)
        ++y
        player.puntos += rows * 10
        rows *= 2
    }
}

const Choque = (arena, player) => {
    let [matriz, offset] = [player.matriz, player.posicion]
    for(let y = 0; y < matriz.length; ++y) {
        for(let x = 0; x < matriz[y].length; ++x) {
            if (matriz[y][x] !== 0 && (arena[y + offset.y] && arena[y + offset.y][x + offset.x]) !== 0) return true
        }
    }
    return false;
}

const Reset = () => {
    let pieces = "ILJOSTZ"
    player.matriz = crearPieza(pieces[pieces.length * Math.random() | 0])
    player.posicion.y = 0
    player.posicion.x = (arena[0].length / 2 | 0) - (player.matriz[0].length / 2 | 0)
    if (Choque(arena, player)) {
        arena.forEach(row => row.fill(0))
        let puntos = player.puntos
        alert("GAME OVER. " + "Total: " + puntos)
        gameOver = true
        player.puntos = 0
        updateScore()
    }
}

const Rotar = () => {
    let pos = player.posicion.x
    let offset = 0
    rotarMatriz(player.matriz)
    while (Choque(arena, player)) {
        player.posicion.x += offset
        offset = -(offset + (offset > 0 ? 1 : -1))
        if (offset > player.matriz[0].length) return player.posicion.x = pos
    }
}

const rotarMatriz = (matriz) => {
    for (let y = 0; y < matriz.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [ matriz[y][x], matriz[x][y] ] = [ matriz[x][y], matriz[y][x] ]
        }
    }
    matriz.forEach(row => row.reverse())
}

let arena = crearMatriz(12, 20)

window.addEventListener('keydown', (e) => {
    if(e.key === "ArrowLeft") return Mover(-1)
    if(e.key === "ArrowRight") return Mover(1)
    if(e.key === "ArrowUp") return Rotar()
    if(e.key === "ArrowDown") return Drop()
    return
})

Reset()
updateScore()
Update()