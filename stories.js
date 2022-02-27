const html = `
<style>
  body {
    margin: 0;
    color: white;
    font-size: small;
  }
  .extendedh {
    width: 100%;
  }
  .extendedv {
    height: 100%;
  }
  #wrapper {
    padding: 8px;
    border-radius: 5px;
    background-color: rgba(0, 0, 0, 0.6);
    box-sizing: border-box;
    width: 300px;
  }
  .extendedh body,
  .extendedh #wrapper {
    width: 100%;
  }
  .extendedv body,
  .extendedv #wrapper {
    height: 100%;
  }
</style>
<div id="wrapper">
  <h2 id="title"></h2>
  <p>
    <button id="prev">Prev</button>
    <button id="next">Next</button>
  </p>
</div>
<script>
  let reearth;
  let index = 0;
  let markers = [];

  const cb = (e) => {
    reearth = e.source.reearth;
    property = e.data.property;

    // これは実際には不要
    if (property && property.default) {
      document.getElementById('title').textContent = property.default.title;
    }

    // この部分の必要性は今ひとつよく分からない
    if (property && property.extended) {
      if (property.extended.horizontally) {
        document.documentElement.classList.add('extendedh');
      } else {
        document.documentElement.classList.remove('extendedh');
      }
      if (property.extended.vertically) {
        document.documentElement.classList.add('extendedv');
      } else {
        document.documentElement.classList.remove('extendedv');
      }
    }

    document.getElementById('title').textContent = e.data.title;
    markers = e.data.markers;
  };

  addEventListener('message', (e) => {
    if (e.source !== parent) return;
    console.log('here');
    cb(e);
  });

  const prev = () => {
    index = Math.max(0, index - 1);
    console.log('index', index);
    select(markers[index]);
  };

  const next = () => {
    index = Math.min(markers.length - 1, index + 1);
    console.log('index', index);
    select(markers[index]);
  };

  const select = (targetMarker) => {
    reearth.visualizer.camera.flyTo(
      {
        lat: targetMarker.lat,
        lng: targetMarker.lng,
        height: targetMarker.height,
      },
      { duration: 2 }
    );
    reearth.layers.select(targetMarker.id);
  };

  document.getElementById('prev').addEventListener('click', prev);
  document.getElementById('next').addEventListener('click', next);
</script>
`;

reearth.ui.show(html);
reearth.on('update', update);
update();

function update() {
  // tourタグの付いたレイヤーから決め打ちで最初のものだけを取り出す
  let layer = reearth.layers.findByTagLabels('tour')[0];
  let markers = [];

  // このエラーチェックはもっとちゃんとやる必要あり
  console.log('layer', layer);
  if (typeof layer === undefined) {
    return;
  }

  // GUIでは下から上に連番となるため、ここでは逆順で登録する
  for (let i = layer.children.length - 1; i >= 0; i--) {
    lat = layer.children[i].property.default.location.lat;
    lng = layer.children[i].property.default.location.lng;
    height = layer.children[i].property.default.height || 10000;
    id = layer.children[i].id;
    title = layer.children[i].title;

    markers.push({ lat: lat, lng: lng, height: height, id: id, title: title });
  }
  console.log('markers', markers);

  reearth.ui.postMessage({
    property: reearth.widget.property,
    title: layer.title,
    markers: markers,
  });
}
