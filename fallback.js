if(window.innerWidth <= 800){
    var image = document.createElement("a-sky");
    image.setAttribute("src","background.jpg");
    var scene = document.getElementById("scene");
    scene.appendChild(image);
    var vid = document.getElementById("banner-video");
    vid.parentNode.removeChild(vid);
}
