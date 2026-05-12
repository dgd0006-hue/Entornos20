    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const scoreElement = document.getElementById("score");
    const livesElement = document.getElementById("lives");
    const levelElement = document.getElementById("level");
    const messageElement = document.getElementById("message");
    const restartBtn = document.getElementById("restartBtn");

    let keys = {};
    let bullets = [];
    let meteors = [];
    let stars = [];
    let score = 0;
    let lives = 3;
    let level = 1;
    let gameOver = false;
    let meteorTimer = 0;
    
    const player = {
      x: canvas.width / 2 - 25,
      y: canvas.height - 70,
      width: 50,
      height: 45,
      speed: 7
    };

    // Creates background stars for a space effect
    function createStars() {
      stars = [];
      for (let i = 0; i < 80; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2,
          speed: Math.random() * 1.5 + 0.3
        });
      }
    }

    // Draws and moves stars downward
    function drawStars() {
      ctx.fillStyle = "white";
      stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        star.y += star.speed;

        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });
    }

    // Draws the player's spaceship
    function drawPlayer() {
      ctx.fillStyle = "#00eaff";
      ctx.beginPath();
      ctx.moveTo(player.x + player.width / 2, player.y);
      ctx.lineTo(player.x, player.y + player.height);
      ctx.lineTo(player.x + player.width, player.y + player.height);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#ffe66d";
      ctx.fillRect(player.x + 18, player.y + 28, 14, 18);
    }

    // Moves the player based on keyboard input
    function movePlayer() {
      if ((keys["ArrowLeft"] || keys["a"]) && player.x > 0) {
        player.x -= player.speed;
      }

      if ((keys["ArrowRight"] || keys["d"]) && player.x + player.width < canvas.width) {
        player.x += player.speed;
      }
    }

    // Creates a bullet from the player's position
    function shootBullet() {
      bullets.push({
        x: player.x + player.width / 2 - 3,
        y: player.y,
        width: 6,
        height: 14,
        speed: 9
      });
    }

    // Draws and updates all bullets
    function updateBullets() {
      ctx.fillStyle = "#ffe66d";
      bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        if (bullet.y < 0) {
          bullets.splice(index, 1);
        }
      });
    }

    // Creates falling meteors with random size and position
    function spawnMeteor() {
      const size = Math.random() * 25 + 30;
      meteors.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        width: size,
        height: size,
        speed: Math.random() * 2 + 2 + level * 0.4
      });
    }

    // Draws and updates all meteors
    function updateMeteors() {
      meteors.forEach((meteor, index) => {
        meteor.y += meteor.speed;

        ctx.fillStyle = "#a66b3f";
        ctx.beginPath();
        ctx.arc(
          meteor.x + meteor.width / 2,
          meteor.y + meteor.height / 2,
          meteor.width / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = "#6b3e26";
        ctx.beginPath();
        ctx.arc(meteor.x + 12, meteor.y + 14, 5, 0, Math.PI * 2);
        ctx.arc(meteor.x + 28, meteor.y + 25, 4, 0, Math.PI * 2);
        ctx.fill();

        if (meteor.y > canvas.height) {
          meteors.splice(index, 1);
          lives--;
          updateUI();

          if (lives <= 0) {
            endGame();
          }
        }
      });
    }

    // Checks collisions between rectangles/circles approximately
    function isColliding(a, b) {
      return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      );
    }

    // Handles bullet-meteor and player-meteor collisions
    function checkCollisions() {
      bullets.forEach((bullet, bulletIndex) => {
        meteors.forEach((meteor, meteorIndex) => {
          if (isColliding(bullet, meteor)) {
            bullets.splice(bulletIndex, 1);
            meteors.splice(meteorIndex, 1);
            score += 10;

            if (score % 100 === 0) {
              level++;
            }

            updateUI();
          }
        });
      });

      meteors.forEach((meteor, meteorIndex) => {
        if (isColliding(player, meteor)) {
          meteors.splice(meteorIndex, 1);
          lives--;
          updateUI();

          if (lives <= 0) {
            endGame();
          }
        }
      });
    }

    function updateUI() {
      scoreElement.textContent = score;
      livesElement.textContent = lives;
      levelElement.textContent = level;
    }

    function endGame() {
      gameOver = true;
      messageElement.textContent = `Game Over! Final score: ${score}`;
    }

    function resetGame() {
      bullets = [];
      meteors = [];
      score = 0;
      lives = 3;
      level = 1;
      gameOver = false;
      meteorTimer = 0;
      player.x = canvas.width / 2 - player.width / 2;
      messageElement.textContent = "";
      updateUI();
      createStars();
      gameLoop();
    }

    // Main game loop
    function gameLoop() {
      if (gameOver) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawStars();
      movePlayer();
      drawPlayer();
      updateBullets();
      updateMeteors();
      checkCollisions();

      meteorTimer++;
      if (meteorTimer > Math.max(25, 70 - level * 5)) {
        spawnMeteor();
        meteorTimer = 0;
      }

      requestAnimationFrame(gameLoop);
    }

    document.addEventListener("keydown", event => {
      keys[event.key] = true;

      if (event.code === "Space" && !gameOver) {
        shootBullet();
      }
    });

    document.addEventListener("keyup", event => {
      keys[event.key] = false;
    });

    restartBtn.addEventListener("click", resetGame);

    createStars();
    updateUI();
    gameLoop();