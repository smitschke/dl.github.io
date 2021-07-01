let classifier;
let img;
let myChart;
var fileExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp'];

//Fileupload
function handleFiles (files) {
  const reader = new FileReader();
  
  reader.onload = function() {
    const temp_img = new Image();
    temp_img.src = reader.result;

    temp_img.onload = function() {
      var image_src = $(temp_img).attr('src');
      img = loadImage(image_src, classify);
    }
  }
  reader.readAsDataURL(files[0]);
}

$(document).ready(function() {
  const input = document.querySelector('input[type="file"]');
  
  input.addEventListener('change', function(e) {
    handleFiles(input.files);
  }, false);
});

//Drop-Area
$("#drop_area").on("dragover", function(event) {
  event.preventDefault();  
  event.stopPropagation();
});

$("#drop_area").on("dragleave", function(event) {
  event.preventDefault();  
  event.stopPropagation();
});

$("#drop_area").on("drop", function(event) {
  event.preventDefault();  
  event.stopPropagation();

  if (!classifier) {
    loadClassifier();
  } 

  //Fehlermeldung
  if ($.inArray(event.originalEvent.dataTransfer.files[0].name.split('.').pop().toLowerCase(), fileExtension) == -1) {
    $("#alert").show();
  } else {
    handleFiles(event.originalEvent.dataTransfer.files);
    $("#alert").hide();
  }
});

//Filedialog
$("#drop_area").on("click", function(event) {
  $('#file_input').click();
});

$("#file_input").change(function () {
  if (!classifier) {
    loadClassifier();
  } 
  
  //Fehlermeldung
  if ($.inArray($(this).val().split('.').pop().toLowerCase(), fileExtension) == -1) {
    $("#alert").show()
  } else {
    $("#alert").hide();
  }
});

//Beispielbilder
$("div.image_preview").on('click', function() {
  var image = $(this).find("img"); 
  var image_src = image.attr("src");
  
  if (!classifier) {
    loadClassifier();
  } 
  
  img = loadImage(image_src, classify);
  $("#alert").hide();
});

//Tab-Container
$( function() {
  $("#tabs").tabs();
} );

//Quellen-Anzeige
$("#sources_link").on("click", function(event) {
  $('#sources').show()
});

$("#close").on("click", function(event) {
  $('#sources').hide();
});

//Classifier
function preload(image) { 
  if (image == null) {
    image = 'images/dummy_image.png';
  }
 
  img = loadImage(image);
}

function modelLoaded() {
  $('#loading').hide();
}

function loadClassifier () {
  $('#loading').show();
  classifier = ml5.imageClassifier('MobileNet', modelLoaded);
}

function setup() {
  var canvas = createCanvas(400, 400);

  canvas.parent('viewport');
  background("#F0F3FD;");
  image(img, 150, 150, 100, 100);
}

function gotResult(error, results) {
  if (error) {
    console.error(error);
  } else {
    var labels = [];
    var confidences = [];

    //Tabellen-Update
    $("tbody tr").remove();

    results.forEach(function (arrayItem) {
      confidences.push(nf(arrayItem.confidence, 0, 4)*100);
      labels.push(arrayItem.label.split(",",1));
      $('table').append( '<tr><td>' + arrayItem.label + '</td><td>' + (arrayItem.confidence*100).toFixed(2) +' %</td></tr>' );
    });

    plot(labels, confidences)
  }
}

function classify() {
  $(".no_data").hide();
  $("table").show();
  classifier.classify(img, gotResult);
  
  //Zentrierte Anzeige im Canvas
  clear();
    
  var wrh = img.width / img.height;
  var newWidth = 400;
  var newHeight = 400 / wrh;
  
  if (newHeight > 400) {
    newHeight = 400;
    newWidth = newHeight * wrh;
  }
  
  var xOffset = newWidth < 400 ? ((400 - newWidth) / 2) : 0;
  var yOffset = newHeight < 400 ? ((400 - newHeight) / 2) : 0;

  image(img, xOffset, yOffset, newWidth, newHeight);

}

//Diagramm
function plot(labels, confidences) {
  var ctx = document.getElementById('myChart').getContext('2d');

  if (typeof(myChart) !== 'undefined') {
    myChart.destroy();
  }

  myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{         
        data: confidences,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        legend: {
          display: false 
        }
      },
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: true,
          display: true,
          title: {
            display: true,
            text: 'Wahrscheinlichkeit in %',
            color: '#343B4A',
            font: {
              family: 'Arial',
              size: 16,
              style: 'normal',
              lineHeight: 1,
            },
            padding: {top: 10, left: 0, right: 0, bottom: 10}
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Klasse',
            color: '#343B4A',
            font: {
              family: 'Arial',
                size: 16,
                style: 'normal',
                lineHeight: 1,
            },
            padding: {top: 0, left: 10, right: 10, bottom: 0}
          }
        }
      }
    }
  });
}