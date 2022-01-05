/* global define Okb vector graphics geometry math undirected_graph random hulls*/
var _scale = window.innerHeight/1000;
var argv = {}
try{
  argv = parseURL();
}catch(e){
  console.log("invalid url arguments");
}
console.log(argv)

var DRAW_DEBUG = false;
var DRAW_CSGRAPH = (("cs" in argv) && argv.cs == "true") ? true : false;

var EDGE_MAX = 120*_scale;
var EDGE_TOLERANCE = 20*_scale;
var EDGE_JOIN_MAX = (DRAW_CSGRAPH ? 70: 110)*_scale;
var EDGE_BREAK_MAX = 280*_scale;
var NODE_RADIUS = 44*_scale;
var CENTER_RADIUS = 18*_scale;
var CENTER_OUTER_RADIUS = 32*_scale;
var HIGHLIGHT_RADIUS = 11*_scale;
var SPRING_CONST = 0.05*_scale;
var NODE_AREA_WIDTH = 512*_scale;
var NODE_COUNT= 30;
var EDGE_COUNT_MAX = 80;

var COLOR_GOO = "rgba(250,200,50,0.5)"
var COLOR_CENTER = "rgb(110,110,50)"
var COLOR_CENTER_OUTER = "rgb(250,220,30)"
var COLOR_BG = "rgb(117,102,139)"
var COLOR_HIGHLIGHT = "rgba(255,255,255,0.6)"

Okb.explode();

var G = new undirected_graph();
var mouse = {"desktop":{x:0,y:0}};

var tool = 0
var Tool = [
  {
    name:"finger", 
    node:{}, 
    cut:{}, 
    help:"drag nodes or cut edges",
    onmousedown: function(tid){
      var found = false;
      for (var i = 0; i < G.nodes.length; i++){
        var d = vector.distance(G.nodes[i], mouse[tid]);
        if (d <= NODE_RADIUS+5){
          Tool[tool].node[tid] = G.nodes[i].id;
          found = true;
          break;
        }
      }
      if (!found){
        Tool[tool].cut[tid] = true;
      }
    },
    onmouseup: function(tid){
      delete Tool[tool].node[tid]
      delete Tool[tool].cut[tid]
    },
    onupdate: function(tid){
      if (Tool[tool].node[tid]){
        var node = G.get_node(Tool[tool].node[tid]);
        node.targ.x = mouse[tid].x;
        node.targ.y = mouse[tid].y;

      }else if (Tool[tool].cut[tid]){

        for (var i = 0; i < G.nodes.length; i++){
          var node = G.nodes[i]
          var p = mouse[tid];
          var d = vector.distance(G.nodes[i], p);
          if (d < EDGE_MAX){
            var mag = (d-EDGE_MAX)*0.1;
            var dir = vector.normalize(vector.subtract(p,node.targ));
            var force = vector.scale(dir,mag);
            node.a.x += force.x;
            node.a.y += force.y;
            var N = G.neighbors(node.id)
            for (var j = 0; j < N.length; j++){
              G.del_edge(N[j],node.id);
            }
          }
        }
      }
    },
  },
];



document.body.style.backgroundColor = COLOR_BG;

var canvas = document.getElementById("canvas0");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var ctx = canvas.getContext("2d");
graphics.context(ctx);

canvas.addEventListener('mousemove', function(event) {
  var rect = canvas.getBoundingClientRect();
  mouse = {desktop:{x:event.clientX - rect.left,
                    y:event.clientY - rect.top}};
}, false);

function locateTouch(event){
  var rect = canvas.getBoundingClientRect();
  mouse = {};
  for (var i = 0; i < event.touches.length; i++){
    var tid = event.touches[i].identifier;
    var x = event.touches[i].pageX - rect.left;
    var y = event.touches[i].pageY - rect.top;
    mouse[tid] = {x:x,y:y};
  }
}

canvas.addEventListener("touchmove", function(event){
  locateTouch(event);
  event.preventDefault();
}, false)


canvas.addEventListener('mousedown',mousedown,true)
canvas.addEventListener('mouseup',mouseup,true)
window.addEventListener('keydown',keydown,false);

canvas.addEventListener('touchstart',function(event){locateTouch(event);mousedown(event);},true)
canvas.addEventListener('touchend',function(event){mouseup(event);},true)

