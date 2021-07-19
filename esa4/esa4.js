async function loadModel(seed_text) {

    const model = await tf.loadLayersModel('web_model/model.json');

    seed_text = 'fairest creatures we desire increase';
    console.log(seed_text);

    generate_text_seq(model, 5, seed_text, 5);
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }

function generate_text_seq(model, text_seq_length, seed_text, n_words) {

    var text = [];
    const sequences_array = [];
    const test = [];

    $.get("web_model/tokenized_words.txt", function(tokens) {
        const json = tokens.replace(/'/g, '"')
        const Obj = JSON.parse(json);
        
        const seed_text_array = seed_text.split(" ");
        console.log("sta");
        console.log(seed_text_array);
        
        for (let i = 0; i < seed_text_array.length; i++) {
  
            sequences_array.push(Obj[seed_text_array[i]])
            
        }
        test.push(sequences_array);

        const predict_array = test.slice(Math.max(test.length - 5, 0))

        const predictClasses = model.predict(tf.tensor(predict_array));
        const yourClass = predictClasses.argMax(-1).dataSync()[0];     
        
        alert(getKeyByValue(Obj, yourClass));
        
    })
}

$( function() {
    $("#tabs").tabs();
});

function handle_text_input() {
    console.log($("#predict").val());

    const seed_words = $("#predict").val().split(" ")
    console.log(seed_words)

    if(seed_words.length >= 5 && $("#predict").val()[$("#predict").val().length -1] == " " ) {
        loadModel($("#predict").val());
    }
}

$("#predict").on("input", handle_text_input);
