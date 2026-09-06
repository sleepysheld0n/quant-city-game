let player;
let cursors;
let building;
let promptText;
let menuVisible = false;
let menuTexts = [];
let infoPanelVisible = false;
let infoTexts = [];
let graphMaxLabel;
let graphMinLabel;
let groundGraphics;
let walkBounce = 0;
let infoPanelBg;

function preload() {
  this.load.image("player", "assets/player.png");
  this.load.image("building", "assets/building.png");
  this.load.image("road", "assets/road.png");
  this.load.image("streetlamp", "assets/streetlamp.png");
  this.load.image("fence", "assets/fence.png");
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#2d2d2d",
  pixelArt: true,
  scene: {  
    preload: preload,
    create: create,
    update: update
  }
};

function create() {
    groundGraphics = this.add.graphics();
    graphGraphics = this.add.graphics();
      graphMaxLabel = this.add.text(300, 45, "", { fontSize: "13px", fill: "#aaaaaa" });
graphMinLabel = this.add.text(300, 165, "", { fontSize: "13px", fill: "#aaaaaa" });
    groundGraphics.lineStyle(1,0x3a3a3a,1);

    for(let x=0; x<=800; x +=40){
        groundGraphics.lineBetween(x,0,x,600);
    }
    for(let y=0; y<=600; y +=40){
        groundGraphics.lineBetween(0,y,800,y);
    }

      // Top and bottom fence rows
  for (let x = 16; x <= 784; x += 32) {
    const fenceTop = this.add.image(x, 16, "fence");
    fenceTop.setScale(2);

    const fenceBottom = this.add.image(x, 584, "fence");
    fenceBottom.setScale(2);
  }

  // Left and right fence columns
  for (let y = 16; y <= 584; y += 32) {
    const fenceLeft = this.add.image(16, y, "fence");
    fenceLeft.setScale(2);
    fenceLeft.setAngle(90);

    const fenceRight = this.add.image(784, y, "fence");
    fenceRight.setScale(2);
    fenceRight.setAngle(90);
  }

      for (let x = 16; x <= 784; x += 32) {
    const roadTile = this.add.image(x, 300, "road");
    roadTile.setScale(2);
  }

    const lamp1 = this.add.image(250, 260, "streetlamp");
  lamp1.setScale(3);

  const lamp2 = this.add.image(550, 260, "streetlamp");
  lamp2.setScale(3);

  // Create a simple colored square as our placeholder player
    player = this.add.image(400, 300, "player");
  player.setScale(2);
  player.setDepth(10);

   building = this.add.image(600, 200, "building");
  building.setScale(6);
    building2 = this.add.image(150, 450, "building");
  building2.setScale(6);

    
  for (let y = 248; y <= 300; y += 32) {
    const drivewayTile = this.add.image(600, y, "road");
    drivewayTile.setScale(2);
    drivewayTile.setAngle(90);
  }

  
  for (let y = 300; y <= 402; y += 32) {
    const drivewayTile = this.add.image(150, y, "road");
    drivewayTile.setScale(2);
    drivewayTile.setAngle(90);
  }

  
  cursors = this.input.keyboard.createCursorKeys();

    this.input.keyboard.on("keydown-E", function () {
    const nearBuilding1 = Phaser.Math.Distance.Between(player.x, player.y, building.x, building.y) < 80;
    const nearBuilding2 = Phaser.Math.Distance.Between(player.x, player.y, building2.x, building2.y) < 80;

    if (nearBuilding1 || nearBuilding2) {
      menuVisible = !menuVisible;
      menuTexts.forEach((text) => text.setVisible(menuVisible));
    }
  });

  promptText = this.add.text(300, 550, "", { fontSize: "20px", fill: "#ffffff" });

  const stocks = ["AAPL", "GOOGL", "MSFT", "NVDA", "TSLA", "AMZN"];

  stocks.forEach((stock, index) => {
    const stockText = this.add.text(340, 150 + index * 40, stock, {
      fontSize: "24px",
      fill: "#ffffff",
      backgroundColor: "#333333",
      padding: { x: 10, y: 5 }
    });

    stockText.setInteractive({ useHandCursor: true });
    stockText.setVisible(false);

    stockText.on("pointerdown", function () {
      menuVisible = false;
      menuTexts.forEach((text) => text.setVisible(false));

      infoTitle.setText(stock);
      infoPrice.setText("Loading...");
      infoReturn.setText("");
      infoMA20.setText("");
      infoMA50.setText("");

      infoPanelVisible = true;
      infoTexts.forEach((text) => text.setVisible(true));
       

      fetch("https://quant-stock-analyzer.onrender.com/stock/" + stock)
      .then((response)=> response.json())
      .then((data)=>{
        infoPrice.setText("Price:$" + data.price);
        infoReturn.setText("Daily Return:" + data.daily_return + "%");
        infoMA20.setText("20-Day MA:" + data.ma20);
        infoMA50.setText("50-Day MA:" + data.ma50);

        drawGraph(data.history);
      } )
      .catch((error)=>{
        infoPrice.setText("Error loading data");
        console.log(error);
      } )
    });

    menuTexts.push(stockText);
  });



const infoTitle = this.add.text(40, 45, "", { fontSize: "22px", fill: "#ffffff" });
const infoPrice = this.add.text(40, 80, "", { fontSize: "15px", fill: "#00ff99" });
const infoReturn = this.add.text(40, 103, "", { fontSize: "15px", fill: "#ffffff" });
const infoMA20 = this.add.text(40, 126, "", { fontSize: "15px", fill: "#ffffff" });
const infoMA50 = this.add.text(40, 149, "", { fontSize: "15px", fill: "#ffffff" });
const infoClose = this.add.text(40, 180, "[ Close ]", { fontSize: "15px", fill: "#ff6666" });

  infoClose.setInteractive({ useHandCursor: true });
  infoClose.on("pointerdown", function () {
    infoPanelVisible = false;
    infoTexts.forEach((text) => text.setVisible(false));
    graphGraphics.clear();
    graphMaxLabel.setText("");
    graphMinLabel.setText("");
    
  });

  infoTexts.push(infoTitle, infoPrice, infoReturn, infoMA20, infoMA50, infoClose);
    infoTexts.forEach((text) => text.setDepth(6));
  graphGraphics.setDepth(6);
  graphMaxLabel.setDepth(6);
  graphMinLabel.setDepth(6);
  infoTexts.forEach((text) => text.setVisible(false));

  



}
  