function mousedown(e){
  for (var k in mouse){
    Tool[tool].onmousedown(k)
  }
  e.preventDefault()
}
function mouseup(e){
  for (var k in mouse){
    Tool[tool].onmouseup(k)
  }
  e.preventDefault()
}
function mouseaction(){
  for (var k in mouse){
    Tool[tool].onupdate(k)
  }
}
function keydown(e){
  if (e.key == "d"){
    DRAW_DEBUG = !DRAW_DEBUG
    e.preventDefault()
  }else if (e.key == " "){
    Tool.drag.on = !Tool.drag.on;
    Tool.cut.on = !Tool.cut.on;
    e.preventDefault()
  }
  
}

function parseURL(){
  var result = {}
  var s = window.location.href.split("?");
  if (s.length < 2){
    return result;
  }
  var ags = s[s.length-1];
  var agl = ags.split("&");
  
  for (var i = 0; i < agl.length; i++){
    result[agl[i].split("=")[0]] = decodeURI(agl[i].split("=")[1]);
  }
  return result;
}

function physics(){
  for (var i = 0; i < G.nodes.length; i++){
    var node = G.nodes[i]
    var N = G.neighbors(node.id)
    for (var j = 0; j < N.length; j++){
      var other = G.get_node(N[j])
      var d = vector.distance(node.targ,other.targ)
      if (EDGE_MAX - EDGE_TOLERANCE < d && d < EDGE_MAX + EDGE_TOLERANCE){
        continue;
      }
      var mag = (d-EDGE_MAX) * SPRING_CONST;
      var dir = vector.normalize(vector.subtract(other.targ,node.targ));
      var force = vector.scale(dir,mag);
      node.a.x += force.x;
      node.a.y += force.y;
    }
  }
  for (var i = 0; i < G.nodes.length; i++){
    var node = G.nodes[i]
    node.v.x += node.a.x;
    node.v.y += node.a.y;
    node.targ.x += node.v.x;
    node.targ.y += node.v.y;
    node.a.x = 0;
    node.a.y = 0;
    node.v.x = 0;
    node.v.y = 0;
    if (vector.distance(node,node.targ) >= 1){
      node.x = math.lerp(node.x, node.targ.x, 0.5);
      node.y = math.lerp(node.y, node.targ.y, 0.5);
    }
  }
}



function draw_schematic(){
  for (var i = 0; i < G.nodes.length; i++){
    ctx.fillStyle = "black";
    ctx.font = "20px sans-serif"
    ctx.fillRect(G.nodes[i].x-3, G.nodes[i].y-3, 6, 6);
    ctx.fillText(G.nodes[i].id, G.nodes[i].x+5, G.nodes[i].y-2);
  }
  var edges = G.edges;
  for (var i = 0; i < edges.length; i++){
    graphics.polygon({stroke:"black"})(edges[i].map((x)=>(G.get_node(x))))
  }
}

