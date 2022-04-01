const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const checkDevice = deviceType();
const mobileActions = document.querySelector('.mobile-btn');

const width = window.innerWidth;
canvas.width = window.innerWidth;

if (checkDevice === 'mobile' || width <= 800) {
    mobileActions.style.display = 'flex';
    canvas.height = window.innerHeight - 53;
} else {
    canvas.height = window.innerHeight;
}

const gameoverDiv = document.querySelector('.gameover');
const btn = document.querySelector('#btn');
const scoreEl = document.querySelector('.scoreCount');

const btnLeft = document.querySelector('.btnLeft')
const btnRight = document.querySelector('.btnRight')
const btnFire = document.querySelector('.btnFire')

btn.addEventListener('click', () => {
    gameoverDiv.style.display = 'none'
    scoreEl.innerHTML = 0
    startGame()
})

function deviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "tablet";
    }
    else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return "mobile";
    }
    return "desktop";
};

startGame()

function startGame() {
    class Player {
        constructor() {
            this.velocity = {
                x: 0,
                y: 0
            }

            this.rotation = 0
            this.opacity = 1

            const image = new Image();
            image.src = './img/spaceship.png';
            image.onload = () => {
                const scale = .25
                this.image = image
                this.width = image.width * scale
                this.height = image.height * scale

                this.position = {
                    x: canvas.width / 2 - this.width / 2,
                    y: canvas.height - this.height - 20
                }
            }
        }

        draw() {
            context.save();
            context.globalAlpha = this.opacity
            context.translate(
                player.position.x + player.width / 2,
                player.position.y + player.height / 2
            )
            context.rotate(this.rotation);

            context.translate(
                -player.position.x - player.width / 2,
                -player.position.y - player.height / 2
            )

            context.drawImage(
                this.image,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            );

            context.restore();
        }

        update() {
            if (this.image) {
                this.draw()
                this.position.x += this.velocity.x
            }
        }
    }

    class Projectible {
        constructor({ position, velocity }) {
            this.position = position
            this.velocity = velocity

            this.radius = 3

            const image = new Image();
            image.src = './img/rocket.png';
            image.onload = () => {
                const scale = .10
                this.image = image
                this.width = image.width * scale
                this.height = image.height * scale
            }
        }

        draw() {
            context.drawImage(
                this.image,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            );
        }

        update() {
            if (this.image) {
                this.draw()
                this.position.x += this.velocity.x
                this.position.y += this.velocity.y
            }
        }
    }

    class Particle {
        constructor({ position, velocity, radius, imagePngName, scale, fades, opacity = 1 }) {
            this.position = position
            this.velocity = velocity
            this.fades = fades

            this.radius = radius
            this.opacity = opacity

            this.scale = scale

            // delete if i want return without images
            const image = new Image();
            image.src = `./img/${imagePngName}.png`;
            image.onload = () => {
                this.image = image
                this.width = image.width * this.scale
                this.height = image.height * this.scale
            }
        }

        draw() {
            context.save()
            context.globalAlpha = this.opacity

            context.drawImage(
                this.image,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            );
            context.restore()
        }

        update() {
            if (this.image) {
                this.draw()
                this.position.x += this.velocity.x
                this.position.y += this.velocity.y

                if (this.fades) this.opacity -= 0.01
            }
        }
    }

    class InviderProjectible {
        constructor({ position, velocity }) {
            this.position = position
            this.velocity = velocity

            this.width = 30;
            this.height = 30;

            const image = new Image();
            image.src = './img/bomb.png';
            image.onload = () => {
                this.image = image
                this.width = this.width
                this.height = this.height
            }

        }

        draw() {
            context.drawImage(
                this.image,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            );

        }

        update() {
            if (this.image) {
                this.draw()
                this.position.x += this.velocity.x
                this.position.y += this.velocity.y
            }

        }
    }

    class Invader {
        constructor({ position }) {
            this.velocity = {
                x: 0,
                y: 0
            }

            const image = new Image();
            image.src = './img/invader.png';
            image.onload = () => {
                const scale = .35
                this.image = image
                this.width = image.width * scale
                this.height = image.height * scale

                this.position = {
                    x: position.x,
                    y: position.y
                }
            }
        }

        draw() {
            context.drawImage(
                this.image,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            );
        }

        update({ velocity }) {
            if (this.image) {
                this.draw()
                this.position.x += velocity.x
                this.position.y += velocity.y
            }
        }

        shoot(invaderProjectibles) {
            invaderProjectibles.push(new InviderProjectible({
                position: {
                    x: this.position.x + this.width / 2,
                    y: this.position.y + this.height
                },
                velocity: {
                    x: 0,
                    y: 5
                }
            }))
        }
    }

    class Grid {
        constructor() {
            this.position = {
                x: 0,
                y: 0
            }

            this.velocity = {
                x: checkDevice === 'mobile' ? 1 : 3,
                y: 0
            }
            this.invaders = [];

            let columns = Math.floor(Math.random() * 6 + 2)
            let rows = Math.floor(Math.random() * 3 + 2)

            if (deviceType === 'mobile' || width < 800) {
                columns = 2
            }

            this.width = columns * 110

            for (let x = 0; x < columns; x++) {
                for (let y = 0; y < rows; y++) {
                    this.invaders.push(new Invader({
                        position: {
                            x: x * 110,
                            y: y * 50
                        }
                    }));
                }
            }
        }

        update() {
            this.position.x += this.velocity.x
            this.position.y -= this.velocity.y

            this.velocity.y = 0;

            if (this.position.x + this.width >= canvas.width
                || this.position.x <= 0) {
                this.velocity.x = -this.velocity.x
                this.velocity.y = 30
            }
        }
    }

    const player = new Player();
    const projectibles = [];
    const grids = [];
    const invaderProjectibles = [];
    const particles = [];
    let score = 0;

    const keys = {
        a: {
            pressed: false
        },
        d: {
            pressed: false
        },
        right: {
            pressed: false
        },
        left: {
            pressed: false
        },
        space: {
            pressed: false
        }
    }

    let frames = 0
    let randomInterval = Math.floor((Math.random() * 500) + 500)
    let imagesEnemiesDeath = ['detail01', 'detail02', 'detail03', 'detail04']
    let backgroundPlanets = ['planet01', 'planet02', 'planet03', 'planet04', 'planet05', 'planet06']
    let backgroundStars = ['star01', 'star02']
    let game = {
        over: false,
        active: true
    }
    createBackgroundParticiple(3, backgroundPlanets, .4, .2);
    createBackgroundParticiple(25, backgroundStars, 3, .3, .8);

    function createBackgroundParticiple(frequency, sprites, speed, scale, opacity = 1) {
        for (let i = 0; i < frequency; i++) {
            // create background elements
            particles.push(new Particle({
                position: {
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                },
                velocity: {
                    x: 0,
                    y: speed
                },
                imagePngName: sprites[Math.floor(Math.random() * sprites.length)],
                scale: Math.random() * .2,
                radius: Math.random() * 3,
                fades: false,
                opacity: opacity
            }))
        }
    }

    function createParticiple({ object, color, imagePngName, fades }) {
        for (let i = 0; i < 15; i++) {
            particles.push(new Particle({
                position: {
                    x: object.position.x + object.width / 2,
                    y: object.position.y + object.height / 2
                },
                velocity: {
                    x: (Math.random() - 0.5) * 2,
                    y: (Math.random() - 0.5) * 2
                },
                radius: Math.random() * 3,
                imagePngName: imagePngName || imagesEnemiesDeath[Math.floor(Math.random() * 4)],
                scale: Math.random() * 0.10,
                fades: fades
            }))
        }
    }

    function animate() {
        if (!game.active) return
        requestAnimationFrame(animate)
        context.fillStyle = 'black'
        context.fillRect(0, 0, canvas.width, canvas.height)

        particles.forEach((particle, index) => {

            if (particle.position.y - particle.height >= canvas.height) {
                particle.position.x = Math.random() * canvas.width
                particle.position.y = -particle.height
            }

            if (particle.opacity <= 0) {
                setTimeout(() => {
                    particles.splice(index, 1)
                }, 0)
            } else {
                particle.update()
            }
        })

        player.update();

        invaderProjectibles.forEach((invaderP, index) => {
            if (invaderP.position.y + invaderP.height >= canvas.height) {
                setTimeout(() => {
                    invaderProjectibles.splice(index, 1)
                }, 0)
            } else invaderP.update()

            // projectile hits player
            if (
                invaderP.position.y + invaderP.height >= player.position.y &&
                invaderP.position.x + invaderP.width >= player.position.x &&
                invaderP.position.x <= player.position.x + player.width
            ) {

                // console.log('you lose')

                setTimeout(() => {
                    invaderProjectibles.splice(index, 1)
                    player.opacity = 0
                    game.over = true
                    gameoverDiv.style.display = 'block';
                }, 0)

                setTimeout(() => {
                    game.active = false
                }, 1000)

                createParticiple({
                    object: player,
                    color: 'white',
                    imagePngName: 'player29detail',
                    fades: true
                })
            }
        })

        projectibles.forEach((projectible, index) => {
            if (projectible.position.y + projectible.radius <= 0) {
                setTimeout(() => {
                    projectibles.splice(index, 1)
                }, 0)
            } else {
                projectible.update()
            }
        })

        grids.forEach((grid, gridIndex) => {
            grid.update();
            //spawn enemies projectiles
            if (frames % 100 === 0 && grid.invaders.length > 0) {
                grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectibles)
            }

            grid.invaders.forEach((invader, index) => {
                invader.update({ velocity: grid.velocity });

                // projectibles hit enemy
                projectibles.forEach((p, pIndex) => {
                    if (p.position.y - p.height <=
                        invader.position.y + invader.height &&
                        p.position.x + p.height >= invader.position.x &&
                        p.position.x - p.height <= invader.position.x + invader.width &&
                        p.position.y + p.height >= invader.position.y
                    ) {
                        setTimeout(() => {
                            const invaderFound = grid.invaders.find(invader2 => {
                                return invader2 === invader
                            })

                            const projectibleFound = projectibles.find(projectible2 => {
                                return projectible2 === p
                            })

                            // remove enemies and projectibles
                            if (invaderFound && projectibleFound) {

                                score += 1;
                                scoreEl.innerHTML = score;


                                createParticiple({
                                    object: invader,
                                    fades: true
                                })

                                grid.invaders.splice(index, 1)
                                projectibles.splice(pIndex, 1)

                                if (grid.invaders.length > 0) {
                                    const firstInvader = grid.invaders[0]
                                    const lastInvader = grid.invaders[grid.invaders.length - 1]

                                    grid.width = lastInvader.position.x -
                                        firstInvader.position.x +
                                        lastInvader.width

                                    grid.position.x = firstInvader.position.x
                                } else {
                                    grids.splice(gridIndex, 1)
                                }
                            }

                        }, 0)
                    }



                })
            })
        })

        if (keys.a.pressed && player.position.x >= 0) {
            player.velocity.x = -8
            player.rotation = -0.15
        } else if (keys.d.pressed && player.position.x + player.width <= canvas.width) {
            player.velocity.x = 8
            player.rotation = 0.15
        } else {
            player.velocity.x = 0
            player.rotation = 0
        }

        //spawning enemies
        if (frames % randomInterval === 0 || grids.length === 0) {
            grids.push(new Grid());
            randomInterval = Math.floor((Math.random() * 500) + 500)
            frames = 0;
        }

        frames++
    }

    animate();

    let shootSide = 'right';

    addEventListener('keydown', ({ key }) => {
        if (game.over) return;


        switch (key) {
            case 'a':
                keys.a.pressed = true
                break;
            case 'ArrowLeft':
                keys.a.pressed = true
                break;
            case 'd':
                keys.d.pressed = true
                break;
            case 'ArrowRight':
                keys.d.pressed = true
                break;
            case ' ':
                spaceBtn();
                break;
        }
    })

    function spaceBtn() {
        let divide = shootSide === 'right' ? 1.5 : 4
        projectibles.push(new Projectible({
            position: {
                x: player.position.x + player.width / divide,
                y: player.position.y + player.height / 5
            },
            velocity: {
                x: 0,
                y: -7
            }
        }))

        shootSide = shootSide === 'right' ? 'left' : 'right';
    }

    btnLeft.addEventListener('touchstart', () => {
        keys.a.pressed = true
    })
    btnLeft.addEventListener('touchend', () => {
        keys.a.pressed = false
    })
    btnRight.addEventListener('touchstart', () => {
        keys.d.pressed = true
    })
    btnRight.addEventListener('touchend', () => {
        keys.d.pressed = false
    })
    btnFire.addEventListener('click', () => {
        spaceBtn()
    })

    addEventListener('keyup', ({ key }) => {
        switch (key) {
            case 'a':
                keys.a.pressed = false
                break;
            case 'ArrowLeft':
                keys.a.pressed = false
                break;
            case 'd':
                keys.d.pressed = false
                break;
            case 'ArrowRight':
                keys.d.pressed = false
                break;
            case ' ':
                break;
        }
    })
}