function update() {
  const speed = 3;

  const buildingSize = 48;

  function collidesWithBuilding(x, y) {
    const collidesB1 = Math.abs(x - building.x) < buildingSize && Math.abs(y - building.y) < buildingSize;
    const collidesB2 = Math.abs(x - building2.x) < buildingSize && Math.abs(y - building2.y) < buildingSize;
    return collidesB1 || collidesB2;
  }

  if (cursors.left.isDown && !collidesWithBuilding(player.x - speed, player.y)) {
    player.x -= speed;
  }
  if (cursors.right.isDown && !collidesWithBuilding(player.x + speed, player.y)) {
    player.x += speed;
  }
  if (cursors.up.isDown && !collidesWithBuilding(player.x - speed, player.y - speed)) {
    player.y -= speed;
  }
  if (cursors.down.isDown && !collidesWithBuilding(player.x + speed, player.y + speed)) {
    player.y += speed;
  }

    const isMoving = cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown;

  if (isMoving) {
    walkBounce += 0.3;
    player.y += Math.sin(walkBounce) * 0.5;
  }

    if (cursors.left.isDown) {
    player.setFlipX(true);
  } else if (cursors.right.isDown) {
    player.setFlipX(false);
  }

  player.x = Phaser.Math.Clamp(player.x,16,784);
  player.y = Phaser.Math.Clamp(player.y,16,584);

  const distance1= Phaser.Math.Distance.Between(player.x,player.y,building.x,building.y);
  const distance2= Phaser.Math.Distance.Between(player.x,player.y,building2.x,building2.y);

  if(distance1<80 ||distance2<80){
    promptText.setText("Press E to enter the building");
  }else{
    promptText.setText("");
  }
}

function drawGraph(history){
    graphGraphics.clear();

    const startX = 300;
    const startY = 70;
    const width = 200;
    const height = 90;

    const minPrice = Math.min(...history);
    const maxPrice = Math.max(...history);

    graphGraphics.fillStyle(0x1a1a1a,1);
    graphGraphics.fillRect(startX,startY,width,height);

    graphGraphics.lineStyle(1,0x444444,1);
    graphGraphics.lineBetween(startX,startY + height/2,startX + width,startY + height/2);

    graphGraphics.lineStyle(2,0x00ffcc,1);
    graphGraphics.beginPath();

    history.forEach((price,index)=>{
        const x = startX + (index/(history.length - 1))*width;
        const y = startY + height - ((price - minPrice)/(maxPrice - minPrice))*height;

        if(index === 0){
            graphGraphics.moveTo(x,y);
        }else{
            graphGraphics.lineTo(x,y);
        }
    });

    graphGraphics.strokePath();

    graphMaxLabel.setText("$" + maxPrice.toFixed(2) + "(30-day high)");
    graphMinLabel.setText("$" + minPrice.toFixed(2) + "(30-day low)");
    
}
const game=new Phaser.Game(config);