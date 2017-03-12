(function(){

    //based on http://stackoverflow.com/a/16743863
    // function addScript(filepath, callback) {
    //   if (filepath) {
    //       var fileref = document.createElement('script');
    //       var done = false;
    //       var head = document.getElementsByTagName("head")[0];

    //       fileref.onload = fileref.onreadystatechange = function () {
    //           if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
    //               done = true;

    //               callback();

    //               // Handle memory leak in IE
    //               fileref.onload = fileref.onreadystatechange = null;
    //               if (head && fileref.parentNode) {
    //                   head.removeChild(fileref);
    //               }
    //           }
    //       };

    //       fileref.setAttribute("type", "text/javascript");
    //       fileref.setAttribute("src", filepath);

    //       head.appendChild(fileref);
    //   }
    // }


    function fadeIn(){
        //TODO: do nice fade in transition when loaded
        console.log('fadeIn')

    }

    function initScene(){
        console.log('Init scene');

        // var banner = document.getElementById('vrbanner');
        var scene = document.querySelector('a-scene');
        console.log(scene);
        //Fallback for mobile
        if(window.innerWidth <= 1080){
            console.log("Small screen: using image");
            var image = document.createElement("a-sky");
            image.setAttribute("src","background.jpg");
            scene.appendChild(image);

        } else {
            console.log("Large screen (default): using video");
            var vid = document.createElement("a-videosphere");
            vid.setAttribute("src","sunset.mov");
            vid.setAttribute("rotation","0 180 0");
            vid.setAttribute("id","banner-video");
            vid.setAttribute("autoplay","");
            vid.setAttribute("loop","");
            console.log(vid);
            scene.appendChild(vid);
        }
    }
initScene();
})();
