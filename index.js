$(function(){
  let $canvas = $("canvas");
  let canvas = $canvas[0];
  let ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  let keys = {up: 87, down: 83, left: 65, right: 68, upk: 38, downk: 40, leftk: 37, rightk:39};
  let player = {x: 0, y: 0, rpos: function(){this.x = canvas.width/2-this.size/2; this.y = canvas.height/2-this.size/2; return this}, size:100, color:"white", speed: 10, get dSpeed(){return player.speed*(Math.sqrt(0.5));}, moveUp: false, moveDown: false, moveLeft: false, moveRight: false};
  let hborders = [{x1:0,x2:canvas.width,y:0, render:false},{x1:0,x2:canvas.width,y:canvas.height, render:true}];
  let vborders = [{y1:0,y2:canvas.height,x:0, render:false},{y1:0,y2:canvas.height,x:canvas.width, render:true}];
  const enemySize = 100;
  let levels = [{},{},{},{},{},{},{boss:true}];
  const enemySpeed = 10;
  let endlevel = [{}];
  let enemyArray = [];
  let lasers = [];
  const laserWidth = 100;
  const laserHeight = 10;
  const laserSpeed = 20;
  const laserReload = 150;
  let level = 1;
  let fireLaser = false;
  const levelTime = 30*1000;
  let levelStart;
  let levelPauseValue = 0;

  const MENU = 1;
  const LEVELDISPLAY = 2;
  const ONLEVEL = 3;
  const PAUSED = 4;
  let gameState = MENU;
  let beforePausedState;
  function init(){
      level=1;
      enemyArray = [];
      loadLevel();
  }

  let thislevel;
  let levelMessageTimeout;
  let enemySpawn;
  let enemySpawnInterval;
  let levelLength;
  function loadLevel(){
    clearTimeout(levelMessageTimeout);
    clearTimeout(levelLength);
    clearInterval(enemySpawnInterval);
    thislevel = levels[level-1];
    enemyArray = [];
    lasers = [];
    player.rpos();
    gameState = LEVELDISPLAY;
    if(typeof thislevel != "undefined"){
      levelMessageTimeout = setTimeout(function(){
        gameState = ONLEVEL;
        //
        //   if("enemies" in thislevel){
        //       enemyArray = JSON.parse(JSON.stringify(thislevel.enemies));
        //   }
        // }
        levelStart = Date.now();
        levelLength = setTimeout(nextLevel, levelTime);
        enemySpawnInterval = setInterval(enemySpawnIntervalFunction,1000-(level-1)*100);

      }, 2000);
    } else {
      gameState = ONLEVEL;
    }
    player.moveUp = player.moveDown = player.moveLeft = player.moveRight = false;
    // fireLaser = false;
  }

  function enemy(instance){
    // rect(instance.x, instance.y, enemySize, enemySize, "white");
    ctx.drawImage($("#enemy")[0], instance.x-enemySize*2.5, instance.y-enemySize*2.5, enemySize*6, enemySize*6);
  }

  function enemySpawnIntervalFunction(){
    side = Math.floor(Math.random()*4)+1;
    let enemyPosition = {};
    if(side === 1){
      enemyPosition = {x:Math.random()*canvas.width, y:0-enemySize};
    } else if(side === 2){
      enemyPosition = {x:Math.random()*canvas.width, y:canvas.height};
    } else if(side === 3){
      enemyPosition = {x:-enemySize, y:Math.random()*canvas.height};
    } else if(side === 4){
      enemyPosition = {x:canvas.width, y:Math.random()*canvas.height};
    }
    enemyArray.push(enemyPosition);
  }

  function updateEnemyPos(instance){
    let targetPlayerX = player.x;
    let targetPlayerY = player.y;
    let xFromPlayer = targetPlayerX-instance.x;
    let yFromPlayer = targetPlayerY-instance.y;
    let distanceFromPlayer = Math.sqrt(Math.pow(xFromPlayer,2)*Math.pow(yFromPlayer,2));
    let moveAngle = Math.atan2(yFromPlayer, xFromPlayer);

    // if(distanceFromPlayer >= speed){
      instance.x += Math.cos(moveAngle) * enemySpeed;
      instance.y += Math.sin(moveAngle) * enemySpeed;
    // }
  }
  function enemyIntersectPlayer(instance){
    /*Circle Intersection*/
    // circleDistance = {x:Math.abs(instance.x - player.x-(player.size/2)),y:Math.abs(instance.y - player.y-(player.size/2))};
    // if (circleDistance.x > (player.size/2 + 50) || circleDistance.y > (player.size/2 + 50)){
    //   return false;
    // }
    // if (circleDistance.x <= (player.size/2) || circleDistance.y <= (player.size/2)) {
    //   return true;
    // }
    // cornerDistance_sq = Math.pow((circleDistance.x - player.size/2),2) + Math.pow((circleDistance.y - player.size/2),2);
    // return (cornerDistance_sq <= Math.pow(50,2));
    return (instance.x + enemySize >= player.x && instance.x <= player.x + player.size && instance.y + enemySize >= player.y && instance.y <= player.y + player.size)?true:false
  }

  function laser(i){
    ctx.translate(i.x, i.y);
    ctx.rotate(i.angle);
    ctx.drawImage($("#laser2")[0], 0, 0-laserHeight*2.5, laserWidth, laserHeight*5);
    // rect(0, 0-laserHeight/2, laserWidth, laserHeight, "blue", i.angle);
    ctx.rotate(-i.angle);
    ctx.translate(-i.x, -i.y);
  }

  function laserMove(i){
    //laserSpeed^2 = i.x^2 + i.x^2
    //y/x
    i.x += Math.cos(i.angle) * laserSpeed;
    i.y += Math.sin(i.angle) * laserSpeed;
    i.originX = i.x;
    i.originY = i.y;
    let angle = i.angle;
    i.coordinates = [{
        x: Math.cos(angle) * (i.x - i.originX) - Math.sin(angle) * (i.y - i.originY) + i.originX,
        y: Math.sin(angle) * (i.x - i.originX) + Math.cos(angle) * (i.y - i.originY) + i.originY
    }, {
        x: Math.cos(angle) * (i.x + laserWidth - i.originX) - Math.sin(angle) * (i.y - i.originY) + i.originX,
        y: Math.sin(angle) * (i.x + laserWidth - i.originX) + Math.cos(angle) * (i.y - i.originY) + i.originY
    }, {
        x: Math.cos(angle) * (i.x - i.originX) - Math.sin(angle) * (i.y + laserHeight - i.originY) + i.originX,
        y: Math.sin(angle) * (i.x - i.originX) + Math.cos(angle) * (i.y + laserHeight - i.originY) + i.originY
    }, {
        x: Math.cos(angle) * (i.x + laserWidth - i.originX) - Math.sin(angle) * (i.y + laserHeight - i.originY) + i.originX,
        y: Math.sin(angle) * (i.x + laserWidth - i.originX) + Math.cos(angle) * (i.y + laserHeight - i.originY) + i.originY
    }];
  }

  function laserOutOfBounds(i){
    if(i.x > canvas.width || i.x + laserWidth < 0 || i.y < -laserWidth || i.y > canvas.height+laserWidth){
      i.visible = false;
    }
  }

  let mouseX = -1;
  let mouseY = -1;

  function createLaser(){
    let canvasMouseX = mouseX * (canvas.width/$(window).width());
    let canvasMouseY = mouseY * (canvas.height/$(window).height());
    let slope = (player.y - canvasMouseY)/(player.x - canvasMouseX);
    let angle = Math.atan2((player.y + player.size/2 - canvasMouseY), (player.x +player.size/2 - canvasMouseX)) + Math.PI;
    let laserX = player.x+player.size/2;
    let laserY = player.y+player.size/2;
    let originX =  laserX + laserWidth/2;
    let originY =  laserY + laserHeight/2;
    // let pointCoordinates = [{x:Math.cos(angle)*(laserX-originX)-Math.sin(angle)*(laserY-originY)+originX, y:Math.sin(angle)*(laserX-originX)+Math.cos(angle)*(laserY-originY)+originY},{x:Math.cos(angle)*(laserX-originX+laserWidth)-Math.sin(angle)*(laserY-originY)+originX, y:Math.sin(angle)*(laserX+laserWidth-originX)+Math.cos(angle)*(laserY-originY)+originY},{x:Math.cos(angle)*(laserX-originX)-Math.sin(angle)*(laserY+laserHeight-originY)+originX, y:Math.sin(angle)*(laserX-originX)+Math.cos(angle)*(laserY+laserHeight-originY)+originY},{x:Math.cos(angle)*(laserX+laserWidth-originX)-Math.sin(angle)*(laserY+laserHeight-originY)+originX, y:Math.sin(angle)*(laserX+laserWidth-originX)+Math.cos(angle)*(laserY+laserHeight-originY)+originY}];
    lasers.push({x:laserX, y:laserY, slope:slope, angle:angle, visible: true, coordinates:null, originX: originX, originY: originY});
  }

  function polygonsIntersect(a, b){
      var polygons = [a, b];
      var minA, maxA, projected, i, i1, j, minB, maxB;
      for(i = 0; i < polygons.length; i++){
          var polygon = polygons[i];
          for (i1 = 0; i1 < polygon.length; i1++){
              var i2 = (i1 + 1) % polygon.length;
              var p1 = polygon[i1];
              var p2 = polygon[i2];
              var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

              minA = maxA = null;
              for(j = 0; j < a.length; j++){
                  projected = normal.x * a[j].x + normal.y * a[j].y;
                  if (minA === null || projected < minA) {
                      minA = projected;
                  }
                  if (maxA === null || projected > maxA) {
                      maxA = projected;
                  }
              }

              minB = maxB = null;
              for(j = 0; j < b.length; j++){
                  projected = normal.x * b[j].x + normal.y * b[j].y;
                  if(maxB === null || projected < minB) {
                      minB = projected;
                  }
                  if(maxB === null || projected > maxB) {
                      maxB = projected;
                  }
              }
              if (maxA < minB || maxB < minA) {
                  return false;
              }
          }
      }
      return true;
  }


  $canvas.mousedown(function(e){
    mouseX = e.pageX;
    mouseY = e.pageY;
    fireLaser = true;
  });

  $canvas.mousemove(function(e){
    mouseX = e.pageX;
    mouseY = e.pageY;
  });

  $canvas.mouseup(function(e){
    fireLaser = false;
  });


  $(window).on("resize",function(){
    // $canvas = $("canvas");
    // canvas = $canvas[0];
    // $canvas.css("transform","scale("+$(window).width()/$canvas.width()+","+$(window).height()/$canvas.height()+")");
  }).trigger("resize");

  function nextLevel(){
    if(level <= levels.length){
      level++;
      loadLevel();
    }
    if(gameState == PAUSED){
      gameState = beforePausedState;
    }
  }

  $("#next").click(nextLevel);
  $("#prev").click(function(){
    if(level > 1){
      level--;
      loadLevel();
    }
    if(gameState == PAUSED){
      gameState = beforePausedState;
    }
  });
  $("#pause").click(pause);
  $("#reset").click(function(){
    init();
    if(gameState == PAUSED){
      gameState = beforePausedState;
    }
  });
  $("#redo").click(function(){
    loadLevel();
    if(gameState == PAUSED){
      gameState = beforePausedState;
    }
  });

  $("#play").click(function(){
    gameState = LEVELDISPLAY;
    init();
  });

  $("#resume").click(function(){
    if(gameState === PAUSED){
      $("#pause").trigger("click");
    }
  });

  $("#gotomenu").click(function(){
    gameState = MENU;
  });

  $("#modalclose").click(function(){
    $("#modal").hide("fast");
  });

  $("#controls").click(function(){
    openModal("Controls",`
    <ul>
      <li>WASD/arrow keys keys to move</li>
      <li>Click and aim to shoot</li>
      <li>P to pause</li>
    </ul>`);
  });

  $("#credits").click(function(){
    openModal("Credits",`
    <ul>
      <li>Coding - Garrett</li>
      <li>Graphics - Kai</li>
      <li>Documentation/Testing - Aadithya</li>
      <li>Game Testing - Ashan</li>
      <li>Storyboard - Hana</li>
    </ul>`)
  });

  function openModal(title, content){
    $("#modal").show("fast");
    $("#modal").children(".title").text(title);
    $("#modal").children(".content").html(content);
  }

  function rect(x, y, width, height, color, rotation=false){
    if(rotation || rotation <= 0)
      ctx.rotate(rotation);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    if(rotation || rotation <= 0)
      ctx.rotate(-rotation);
  }

  function pause(){
    if(gameState !== PAUSED && gameState !== MENU && gameState !== LEVELDISPLAY){
      beforePausedState = gameState;
      gameState = PAUSED;
      clearTimeout(levelMessageTimeout);
      clearTimeout(levelLength);
      clearInterval(enemySpawnInterval);
      enemySpawnInterval = null;
      levelPauseValue = Date.now();
      rect(0,0,canvas.width,canvas.height,"rgba(0,0,0,0.75)");
      ctx.font = "100px arial";
      ctx.fillStyle = "rgba(255,255,255,1)";
      ctx.textAlign = "center";
      ctx.fillText("Paused",canvas.width/2,canvas.height/5);
      $("#pause").text("Resume");
    } else if(gameState === PAUSED){
      // if(beforePausedState === LEVELDISPLAY){
      //   loadLevel();
      // }
      gameState = beforePausedState;
      $("#pause").text("Pause");
      clearTimeout(levelLength);
      console.log(levelPauseValue - levelStart);
      levelStart = Date.now();
      levelLength = setTimeout(nextLevel, levelTime - (levelPauseValue - levelStart));
      enemySpawnInterval = setInterval(enemySpawnIntervalFunction,1000-(level-1)*50);
    }
  }

  $(document).keypress(function(e){
    switch(e.key){
      case "p":
      case "Escape":
        pause();
        break;
    }
  });
  $(document).keydown(function(e){
    switch(e.which){
      case keys.up:
      case keys.upk:
        player.moveUp = true;
        break;
      case keys.down:
      case keys.downk:
        player.moveDown = true;
        break;
      case keys.left:
      case keys.leftk:
        player.moveLeft = true;
        break;
      case keys.right:
      case keys.rightk:
        player.moveRight = true;
        break;
    }
  });
  $(document).keyup(function(e){
    switch(e.which){
      case keys.up:
      case keys.upk:
        player.moveUp = false;
        break;
      case keys.down:
      case keys.downk:
        player.moveDown = false;
        break;
      case keys.left:
      case keys.leftk:
        player.moveLeft = false;
        break;
      case keys.right:
      case keys.rightk:
        player.moveRight = false;
        break;
    }
  });


  var previousPlayerX = player.x;
  var previousPlayerY = player.y;

  function checkBorders(){
    // for(let i = 0; i < hborders.length; i++){
    //   if(player.x < hborders[i].x2 && player.x+player.size > hborders[i].x1 && player.y < hborders[i].y && player.y + player.size > hborders[i].y){
    //     player.y = previousPlayerY;
    //   }
    //   if(player.y < hborders[i].y && player.y+player.size > hborders[i].y && player.x < hborders[i].x2 && player.x+player.size > hborders[i].x1){
    //     player.x = previousPlayerX;
    //   }
    // }
    // for(let i = 0; i < vborders.length; i++){
    //   if(player.x <= vborders[i].x && player.x+player.size > vborders[i].x && player.y < vborders[i].y2 && player.y + player.size > vborders[i].y1){
    //     player.x = previousPlayerX;
    //   }
    //   if(player.y < vborders[i].y2 && player.y+player.size > vborders[i].y1 && vborders[i].x > player.x && vborders[i].x < player.x+player.size){
    //     player.y = previousPlayerY;
    //   }
    // }
    if(player.x < 0 || player.x + player.size > canvas.width){
      player.x = previousPlayerX;
    }

    if(player.y < 0 || player.y + player.size > canvas.height){
      player.y = previousPlayerY;
    }
  }

  let laserTime = 0;
  //Game Loop
  function loop(t){
    if(gameState === ONLEVEL || gameState === LEVELDISPLAY){
      $("#pause").text("Pause");
      $("#pausemenu").hide();
      $("#topright").show();
      $("#menu").hide();
      //Background
      previousPlayerY = player.y;
      // rect(0, 0, canvas.width, canvas.height, "black");
      ctx.drawImage($("#background")[0], 0, 0, canvas.width, canvas.height)

      previousPlayerX = player.x;
      let accuracy = 25;
      if(player.moveUp){
        for(j = 0; j < accuracy; j++){
          if(!player.moveLeft && !player.moveRight){
            player.y -= player.speed/accuracy;
          } else{
            player.y -= player.dSpeed/accuracy;
          }
          checkBorders();
          previousPlayerY = player.y;
        }
      }
      if(player.moveDown){
        for(j = 0; j < accuracy; j++){
          if(!player.moveLeft && !player.moveRight){
            player.y += player.speed/accuracy;
          } else{
            player.y += player.dSpeed/accuracy;
          }
          checkBorders();
          previousPlayerY = player.y;
        }
      }
      if(player.moveLeft){
        for(j = 0; j < accuracy; j++){
          if(!player.moveUp && !player.moveDown){
            player.x -= player.speed/accuracy;
          } else{
            player.x -= player.dSpeed/accuracy;
          }
          checkBorders();
          previousPlayerX = player.x;
        }
      }
      if(player.moveRight/* && !hasRB*/){
        for(j = 0; j < accuracy; j++){
          if(!player.moveUp && !player.moveDown){
            player.x += player.speed/accuracy;
          } else{
            player.x += player.dSpeed/accuracy;
          }
          checkBorders();
          previousPlayerX = player.x;
        }
      }

      // let hasTB = false, hasBB = false, hasLB = false, hasRB=false;
      /*Render*/

      $("#levelnum").text("Level: "+level);

      if(fireLaser && t - laserTime > laserReload){
        laserTime = t;
        createLaser();
      }

      lasers = lasers.filter(i => i.visible);
      lasers.forEach(laserMove);
      lasers.forEach(laserOutOfBounds);
      lasers.forEach(laser);
      //Laser Debugging
      // lasers.forEach(function(i){
      //   i.coordinates.forEach(function(j){
      //     rect(j.x, j.y, 10, 10, "rgb(0,255,0)");
      //   });
      //   rect(i.originX, i.originY, 10, 10, "rgb(0,0,255)");
      //   rect(i.x, i.y, 10, 10, "rgb(255, 255, 0)");
      //   rect(i.x + laserWidth, i.y, 10, 10, "rgb(255, 255, 0)");
      //   rect(i.x, i.y + laserHeight, 10, 10, "rgb(255, 255, 0)");
      //   rect(i.x + laserWidth, i.y + laserHeight, 10, 10, "rgb(255, 255, 0)");
      // });
      //Player
      // rect(player.x, player.y, player.size, player.size, player.color);
      ctx.drawImage($("#player")[0], player.x, player.y, player.size, player.size)

      if(!enemyArray.length && gameState !== LEVELDISPLAY){
        // nextLevel();
      }
      enemyArray.forEach(updateEnemyPos);
      enemyArray.forEach(function(i){
        i.coordinates = [{x:i.x, y:i.y},{x:i.x+enemySize, y:i.y},{x:i.x, y:i.y+enemySize},{x:i.x+enemySize, y:i.y+enemySize}];
        //Enemy Position Debugging
        // i.coordinates.forEach(function(j){
        //   rect(j.x, j.y, 10, 10, "green");
        // });
      });
      enemyArray = enemyArray.filter(function(i){
        let enemyDoesntIntersect = true;
        lasers = lasers.filter(function(j){
          if(polygonsIntersect(j.coordinates, i.coordinates)){
            enemyDoesntIntersect = false;
            return false;
          }
          return true;
        });
        return enemyDoesntIntersect;
      });
      enemyArray.forEach(enemy);
      enemyArray.forEach(function(i){
        if(enemyIntersectPlayer(i)){
          loadLevel();
        }
      });
      if(gameState === LEVELDISPLAY && typeof thislevel != "undefined"){
        ctx.font = "100px arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillText("Level "+level,canvas.width/2,canvas.height/4);
      } else if(typeof thislevel == "undefined"){
        ctx.font = "100px arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "hsl("+((t/2) % 361)+", 100%, 50%)";
        ctx.fillText("You Win!",canvas.width/2,canvas.height/4);
      }
    }  else if(gameState == MENU){
      $("#menu").show();
      $("#pausemenu").hide();
      $("#topright").hide();
      $("#pause").text("Pause");
      ctx.drawImage($("#background")[0], 0, 0, canvas.width, canvas.height);
      ctx.font = "150px arial";
      ctx.fillStyle = "rgba(255,255,255,1)";
      ctx.textAlign = "center";
      ctx.fillText("StarPixel",canvas.width/2,canvas.height/4);
    } else if(gameState == PAUSED){
      $("#pausemenu").show();
    }
    window.requestAnimationFrame(loop);
  }
  window.requestAnimationFrame(loop);
});