function draw_csgraph(){
  ctx.fillStyle="white";
  ctx.fillRect(0,0,canvas.width,canvas.height)
  var edges = G.edges;
  for (var i = 0; i < edges.length; i++){
    graphics.polygon({stroke:"black",strokeWidth:2})(edges[i].map((x)=>(G.get_node(x))))
  }
  var id2a = "abcdefghijklmnopqrstuvwxyz123456789"
  for (var i = 0; i < G.nodes.length; i++){
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(G.nodes[i].x, G.nodes[i].y, 
      CENTER_OUTER_RADIUS, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = "black";
    ctx.font = "30px serif"
    ctx.textAlign = "center"; 
    ctx.fillText(id2a[G.nodes[i].id], G.nodes[i].x, G.nodes[i].y+8);
  }  
  
}

function draw(){
  ctx.fillStyle = COLOR_GOO;
  for (var i = 0; i < G.nodes.length; i++){
    ctx.beginPath();
    ctx.arc(G.nodes[i].x, G.nodes[i].y, NODE_RADIUS, 0, 2 * Math.PI, false);
    ctx.fill();
  }
  var edges = G.edges;
  for (var i = 0; i < edges.length; i++){
    var e = [G.get_node(edges[i][0]), G.get_node(edges[i][1])]
    var d = vector.distance(e[0], e[1]);
    var mt = math.map(d,0,EDGE_BREAK_MAX,0,1);
    var f = (x)=>(0.5-0.5*Math.sin(x*Math.PI*2+Math.PI/2));
    var [l0,l1] = geometry.tube(geometry.subdivide(e,10),(x)=>(Math.max(0,(1-f(x)*mt)*NODE_RADIUS)));
    graphics.polygon({fill:COLOR_GOO,stroke:undefined})(l0.concat(l1.slice().reverse()));
  }

  var H = hulls(G);
  for (var i = 0; i < H.length; i++){
    ctx.lineJoin = "round"
    graphics.polygon({fill:COLOR_GOO,stroke:undefined})(H[i]);
  }

  ctx.fillStyle = COLOR_CENTER;
  ctx.strokeStyle = COLOR_CENTER_OUTER;
  ctx.lineWidth = CENTER_OUTER_RADIUS-CENTER_RADIUS;
  for (var i = 0; i < G.nodes.length; i++){
    ctx.beginPath();
    ctx.arc(G.nodes[i].x, G.nodes[i].y, (CENTER_RADIUS+CENTER_OUTER_RADIUS)/2, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = COLOR_HIGHLIGHT;
  for (var i = 0; i < G.nodes.length; i++){
    ctx.beginPath();
    ctx.arc(G.nodes[i].x-CENTER_RADIUS, G.nodes[i].y-CENTER_RADIUS, 
      HIGHLIGHT_RADIUS, 0, 2 * Math.PI, false);
    ctx.fill();
  }
}

function break_edges(){
  var edges = G.edges;
  for (var i = 0; i < edges.length; i++){
    var e = [G.get_node(edges[i][0]), G.get_node(edges[i][1])]
    var d = vector.distance(e[0], e[1]);
    if (d > EDGE_BREAK_MAX){
      G.del_edge(edges[i][0],edges[i][1])
    }
  }  
}

function is_dragged(id){
  if (Tool[tool].name != "finger"){
    return false;
  }
  for (var k in Tool[tool].node){
    if (Tool[tool].node[k] == id){
      return true;
    }
  }
  return false;
}

function join_edges(){
  var edges = G.edges;
  for (var j = 0; j < G.nodes.length; j++){
    var node = G.nodes[j];
    var N = G.neighbors(node.id);
    for (var i = 0; i < G.nodes.length; i++){
      if (G.nodes[i].id == node.id){
        continue;
      }
      if (N.includes(G.nodes[i].id)){
        continue;
      }
      var d = vector.distance(G.nodes[i], node);
      if (d < EDGE_JOIN_MAX){
        if (G.edge_count() < EDGE_COUNT_MAX || (is_dragged(node.id) && N.length < 2)){            
          G.new_edge(G.nodes[i].id, node.id);
        }
        
      }
    }
  }
}


function main(){
  document.getElementById("help").innerHTML = Tool[tool].help
  // ctx.fillStyle = COLOR_BG;
  // ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  mouseaction();


  join_edges();
  break_edges();

  physics();

  if (!DRAW_CSGRAPH){
    draw();
  }else{
    draw_csgraph();
  }
  if (DRAW_DEBUG){
    draw_schematic();
    ctx.fillStyle="blue";
    for (var k in mouse){
      ctx.fillRect(mouse[k].x-5,mouse[k].y-5,10,10)
    }
  }


}

function make_node(x,y){
  var id = G.new_node({x:x,y:y,targ:{x:x,y:y},v:{x:0,y:0},a:{x:0,y:0}});
  for (var i = 0; i < G.nodes.length; i++){
    if (G.nodes[i].id == id){
      continue;
    }
    if (vector.distance(G.nodes[i], G.get_node(id)) < EDGE_MAX){
      G.new_edge(G.nodes[i].id, id);
    }
  }
}
var cnt = NODE_COUNT;
var getNoise = random.blue({dimension:2, iteration: 30});
for (var i = 0; i < cnt; i++){
   var p = getNoise();
   make_node(p.x*NODE_AREA_WIDTH+canvas.width/2-NODE_AREA_WIDTH/2,
             p.y*NODE_AREA_WIDTH+canvas.height/2-NODE_AREA_WIDTH/2)
}
console.log("generated",cnt)

console.log("init.")

main();
setInterval(main,1);