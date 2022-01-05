/* global describe geometry */
function undirected_graph(){
  var that = this
  var Nodes = [];
  var Edges = {};

  Object.defineProperty(this, "nodes", {
    get: function(){ return Nodes },
    set: function(x){ Nodes = x}
  })

  Object.defineProperty(this, "edges", {
    get: function(){
      var result = []
      for (var u in Edges){
        for (var v in Edges[u]){
          if (Edges[u][v]){
            result.push([u,v])
          }
        }
      }
      return result;
    },
    set: function(x){
      Edges = []
      for (var i = 0; i < x.length; i++){
        that.new_edge(x[i][0],x[i][1]);
      }
    }
  })
  this._edges_adj_table = function(){
    return Edges;
  }

  this.edge_count = function(){
    var cnt = 0;
    for (var u in Edges){
      for (var v in Edges[u]){
        if (Edges[u][v]){
          cnt ++;
        }
      }
    }
    return cnt;
  }

  var id_cnt = -1;
  function new_id(){
    id_cnt++;
    return id_cnt+""; btoa(Math.random());
  }

  function compare_id(id0,id1){
    var idm; var idM;
    if (id0 < id1){
      idm = id0;
      idM = id1;
    }else{
      idm = id1;
      idM = id0;
    }
    return [idm, idM]
  }

  this.new_node = function(data){
    var node = Object.assign({id: new_id()}, data)
    Nodes.push(node);
    return node.id;
  }

  this.new_edge = function(id0,id1){
    var [idm, idM] = compare_id(id0,id1);
    if (! (idm in Edges)){
      Edges[idm] = {};
    }
    Edges[idm][idM] = true;
  }

  this.del_edge = function(id0,id1){
    var [idm, idM] = compare_id(id0,id1);
    delete Edges[idm][idM];
  }

  this.neighbors = function(id){
    var result = []
    if (id in Edges){
      result = result.concat(Object.keys(Edges[id]));
    }
    for (var k in Edges){
      if (Edges[k][id]){
        result.push(k)
      }
    }
    return result;
  }

  this.get_node = function(id){
    for (var i = 0; i < Nodes.length; i++){
      if (Nodes[i].id == id){
        return Nodes[i];
      }
    }  
  }

  this.del_node = function(id){
    for (var i = Nodes.length-1; i >= 0; i--){
      if (Nodes[i].id == id){
        Nodes.splice(i,1);
      }
    }
    var N = that.neighbors(id);
    for (var i = 0; i < N.length; i++){
      that.del_edge(id, N[i]);
    }
  }

  function component_at(id){
    var visited = [id];
    function f(front){
      var N = that.neighbors(front);
      for (var i = 0; i < N.length; i++){
        if (!visited.includes(N[i])){
          visited.push(N[i])
          f(N[i])
        }
      }
    }
    f(id);
    return visited;
  }

  this.components = function(){
    function f(nodes){
      if (nodes.length == 0){
        return []
      }else{
        var visited = component_at(nodes[0].id)
        return [visited].concat(f(nodes.filter((x)=>(!visited.includes(x.id)))))
      }
    }
    return f(Nodes);
  }

  this.clone = function(){
    var g = new undirected_graph();
    g.nodes = that.nodes.slice();
    g.edges = that.edges.slice();
    return g;
  }

  this.is_cut_vertex = function(id){
    var g = that.clone();
    var n = g.components();
    g.del_node(id);
    var nn = g.components();

    if (nn.length != n.length){
      return true;
    }else{
      return false;
    }
  }

}

function self_intersect(G){
  function f(nodes,edges){
    function get_node(id){
      for (var i = 0; i < nodes.length; i++){
        if (nodes[i].id == id){
          return nodes[i];
        }
      }
    }
    var i = 0;
    while (i < edges.length){
      var j = i+1;
      while (j < edges.length){
        if (i == j){
          continue;
        }
        var sct = geometry.intersect(
          [get_node(edges[i][0]), get_node(edges[i][1])],
          [get_node(edges[j][0]), get_node(edges[j][1])],
          false
        )
        if (sct == false){
          j++;
          continue
        }
        var nid = JSON.stringify([edges[i],edges[j]]);
        var nn = Object.assign({},sct,{id:nid})
        var nes = [[edges[i][0],nid],[edges[i][1],nid],[edges[j][0],nid],[edges[j][1],nid]]
        nodes.push(nn)
        edges.splice(i,1); j--;
        edges.splice(j,1);
        edges.push(nes[0]);
        edges.push(nes[1]);
        edges.push(nes[2]);
        edges.push(nes[3]);
        i--;
        break;
      }
      i++;
    }
    return [nodes,edges]
  }
  var g = G.clone();
  var nodes = g.nodes.slice();
  var edges = g.edges.slice();
  var [nnodes, nedges] = f(nodes,edges)
  g.nodes = nnodes;
  g.edges = nedges;
  return g;
}


function hulls(g){
  var G = self_intersect(g);
  function lowestY(plist){
    var mi = 0;
    var mv = 1/0;
    for (var i = 0; i < plist.length; i++){
      if (plist[i].y < mv){
        mv = plist[i].y;
        mi = i;
      }
    }
    return mi;
  }
  function subseq(a,b){
    for (var i = 0; i < a.length; i++){
      var ok = true;
      for (var j = 0; j < b.length; j++){
        if (a[i+j] != b[j]){
          ok = false;
          break;
        }
      }
      if (ok){
        return true;
      }
    }
    return false;
  }
  function nang(x){
    if (-Math.PI <= x && x <= Math.PI){
      return x;
    }
    while (x < -Math.PI){
      x += Math.PI*2
    }
    while (x > Math.PI){
      x -= Math.PI*2
    }
    return x;
  }

  var coms = G.components()
  var result = []

  for (var j = 0; j < coms.length; j++){
    var plist = coms[j].map((x)=>(G.get_node(x)));
    if (coms[j].length <= 2){
      result.push(plist)
      continue
    }
    var p0 = plist[lowestY(plist)];
    var visited = []

    var home_pass = 0;
    if (G.is_cut_vertex(p0.id)){
      home_pass = 1;
    }

    function f(p){
      if (visited.length && p == visited[0]){
        if (home_pass == 0){
          return
        }else{
          home_pass --;
        }
      }
      var neib = G.neighbors(p.id).map((x)=>(G.get_node(x)));
      neib = neib.filter((x)=>(!subseq(visited,[p,x])))
      if (neib.length > 1){
        neib = neib.filter((x)=>(!(visited.length && x==visited[visited.length-1])))
      }

      if (!neib.length){
        return
      }

      var keyfunc;
      if (visited.length){
        var lp = visited[visited.length-1];
        var aa = Math.atan2(p.y-lp.y, p.x-lp.x);
        keyfunc = (q)=>(nang(Math.atan2(q.y-p.y, q.x-p.x)-aa));
      }else{
        keyfunc = (q)=>(Math.atan2(q.y-p.y, q.x-p.x));
      }
      var np = neib.reduce((a,b)=>((keyfunc(a)>keyfunc(b))?a:b),-1/0);
      visited.push(p)
      f(np);
    }
    f(p0);
    result.push(visited);
  }
  return result;
}




