var counter = (function(){

    var count = 0;
    var step = 0;

    function init(_step){
        step = _step;
    }

    function increase(){
        count += step;
        if (count > 23) {
            count = 0;
        }
        loadImage(count);
    }

    function decrease(){
        count -= step;
        if (count < 0) {
            count = 23;
        }
        loadImage(count);
    }

    return {
        init:init,
        increase:increase,
        decrease:decrease,
    };
}());
counter.init(1);

function loadImage(file) {

    var fileArray = ["disc1.png", "disc2.png", "disc3.png", "disc4.png",
                    "disc5.png", "disc6.png", "disc7.png", "disc8.png",
                    "disc9.png", "disc10.png", "disc11.png", "disc12.png",
                    "disc13.png", "disc14.png", "disc15.png", "disc16.png",
                    "disc17.png", "disc18.png", "disc19.png", "disc20.png",
                    "disc21.png", "disc22.png", "disc23.png", "disc24.png"];

    var imageObj = new Image();

    imageObj.onload = function() {

        var img = document.getElementById('disc');

        img.setAttribute('src', this.src);

    };

    imageObj.src = "img/disc/" + fileArray[file];
}

var position = (function(){

    var count = 0;
    var step = 0;

    function init(_step){
        step = _step;
    }

    function move(){
        count += step;
        if (count > 8) {
            count = 0;
        }
        setPosition(count);
    }

    return {
        init:init,
        move:move,
    };
}());
position.init(1);

function setPosition(pos) {

    var posArray = ["right 0px bottom 0px", "right 300px bottom 0px", "right 600px bottom 0px",
                    "right 0px bottom 300px", "right 300px bottom 300px", "right 600px bottom 300px",
                    "right 0px bottom 600px", "right 300px bottom 600px", "right 600px bottom 600px"];
    
    const element = document.getElementById('robot');
    element.style.setProperty('background-position', posArray[pos]);
}

function animate() {

    var intervalId = 0;
    var intervalId2 = 0;

    window.onkeydown = function(evt) {
        var key = evt.which ? evt.which : evt.keyCode;

        var c = String.fromCharCode(key);

        switch (c) {

            case ('L'):
                counter.decrease();
                break;
            case ('R'):
                counter.increase();
                break;
            case ('A'):
                if (intervalId != 0 || intervalId2 != 0) {
                    clearInterval(intervalId);
                    intervalId = 0;
                    clearInterval(intervalId2);
                    intervalId2 = 0;
                } else {
                    intervalId = setInterval(function(){ position.move(); }, 100);
                    intervalId2 = setInterval(function(){ counter.increase(); }, 50);
                }
                break;

        }

    };

}

//Quellen-Anzeige
$(document).ready(function() {
$("#source_link").on("click", function(event) {
    console.log("test");
    $('#sources').show();
  });
  
  $("#close").on("click", function(event) {
    $('#sources').hide();
  });
});