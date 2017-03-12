//Fallback for mobile
    if(window.innerWidth <= 1080){
        var image = document.createElement("a-sky");
        image.setAttribute("src","background.jpg");
        var scene = document.getElementById("scene");
        scene.appendChild(image);
        var vid = document.getElementById("banner-video");
        vid.parentNode.removeChild(vid);
    }

// Remove VR button

    var button = document.getElementsByClassName('a-enter-vr-button')[0];
    button.parentNode.removeChild(button);
