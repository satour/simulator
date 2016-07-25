require('./whirligig.component.less')
var Sprite3D = require('./Sprite3D')

function initBox(element){
  if(!element){
    return;
  }
  var c = element,//document.createElement('div'),
    s = element.style || {};
  
  if ( !Sprite3D.prototype._isInit ) Sprite3D.isSupported();

  s[Sprite3D.prototype._browserPrefix+"Perspective"] = "800" + (Sprite3D.prototype._browserPrefix=="Moz"?"px":"");
  s[Sprite3D.prototype._browserPrefix+"PerspectiveOrigin"] = "0 0";
  s[Sprite3D.prototype._browserPrefix+"TransformOrigin"] = "0 0";
  s[Sprite3D.prototype._browserPrefix+"Transform"] = "translateZ(0px)";

  //s.position = "absolute";
  s.width = "100%";
  s.height = "100%";
  s.margin = "0px";
  s.padding = "0px";
  //s.border = "1px solid red"; // <- this one is for debug
  //document.body.appendChild(c);

  var stage = new Sprite3D(c);
  var container = new Sprite3D().setZ(0).rotateX(-20).update();
  stage.addChild(container);
  container.setTransformOrigin(200, 200)
  
  // front left face
  container.addChild( 
    new Sprite3D()
      .setClassName("imageLeft")
      .setTransformOrigin(100, 100)
      .setPosition( -100, -150, 200 )
      .rotateY( -90)
      .setRotateFirst(true)
      .update()
  );
  
  // front right face
  container.addChild( 
    new Sprite3D()
      .setClassName("imageRight")
      .setTransformOrigin(100, 100)
      .setPosition( -100, -150, 0)
      .rotateY( 0)
      .setRotateFirst(true)
      .update()
  );
  
  // back left face
  container.addChild( 
    new Sprite3D()
      .setClassName("imageBackLeft")
      .setTransformOrigin(100, 100)
      .setPosition( -100, -150, 0)
      .rotateY(-90)
      .setRotateFirst(true)
      .update()
  );
  
  // back right face
  container.addChild( 
    new Sprite3D()
      .setClassName("imageBackRight")
      .setTransformOrigin(100, 100)
      .setPosition( 100, -150, 200)
      .rotateY(-180)
      .setRotateFirst(true)
      .update()
  );

  // top face
  container.addChild( 
    new Sprite3D()
      .setClassName("imageTop")
      .setTransformOrigin(100, 100)
      .setPosition( -100, -100, -250)
      .rotateX(-90)
      .rotateZ(-90)
      .setRotateFirst(true)
      .update()
  );

  // back right face
  container.addChild( 
    new Sprite3D()
      .setClassName("imageBottom")
      .setTransformOrigin(-100, -100)
      .setPosition( -100, -100, -50)
      .rotateX(-90)
      .rotateZ(-90)
      .setRotateFirst(true)
      .update()
  );
  
  // gyro.startTracking(function(o) {
  //       container
  //     .setRotation(o.alpha, o.beta, o.gamma)
  //     .update();
  //   });
  return container;
}

/* @ngInject */
const whirligigComponent = {
  template: `
    <div class="whirligig">
      <img class="whirligig-qr" />
      <p>Whirlybird</p>
    </div>
  `,
  replace: true,
  bindings: {device: "="},
  controllerAs: 'whirligigControl',
  /* @ngInject */
  controller ($scope) {
    function setupController(){
      var t=0;
      $scope.box = initBox(document.getElementsByClassName('whirligig')[1]);
      // var qrImg = document.getElementsByClassName('whirligig-qr')[1];
      // var url = window.location.href;
      // var qrUrl = url.replace('demo?', 'demo-gyro-controller?')
      // var chartUrl = 'https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl='+encodeURIComponent(qrUrl)
      // qrImg.src = chartUrl;    // creates an <img> tag as text

      function move() {
        // increment the t value, used for angle calculation
        t += .05;
        
        // rotate the container around the X and Y axis, then apply these transformations
        $scope.box
          .rotateY( -3 )
          .setRotationX( Math.cos(t) * 15 - 20 )
          .update();
      }

      //setInterval( move, 1000 / 40 );

      $scope.$watch(() => {
        return this.device.sensors.gyro.stringValue
      }, (newValue) => {
        var g = newValue.split("_")
        this.currentVal = g;
        if($scope.box){
          $scope.box
          //.setRotation(g[0], g[1], g[2])
          //.setRotation(g[0], g[2], g[1])
          //.setRotation(g[1], g[2], g[0]) 1 right
          //.setRotation(g[1], g[0], g[2]) same one right
          //.setRotation(g[2], g[1], g[0])
          .setRotation(g[2], g[0], g[1]) 
          .update();
        }
      })
    }
    setTimeout(setupController, 2000)
  }
}

module.exports = whirligigComponent;