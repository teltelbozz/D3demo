// ------------------------------------------------------------------
//	日本地図を書く処理　by teltel
// ------------------------------------------------------------------

var width = 300,
    height = 600;
var scale = 600;
var localName = "";


d3.json("./assets/japan.geo.json", createMap);

function createMap(japan) {
  var aProjection = d3.geoMercator()
      .center([ 136.0, 37.9 ])
      .translate([width/2, height/2])
      .scale(scale*1.5);
  var geoPath = d3.geoPath().projection(aProjection);
  
  //SVG（地図と棒グラフ）のレスポンシブ対応
  var svg = d3.select("svg")
  .attr("viewBox", `0 0 ${width} ${height}`) // ビューポートを設定
  .attr("preserveAspectRatio", "xMidYMid meet") // 比率を維持
  .style("width", "100%") // 幅をコンテナにフィット
  .style("height", "auto"); // 高さを自動調整

  //マップ描画
  var map = svg.selectAll("path")
    .data(japan.features.filter(d => d != null)) // nullデータを除外
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
        //return Math.random();
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

        // マウス位置の都道府県領域の元の色を保存し、赤色に変更
        const currentColor = d3.select(this).attr('fill');
        d3.select(this).attr('data-original-fill', currentColor); // 元の色をカスタム属性として保存
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

        // 保存しておいた元の色を取得
        const originalColor = d3.select(this).attr('data-original-fill');

        // 元の色に戻す
        d3.select(this).attr('fill', originalColor);
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

    document.getElementById('cell5-1').textContent = data[localName].合計.総数; 
    document.getElementById('cell5-2').textContent = data[localName].合計.腐朽・破損なし; 
    document.getElementById('cell5-3').textContent = data[localName].合計.腐朽・破損あり; 
    
  })

  //console.log(document.getElementById('cell5-1'));
    displayLocalData();
  }

  function displayLocalData() {

    document.getElementById('rankingDisp').style.display = "none";
    document.getElementById('localdataDisp').style.display = "block";

  }


  function update_geomap(datas) {
      // すべての都道府県の色を更新
    d3.selectAll("path")
    .attr("fill", "#FFFFFF"); 

    // ランキングにある都道府県名を取得（配列内の順序がランキングの順位）
    const rankedLocations = datas.map(data => data.locationName);

    console.log(rankedLocations);
  
    /*グラデーション作れるらしいが、うまくいかなかったので諦め
    // 色のスケールを作成（濃い青 -> 薄い青）
    const colorScale = d3.scaleLinear()
      .domain([rankedLocations.length-1,0]) // 順位範囲 (0が最下位、length-1が最上位)
      //.range(["#dc143c", "#f08080"]); // 濃い色 -> 薄い色の範囲を指定
      .range(['#2566cc', '#3370cf', '#427ad3', '#5185d6', '#608fda', '#6f99dd', '#7ea4e1', '#8daee5', '#9cb8e8', '#abc3ec', '#bacdef', '#c9d7f3', '#d8e2f6', '#e7ecfa', '#f6f7fe']); // 濃い色 -> 薄い色の範囲を指定
    */

    // すべての都道府県の色を更新
    d3.selectAll("path")
      .transition()
      .delay(function (d) {
        // データが不正なら遅延なし
        if (!d || !d.properties) return 0;
    
        // 現在の都道府県の名前
        const locationName = d.properties.name_local;
    
        // ランキング内での位置を取得（見つからなければ 0）
        const rankIndex = rankedLocations.indexOf(locationName);
    
        // ランキングに基づいて遅延を設定
        return rankIndex >= 0 ? rankIndex * 100 : 0; // ランク順に10ms間隔で遅延
      })
      .duration(1000)
      .attr("fill", function (d) {
        // データが不正なら白
        if (!d || !d.properties) return "#FFFFFF";
  
        // 現在の都道府県の名前
        const locationName = d.properties.name_local;
  
        // ランキング内での位置を取得（見つからなければ -1）
        const rankIndex = rankedLocations.indexOf(locationName);

        // ランキングにある場合は青、ない場合は白
        return rankIndex >= 0 ? "#2566cc" : "#FFFFFF";
      })
      .attr(`fill-opacity`,function (d) {
        // データが不正なら白
        if (!d || !d.properties) return "#FFFFFF";
  
        // 現在の都道府県の名前
        const locationName = d.properties.name_local;
  
        // ランキング内での位置を取得（見つからなければ -1）
        const rankIndex = rankedLocations.indexOf(locationName);
       
        // 透過率を計算
        return rankIndex >= 0 ? rankIndex/(rankedLocations.length-1) : 1;

      });
    
  }

