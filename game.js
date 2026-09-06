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

function preload() {
  this.load.image("player", "assets/player.png");
  this.load.image("building", "assets/building.png");
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
    groundGraphics.lineStyle(1,0x3a3a3a,1);

    for(let x=0; x<=800; x +=40){
        groundGraphics.lineBetween(x,0,x,600);
    }
    for(let y=0; y<=600; y +=40){
        groundGraphics.lineBetween(0,y,800,y);
    }

    groundGraphics.lineStyle(3,0x666666,1);
    groundGraphics.strokeRect(2,2,796,596);

  // Create a simple colored square as our placeholder player
    player = this.add.image(400, 300, "player");
  player.setScale(2);

   building = this.add.image(600, 200, "building");
  building.setScale(6);
    building2 = this.add.image(150, 450, "building");
  building2.setScale(6);

  // Set up arrow key detection
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

  const infoTitle = this.add.text(340, 150, "", { fontSize: "28px", fill: "#ffffff" });
  const infoPrice = this.add.text(340, 200, "", { fontSize: "18px", fill: "#00ff99" });
  const infoReturn = this.add.text(340, 230, "", { fontSize: "18px", fill: "#ffffff" });
  const infoMA20 = this.add.text(340, 260, "", { fontSize: "18px", fill: "#ffffff" });
  const infoMA50 = this.add.text(340, 290, "", { fontSize: "18px", fill: "#ffffff" });
  const infoClose = this.add.text(340, 340, "[ Close ]", { fontSize: "18px", fill: "#ff6666" });

  infoClose.setInteractive({ useHandCursor: true });
  infoClose.on("pointerdown", function () {
    infoPanelVisible = false;
    infoTexts.forEach((text) => text.setVisible(false));
    graphGraphics.clear();
    graphMaxLabel.setText("");
    graphMinLabel.setText("");
  });

  infoTexts.push(infoTitle, infoPrice, infoReturn, infoMA20, infoMA50, infoClose);
  infoTexts.forEach((text) => text.setVisible(false));

  graphGraphics = this.add.graphics()

  graphMaxLabel = this.add.text(340,380,"",{fontSize:"14px",fill:"#aaaaaa"});
  graphMinLabel = this.add.text(340,495,"",{fontSize:"14px",fill:"#aaaaaa"});

}
  

function update() {
  const speed = 3;

  if (cursors.left.isDown) {
    player.x -= speed;
  }
  if (cursors.right.isDown) {
    player.x += speed;
  }
  if (cursors.up.isDown) {
    player.y -= speed;
  }
  if (cursors.down.isDown) {
    player.y += speed;
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

    const startX = 340;
    const startY = 390;
    const width = 300;
    const height = 100;

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