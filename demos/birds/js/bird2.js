function BirdHandler( $canvas, $how_many ){
	this.number_of_birds = $how_many;
	this.canvas = $canvas;
	this.ctx = this.canvas.getContext( '2d' );
	this.doPoo = false;
	var _this = this;
	this.birdArray = new Array( );
	this.pooArray = new Array( );
	
	for(var i = 0; i < this.number_of_birds; i++){
		this.birdArray.push(new Bird(_this,$canvas,i));
	}
	
	this.draw = function( ){
		_this.ctx.clearRect(0,0,1000,530);
		for(var p = 0; p < _this.number_of_birds; p++){
			var bird = _this.birdArray[p];
			if(bird.fullyloaded){
				bird.draw();
			}
		}
		
		if(_this.doPoo){
			_this.drawPoo();
		}
		_this.drawShimmer();
	}
	
	this.drawShimmer = function(){
		var numberOfShimmers = 5;
		while(numberOfShimmers--){
			_this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)"; 
			_this.ctx.fillRect(Math.random()*1000,Math.random()*92 + 274, 3, 2);
		}
	}
	
	this.checkPostFree = function( $postID, $birdID ){
		var sendBack = true;
		for(var p = 0; p < _this.number_of_birds; p++){
			if( _this.birdArray[p].id != $birdID && _this.birdArray[p].post_number == $postID){
				sendBack = false;
			}
		}
		return sendBack;
	}
	
	this.checkForBump = function( $bird  ){
		for(var p = 0; p < _this.number_of_birds; p++){
			if( _this.birdArray[p].post_number == $bird.post_number && $bird.id != _this.birdArray[p].id && !_this.birdArray[p].flying ){
				_this.birdArray[p].flyOff( );
			}
		}
	}
	
	this.drawPoo = function(){
		var tAL = _this.pooArray.length;
		if( tAL == 0 ){
			this.doPoo = false;
		}
		while( tAL-- ){
			pooPos = this.pooArray[ tAL ].step( );
			if( pooPos ){
				this.ctx.drawImage(Poo.Image,pooPos.x,pooPos.y);
			}else{
				new Splat(_this.canvas,this.pooArray[ tAL ].xPos, this.pooArray[ tAL ].yPos);
				this.pooArray.splice( tAL, 1);
			}
		}
	}
	
	this.addPoo = function( $bird ){
		this.pooArray.push(new Poo($bird.xPos+130,$bird.yPos+160));
		this.doPoo = true;
	}
	new Poo( 0,0 );
	setInterval(this.draw,50);
}


