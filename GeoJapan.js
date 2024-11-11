// ------------------------------------------------------------------
//	日本地図を書く処理　by teltel
// ------------------------------------------------------------------

var width = 600,
    height = 600;
var scale = 1600;
var localName = "";

//d3.json("./japan.geojson", createMap);
d3.json("./assets/japan.geo.json", createMap);

function createMap(japan) {
  var aProjection = d3.geoMercator()
      //.center([ 136.0, 35.6 ])
      .center([ 136.0, 37.9 ])
      .translate([width/2, height/2])
      .scale(scale);
  var geoPath = d3.geoPath().projection(aProjection);
  var svg = d3.select("svg").attr("width",width).attr("height",height);

  //マップ描画
  var map = svg.selectAll("path").data(japan.features)
    .enter()
    .append("path")
      .attr("d", geoPath)
      .attr(`stroke`, `#666`)
      .attr(`stroke-width`, 0.25)
      .attr(`fill`, `#2566CC`)
      .attr(`fill-opacity`, (item) => {
      // メモ
      // item.properties.name_ja に都道府県名が入っている

      // 透明度をランダムに指定する (0.0 - 1.0)
        return Math.random();
      })
      /**
      * 都道府県領域の MouseOver イベントハンドラ
      */
      .on(`mouseover`, function (item) {
        // ラベル用のグループ
        const group = svg.append(`g`).attr(`id`, `label-group`);

        // 地図データから都道府県名を取得する
        const label = item.properties.name_local;

        // 矩形を追加: テキストの枠
        const rectElement = group
          .append(`rect`)
          .attr(`id`, `label-rect`)
          .attr(`stroke`, `#666`)
          .attr(`stroke-width`, 0.5)
          .attr(`fill`, `#fff`);

        // テキストを追加
        const textElement = group
          .append(`text`)
          .attr(`id`, `label-text`)
          .text(label);

        // テキストのサイズから矩形のサイズを調整
        const padding = { x: 5, y: 0 };
        const textSize = textElement.node().getBBox();
        rectElement
          .attr(`x`, textSize.x - padding.x)
          .attr(`y`, textSize.y - padding.y)
          .attr(`width`, textSize.width + padding.x * 2)
          .attr(`height`, textSize.height + padding.y * 2);

        // マウス位置の都道府県領域を赤色に変更
        d3.select(this).attr(`fill`, `#CC4C39`);
        d3.select(this).attr(`stroke-width`, `1`);
      })
                  /**
       * 都道府県領域の MouseMove イベントハンドラ
       */
      .on('mousemove', function (item) {
        // テキストのサイズ情報を取得
        const textSize = svg.select('#label-text').node().getBBox();

        // マウス位置からラベルの位置を指定
        const labelPos = {
          x: d3.event.offsetX - textSize.width,
          y: d3.event.offsetY - textSize.height,
        };

        // ラベルの位置を移動
        svg
          .select('#label-group')
          .attr(`transform`, `translate(${labelPos.x}, ${labelPos.y})`);
      })

      /**
       * 都道府県領域の MouseOut イベントハンドラ
       */
      .on(`mouseout`, function (item) {
        // ラベルグループを削除
        svg.select('#label-group').remove();

        // マウス位置の都道府県領域を青色に戻す
        d3.select(this).attr(`fill`, `#2566CC`);
        d3.select(this).attr(`stroke-width`, `0.25`);
      })

      .on(`click`, function (item) {
        // 地図データから都道府県名を取得する
        const label = item.properties.name_local;

        displayData(label);
      });

  //ズームイベント設定    
  var zoom = d3.zoom().on('zoom', function(){
      aProjection.scale(scale * d3.event.transform.k);
      map.attr('d', geoPath);
  });
  svg.call(zoom);

  //ドラッグイベント設定
  var drag = d3.drag().on('drag', function(){
      var tl = aProjection.translate();
      aProjection.translate([tl[0] + d3.event.dx, tl[1] + d3.event.dy]);
      map.attr('d', geoPath);
  });
  map.call(drag);
}

