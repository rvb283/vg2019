$(function(){
  let $canvas = $("canvas");
  let canvas = $canvas[0]
  let ctx = canvas.getContext('2d');

  let keys = {up: 87, down: 83, left: 65, right: 68, upk: 38, downk: 40, leftk: 37, rightk:39};
  let player = {x: 0, y: 0, rpos: function(){this.x = -this.size/2; this.y = canvas.height-2*this.size/3; return this}, size:100, color:"white", speed: 20, get dSpeed(){return player.speed*(Math.sqrt(0.5));}, moveUp: false, moveDown: false, moveLeft: false, moveRight: false};

  var mouseX = 0;
  var mouseY = 0;

  let enemyArray = [];
  /*21 by 14?*/
  var level = 1;

  function init(){
      level=1;
  }

  function loadLevel(){
    player.rpos();
    player.moveUp = player.moveDown = player.moveLeft = player.moveRight = false;
  }

  function enemy(instance){
    // ctx.beginPath();
    // ctx.arc(instance.x+xIncrement, instance.y+yIncrement, 50, 0, 2 * Math.PI,false);
    // ctx.fillStyle = "red";
    // ctx.lineWidth = 0;
    // ctx.fill();

    // if(instance.skin == 0){
    //   instance.skin = Math.floor(Math.random()*2)+1;
    // } else {
    //   if(instance.skin == 1){
    //     ctx.drawImage($("#dog")[0], instance.x+xIncrement-50, instance.y+yIncrement-50, 100, 100);
    //   } else if(instance.skin == 2){
    //     ctx.drawImage($("#cat")[0], instance.x+xIncrement-50, instance.y+yIncrement-50, 100, 100);
    //   }
    // }
  }

  function updateEnemyPos(instance){
    normalXPosition = -player.x;
    normalYPosition = -player.y + 1800;
    let targetPlayerX = (player.size/2) + normalXPosition;
    let targetPlayerY = (player.size/2) + normalYPosition;
    let xFromPlayer = targetPlayerX-instance.x;
    let yFromPlayer = targetPlayerY-instance.y;
    let distanceFromPlayer = Math.sqrt(Math.pow(xFromPlayer,2)*Math.pow(yFromPlayer,2));
    let speed = 3;
    let moveAngle = Math.atan2(yFromPlayer, xFromPlayer);

    if(distanceFromPlayer >= speed){
      instance.x += Math.cos(moveAngle) * speed;
      instance.y += Math.sin(moveAngle) * speed;
    }
  }

  function enemyIntersectPlayer(instance){
    circleDistance = {x:Math.abs(instance.x - normalXPosition-(player.size/2)),y:Math.abs(instance.y - normalYPosition-(player.size/2))};
    if (circleDistance.x > (player.size/2 + 50) || circleDistance.y > (player.size/2 + 50)){
      return false;
    }
    if (circleDistance.x <= (player.size/2) || circleDistance.y <= (player.size/2)) {
      return true;
    }
    cornerDistance_sq = Math.pow((circleDistance.x - player.size/2),2) + Math.pow((circleDistance.y - player.size/2),2);
    return (cornerDistance_sq <= Math.pow(50,2));
    return false;
  }

  $(window).on("resize",function(){
    // $canvas.css("transform","scale("+$(window).width()/$canvas.width()+","+$(window).height()/$canvas.height()+")");
  }).trigger("resize");

  function rect(x, y, width, height, color){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  }

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

  $(document).mousedown(function(){

  });

  $(document).mouseup(function(){

  });

  $("#canvas").mousemove(function(e){
    mouseX = e.pageX;
    mouseY = e.pageY;
  });


  var previousPlayerX = player.x;
  var previousPlayerY = player.y;

  var xDisplacement = (canvas.width/2-player.size/2);
  var yDisplacement = (canvas.width/2-player.size/2);
  var xIncrement = xDisplacement+player.x;
  var yIncrement = yDisplacement+player.y;
  var normalXPosition = -player.x;
  var normalYPosition = -player.y + 1800;

  var accuracy = 25;

  function checkBorders(){

  }


  //Game Loop
  function loop(t){
    //Background
    rect(0, 0, canvas.width, canvas.height, "black");
    // console.log("Previous Player X:"+previousPlayerX+"Previous Player Y"+previousPlayerX);

    previousPlayerX = player.x;
    previousPlayerY = player.y;

    if(player.moveUp){
      for(j = 0; j < accuracy; j++){
        // alert("before y increase:"+player.y);
        if(!player.moveLeft && !player.moveRight){
          player.y -= player.speed/accuracy;
        } else{
          player.y -= player.dSpeed/accuracy;
        }
        normalXPosition = -player.x;
        normalYPosition = -player.y + 1800;
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
        normalXPosition = -player.x;
        normalYPosition = -player.y + 1800;
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
        normalXPosition = -player.x;
        normalYPosition = -player.y + 1800;
        checkBorders();
        previousPlayerX = player.x;
      }
    }
    if(player.moveRight){
      for(j = 0; j < accuracy; j++){
        if(!player.moveUp && !player.moveDown){
          player.x += player.speed/accuracy;
        } else{
          player.x += player.dSpeed/accuracy;
        }
        normalXPosition = -player.x;
        normalYPosition = -player.y + 1800;
        checkBorders();
        previousPlayerX = player.x;
      }
    }

    newPlayerDifferenceX = player.x-previousPlayerX;
    newPlayerDifferenceY = previousPlayerY-player.y;

    // let hasTB = false, hasBB = false, hasLB = false, hasRB=false;
    /*Render*/

    $("#score").text(level);

    //Goal
    // rect(goal.x + xIncrement, goal.y + yIncrement, goal.width, goal.height, goal.color);
    //Player
    rect(player.x, player.y, player.size, player.size, player.color);
    // ctx.drawImage($("#ernie")[0], canvas.width/2 - player.size/2, canvas.height/2- player.size/2,player.size,player.size);

    enemyArray.forEach(updateEnemyPos);
    enemyArray.forEach(enemy);
    enemyArray.forEach(function(instance){
      if(enemyIntersectPlayer(instance)){
        loadLevel();
      }
    });

    // console.log("xIncrement: "+xIncrement +" yIncrement: "+yIncrement);
    // console.log("xDisplacement: "+xDisplacement +" yDisplacement: "+yDisplacement);
    // console.log("Player X: "+player.x +" Player Y: "+player.y);
    // console.log("Normal X:"+normalXPosition+"Normal Y: "+normalYPosition);
    // console.log("Goal X: "+goal.x +" Goal Y: "+goal.y);
    // console.log("-player.x <= goal.x + goal.width + xDisplacement " + (-player.x <= goal.x + goal.width));
    // console.log("-player.x + player.size >= goal.x + xDisplacement " + (-player.x + player.size >= goal.x));
    // console.log("-player.y+1800 + player.size >= goal.y - yDisplacement" + (-player.y + 1800 + player.size >= goal.y));
    // console.log("-player.y+1800 <= goal.y + goal.height - yDisplacement" + ( -player.y + 1800 <= goal.y + goal.height));

    window.requestAnimationFrame(loop);
  }
  init();
  window.requestAnimationFrame(loop);
});