function Bird( $birdHandler, $canvas, $id ){
	this.BirdHandler = $birdHandler;
	this.id = $id;
	this.postXArray = new Array(-95,10,219,542,720);
	this.postYArray = new Array(163,167,165,167,166);
	this.flying = true;
	this.sitting = false;
	this.flyingOff = false;
	this.xPos = -100;
	this.yPos = Math.round(Math.random()*300)-150;
	
	this.post_number = Math.round(Math.random()*(this.postXArray.length-1));
	this.targetX = this.postXArray[this.post_number];
	this.targetY = this.postYArray[this.post_number];
	
	this.speed = Math.round(Math.random()*40)+30;
	this.canvas = $canvas;
	this.ctx = this.canvas.getContext( '2d' );
	
	this.birdImgCount = 8;
	this.birdLandImgCount = 12;
	this.birdImgs = new Array( );
	this.birdLandingImgs = new Array( );
	this.graphicsLoadedBirds = 0;
	this.graphicsLoadedBirdsLanding = 0;
	
	this.flyOffTimer = null;
	this.fullyloaded = false;
	this.count = 0;
	
	this.landingCount = 0;
	
	this.disx = this.xPos - this.targetX;
	this.disy = this.yPos - this.targetY;
	var _this = this;
	
	this.setupBirdsFlight = function( ){
		var n = this.birdImgCount;
		var $img;
		while( n-- ){
			$img = new Image();
			$img.addEventListener( 'load', this.loadedBirdImg, false );
			$img.src = 'images/sequence_resized/bird'+(n+1)+'.png';
			this.birdImgs.push( $img );
		}
		this.count = Math.max(0,Math.round(Math.random()*this.birdImgs.length-1));
	}
	
	this.loadedBirdImg = function( ){
		_this.graphicsLoadedBirds++;
		if( _this.graphicsLoadedBirds >= _this.birdImgCount ){
			_this.setupBirdsLanding( );
		}
	}
	
	this.setupBirdsLanding = function( ){
		var n = this.birdLandImgCount;
		var $img2;
		while( n-- ){
			$img2 = new Image();
			$img2.addEventListener( 'load', this.loadedBirdLandingImg, false );
			$img2.src = 'images/sequence_resized/landing'+(n+1)+'.png';
			this.birdLandingImgs.push( $img2 );
			
		}
		
	}
	
	this.loadedBirdLandingImg = function( ){
		_this.graphicsLoadedBirdsLanding++;
		if( _this.graphicsLoadedBirdsLanding >= _this.birdLandImgCount ){
			_this.init( );
		}
	}
	
	this.init = function( ){
		this.fullyloaded = true;
		this.count = this.birdImgs.length - 1;
		this.landingCount = this.birdLandingImgs.length - 1;
	}
	
	this.draw = function(){
		if(_this.flying){
			_this.ctx.drawImage(_this.birdImgs[_this.count],_this.xPos,_this.yPos);
			_this.count--; 
			if(_this.count < 0){ _this.count = _this.birdImgs.length - 1; }
			_this.xPos -= Math.round(Math.cos(Math.atan2(_this.disy,_this.disx))*_this.speed);
			_this.yPos -= Math.round(Math.sin(Math.atan2(_this.disy,_this.disx))*_this.speed);
			if(_this.flyingOff){
				if(_this.xPos > 1000 || _this.xPos < -150 || _this.yPos > 200 || _this.yPos < -150){
					_this.restart();
				}
			}else{
				if( _this.yPos > _this.targetY ){
					_this.BirdHandler.checkForBump( _this );
					_this.flying = false;
					flyOffTimer = setTimeout(_this.flyOff, Math.round(Math.random()*5000)+2000 );
				}
			}
			// console.log( 'x:'+_this.xPos+' - y:'+_this.yPos );
		}else{
			_this.xPos = _this.targetX;
			_this.yPos = _this.targetY;
			_this.ctx.drawImage(_this.birdLandingImgs[_this.landingCount],_this.xPos,_this.yPos);
			if(_this.landingCount){ _this.landingCount--; }
		}
	}
	
	this.flyOff = function(){
		if(Math.random() > 0.3){
			_this.BirdHandler.addPoo( _this );
		}
		if(_this.flyOffTimer != null){
			clearTimeout(_this.flyOffTimer);
		}
		_this.flying = true;
		_this.sitting = false;
		_this.flyingOff = true;
		_this.post_number = -1;
		_this.targetX = 1200;
		_this.targetY = Math.round(Math.random()*400)-200;
		_this.disx = _this.xPos - _this.targetX;
		_this.disy = _this.yPos - _this.targetY;
		_this.landingCount = _this.birdLandingImgs.length - 1;
	}
	
	this.restart = function(){
		_this.flying = true;
		_this.sitting = false;
		_this.flyingOff = false;
		
		_this.xPos = -100;
		_this.yPos = Math.round(Math.random()*300)-150;
		
		_this.post_number = Math.round(Math.random()*(_this.postXArray.length-1));
		if(_this.BirdHandler.checkPostFree(_this.post_number, _this.id)){
			_this.targetX = _this.postXArray[_this.post_number];
			_this.targetY = _this.postYArray[_this.post_number];
		}else{
			_this.post_number = -1;
			_this.targetX = 1200;
			_this.targetY = Math.round(Math.random()*200);
			_this.flying = true;
			_this.sitting = false;
			_this.flyingOff = true;
		}
		_this.disx = _this.xPos - _this.targetX;
		_this.disy = _this.yPos - _this.targetY;
		_this.landingCount = _this.birdLandingImgs.length - 1;
	}
	
	this.setupBirdsFlight();
}

function Poo( $x, $y ){
	var _this = this;

	if( typeof Poo.Image == "undefined" ){
		Poo.Image = new Image( );
		Poo.FullyLoaded = false; 
		Poo.Image.addEventListener( 'load', this.pooLoaded, false );
		Poo.Image.src = 'images/poo.png';
	}else{
		if( Poo.FullyLoaded ){
			this.pooLoaded( );
		}
	}
	this.xV = -( ( Math.random() * 20 ) );
	this.xPos = $x;
	this.yPos = $y;

	this.active = true;
}

Poo.prototype.pooLoaded = function(){
	Poo.FullyLoaded = true; 
}

Poo.prototype.step = function(){
	this.yPos = this.yPos + 35;
	this.xV = this.xV * 0.9;
	this.xPos = this.xPos + this.xV;
	if(this.yPos < 510){
		return {x:this.xPos, y:this.yPos};
	}
	return null;
}

function Splat( $canvas, $x, $y ){
	var startX = $x;
	var startY = $y + 20 + Math.round( Math.random() * 20 );
	var randBlobs = 10;
	var blobSize = 3;
	
	var number_of_blobs = Math.round(Math.random()*randBlobs) + 3;
	var canvas = $canvas;
	var ctx = canvas.getContext( '2d' );
	ctx.fillStyle = "rgba(255,255,255,0.7)";
	while(number_of_blobs--){
		var xPos = startX + ((Math.random()*(blobSize*2))-blobSize);
		var yPos = startY + ((Math.random()*(blobSize*2))-blobSize);
		var radis = (Math.random()*blobSize)+(blobSize/2);
		 
		ctx.beginPath();  
		ctx.arc(xPos,yPos,radis,0,0.01, true);   
		ctx.fill(); 
		if( number_of_blobs == 1 ){
			ctx.fillStyle = "rgba(200,200,200,0.7)";
		}
	}
}
