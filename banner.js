//Fallback for mobile
function(){
    if(window.innerWidth <= 1080){
        var image = document.createElement("a-sky");
        image.setAttribute("src","background.jpg");
        var scene = document.getElementById("scene");
        scene.appendChild(image);
        var vid = document.getElementById("banner-video");
        vid.parentNode.removeChild(vid);
    }
}

// Remove VR button
function (){
    var button = document.getElementByClassName('a-enter-vr-button')[0];
    button.parentNode.removeChild(button);
}