// Display data in the table based on the clicked prefecture
function displayData(localName) {

  document.getElementById('localname_title').textContent = localName;

  //初期化
  document.getElementById('cell1-1').textContent = "-"; 
  document.getElementById('cell1-2').textContent = "-"; 
  document.getElementById('cell1-3').textContent = "-"; 

  document.getElementById('cell1-4').textContent = "-"; 
  document.getElementById('cell1-5').textContent = "-"; 
  document.getElementById('cell1-6').textContent = "-"; 

  document.getElementById('cell2-1').textContent = "-"; 
  document.getElementById('cell2-2').textContent = "-"; 
  document.getElementById('cell2-3').textContent = "-"; 

  document.getElementById('cell2-4').textContent = "-"; 
  document.getElementById('cell2-5').textContent = "-"; 
  document.getElementById('cell2-6').textContent = "-"; 

  document.getElementById('cell3-1').textContent = "-"; 
  document.getElementById('cell3-2').textContent = "-"; 
  document.getElementById('cell3-3').textContent = "-"; 

  document.getElementById('cell3-4').textContent = "-"; 
  document.getElementById('cell3-5').textContent = "-"; 
  document.getElementById('cell3-6').textContent = "-"; 

  document.getElementById('cell4-1').textContent = "-"; 
  document.getElementById('cell4-2').textContent = "-"; 
  document.getElementById('cell4-3').textContent = "-"; 

  document.getElementById('cell5-1').textContent = "-"; 
  document.getElementById('cell5-2').textContent = "-"; 
  document.getElementById('cell5-3').textContent = "-"; 


  const file_json = "assets/local_data.json"
  console.log(file_json);

  jQuery.getJSON(file_json,function (data)
  {
    document.getElementById('cell1-1').textContent = data[localName].一戸建て.木造.総数; 
    document.getElementById('cell1-2').textContent = data[localName].一戸建て.木造.腐朽・破損なし; 
    document.getElementById('cell1-3').textContent = data[localName].一戸建て.木造.腐朽・破損あり; 

    document.getElementById('cell1-4').textContent = data[localName].一戸建て.非木造.総数; 
    document.getElementById('cell1-5').textContent = data[localName].一戸建て.非木造.腐朽・破損なし; 
    document.getElementById('cell1-6').textContent = data[localName].一戸建て.非木造.腐朽・破損あり; 

    document.getElementById('cell2-1').textContent = data[localName].長屋建て.木造.総数; 
    document.getElementById('cell2-2').textContent = data[localName].長屋建て.木造.腐朽・破損なし; 
    document.getElementById('cell2-3').textContent = data[localName].長屋建て.木造.腐朽・破損あり; 

    document.getElementById('cell2-4').textContent = data[localName].長屋建て.非木造.総数; 
    document.getElementById('cell2-5').textContent = data[localName].長屋建て.非木造.腐朽・破損なし; 
    document.getElementById('cell2-6').textContent = data[localName].長屋建て.非木造.腐朽・破損あり; 

    document.getElementById('cell3-1').textContent = data[localName].共同住宅.木造.総数; 
    document.getElementById('cell3-2').textContent = data[localName].共同住宅.木造.腐朽・破損なし; 
    document.getElementById('cell3-3').textContent = data[localName].共同住宅.木造.腐朽・破損あり; 

    document.getElementById('cell3-4').textContent = data[localName].共同住宅.非木造.総数; 
    document.getElementById('cell3-5').textContent = data[localName].共同住宅.非木造.腐朽・破損なし; 
    document.getElementById('cell3-6').textContent = data[localName].共同住宅.非木造.腐朽・破損あり; 

    document.getElementById('cell4-1').textContent = data[localName].その他.総数; 
    document.getElementById('cell4-2').textContent = data[localName].その他.腐朽・破損なし; 
    document.getElementById('cell4-3').textContent = data[localName].その他.腐朽・破損あり; 

    document.getElementById('cell5-1').textContent = data[localName].合計.総数; 
    document.getElementById('cell5-2').textContent = data[localName].合計.腐朽・破損なし; 
    document.getElementById('cell5-3').textContent = data[localName].合計.腐朽・破損あり; 

  })

    displayLocalData();
  }

  function displayLocalData() {

    document.getElementById('rankingDisp').style.display = "none";
    document.getElementById('localdataDisp').style.display = "block";

  }