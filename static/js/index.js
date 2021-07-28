$('#detect').click(() => {
    $("#result").text('Predicting...');
    var formData = new FormData();
    formData.append('file', document.querySelector('#img-upload').files[0]);
    // $.post('/api/detect', formData, (success) => {
    //     $('#result').text(success);
    // });
    $.ajax({
        url : '/api/detect',
        type : 'POST',
        data : formData,
        processData: false,  // tell jQuery not to process the data
        contentType: false,  // tell jQuery not to set contentType
        success : function(data) {
            // console.log(data);
            // $("#result").text(data);
            show_prediction(data['image'], data['boxes'], data['confidences']);
            $("#result").text('Done...');
        }
 });
});

function show_prediction(filename, boxes, confidences){
    let canvas = document.querySelector("#result-canvas");
    let context = canvas.getContext('2d');
    let imageObj = new Image();
    const {w, h} = {w: 640, h: 480};
    imageObj.onload = function() {
        context.drawImage(imageObj, 0, 0, w, h);
        for(i = 0; i < boxes.length; i++){
            const box = boxes[i];
            //console.log(box);
            const {x1, y1, x2, y2} = {x1: box[0]*w, y1: box[1]*h, x2: box[2]*w, y2: box[3]*h}
            //console.log(x1, y1, x2, y2);
            const {width, height} = {width: parseInt(x2-x1), height: parseInt(y2-y1)}
            context.beginPath();
            context.rect(x1, y1, width, height);
            context.lineWidth = 2;
            context.strokeStyle = 'red';
            context.stroke();
            // Add Label
            if(height >= 2 || width >= 2){
                context.font = "bold 2.5rem 'Noto Sans JP', sans-serif";
                context.textAlign = "start";
                context.textBaseline = "bottom";
                context.fillStyle = "steelblue";
                context.fillText("Drone", x1-15, y2+25);
                context.lineWidth = 0.3;
                context.strokeStyle = 'white';
                context.strokeText("Drone", x1-15, y2+25);
            }
        }
    };
    imageObj.src = '../static/uploads/' + filename;
    canvas.height = h;
    canvas.width = w;
}