// ------------------------------------------------------------------
//	棒グラフを書く処理　by teltel
// ------------------------------------------------------------------

function load_bar_chart (selector)
{
    var maxdomain = 250000

    //document.getElementById('fetchData').addEventListener('click', () => {
      let houseType = document.getElementById('houseType').value;
      let buildingType = document.getElementById('buildingType').value;
      let decayStatus = document.getElementById('decayStatus').value;

      // パラメータをエンコードしてAPIに送信
      const apiEndpoint = `https://d3demo.vercel.app/api/vacant-houses-data?houseType=${encodeURIComponent(houseType)}&buildingType=${encodeURIComponent(buildingType)}&decayStatus=${encodeURIComponent(decayStatus)}`;

      fetch(apiEndpoint)
        .then(response => {
          if (!response.ok) {
            throw new Error('データの取得に失敗しました');
          }
          return response.json();
        })
        .then(data => {
          console.log('取得したデータ:', data.slice(-15));
          //上位15位まで表示
          var datas = data.slice(-15);
          update_geomap(datas);
          write_bar_chart(datas,maxdomain)
        })
        .catch(error => {
          console.error('エラー:', error);
        });
  //  });

}

// ------------------------------------------------------------------
function write_bar_chart (data,maxdomain)
{

// 既存のSVG要素を削除
d3.select("#ChartArea").select("svg").remove();

// set the dimensions and margins of the graph
const margin = {top: 20, right: 30, bottom: 30, left: 60}
const width = 450 - margin.left - margin.right
const height = 550 - margin.top - margin.bottom

// set the ranges
const y = d3.scaleBand()
          .range([height, 0])
          .padding(0.1);

const x = d3.scaleLinear()
          .range([0, width]);
          
// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#ChartArea").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

  // format the data
  data.forEach(function(d) {
    d.emptyhouse = +d.emptyhouse;
  });

  // Scale the range of the data in the domains
  //x.domain([0, d3.max(data, function(d){ return d.emptyhouse; })])
  x.domain([0, maxdomain]); //固定
  y.domain(data.map(function(d) { return d.locationName; }));

  // グラデーションの定義
  var gradient = svg.append("defs")
  .append("linearGradient")
  .attr("id", "barGradient")
  .attr("x1", "0%")
  .attr("y1", "0%")
  .attr("x2", "100%")//水平方向のグラデーション
  .attr("y2", "0%"); 

   // グラデーションの色と位置を設定
   gradient.append("stop")
   .attr("offset", "0%")
   .attr("stop-color", "steelblue");  // 開始色
   gradient.append("stop")
   .attr("offset", "100%")
   .attr("stop-color", "lightblue");  // 終了色

  // append the rectangles for the bar chart
  svg.selectAll(".bar")
  .data(data)
  .enter().append("rect")
  .attr("class", "bar")
  .attr("x", 0)  // xの位置（グラフの左端に設定）
  .attr("y", function(d) { return y(d.locationName); })  // yの位置
  .attr("width", 0)  // 初期の高さを0に設定
  .transition()  // アニメーションを開始
  .duration(500)  // 500ミリ秒かけて変化
  .attr("width", function(d) { return x(d.emptyhouse); })  // 横幅
  .attr("height", y.bandwidth())  // 最終的な高さを設定
  .attr("y", function(d) { return y(d.locationName); }) // 最終的なy位置
  .attr("fill", "url(#barGradient)")  // グラデーションを適用
  .delay(function(d, i) { return i * 100; })  // 各棒グラフの開始を遅らせる（100msずつ）
  .attr("width", function(d) { return x(d.emptyhouse); });  // 横幅を設定

  // バーの上に実際の値を表示
  svg.selectAll(".bar-label")
  .data(data)
  .enter().append("text")
  .attr("class", "bar-label")
  .attr("x", function(d) { return x(d.emptyhouse) + 5; }) // 初期値を設定
  .attr("y", function(d) { return y(d.locationName) + y.bandwidth() / 2; })
  .attr("dy", ".35em")
  .text(function(d) { return d3.format(",")(d.emptyhouse); })
  .style("opacity", 0)
  .transition()
  .delay(2000)//アニメーションにあわせて変更 by teltel
  .duration(500)
  .style("opacity", 1) 
  .on("end", function() { // transitionの終了後に実行
    // テキストの幅を取得
    var textWidth = this.getBBox().width;
    // バーの右端の座標
    var barRightX = x(d3.select(this).datum().emptyhouse); 

    // テキストがcanvas領域を超える場合は、バーの右端から左にずらす
    d3.select(this).attr("x", Math.min(barRightX + 5, width - textWidth - 5));
  });


  // add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(5));

  // add the y Axis
  svg.append("g")
      .call(d3.axisLeft(y));

}

// ------------------------------------------------------------------
